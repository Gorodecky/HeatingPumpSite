import type { PrismaClient } from "@prisma/client";

export type NewLeadData = {
  source: "selection" | "contact";
  city?: string;
  area?: string;
  object?: string;
  heating?: string;
  timing?: string;
  name: string;
  phone: string;
  comment?: string;
  policyVersion: string;
};

export async function createLeadWithNotification(
  prisma: PrismaClient,
  input: NewLeadData,
) {
  return prisma.$transaction(async (transaction) => {
    const lead = await transaction.lead.create({
      data: {
        source: input.source,
        lastContactAt: new Date(),
        city: input.city,
        area: input.area,
        objectType: input.object,
        heatingSystem: input.heating,
        realizationTiming: input.timing,
        name: input.name,
        phone: input.phone,
        comment: input.comment,
        consentGiven: true,
        consentAt: new Date(),
        policyVersion: input.policyVersion,
      },
      select: { id: true, createdAt: true, status: true },
    });
    await transaction.leadNotification.create({ data: { leadId: lead.id } });
    return lead;
  });
}
