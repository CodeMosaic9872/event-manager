-- Drop legacy unique constraint on key only; allow one template row per (key, channel).
ALTER TABLE "NotificationTemplate" DROP CONSTRAINT IF EXISTS "NotificationTemplate_key_key";

CREATE UNIQUE INDEX IF NOT EXISTS "NotificationTemplate_key_channel_key" ON "NotificationTemplate"("key", "channel");
