"use client";

import { useCallback, useEffect, useId, useMemo, useState } from "react";

/** Fixed filter categories from design (Hebrew labels). */
export const JOBS_FILTER_CATEGORY_IDS = ["dj", "halls", "photo", "catering"] as const;
export type JobsFilterCategoryId = (typeof JOBS_FILTER_CATEGORY_IDS)[number];

const CATEGORY_ROWS: { id: JobsFilterCategoryId; label: string }[] = [
  { id: "dj", label: "דיג'יי (DJ)" },
  { id: "halls", label: "אולמות אירועים" },
  { id: "photo", label: "צילום והפקה" },
  { id: "catering", label: "קייטרינג" },
];

const LABEL_BY_ID = Object.fromEntries(CATEGORY_ROWS.map((r) => [r.id, r.label])) as Record<
  JobsFilterCategoryId,
  string
>;

/** Map API `job.category` (and light fallbacks) to a design category id, or null if unknown. */
export function jobPrimaryFilterCategoryId(job: {
  category?: string;
  title?: string;
  description?: string;
}): JobsFilterCategoryId | null {
  const blob = `${job.category ?? ""} ${job.title ?? ""} ${job.description ?? ""}`.trim();
  if (!blob) return null;
  const c = job.category?.trim() ?? "";
  const lower = blob.toLowerCase();

  if (/אולמות|אירועים.*אולם|event\s*hall|venue|hall/i.test(blob) || lower.includes("hall")) {
    return "halls";
  }
  if (/קייטרינג|catering|food|מזון/i.test(blob)) {
    return "catering";
  }
  if (/צילום|הפקה|photo|production|video/i.test(blob)) {
    return "photo";
  }
  if (/דיג׳יי|דיג'יי|\bdj\b|d\.j\./i.test(blob) || lower.includes("dj")) {
    return "dj";
  }

  if (c) {
    const cl = c.toLowerCase();
    if (cl.includes("אולם") || cl.includes("hall")) return "halls";
    if (cl.includes("קייטר")) return "catering";
    if (cl.includes("צילום") || cl.includes("הפקה")) return "photo";
    if (cl.includes("דיג")) return "dj";
  }

  return null;
}

export function jobPassesCategoryFilters(
  job: { category?: string; title?: string; description?: string },
  appliedIds: ReadonlySet<JobsFilterCategoryId>,
): boolean {
  if (appliedIds.size === 0) return true;
  const bucket = jobPrimaryFilterCategoryId(job);
  if (!bucket) return false;
  return appliedIds.has(bucket);
}

type JobsCategoryFilterProps = {
  appliedIds: ReadonlySet<JobsFilterCategoryId>;
  onAppliedIdsChange: (next: Set<JobsFilterCategoryId>) => void;
};

export function JobsCategoryFilter({ appliedIds, onAppliedIdsChange }: JobsCategoryFilterProps) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<Set<JobsFilterCategoryId>>(() => new Set(appliedIds));
  const titleId = useId();

  const openModal = useCallback(() => {
    setDraft(new Set(appliedIds));
    setOpen(true);
  }, [appliedIds]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  const triggerText = useMemo(() => {
    if (appliedIds.size === 0) return "סינון לפי: בחר קטגוריה";
    const labels = JOBS_FILTER_CATEGORY_IDS.filter((id) => appliedIds.has(id)).map((id) => LABEL_BY_ID[id]);
    const joined = labels.join(" · ");
    if (joined.length <= 42) return `סינון: ${joined}`;
    return `סינון: ${labels[0]}${labels.length > 1 ? ` +${labels.length - 1}` : ""}`;
  }, [appliedIds]);

  const toggleDraft = useCallback((id: JobsFilterCategoryId) => {
    setDraft((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const apply = () => {
    onAppliedIdsChange(new Set(draft));
    setOpen(false);
  };

  return (
    <div className="relative w-full sm:w-auto sm:min-w-[290px]" dir="rtl">
      <button
        type="button"
        onClick={openModal}
        className="flex h-14 w-full items-center justify-between gap-3 rounded-2xl border border-[#E2E8F0] bg-white px-5 text-start text-base font-normal leading-6 text-[#00113A] outline-none ring-offset-2 transition hover:border-[#CBD5E1] focus-visible:ring-2 focus-visible:ring-[#0061A7]/30"
        aria-haspopup="dialog"
        aria-expanded={open}
      >
        <span className="min-w-0 flex-1 truncate text-right">{triggerText}</span>
        <span className="shrink-0 text-[#64748B]" aria-hidden>
          <svg width="12" height="8" viewBox="0 0 12 8" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M1 1.5L6 6.5L11 1.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
      </button>

      {open ? (
        <>
          <button
            type="button"
            className="fixed inset-0 z-[80] cursor-default bg-black/40"
            aria-label="סגור"
            onClick={() => setOpen(false)}
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            className="absolute inset-s-0 top-[calc(100%+8px)] z-[81] box-border w-[min(304px,calc(100vw-2rem))] rounded-[24px] border border-[rgba(134,85,246,0.2)] bg-[#E3F0FC] shadow-[0px_8px_32px_rgba(0,0,0,0.37)]"
            dir="rtl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative flex max-h-[70vh] min-h-[320px] flex-col px-4 pb-6 pt-14 text-right">
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="absolute start-0 top-4 flex h-9 w-9 items-center justify-center rounded-full text-[#00113A] hover:bg-black/5"
                aria-label="סגור"
              >
                <span className="text-[40px] leading-none" aria-hidden>
                  ×
                </span>
              </button>

              <h2 id={titleId} className="text-right mb-4 text-[24px] font-bold uppercase leading-[32px] tracking-[0.7px] text-[#00113A]">
                קטגוריות
              </h2>

              <ul className="flex list-none flex-col gap-4 pe-1 text-right mb-10">
                {CATEGORY_ROWS.map((row) => {
                  const checked = draft.has(row.id);
                  return (
                    <li key={row.id}>
                      <label className="flex cursor-pointer items-center justify-between gap-4 text-right">
                        <span className="relative flex size-5 shrink-0 items-center justify-center">
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={() => toggleDraft(row.id)}
                            className="peer sr-only"
                          />
                          <span
                            className={`pointer-events-none absolute inset-0 flex items-center justify-center rounded border-2 transition peer-focus-visible:ring-2 peer-focus-visible:ring-[#0061A7]/40 ${
                              checked
                                ? "border-[#2563EB] bg-[#2563EB]"
                                : "border-[#CBD5E1] bg-white"
                            }`}
                            aria-hidden
                          >
                            {checked ? (
                              <svg width="12" height="10" viewBox="0 0 12 10" fill="none" className="text-white">
                                <path
                                  d="M1 5l3.5 3.5L11 1"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                />
                              </svg>
                            ) : null}
                          </span>
                        </span>
                        <span className="min-w-0 flex-1 text-right text-base font-normal leading-6 text-[#00113A]">
                          {row.label}
                        </span>
                      </label>
                    </li>
                  );
                })}
              </ul>

              <button
                type="button"
                onClick={apply}
                className="mt-2 flex h-12 w-full items-center justify-center rounded-[999px] bg-[#201C44] px-6 text-center text-base font-bold leading-6 text-white! transition hover:bg-[#151238]"
              >
                הצג סינון
              </button>
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
}
