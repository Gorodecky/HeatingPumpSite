import { Resend } from "resend";

export type NotificationLead = {
  id: string;
  createdAt: Date;
  source: string;
  name: string;
  phone: string;
  city: string | null;
  area: string | null;
  objectType: string | null;
  heatingSystem: string | null;
  realizationTiming: string | null;
  comment: string | null;
};

const labels: Record<string, string> = {
  source: "Тип заявки",
  name: "Ім’я",
  phone: "Телефон",
  city: "Місто / населений пункт",
  area: "Площа об’єкта",
  objectType: "Тип об’єкта",
  heatingSystem: "Система опалення",
  realizationTiming: "Строк реалізації",
  comment: "Коментар",
};
const sourceLabels: Record<string, string> = {
  contact: "Контактна форма",
  selection: "Підбір теплового насоса",
};

export function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (character) => {
    const entities: Record<string, string> = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    };
    return entities[character];
  });
}

export function buildLeadEmail(lead: NotificationLead) {
  const type = sourceLabels[lead.source] ?? lead.source;
  const fields: Array<[string, string]> = [
    [labels.source, type],
    ["ID заявки", lead.id],
    ["Дата й час", lead.createdAt.toISOString()],
    [labels.name, lead.name],
    [labels.phone, lead.phone],
    [labels.city, lead.city ?? "—"],
    [labels.area, lead.area ?? "—"],
    [labels.objectType, lead.objectType ?? "—"],
    [labels.heatingSystem, lead.heatingSystem ?? "—"],
    [labels.realizationTiming, lead.realizationTiming ?? "—"],
    [labels.comment, lead.comment ?? "—"],
  ];
  const subject = `Нова заявка: ${type} (${lead.id})`;
  const text = fields.map(([label, value]) => `${label}: ${value}`).join("\n");
  const html = `<h1>Нова заявка: ${escapeHtml(type)}</h1><table>${fields
    .map(
      ([label, value]) =>
        `<tr><th align="left">${escapeHtml(label)}</th><td>${escapeHtml(value).replace(/\n/g, "<br>")}</td></tr>`,
    )
    .join("")}</table>`;
  return { subject, text, html };
}

export async function sendLeadNotification(
  lead: NotificationLead,
  config: {
    apiKey?: string;
    from?: string;
    to?: string;
  },
  send: (
    payload: ReturnType<typeof buildLeadEmail> & {
      from: string;
      to: string;
    },
    idempotencyKey: string,
  ) => Promise<{ error: { name?: string } | null }>,
) {
  if (!config.apiKey || !config.from || !config.to) {
    throw new Error("RESEND_NOT_CONFIGURED");
  }
  const payload = buildLeadEmail(lead);
  const result = await send(
    { ...payload, from: config.from, to: config.to },
    `lead-notification/${lead.id}`,
  );
  if (result.error) throw new Error(result.error.name || "RESEND_SEND_FAILED");
}

export async function sendWithResend(
  lead: NotificationLead,
  config = {
    apiKey: process.env.RESEND_API_KEY,
    from: process.env.RESEND_FROM_EMAIL,
    to: process.env.LEAD_NOTIFICATION_EMAIL,
  },
) {
  const client = config.apiKey ? new Resend(config.apiKey) : undefined;
  return sendLeadNotification(lead, config, async (payload, idempotencyKey) => {
    if (!client) throw new Error("RESEND_NOT_CONFIGURED");
    const { error } = await client.emails.send(
      {
        from: payload.from,
        to: payload.to,
        subject: payload.subject,
        text: payload.text,
        html: payload.html,
      },
      { idempotencyKey },
    );
    return { error: error ? { name: error.name } : null };
  });
}
