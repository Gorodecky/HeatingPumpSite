ALTER TABLE "LeadNotification" ADD COLUMN "firstAttemptAt" TIMESTAMP(3);

-- Conservatively anchor already-attempted rows to queue creation so that an
-- old row can never get a fresh provider idempotency window by upgrading.
UPDATE "LeadNotification"
SET "firstAttemptAt" = "createdAt"
WHERE "attempts" > 0;
