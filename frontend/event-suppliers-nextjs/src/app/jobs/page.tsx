"use client";

import Link from "next/link";
import { useGetJobsQuery } from "@/shared/api/api";

export default function JobsPage() {
  const { data: jobs = [], isLoading } = useGetJobsQuery();
  return (
    <section className="mx-auto w-full max-w-[1200px] rounded-[24px] border border-[#bfdbfe] bg-[linear-gradient(180deg,#9BD3EF_0%,#FFFFFF_58%)] p-8">
      <div className="mb-4 flex items-center justify-between rounded-2xl border border-[#201c44] bg-white/60 p-5">
        <h1 className="text-3xl text-[#201c44]">עמוד הצעות עבודה</h1>
        <Link href="/jobs/publish" className="rounded-full bg-[#266dd8] px-4 py-2 text-white">
          פרסום דרישה חדשה
        </Link>
      </div>
      {isLoading ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-4 text-slate-700">טוען מודעות...</div>
      ) : jobs.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-4 text-slate-700">
          עדיין אין מודעות. אפשר להתחיל בפרסום ראשון.
        </div>
      ) : (
        <div className="grid gap-3">
          {jobs.map((job) => (
            <article key={job.id} className="rounded-2xl border border-slate-200 bg-white p-5">
              <div className="mb-2 flex items-center justify-between text-xs text-slate-400">
                <span>Relevant</span>
                <span className="rounded-full bg-[#dbeafe] px-2 py-1 text-[#1d4ed8]">OPEN</span>
              </div>
              <h2 className="text-lg text-[#201c44]">{job.title}</h2>
              <p className="text-sm text-slate-600">
                סטטוס: {job.status} | תקציב {job.budgetMin} - {job.budgetMax}
              </p>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
