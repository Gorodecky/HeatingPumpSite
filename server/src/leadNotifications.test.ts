import assert from "node:assert/strict";
import test from "node:test";
import {
  buildLeadEmail,
  sendLeadNotification,
  type NotificationLead,
} from "./leadNotifications.js";

const baseLead: NotificationLead = {
  id: "8f7c77ea-4a31-4d6b-a5d6-b6afac3d3c53",
  createdAt: new Date("2026-11-05T10:20:30.000Z"),
  source: "selection",
  name: "Олена",
  phone: "+380638788281",
  city: "Вінниця",
  area: "100–150 м²",
  objectType: "Новий будинок",
  heatingSystem: "Тепла підлога",
  realizationTiming: "Найближчим часом",
  comment: "Потрібен підбір",
};

test("formats a selection lead with every stored field and escaped HTML", () => {
  const email = buildLeadEmail({
    ...baseLead,
    name: "<Олена & Іван>",
    comment: "<script>alert('x')</script>",
  });
  assert.match(email.subject, /Підбір теплового насоса/);
  for (const value of [
    baseLead.id,
    "2026-11-05T10:20:30.000Z",
    "Вінниця",
    "100–150 м²",
    "Новий будинок",
    "Тепла підлога",
    "Найближчим часом",
    "+380638788281",
  ]) assert.ok(email.text.includes(value));
  assert.ok(email.html.includes("&lt;Олена &amp; Іван&gt;"));
  assert.ok(!email.html.includes("<script>"));
});

test("formats a contact lead and includes an empty comment explicitly", () => {
  const email = buildLeadEmail({
    ...baseLead,
    source: "contact",
    city: null,
    area: null,
    objectType: null,
    heatingSystem: null,
    realizationTiming: null,
    comment: null,
  });
  assert.match(email.subject, /Контактна форма/);
  assert.match(email.text, /Коментар: —/);
});

test("retries use the same Resend idempotency key and surface provider errors", async () => {
  const keys: string[] = [];
  const mockSend = async (
    _payload: { from: string; to: string; subject: string; text: string; html: string },
    key: string,
  ) => {
    keys.push(key);
    return { error: keys.length === 1 ? { name: "rate_limit_exceeded" } : null };
  };
  const config = {
    apiKey: "mock-key",
    from: "notifications@example.test",
    to: "manager@example.test",
  };
  await assert.rejects(sendLeadNotification(baseLead, config, mockSend), /rate_limit_exceeded/);
  await sendLeadNotification(baseLead, config, mockSend);
  assert.deepEqual(keys, [
    `lead-notification/${baseLead.id}`,
    `lead-notification/${baseLead.id}`,
  ]);
  await assert.rejects(
    sendLeadNotification(baseLead, { ...config, apiKey: undefined }, mockSend),
    /RESEND_NOT_CONFIGURED/,
  );
});
