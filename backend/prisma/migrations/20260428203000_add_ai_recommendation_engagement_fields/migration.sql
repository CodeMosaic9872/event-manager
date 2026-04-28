ALTER TABLE "AiRecommendationLog"
ADD COLUMN "clickedAt" TIMESTAMP(3),
ADD COLUMN "acceptedAt" TIMESTAMP(3);

CREATE INDEX "AiRecommendationLog_supplierId_createdAt_idx"
ON "AiRecommendationLog"("supplierId", "createdAt");
