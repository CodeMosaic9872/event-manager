-- Add token versioning and compromise tracking for replay detection.
ALTER TABLE "User"
ADD COLUMN "refreshTokenVersion" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN "refreshTokenCompromisedAt" TIMESTAMP(3);
