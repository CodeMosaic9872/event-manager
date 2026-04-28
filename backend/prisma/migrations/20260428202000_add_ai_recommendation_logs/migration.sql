CREATE TABLE "AiRecommendationLog" (
  "id" TEXT NOT NULL,
  "conversationId" TEXT NOT NULL,
  "messageId" TEXT NOT NULL,
  "supplierId" TEXT,
  "score" DECIMAL(5,4),
  "reasonsJson" JSONB,
  "failureTag" TEXT,
  "latencyMs" INTEGER,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "AiRecommendationLog_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "AiRecommendationLog_conversationId_createdAt_idx"
ON "AiRecommendationLog"("conversationId", "createdAt");

CREATE INDEX "AiRecommendationLog_failureTag_createdAt_idx"
ON "AiRecommendationLog"("failureTag", "createdAt");

ALTER TABLE "AiRecommendationLog"
ADD CONSTRAINT "AiRecommendationLog_conversationId_fkey"
FOREIGN KEY ("conversationId") REFERENCES "AiConversation"("id")
ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "AiRecommendationLog"
ADD CONSTRAINT "AiRecommendationLog_messageId_fkey"
FOREIGN KEY ("messageId") REFERENCES "AiMessage"("id")
ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "AiRecommendationLog"
ADD CONSTRAINT "AiRecommendationLog_supplierId_fkey"
FOREIGN KEY ("supplierId") REFERENCES "Supplier"("id")
ON DELETE SET NULL ON UPDATE CASCADE;
