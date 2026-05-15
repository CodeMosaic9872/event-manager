"use client";

import { startTransition, useCallback, useEffect, useId, useState } from "react";

/** Options aligned with design + existing job `category` values in demo/API. */
export const JOB_FILTER_CATEGORY_OPTIONS = [
  "די ג'ייז",
  "אולמות אירועים",
  "צילום והפקה",
  "קייטרינג",
  "אירוע חברה",
  "חתונה",
  "אולם / גן",
] as const;

type JobCategoryFilterDropdownProps = {
  appliedCategories: Set<string>;
  onApply: (categories: Set<string>) => void;
  className?: string;
};

function FilterCheckbox({
  checked,
  onChange,
  label,
  id,
}: {
  checked: boolean;
  onChange: (next: boolean) => void;
  label: string;
  id: string;
}) {
  return (
    <label
      htmlFor={id}
      className="flex w-full cursor-pointer items-center justify-between gap-3 py-0.5"
    >
      <span className="text-start text-sm font-normal leading-5 text-black">{label}</span>
      <input
        id={id}
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="sr-only"
      />
      <span
        className={`flex size-[18px] shrink-0 items-center justify-center rounded border ${
          checked ? "border-[#6AB7FF] bg-[#6AB7FF]" : "border-black/20 bg-black/5"
        }`}
        aria-hidden
      >
        {checked ? (
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path
              d="M3.5 8.5L6.5 11.5L12.5 4.5"
              stroke="black"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        ) : null}
      </span>
    </label>
  );
}

export function JobCategoryFilterDropdown({
  appliedCategories,
  onApply,
  className = "",
}: JobCategoryFilterDropdownProps) {
  const uid = useId();
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<Set<string>>(() => new Set(appliedCategories));

  useEffect(() => {
    if (open) {
      startTransition(() => setDraft(new Set(appliedCategories)));
    }
  }, [open, appliedCategories]);

  const close = useCallback(() => setOpen(false), []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, close]);

  const toggle = (key: string, checked: boolean) => {
    setDraft((prev) => {
      const next = new Set(prev);
      if (checked) next.add(key);
      else next.delete(key);
      return next;
    });
  };

  const apply = () => {
    onApply(new Set(draft));
    setOpen(false);
  };

  const summaryLabel =
    appliedCategories.size === 0
      ? "סינון לפי: בחר קטגוריה"
      : `${appliedCategories.size} קטגוריות נבחרו`;

  return (
    <div className={`relative w-full ${className}`.trim()}>
      <button
        type="button"
        aria-expanded={open}
        aria-haspopup="dialog"
        onClick={() => setOpen((o) => !o)}
        className="flex h-[50px] w-full items-center justify-end gap-2 rounded-[10px] border border-[#CDDBDB] bg-[rgba(255,255,255,0.31)] px-2.5 text-end text-sm font-normal leading-4 tracking-tight text-black outline-none ring-[#6AB7FF] focus-visible:ring-2"
      >
        <span className="text-[8px] leading-none text-black opacity-60" aria-hidden>
          ▼
        </span>
        <span className="min-w-0 flex-1 truncate">{summaryLabel}</span>
      </button>

      {open ? (
        <>
          <button
            type="button"
            className="fixed inset-0 z-40 cursor-default bg-black/25 backdrop-blur-[2px]"
            aria-label="סגור רקע"
            onClick={close}
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby={`${uid}-filter-title`}
            className="absolute inset-s-0 top-[calc(100%+8px)] z-50 box-border w-[min(304px,calc(100vw-2rem))] rounded-[24px] border border-[rgba(134,85,246,0.2)] bg-[#E3F0FC] shadow-[0px_8px_32px_rgba(0,0,0,0.37)] backdrop-blur-[6px]"
            style={{ minHeight: 400, maxHeight: "min(572px, 70vh)" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative flex max-h-[min(572px,70vh)] flex-col px-[15px] pb-6 pt-14">
              <button
                type="button"
                onClick={close}
                className="absolute inset-e-4 top-6 flex size-8 items-center justify-center text-[32px] font-normal leading-6 text-black hover:opacity-70"
                aria-label="סגור סינון"
              >
                ×
              </button>

              <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto overscroll-contain pe-2">
                <h2
                  id={`${uid}-filter-title`}
                  className="text-start text-2xl font-normal uppercase leading-5 tracking-[0.7px] text-black"
                >
                  קטגוריות
                </h2>

                <div className="flex flex-col gap-2">
                  {JOB_FILTER_CATEGORY_OPTIONS.map((opt) => (
                    <FilterCheckbox
                      key={opt}
                      id={`${uid}-${opt}`}
                      label={opt}
                      checked={draft.has(opt)}
                      onChange={(c) => toggle(opt, c)}
                    />
                  ))}
                </div>
              </div>

              <div className="mt-6 flex shrink-0 justify-center pt-2">
                <button
                  type="button"
                  onClick={apply}
                  className="flex h-12 w-[min(209px,100%)] items-center justify-center rounded-[99px] bg-[#00113A] px-6 text-center text-xl font-normal leading-6 text-white"
                >
                  הצג סינון
                </button>
              </div>
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
}
