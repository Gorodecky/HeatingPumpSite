CREATE TYPE "LeadNotificationStatus" AS ENUM ('PENDING', 'PROCESSING', 'SENT', 'FAILED');

CREATE TABLE "LeadNotification" (
    "id" UUID NOT NULL,
    "leadId" UUID NOT NULL,
    "status" "LeadNotificationStatus" NOT NULL DEFAULT 'PENDING',
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "nextAttemptAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lockedAt" TIMESTAMP(3),
    "sentAt" TIMESTAMP(3),
    "lastErrorCode" VARCHAR(100),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "LeadNotification_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "LeadNotification_leadId_key" ON "LeadNotification"("leadId");
CREATE INDEX "LeadNotification_status_nextAttemptAt_idx" ON "LeadNotification"("status", "nextAttemptAt");
ALTER TABLE "LeadNotification" ADD CONSTRAINT "LeadNotification_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "Lead"("id") ON DELETE CASCADE ON UPDATE CASCADE;
