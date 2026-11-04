ALTER TABLE "Lead" ADD COLUMN "lastContactAt" TIMESTAMP(3);
UPDATE "Lead" SET "lastContactAt" = "createdAt" WHERE "lastContactAt" IS NULL;
ALTER TABLE "Lead" ALTER COLUMN "lastContactAt" SET NOT NULL;
CREATE INDEX "Lead_lastContactAt_idx" ON "Lead"("lastContactAt");
