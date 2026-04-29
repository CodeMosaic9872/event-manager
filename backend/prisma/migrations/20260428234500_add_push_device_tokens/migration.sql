CREATE TABLE "PushDeviceToken" (
  "id" TEXT NOT NULL,
  "userId" TEXT,
  "supplierId" TEXT,
  "token" TEXT NOT NULL,
  "platform" TEXT,
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  "lastSeenAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "PushDeviceToken_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "PushDeviceToken_token_key" ON "PushDeviceToken"("token");
CREATE INDEX "PushDeviceToken_userId_isActive_idx" ON "PushDeviceToken"("userId", "isActive");
CREATE INDEX "PushDeviceToken_supplierId_isActive_idx" ON "PushDeviceToken"("supplierId", "isActive");

ALTER TABLE "PushDeviceToken"
ADD CONSTRAINT "PushDeviceToken_userId_fkey"
FOREIGN KEY ("userId") REFERENCES "User"("id")
ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "PushDeviceToken"
ADD CONSTRAINT "PushDeviceToken_supplierId_fkey"
FOREIGN KEY ("supplierId") REFERENCES "Supplier"("id")
ON DELETE CASCADE ON UPDATE CASCADE;
