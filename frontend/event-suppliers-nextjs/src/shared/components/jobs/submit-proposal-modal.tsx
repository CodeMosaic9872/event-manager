"use client";

import Link from "next/link";
import { useCallback, useEffect, useId, useState } from "react";
import type { JobSummaryResponse } from "@/shared/types";
import { useApplyToJobMutation } from "@/shared/api/api";
import {
  JobIconBackArrow,
  JobIconClose,
  JobIconDate,
  JobIconLocation,
  JobIconSuccessCheck,
} from "./job-public-icons";

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
  const fmt = (n: number) => n.toLocaleString("he-IL", { maximumFractionDigits: 0, useGrouping: true });
  return `₪${fmt(min)} - ₪${fmt(max)}`;
}

function serviceChipText(job: JobSummaryResponse) {
  const cat = job.category ?? "קייטרינג";
  const aud = job.audienceLabel?.replace(/^כמות קהל:\s*/i, "").trim();
  return aud ? `${cat} (${aud})` : cat;
}

export type SubmitProposalModalProps = {
  job: JobSummaryResponse;
  open: boolean;
  onClose: () => void;
  /** Called after a successful API apply (optional). */
  onConfirm?: () => void;
};

export function SubmitProposalModal({ job, open, onClose, onConfirm }: SubmitProposalModalProps) {
  const [step, setStep] = useState<"form" | "success">("form");
  const [applyToJob, { isLoading: isApplying, error: applyError }] = useApplyToJobMutation();
  const formTitleId = useId();
  const successTitleId = useId();

  const close = useCallback(() => {
    setStep("form");
    onClose();
  }, [onClose]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, close]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  if (!open) return null;

  const dateLabel = formatEventDate(job.eventDate);
  const location = job.locationText ?? job.location ?? "תל אביב";
  const audience = job.audienceLabel ?? "כמות קהל: 1000 - 1200 איש";
  const budget = formatBudgetRange(job.budgetMin, job.budgetMax);

  const applyErrorMessage =
    applyError && typeof applyError === "object" && applyError !== null && "data" in applyError
      ? String((applyError as { data?: { message?: string } }).data?.message ?? "")
      : "";

  const handleSubmit = async () => {
    try {
      await applyToJob({ jobId: job.id, message: "" }).unwrap();
      onConfirm?.();
      setStep("success");
    } catch {
      /* error surfaced via applyError */
    }
  };

  const labelledBy = step === "form" ? formTitleId : successTitleId;

  return (
    <>
      <button
        type="button"
        className="fixed inset-0 z-60 cursor-default bg-black/47"
        aria-label="סגור"
        onClick={close}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={labelledBy}
        dir="rtl"
        lang="he"
        className="fixed left-1/2 top-1/2 z-61 w-[min(90vw,576px)] max-w-[576px] max-h-[90vh] -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-[24px] border border-[rgba(134,85,246,0.2)] bg-[#E3F0FC] shadow-[0px_8px_32px_rgba(0,0,0,0.37)] backdrop-blur-[6px]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative max-h-[90vh] overflow-y-auto px-8 pb-10 pt-14 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden" dir="rtl" lang="he">
          <button
            type="button"
            onClick={close}
            className="absolute inset-s-5 top-5 flex h-10 w-10 items-center justify-center rounded-full"
            aria-label="סגור"
          >
            <JobIconClose className="h-[18px] w-[18px] opacity-45 transition hover:opacity-100" />
          </button>

          {step === "form" ? (
            <>
              <div className="mx-auto flex w-full max-w-[437px] flex-col gap-4 text-center">
                <h2
                  id={formTitleId}
                  className="text-[36px] font-bold leading-[40px] tracking-[-0.72px] text-[#00113A]"
                >
                  האם ברצונך להגיש מועמדות להצעה - {job.title}?
                </h2>
              </div>

              <div className="mx-auto mt-6 flex w-full max-w-[368px] flex-wrap items-center justify-start gap-x-4 gap-y-2 text-start text-sm leading-5 text-black sm:justify-between">
                <span className="inline-flex items-center gap-1.5 text-right">
                  <JobIconDate className="h-3.5 w-3.5 shrink-0" />
                  <span>{dateLabel}</span>
                </span>
                <span className="inline-flex items-center gap-1.5 text-right">
                  <JobIconLocation className="h-3.5 w-3.5 shrink-0" />
                  <span>{location}</span>
                </span>
                <span className="w-full text-right sm:w-auto">{audience}</span>
              </div>

              <div className="mx-auto mt-8 flex w-full max-w-[368px] flex-col items-start gap-3">
                <p className="text-right text-[16px] font-medium uppercase leading-6 tracking-[1.6px] text-black">
                  שירות נדרש
                </p>
                <div className="inline-flex rounded-sm bg-[#CDE5FF] px-3 py-1">
                  <span className="text-right text-[12px] font-medium leading-4 text-[#004B74]">
                    {serviceChipText(job)}
                  </span>
                </div>
              </div>

              <div className="mx-auto mt-6 w-full max-w-[368px] border-t border-[#C5C5C5] pt-6">
                <div className="text-right">
                  <p className="text-[12px] leading-4 text-black">תקציב</p>
                  <p className="text-[24px] font-bold leading-[32px] text-[#00113A]">{budget}</p>
                </div>
              </div>

              {applyErrorMessage ? (
                <p className="mx-auto mt-4 w-full max-w-[368px] text-right text-sm text-red-600" role="alert">
                  {applyErrorMessage || "לא ניתן להגיש את ההצעה. נסה שוב."}
                </p>
              ) : null}

              <div className="mx-auto mt-16 flex w-full max-w-[368px]">
                <button
                  type="button"
                  onClick={() => void handleSubmit()}
                  disabled={isApplying}
                  className="flex h-[48px] min-w-[209px] items-center justify-center rounded-[99px] bg-[#00113A] px-6 text-center text-[24px] font-semibold leading-[24px] text-white disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isApplying ? "שולח..." : "הגשת הצעה"}
                </button>
              </div>
            </>
          ) : (
            <>
              <p id={successTitleId} className="sr-only">
                המכרז הוגש בהצלחה
              </p>

              <div className="mx-auto flex w-full max-w-[379px] flex-col items-stretch gap-4 pt-2 text-right">
                <div className="flex w-full max-w-[339px] flex-row items-center justify-center gap-3.5 self-center rounded-[20px] bg-[#6AB7FF] px-3 py-2.5">
                  <JobIconSuccessCheck className="h-[29px] w-[29px] shrink-0" />
                  <span className="text-center text-[24px] font-medium leading-[24px] tracking-[0.3px] text-[#201C44]">
                   המועמדות הוגשה בהצלחה!
                  </span>
                </div>

                <p className="text-center text-[18px] font-normal leading-[29px] text-black">
                 הפרטים שלך עברו בהצלחה ללקוח, שמחים שלקחת חלק ומחזיקים לך אצבעות {`:)`}
                </p>

                <div className="flex w-full flex-col pt-4">
                  <Link
                    href="/jobs"
                    onClick={close}
                    className="flex h-[48px] w-full flex-row items-center justify-center gap-2 rounded-[99px] bg-[#201C44] px-8 text-[16px] font-semibold leading-[24px] text-white! transition hover:bg-[#151238]"
                  >
                    <span>חזרה ללוח המכרזים</span>
                    <JobIconBackArrow className="h-[14px] w-[14px] shrink-0 brightness-0 invert" />
                  </Link>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}
