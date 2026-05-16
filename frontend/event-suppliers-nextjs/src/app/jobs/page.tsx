"use client";

import { useMemo, useState } from "react";
import {
  useGetJobsQuery,
  useGetAppliedSupplierJobsQuery,
} from "@/shared/api/api";
import { MarketingPageShell } from "@/shared/components/marketing-page-shell";
import { SupplierJobOfferCard } from "@/shared/components/jobs/supplier-job-offer-card";
import { marketingPloniFont } from "@/shared/lib/marketing-typography";
import { useAppSelector } from "@/store/hooks";
import { JobsCategoryFilter } from "@/app/jobs/jobs-category-filter";

/* ─── Skeleton card ─────────────────────────────────────────────────── */

function JobCardSkeleton() {
  return (
    <div
      className="relative box-border flex min-h-[399px] w-full flex-col rounded-[14px] border border-[#E2E8F0] bg-white/70 shadow-sm animate-pulse overflow-hidden"
      aria-hidden="true"
    >
      <div className="absolute left-[9px] top-3.5 h-[21px] w-[93px] rounded-[20px] bg-slate-200" />
      <div className="flex min-h-0 flex-1 flex-col items-stretch px-8 pt-5">
        <div className="flex flex-col gap-3 pt-2">
          <div className="h-4 w-24 rounded bg-slate-200" />
          <div className="h-7 w-3/4 rounded bg-slate-200" />
          <div className="h-3 w-28 rounded bg-slate-100" />
        </div>
        <div className="mt-4 flex gap-4">
          <div className="h-4 w-20 rounded bg-slate-200" />
          <div className="h-4 w-24 rounded bg-slate-200" />
          <div className="h-4 w-28 rounded bg-slate-200" />
        </div>
        <div className="mt-[15px] flex flex-col gap-2">
          <div className="h-4 w-full rounded bg-slate-200" />
          <div className="h-4 w-5/6 rounded bg-slate-200" />
          <div className="h-4 w-4/6 rounded bg-slate-200" />
          <div className="h-4 w-3/6 rounded bg-slate-200" />
        </div>
        <div className="mt-auto border-t border-[#F8FAFC] pt-6 pb-5">
          <div className="flex items-end justify-between gap-4">
            <div className="flex flex-col gap-1.5">
              <div className="h-3 w-12 rounded bg-slate-200" />
              <div className="h-7 w-32 rounded bg-slate-200" />
            </div>
            <div className="h-[39px] w-28 rounded-[99px] bg-slate-200" />
          </div>
        </div>
        <div className="mb-5 h-[62px] w-full rounded-lg bg-slate-100" />
      </div>
    </div>
  );
}

function SkeletonGrid({ count = 4 }: { count?: number }) {
  return (
    <ul className="mx-auto mt-10 grid w-full max-w-[900px] list-none grid-cols-1 justify-items-center gap-x-9 gap-y-6 sm:mt-12 md:grid-cols-2 md:justify-items-stretch md:gap-x-9 md:gap-y-6">
      {Array.from({ length: count }).map((_, i) => (
        <li key={i} className="flex w-full max-w-[432px] justify-center md:max-w-none">
          <JobCardSkeleton />
        </li>
      ))}
    </ul>
  );
}

/* ─── Page ──────────────────────────────────────────────────────────── */

export default function JobsPage() {
  const sessionUser = useAppSelector((s) => s.auth.user);
  const isAuthHydrated = useAppSelector((s) => s.auth.isHydrated);

  /** Empty set = no filter (all categories) */
  const [appliedCategoryIds, setAppliedCategoryIds] = useState<Set<string>>(() => new Set());

  const skip = !isAuthHydrated || !sessionUser;

  /** Public jobs list — filtered by categoryId on the BE when set */
  const categoryArray = useMemo(
    () => Array.from(appliedCategoryIds),
    [appliedCategoryIds],
  );

  const { data: jobs = [], isLoading: loadingJobs } = useGetJobsQuery({
    page: 1,
    limit: 100,
    ...(categoryArray.length > 0 ? { categoryId: categoryArray } : {}),
  });

  /** Applied job IDs — used only to mark cards as already-applied */
  const { data: appliedJobs = [], isLoading: loadingApplied } =
    useGetAppliedSupplierJobsQuery({ page: 1, limit: 100 }, { skip });

  const appliedJobIds = useMemo(
    () => new Set(appliedJobs.map((j) => j.id)),
    [appliedJobs],
  );

  const isLoading = loadingJobs || (!!sessionUser && loadingApplied);

  return (
    <MarketingPageShell
      className="min-h-screen"
      contentClassName="!max-w-[1440px] !px-4 !pb-20 !pt-20 sm:!px-6 sm:!pt-24 lg:!pt-[123px]"
    >
      <div
        className="mx-auto flex w-full max-w-[900px] flex-col items-stretch"
        style={{ fontFamily: marketingPloniFont }}
      >
        {/* ── Hero text ── */}
        <div className="w-full text-right">
          <p className="text-[14px] font-normal uppercase leading-4 tracking-[1.2px] text-[#0061A7]">
            הזדמנויות בזמן אמת
          </p>
          <h1 className="mt-2 text-[32px] font-bold leading-none tracking-[-1.2px] text-[#00113A] sm:text-[40px] sm:tracking-[-2.4px] md:text-[48px]">
            לוח הצעות עבודה
          </h1>
          <p className="mt-3 text-base font-normal leading-6 text-[#00113A] sm:text-[20px] sm:leading-6">
            איך זה עובד? מחברים בין לקוחות לספקים - כאן אפשר לראות הזדמנויות בזמן אמת ולהגיש הצעה.
          </p>
        </div>

        {/* ── Filter + count bar ── */}
        <div className="mt-8 flex w-full flex-col gap-4 sm:mt-10 sm:flex-row sm:items-center sm:justify-between">
          <p className="order-1 text-end text-sm font-normal leading-6 text-[#00113A] sm:order-2">
            {isLoading ? "טוען..." : `מוצגות ${jobs.length} הצעות פעילות`}
          </p>
          <div className="order-2 flex w-full sm:order-1 sm:w-auto">
            <JobsCategoryFilter
              appliedIds={appliedCategoryIds}
              onAppliedIdsChange={setAppliedCategoryIds}
            />
          </div>
        </div>

        {/* ── Content ── */}
        {isLoading ? (
          <SkeletonGrid count={4} />
        ) : jobs.length === 0 ? (
          <div className="mt-12 rounded-[14px] border border-[#E2E8F0] bg-white/80 p-8 text-center text-[#00113A]">
            לא נמצאו הצעות בקטגוריה זו.
          </div>
        ) : (
          <ul className="mx-auto mt-10 grid w-full max-w-[900px] list-none grid-cols-1 justify-items-center gap-x-9 gap-y-6 sm:mt-12 md:grid-cols-2 md:justify-items-stretch md:gap-x-9 md:gap-y-6">
            {jobs.map((job) => (
              <li key={job.id} className="flex w-full max-w-[432px] justify-center md:max-w-none">
                <SupplierJobOfferCard
                  job={job}
                  isApplied={appliedJobIds.has(job.id)}
                />
              </li>
            ))}
          </ul>
        )}
      </div>
    </MarketingPageShell>
  );
}
