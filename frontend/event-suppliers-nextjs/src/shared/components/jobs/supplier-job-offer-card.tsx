"use client";

import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import type { JobSummaryResponse } from "@/shared/types";
import { useAppSelector } from "@/store/hooks";
import { JobIconDate, JobIconLocation } from "./job-public-icons";
import { SubmitProposalModal } from "./submit-proposal-modal";

function formatEventDate(iso: string | undefined) {
  if (!iso) return "—";
  try {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return iso;
    return d.toLocaleDateString("he-IL", { day: "numeric", month: "long", year: "numeric" });
  } catch {
    return iso;
  }
}

function formatBudgetRange(min: number, max: number) {
  const fmt = (n: number) =>
    n.toLocaleString("he-IL", { maximumFractionDigits: 0, useGrouping: true });
  return `₪${fmt(min)} - ₪${fmt(max)}`;
}

function MetadataChip({
  children,
  icon,
}: {
  children: ReactNode;
  icon: ReactNode;
}) {
  return (
    <span className="inline-flex items-center gap-1.5 text-right text-sm font-normal leading-5 text-black">
      {children}
      {icon}
    </span>
  );
}

export function SupplierJobOfferCard({ job }: { job: JobSummaryResponse }) {
  const router = useRouter();
  const [proposalOpen, setProposalOpen] = useState(false);
  const sessionUser = useAppSelector((state) => state.auth.user);
  const category = job.category ?? "אירוע חברה";
  const audience = job.audienceLabel ?? "כמות קהל: 1000 - 1200 איש";
  const location = job.location ?? "תל אביב";
  const dateLabel = formatEventDate(job.eventDate);
  const description =
    job.description ?? "אירוע חברה, ציוד הגברה ותאורה כולל.";
  const budget = formatBudgetRange(job.budgetMin, job.budgetMax);
  const isActive = (job.status || "").toUpperCase() === "OPEN" || job.status === "OPEN";
  const isMine = Boolean(job.isMine);
  const canSubmitProposal = Boolean(
    sessionUser?.roles.some((role) => role === "supplier" || role === "admin"),
  );
  const canPrimaryAction = isMine || canSubmitProposal;

  const handlePrimaryAction = () => {
    if (isMine) {
      const params = new URLSearchParams({
        edit: "1",
        id: job.id,
        title: job.title,
        eventType: job.category ?? "",
        location: job.location ?? "",
        date: job.eventDate ?? "",
        budget:
          job.budgetMin && job.budgetMax && job.budgetMin !== job.budgetMax
            ? `${job.budgetMin}-${job.budgetMax}`
            : `${job.budgetMin ?? 0}`,
        description: job.description ?? "",
      });
      router.push(`/jobs/publish?${params.toString()}`);
      return;
    }
    if (!canSubmitProposal) return;
    setProposalOpen(true);
  };

  const primaryLabel = isMine ? "ניהול ההצעה" : "הגשת הצעה";

  return (
    <>
      <article
        dir="rtl"
        lang="he"
        className="relative box-border flex min-h-[399px] w-full flex-col rounded-[14px] border border-[#4721DF] bg-[rgba(230,241,255,0.64)] shadow-[1px_1px_2px_#4721DF]"
      >
        {isActive ? (
          <div
            className={`absolute left-[9px] top-3.5 z-10 flex h-[21px] min-w-[93px] items-center justify-center rounded-[20px] px-2.5 ${
              isMine ? "bg-[#BDC3FF]" : "bg-[#6AB7FF]"
            }`}
          >
            <span className="text-center text-xs font-normal uppercase leading-4 tracking-[0.6px] text-[#002D53]">
              {isMine ? "המכרז שלי" : "פעיל"}
            </span>
          </div>
        ) : null}

        <div className="flex min-h-0 flex-1 flex-col items-stretch px-8 pt-5">
          <div className="min-h-0 w-full flex-1">
            <div className="flex w-full flex-col items-start gap-0">
              <p className="w-full text-right text-[18px] font-normal leading-[28px] text-[#4721DF]">
                {category}
              </p>
              <h2 className="mt-2 w-full text-right text-2xl font-normal leading-8 text-black">
                {job.title}
              </h2>
            </div>

            {/* Meta row: group from the physical right (reading start in RTL) */}
            <div className="mt-4 flex w-full flex-wrap items-center justify-start gap-x-4 gap-y-2 text-sm">
              <MetadataChip icon={<JobIconDate className="h-[13px] w-3 shrink-0" />}>
                {dateLabel}
              </MetadataChip>
              <MetadataChip icon={<JobIconLocation className="h-[13px] w-2.5 shrink-0" />}>
                {location}
              </MetadataChip>
              <span className="w-full text-right text-sm font-normal leading-5 text-black sm:w-auto">
                {audience}
              </span>
            </div>

            <div className="mt-[15px] flex w-full flex-col items-start gap-3">
              <h3 className="w-full text-right text-[20px] font-normal uppercase leading-6 tracking-[1.6px] text-black">
                פירוט ההצעה
              </h3>
              <p className="line-clamp-4 w-full text-right text-xs font-normal leading-4 text-black">
                {description}
              </p>
            </div>
          </div>

          <div className="mt-7 w-full border-t border-[#F8FAFC] pt-6">
            <div className="flex w-full flex-col items-stretch gap-4 sm:flex-row sm:items-end sm:justify-between sm:gap-[18px]">
              <div className="w-full text-right sm:w-auto sm:pe-0">
                <p className="text-xs font-normal leading-4 text-black">תקציב משוער</p>
                <p className="text-2xl font-normal leading-8 text-[#00113A]">{budget}</p>
              </div>
              <button
                type="button"
                disabled={!canPrimaryAction}
                onClick={handlePrimaryAction}
                dir="ltr"
                className={`inline-flex h-[39px] min-w-0 shrink-0 items-center justify-center gap-2 rounded-[99px] px-6 py-3 text-center text-base font-normal leading-6 text-white ${
                  canPrimaryAction
                    ? "bg-[#201C44] hover:bg-[#151238]"
                    : "cursor-not-allowed bg-[#C5C8D0] text-white!"
                }`}
              >
                <Image
                  src="/left-arrow.svg"
                  alt=""
                  width={10}
                  height={8}
                  className="h-2.5 w-auto shrink-0 brightness-0 invert"
                  aria-hidden
                  unoptimized
                />
                <span className="text-white">{primaryLabel}</span>
              </button>
            </div>
          </div>

          <div className="mt-4">
            <div className="flex items-center justify-between gap-3 rounded-lg bg-[#F3F4F5] p-4 isolation-isolate">
              <div className="flex min-w-0 items-center gap-3">
                <div
                  className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-[#E2E8F0]"
                  aria-hidden
                >
                  <Image
                    src="/lock.svg"
                    alt=""
                    width={16}
                    height={21}
                    className="h-5 w-4 object-contain brightness-0 saturate-100"
                    aria-hidden
                    unoptimized
                  />
                </div>
                <div className="flex min-w-0 flex-col items-start text-right">
                  <p className="w-full text-right text-xs font-normal uppercase leading-4 tracking-[-0.3px] text-black">
                    פרטי התקשרות
                  </p>
                  <p
                    className="max-w-[138px] blur-[2px] text-right text-[10px] font-normal leading-5 text-[#444650]"
                    style={{ fontFamily: "Inter, system-ui, sans-serif" }}
                  >
                    client.email@provider.com
                  </p>
                </div>
              </div>
              <Link
                href="/join-supplier"
                className="z-1 max-w-[132px] shrink-0 text-right text-[10px] font-normal leading-3 text-[#0061A7] hover:underline"
              >
                הירשם כספק כדי להגיש מועמדות
              </Link>
            </div>
          </div>
        </div>
      </article>
      <SubmitProposalModal job={job} open={proposalOpen} onClose={() => setProposalOpen(false)} />
    </>
  );
}
