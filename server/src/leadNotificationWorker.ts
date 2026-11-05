import type { PrismaClient } from "@prisma/client";
import {
  sendWithResend,
  type NotificationLead,
} from "./leadNotifications.js";

export const RESEND_IDEMPOTENCY_WINDOW_MS = 24 * 60 * 60 * 1000;
export const AUTOMATIC_RETRY_WINDOW_MS = 20 * 60 * 60 * 1000;
export const MAX_NOTIFICATION_ATTEMPTS = 8;
const retryDelaysMs = [
  60_000,
  5 * 60_000,
  15 * 60_000,
  60 * 60_000,
  3 * 60 * 60_000,
  6 * 60 * 60_000,
];

type ClaimedNotification = {
  leadId: string;
  attempts: number;
  firstAttemptAt: Date;
};

type WorkerOptions = {
  now?: () => Date;
  send?: (lead: NotificationLead) => Promise<void>;
  batchSize?: number;
};

export async function processLeadNotificationBatch(
  prisma: PrismaClient,
  options: WorkerOptions = {},
) {
  const now = options.now ?? (() => new Date());
  const send = options.send ?? sendWithResend;
  const batchSize = options.batchSize ?? 5;
  let processed = 0;
  let sent = 0;
  let failed = 0;

  for (; processed < batchSize; processed += 1) {
    const claimed = await prisma.$transaction((transaction) =>
      transaction.$queryRaw<ClaimedNotification[]>`
        WITH candidate AS (
          SELECT "id" FROM "LeadNotification"
          WHERE ("status" = 'PENDING' AND "nextAttemptAt" <= ${now()})
             OR ("status" = 'PROCESSING' AND "lockedAt" < ${now()} - INTERVAL '5 minutes')
          ORDER BY "nextAttemptAt", "createdAt"
          FOR UPDATE SKIP LOCKED
          LIMIT 1
        )
        UPDATE "LeadNotification" AS notification
        SET "status" = 'PROCESSING', "lockedAt" = ${now()},
            "attempts" = "attempts" + 1,
            "firstAttemptAt" = COALESCE("firstAttemptAt", ${now()}),
            "updatedAt" = ${now()}
        FROM candidate
        WHERE notification."id" = candidate."id"
        RETURNING notification."leadId", notification."attempts",
                  notification."firstAttemptAt"
      `,
    );
    const notification = claimed[0];
    if (!notification) break;

    const attemptedAt = now();
    const ageMs = attemptedAt.getTime() - notification.firstAttemptAt.getTime();
    let terminalError: string | undefined;
    if (ageMs >= RESEND_IDEMPOTENCY_WINDOW_MS) {
      terminalError = "IDEMPOTENCY_WINDOW_EXPIRED";
    } else if (ageMs >= AUTOMATIC_RETRY_WINDOW_MS) {
      terminalError = "AUTOMATIC_RETRY_WINDOW_EXPIRED";
    } else if (notification.attempts > MAX_NOTIFICATION_ATTEMPTS) {
      terminalError = "MAX_ATTEMPTS_EXCEEDED";
    }

    if (terminalError) {
      await prisma.leadNotification.update({
        where: { leadId: notification.leadId },
        data: {
          status: "FAILED",
          lockedAt: null,
          lastErrorCode: terminalError,
        },
      });
      failed += 1;
      continue;
    }

    try {
      const lead = await prisma.lead.findUnique({
        where: { id: notification.leadId },
        select: {
          id: true,
          createdAt: true,
          source: true,
          name: true,
          phone: true,
          city: true,
          area: true,
          objectType: true,
          heatingSystem: true,
          realizationTiming: true,
          comment: true,
        },
      });
      if (!lead) throw new Error("LEAD_NOT_FOUND");
      await send(lead as NotificationLead);
      await prisma.leadNotification.update({
        where: { leadId: notification.leadId },
        data: {
          status: "SENT",
          sentAt: now(),
          lockedAt: null,
          lastErrorCode: null,
        },
      });
      sent += 1;
    } catch (error) {
      const errorCode =
        error instanceof Error && /^[A-Z0-9_]{1,100}$/.test(error.message)
          ? error.message
          : "DELIVERY_ERROR";
      const exhausted =
        notification.attempts >= MAX_NOTIFICATION_ATTEMPTS ||
        now().getTime() - notification.firstAttemptAt.getTime() >=
          AUTOMATIC_RETRY_WINDOW_MS;
      const delay =
        retryDelaysMs[
          Math.min(notification.attempts - 1, retryDelaysMs.length - 1)
        ];
      await prisma.leadNotification.update({
        where: { leadId: notification.leadId },
        data: {
          status: exhausted ? "FAILED" : "PENDING",
          lockedAt: null,
          nextAttemptAt: new Date(now().getTime() + delay),
          lastErrorCode: errorCode,
        },
      });
      console.error(`Lead notification delivery failed (${errorCode}).`);
      if (exhausted) failed += 1;
    }
  }

  return { processed, sent, failed };
}
