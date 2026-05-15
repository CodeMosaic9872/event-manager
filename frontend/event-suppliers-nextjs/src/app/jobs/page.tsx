"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useGetJobsQuery } from "@/shared/api/api";
import { MarketingPageShell } from "@/shared/components/marketing-page-shell";
import { SupplierJobOfferCard } from "@/shared/components/jobs/supplier-job-offer-card";
import { marketingPloniFont } from "@/shared/lib/marketing-typography";

export default function JobsPage() {
  const { data: allJobs = [], isLoading } = useGetJobsQuery({ status: "PUBLISHED" });
  const [selectedCategory, setSelectedCategory] = useState("all");

  const categoryOptions = useMemo(() => {
    const set = new Set(
      allJobs
        .map((job) => (job.category ?? "").trim())
        .filter((category) => category.length > 0),
    );
    return ["all", ...Array.from(set)];
  }, [allJobs]);

  const filtered = useMemo(() => {
    if (selectedCategory === "all") return allJobs;
    return allJobs.filter((job) => (job.category ?? "").trim() === selectedCategory);
  }, [allJobs, selectedCategory]);

  return (
    <MarketingPageShell
      className="min-h-screen"
      contentClassName="!max-w-[1440px] !px-4 !pb-20 !pt-20 sm:!px-6 sm:!pt-24 lg:!pt-[123px]"
    >
      <div className="mx-auto flex w-full max-w-[900px] flex-col items-stretch" style={{ fontFamily: marketingPloniFont }}>
        <div className="w-full text-right">
          <p className="text-[14px] font-normal uppercase leading-4 tracking-[1.2px] text-[#0061A7]">הזדמנויות בזמן אמת</p>
          <h1 className="mt-2 text-[32px] font-normal leading-none tracking-[-1.2px] text-[#00113A] sm:text-[40px] sm:tracking-[-2.4px] md:text-[48px]">לוח הצעות עבודה</h1>
          <p className="mt-3 text-base font-normal leading-6 text-[#00113A] sm:text-[20px] sm:leading-6">איך זה עובד? מחברים בין לקוחות לספקים - כאן אפשר לראות הזדמנויות בזמן אמת ולהגיש הצעה.</p>
        </div>

        <div className="mt-8 flex w-full flex-col gap-4 sm:mt-10 sm:flex-row sm:items-center sm:justify-between">
          <p className="order-1 text-end text-sm font-normal leading-6 text-[#00113A] sm:order-2">
            {isLoading ? "טוען..." : `מוצגות ${filtered.length} הצעות פעילות`}
          </p>
          <div className="order-2 flex w-full sm:order-1 sm:w-auto">
            <label className="sr-only" htmlFor="jobs-category-filter">Filter by category</label>
            <select
              id="jobs-category-filter"
              value={selectedCategory}
              onChange={(event) => setSelectedCategory(event.target.value)}
              className="h-[56px] w-full rounded-2xl border border-[#BFDBFE] bg-white px-5 text-base leading-6 text-[#00113A] outline-none sm:min-w-[290px]"
            >
              <option value="all">Filter by: Select a category</option>
              {categoryOptions.filter((c) => c !== "all").map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </div>

        {isLoading ? (
          <div className="mt-12 rounded-[14px] border border-[#E2E8F0] bg-white/80 p-8 text-center text-[#00113A]">טוען הצעות...</div>
        ) : (
          <>
            <ul className="mx-auto mt-10 grid w-full max-w-[900px] list-none grid-cols-1 justify-items-center gap-x-9 gap-y-6 sm:mt-12 md:grid-cols-2 md:justify-items-stretch md:gap-x-9 md:gap-y-6">
              {filtered.map((job) => (
                <li key={job.id} className="flex w-full max-w-[432px] justify-center md:max-w-none">
                  <SupplierJobOfferCard job={job} />
                </li>
              ))}
            </ul>
            {filtered.length === 0 && <p className="mt-10 text-center text-[#00113A]">לא נמצאו הצעות בקטגוריה זו.</p>}
          </>
        )}
      </div>
    </MarketingPageShell>
  );
}
