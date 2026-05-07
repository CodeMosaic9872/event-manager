import { demoSupplierJobOffers } from "@/shared/data/supplier-job-offers.demo";
import type { JobSummaryResponse } from "@/shared/types";

export type LocalPublishedJob = {
  id: string;
  title: string;
  eventType: string;
  city: string;
  budget: string;
  date: string;
  description: string;
  isMine?: boolean;
};

function parseBudget(raw: string): number {
  const n = Number(raw.replace(/[^\d]/g, ""));
  return Number.isFinite(n) && n > 0 ? n : 0;
}

/** Merges Redux-published jobs, API jobs, and demo fallbacks; local rows override demo by id. */
export function mergeJobList(
  apiJobs: JobSummaryResponse[] | undefined,
  localJobs: LocalPublishedJob[],
): JobSummaryResponse[] {
  const localMapped: JobSummaryResponse[] = localJobs.map((job) => {
    const budget = parseBudget(job.budget);
    const fallback = budget > 0 ? budget : 10000;
    return {
      id: job.id,
      title: job.title,
      status: "OPEN",
      budgetMin: fallback,
      budgetMax: fallback,
      category: job.eventType,
      location: job.city,
      eventDate: job.date,
      description: job.description,
      isMine: job.isMine ?? true,
    };
  });
  const localIds = new Set(localMapped.map((j) => j.id));

  if (apiJobs && apiJobs.length > 0) {
    const apiOnly = apiJobs.filter((j) => !localIds.has(j.id));
    return [...localMapped, ...apiOnly];
  }

  const demoFiltered = demoSupplierJobOffers.filter((j) => !localIds.has(j.id));
  return [...localMapped, ...demoFiltered];
}
