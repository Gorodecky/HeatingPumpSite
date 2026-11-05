import assert from "node:assert/strict";
import { spawn, type ChildProcess } from "node:child_process";
import { once } from "node:events";
import net from "node:net";
import test, { after, before, beforeEach } from "node:test";
import { PrismaClient } from "@prisma/client";
import { createLeadWithNotification } from "./leadPersistence.js";
import {
  AUTOMATIC_RETRY_WINDOW_MS,
  MAX_NOTIFICATION_ATTEMPTS,
  processLeadNotificationBatch,
  RESEND_IDEMPOTENCY_WINDOW_MS,
} from "./leadNotificationWorker.js";
import type { NotificationLead } from "./leadNotifications.js";

const databaseUrl = process.env.TEST_DATABASE_URL;
if (!databaseUrl || process.env.DATABASE_URL !== databaseUrl) {
  throw new Error("Run integration tests only through npm run test:integration.");
}

const prisma = new PrismaClient({ datasources: { db: { url: databaseUrl } } });
const schemaName = new URL(databaseUrl).searchParams.get("schema") ?? "";
if (!/^lead_it_\d+_\d+$/.test(schemaName)) {
  throw new Error("Integration tests require their isolated test schema.");
}

const validLead = {
  source: "selection" as const,
  city: "Вінниця",
  area: "100–150 м²",
  object: "Новий будинок",
  heating: "Тепла підлога",
  timing: "Найближчим часом",
  name: "Тестова заявка",
  phone: "+380638788281",
  comment: "Інтеграційний тест",
  policyVersion: "test",
};
const selectionFormPayload = {
  source: "selection",
  city: validLead.city,
  area: validLead.area,
  object: validLead.object,
  heating: validLead.heating,
  timing: validLead.timing,
  name: validLead.name,
  phone: validLead.phone,
  comment: validLead.comment,
  consent: true,
};

before(async () => {
  await prisma.$connect();
});

beforeEach(async () => {
  await prisma.leadNotification.deleteMany();
  await prisma.lead.deleteMany();
});

after(async () => {
  await prisma.$disconnect();
});

test("lead and PENDING notification commit atomically; notification insert failure rolls both back", async () => {
  const beforeCount = await prisma.lead.count();
  const functionName = `"${schemaName}"."reject_notification_for_test"`;
  await prisma.$executeRawUnsafe(
    `CREATE FUNCTION ${functionName}() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN RAISE EXCEPTION 'forced test failure'; END; $$`,
  );
  await prisma.$executeRawUnsafe(
    `CREATE TRIGGER reject_notification_for_test BEFORE INSERT ON "LeadNotification" FOR EACH ROW EXECUTE FUNCTION ${functionName}()`,
  );
  try {
    await assert.rejects(createLeadWithNotification(prisma, validLead));
    assert.equal(await prisma.lead.count(), beforeCount);
    assert.equal(await prisma.leadNotification.count(), 0);
  } finally {
    await prisma.$executeRawUnsafe(
      `DROP TRIGGER IF EXISTS reject_notification_for_test ON "LeadNotification"`,
    );
    await prisma.$executeRawUnsafe(`DROP FUNCTION ${functionName}()`);
  }

  const saved = await createLeadWithNotification(prisma, validLead);
  const notification = await prisma.leadNotification.findUniqueOrThrow({
    where: { leadId: saved.id },
  });
  assert.equal(notification.status, "PENDING");
  assert.equal(notification.attempts, 0);
  assert.equal(notification.firstAttemptAt, null);
});

test("provider failure retries with the same lead key and ends SENT", async () => {
  const lead = await createLeadWithNotification(prisma, validLead);
  const keys: string[] = [];
  const fixedNow = new Date("2026-11-05T12:00:00.000Z");
  let calls = 0;
  const send = async (item: NotificationLead) => {
    keys.push(`lead-notification/${item.id}`);
    calls += 1;
    if (calls === 1) throw new Error("RESEND_RATE_LIMITED");
  };

  const failedAttempt = await processLeadNotificationBatch(prisma, {
    now: () => fixedNow,
    send,
    batchSize: 1,
  });
  assert.equal(failedAttempt.failed, 0);
  const pending = await prisma.leadNotification.findUniqueOrThrow({
    where: { leadId: lead.id },
  });
  assert.equal(pending.status, "PENDING");
  assert.equal(pending.attempts, 1);
  assert.ok(pending.firstAttemptAt);

  await prisma.leadNotification.update({
    where: { leadId: lead.id },
    data: { nextAttemptAt: new Date(fixedNow.getTime() - 1_000) },
  });
  const retry = await processLeadNotificationBatch(prisma, {
    now: () => new Date(fixedNow.getTime() + 2_000),
    send,
    batchSize: 1,
  });
  assert.equal(retry.sent, 1);
  assert.equal(keys.length, 2);
  assert.equal(keys[0], keys[1]);
  const sent = await prisma.leadNotification.findUniqueOrThrow({
    where: { leadId: lead.id },
  });
  assert.equal(sent.status, "SENT");
  assert.equal(sent.attempts, 2);
  assert.ok(sent.sentAt);
});

test("stale PROCESSING from a previous API process is reclaimed inside the idempotency window", async () => {
  const lead = await createLeadWithNotification(prisma, validLead);
  const now = new Date("2026-11-05T12:00:00.000Z");
  await prisma.leadNotification.update({
    where: { leadId: lead.id },
    data: {
      status: "PROCESSING",
      attempts: 1,
      firstAttemptAt: new Date(now.getTime() - 60 * 60 * 1000),
      lockedAt: new Date(now.getTime() - 6 * 60 * 1000),
    },
  });
  const sentIds: string[] = [];
  const result = await processLeadNotificationBatch(prisma, {
    now: () => now,
    send: async (item) => {
      sentIds.push(item.id);
    },
    batchSize: 1,
  });
  assert.equal(result.sent, 1);
  assert.deepEqual(sentIds, [lead.id]);
  const notification = await prisma.leadNotification.findUniqueOrThrow({
    where: { leadId: lead.id },
  });
  assert.equal(notification.status, "SENT");
  assert.equal(notification.attempts, 2);
});

test("an expired 24-hour idempotency window becomes FAILED without calling Resend", async () => {
  const lead = await createLeadWithNotification(prisma, validLead);
  const now = new Date("2026-11-05T12:00:00.000Z");
  await prisma.leadNotification.update({
    where: { leadId: lead.id },
    data: {
      status: "PROCESSING",
      attempts: 1,
      firstAttemptAt: new Date(now.getTime() - RESEND_IDEMPOTENCY_WINDOW_MS - 1),
      lockedAt: new Date(now.getTime() - 6 * 60 * 1000),
    },
  });
  let sendCalls = 0;
  const result = await processLeadNotificationBatch(prisma, {
    now: () => now,
    send: async () => {
      sendCalls += 1;
    },
    batchSize: 1,
  });
  assert.equal(result.failed, 1);
  assert.equal(sendCalls, 0);
  const notification = await prisma.leadNotification.findUniqueOrThrow({
    where: { leadId: lead.id },
  });
  assert.equal(notification.status, "FAILED");
  assert.equal(notification.lastErrorCode, "IDEMPOTENCY_WINDOW_EXPIRED");
  assert.equal(notification.lockedAt, null);
});

test("expired automatic retry window transitions to FAILED; later batches do not resend", async () => {
  const lead = await createLeadWithNotification(prisma, validLead);
  const now = new Date("2026-11-05T12:00:00.000Z");
  await prisma.leadNotification.update({
    where: { leadId: lead.id },
    data: {
      attempts: MAX_NOTIFICATION_ATTEMPTS - 1,
      firstAttemptAt: new Date(now.getTime() - AUTOMATIC_RETRY_WINDOW_MS - 1),
      nextAttemptAt: new Date(now.getTime() - 1_000),
    },
  });
  let sendCalls = 0;
  const result = await processLeadNotificationBatch(prisma, {
    now: () => now,
    send: async () => {
      sendCalls += 1;
      throw new Error("RESEND_TEMPORARY_ERROR");
    },
    batchSize: 1,
  });
  assert.equal(result.failed, 1);
  assert.equal(sendCalls, 0);
  const failed = await prisma.leadNotification.findUniqueOrThrow({
    where: { leadId: lead.id },
  });
  assert.equal(failed.status, "FAILED");
  assert.equal(failed.lastErrorCode, "AUTOMATIC_RETRY_WINDOW_EXPIRED");
  const laterBatch = await processLeadNotificationBatch(prisma, {
    send: async () => {
      sendCalls += 1;
    },
  });
  assert.equal(laterBatch.processed, 0);
  assert.equal(sendCalls, 0);
});

test("the eighth failed attempt is terminal and is not sent again", async () => {
  const lead = await createLeadWithNotification(prisma, validLead);
  const now = new Date("2026-11-05T12:00:00.000Z");
  await prisma.leadNotification.update({
    where: { leadId: lead.id },
    data: {
      attempts: MAX_NOTIFICATION_ATTEMPTS - 1,
      firstAttemptAt: new Date(now.getTime() - 60 * 60 * 1000),
      nextAttemptAt: new Date(now.getTime() - 1_000),
    },
  });
  let sendCalls = 0;
  const send = async () => {
    sendCalls += 1;
    throw new Error("RESEND_TEMPORARY_ERROR");
  };
  const result = await processLeadNotificationBatch(prisma, {
    now: () => now,
    send,
    batchSize: 1,
  });
  assert.equal(result.failed, 1);
  const failed = await prisma.leadNotification.findUniqueOrThrow({
    where: { leadId: lead.id },
  });
  assert.equal(failed.status, "FAILED");
  assert.equal(failed.attempts, MAX_NOTIFICATION_ATTEMPTS);
  assert.equal(failed.lastErrorCode, "RESEND_TEMPORARY_ERROR");
  const laterBatch = await processLeadNotificationBatch(prisma, {
    send,
    batchSize: 1,
  });
  assert.equal(laterBatch.processed, 0);
  assert.equal(sendCalls, 1);
});

test("manual retry touches only FAILED rows and records the operator retry", async () => {
  const lead = await createLeadWithNotification(prisma, validLead);
  await prisma.leadNotification.update({
    where: { leadId: lead.id },
    data: {
      status: "FAILED",
      attempts: MAX_NOTIFICATION_ATTEMPTS,
      firstAttemptAt: new Date(Date.now() - RESEND_IDEMPOTENCY_WINDOW_MS - 1),
      lastErrorCode: "IDEMPOTENCY_WINDOW_EXPIRED",
    },
  });

  const manualRetry = () => prisma.$executeRaw`
    UPDATE "LeadNotification"
    SET "status" = 'PENDING',
        "attempts" = 0,
        "firstAttemptAt" = NULL,
        "nextAttemptAt" = NOW(),
        "lockedAt" = NULL,
        "lastErrorCode" = 'MANUAL_RETRY',
        "manualRetryCount" = "manualRetryCount" + 1,
        "lastManualRetryAt" = NOW(),
        "updatedAt" = NOW()
    WHERE "leadId" = ${lead.id}::uuid AND "status" = 'FAILED'
  `;
  assert.equal(await manualRetry(), 1);
  assert.equal(await manualRetry(), 0);
  const requeued = await prisma.leadNotification.findUniqueOrThrow({
    where: { leadId: lead.id },
  });
  assert.equal(requeued.status, "PENDING");
  assert.equal(requeued.attempts, 0);
  assert.equal(requeued.firstAttemptAt, null);
  assert.equal(requeued.manualRetryCount, 1);
  assert.ok(requeued.lastManualRetryAt);
});

test("migrated API serves health, blocks leads when disabled, and keeps persisted queue after restart", async () => {
  const beforeCount = await prisma.lead.count();
  const disabled = await startApi(false);
  try {
    const health = await fetch(`${disabled.origin}/api/v1/health`);
    assert.equal(health.status, 200);
    const blocked = await fetch(`${disabled.origin}/api/v1/leads`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(selectionFormPayload),
    });
    assert.equal(blocked.status, 503);
  } finally {
    await disabled.stop();
  }
  assert.equal(await prisma.lead.count(), beforeCount);

  const enabled = await startApi(true);
  let firstLeadId = "";
  try {
    const health = await fetch(`${enabled.origin}/api/v1/health`);
    assert.equal(health.status, 200);
    const selectionResponse = await fetch(`${enabled.origin}/api/v1/leads`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(selectionFormPayload),
    });
    assert.equal(selectionResponse.status, 201);
    firstLeadId = (await selectionResponse.json()).lead.id;

    const contactResponse = await fetch(`${enabled.origin}/api/v1/leads`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        source: "contact",
        name: "Тестова контактна заявка",
        phone: "+380638788281",
        comment: "Перевірка endpoint",
        consent: true,
      }),
    });
    assert.equal(contactResponse.status, 201);
    const contactId = (await contactResponse.json()).lead.id;
    for (const leadId of [firstLeadId, contactId]) {
      const notification = await prisma.leadNotification.findUniqueOrThrow({
        where: { leadId },
      });
      assert.equal(notification.status, "PENDING");
    }
  } finally {
    await enabled.stop();
  }

  const persisted = await prisma.leadNotification.findUniqueOrThrow({
    where: { leadId: firstLeadId },
  });
  assert.equal(persisted.status, "PENDING");
  const firstAttemptAt = new Date(Date.now() - 60 * 60 * 1000);
  await prisma.leadNotification.update({
    where: { leadId: firstLeadId },
    data: {
      status: "PROCESSING",
      attempts: 1,
      firstAttemptAt,
      lockedAt: new Date(Date.now() - 6 * 60 * 1000),
    },
  });
  const restarted = await startApi(true);
  try {
    const health = await fetch(`${restarted.origin}/api/v1/health`);
    assert.equal(health.status, 200);
    const afterRestart = await prisma.leadNotification.findUniqueOrThrow({
      where: { leadId: firstLeadId },
    });
    assert.equal(afterRestart.status, "PROCESSING");
  } finally {
    await restarted.stop();
  }
  const recovered = await processLeadNotificationBatch(prisma, {
    send: async () => {},
    batchSize: 1,
  });
  assert.equal(recovered.sent, 1);
  assert.equal(
    (await prisma.leadNotification.findUniqueOrThrow({
      where: { leadId: firstLeadId },
    })).status,
    "SENT",
  );
});

async function startApi(leadsEnabled: boolean) {
  const port = await reservePort();
  const child = spawn(
    process.execPath,
    ["--import", "tsx", "src/index.ts"],
    {
      cwd: process.cwd(),
      env: {
        ...process.env,
        DATABASE_URL: databaseUrl,
        SESSION_SECRET: "integration-test-session-secret-00000000000000000000",
        NODE_ENV: "test",
        PORT: String(port),
        LEADS_ENABLED: String(leadsEnabled),
        RESEND_API_KEY: "",
        RESEND_FROM_EMAIL: "",
        LEAD_NOTIFICATION_EMAIL: "",
      },
      stdio: "ignore",
    },
  );
  const origin = `http://127.0.0.1:${port}`;
  try {
    await waitForHealth(child, origin);
  } catch (error) {
    await stopChild(child);
    throw error;
  }
  return {
    origin,
    stop: async () => stopChild(child),
  };
}

async function reservePort() {
  const server = net.createServer();
  server.listen(0, "127.0.0.1");
  await once(server, "listening");
  const address = server.address();
  if (!address || typeof address === "string") throw new Error("Could not reserve a local port.");
  await new Promise<void>((resolve, reject) =>
    server.close((error) => (error ? reject(error) : resolve())),
  );
  return address.port;
}

async function waitForHealth(child: ChildProcess, origin: string) {
  const deadline = Date.now() + 15_000;
  while (Date.now() < deadline) {
    if (child.exitCode !== null) throw new Error("Test API exited before becoming healthy.");
    try {
      const response = await fetch(`${origin}/api/v1/health`);
      if (response.ok) return;
    } catch {
      // The server has not bound its port yet.
    }
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
  throw new Error("Timed out waiting for the test API health endpoint.");
}

async function stopChild(child: ChildProcess) {
  if (child.exitCode !== null) return;
  child.kill("SIGTERM");
  await new Promise<void>((resolve, reject) => {
    const timeout = setTimeout(() => {
      child.off("exit", onExit);
      reject(new Error("Test API did not stop cleanly."));
    }, 10_000);
    const onExit = () => {
      clearTimeout(timeout);
      resolve();
    };
    child.once("exit", onExit);
  });
}
