CREATE TABLE "JobApplicationHistory" (
  "id" TEXT NOT NULL,
  "jobApplicationId" TEXT NOT NULL,
  "fromStatus" "JobApplicationStatus",
  "toStatus" "JobApplicationStatus" NOT NULL,
  "reason" TEXT,
  "actorType" TEXT NOT NULL,
  "actorId" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "JobApplicationHistory_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "JobApplicationHistory_jobApplicationId_createdAt_idx"
ON "JobApplicationHistory"("jobApplicationId", "createdAt");

ALTER TABLE "JobApplicationHistory"
ADD CONSTRAINT "JobApplicationHistory_jobApplicationId_fkey"
FOREIGN KEY ("jobApplicationId") REFERENCES "JobApplication"("id")
ON DELETE CASCADE ON UPDATE CASCADE;
