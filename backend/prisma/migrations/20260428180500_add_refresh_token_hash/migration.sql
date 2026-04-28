-- Add refresh token hash storage to support secure JWT rotation/revocation.
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "refreshTokenHash" TEXT;
