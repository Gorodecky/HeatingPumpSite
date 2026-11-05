ALTER TABLE "LeadNotification"
ADD COLUMN "manualRetryCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN "lastManualRetryAt" TIMESTAMP(3);
