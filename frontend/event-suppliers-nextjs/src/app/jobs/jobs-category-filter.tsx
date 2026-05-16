"use client";

import { useCallback, useEffect, useId, useState } from "react";
import { useGetCategoriesQuery } from "@/shared/api/api";

type JobsCategoryFilterProps = {
  /** Currently applied category IDs (committed to the BE) */
  appliedIds: Set<string>;
  onAppliedIdsChange: (ids: Set<string>) => void;
};

export function JobsCategoryFilter({
  appliedIds,
  onAppliedIdsChange,
}: JobsCategoryFilterProps) {
  const [open, setOpen] = useState(false);
  /** Draft state while modal is open — committed only on "הצג סינון" */
  const [draft, setDraft] = useState<Set<string>>(() => new Set(appliedIds));
  const titleId = useId();

  const { data: categories = [], isLoading } = useGetCategoriesQuery();

  /* Keep draft in sync when modal opens */
  const openModal = useCallback(() => {
    setDraft(new Set(appliedIds));
    setOpen(true);
  }, [appliedIds]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, [open]);

  const toggleDraft = (id: string) => {
    setDraft((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const handleApply = () => {
    onAppliedIdsChange(new Set(draft));
    setOpen(false);
  };

  const handleClear = () => {
    setDraft(new Set());
    onAppliedIdsChange(new Set());
    setOpen(false);
  };

  /* Trigger label — always static */
  const triggerText = "סינון לפי: קטגוריה";

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
          <svg width="12" height="8" viewBox="0 0 12 8" fill="none">
            <path d="M1 1.5L6 6.5L11 1.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
      </button>

      {open && (
        <>
          {/* Backdrop */}
          <button
            type="button"
            className="fixed inset-0 z-[80] cursor-default bg-black/40"
            aria-label="סגור"
            onClick={() => setOpen(false)}
          />

          {/* Modal */}
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            className="absolute inset-s-0 top-[calc(100%+8px)] z-[81] box-border w-[min(304px,calc(100vw-2rem))] rounded-[24px] border border-[rgba(134,85,246,0.2)] bg-[#E3F0FC] shadow-[0px_8px_32px_rgba(0,0,0,0.37)]"
            dir="rtl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative flex max-h-[70vh] flex-col px-4 pb-6 pt-14 text-right">
              {/* Close × */}
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="absolute start-0 top-4 flex h-9 w-9 items-center justify-center rounded-full text-[#00113A] hover:bg-black/5"
                aria-label="סגור"
              >
                <span className="text-[40px] leading-none" aria-hidden>×</span>
              </button>

              <h2
                id={titleId}
                className="mb-4 text-right text-[24px] font-bold uppercase leading-[32px] tracking-[0.7px] text-[#00113A]"
              >
                קטגוריות
              </h2>

              {/* Category list */}
              {isLoading ? (
                <div className="flex flex-col gap-3 overflow-y-auto">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="h-6 w-full animate-pulse rounded bg-slate-200" />
                  ))}
                </div>
              ) : (
                <ul className="mb-4 flex list-none flex-col gap-4 overflow-y-hidden pe-1 text-right [&::-webkit-scrollbar]:hidden" style={{ scrollbarWidth: 'none' }}>
                  {categories.map((cat) => {
                    const checked = draft.has(cat.id);
                    return (
                      <li key={cat.id}>
                        <label className="flex cursor-pointer items-center justify-between gap-4 text-right">
                          {/* Custom checkbox */}
                          <span className="relative flex size-5 shrink-0 items-center justify-center">
                            <input
                              type="checkbox"
                              checked={checked}
                              onChange={() => toggleDraft(cat.id)}
                              className="peer sr-only"
                            />
                            <span
                              className={`pointer-events-none absolute inset-0 flex items-center justify-center rounded-[4px] border-2 transition peer-focus-visible:ring-2 peer-focus-visible:ring-[#0061A7]/40 ${
                                checked
                                  ? "border-[#2563EB] bg-[#2563EB]"
                                  : "border-[#CBD5E1] bg-white"
                              }`}
                              aria-hidden
                            >
                              {checked && (
                                <svg width="11" height="8" viewBox="0 0 11 8" fill="none">
                                  <path d="M1 4L4 7L10 1" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                              )}
                            </span>
                          </span>
                          <span className="min-w-0 flex-1 text-right text-base font-normal leading-6 text-[#00113A]">
                            {cat.name}
                          </span>
                        </label>
                      </li>
                    );
                  })}
                </ul>
              )}

              {/* Apply button */}
              <button
                type="button"
                onClick={handleApply}
                className="mt-2 flex h-[60px] w-full items-center justify-center rounded-[999px] bg-[#201C44] px-6 text-center text-base font-bold leading-6 text-white transition hover:bg-[#151238] active:scale-[0.98]"
              >
                הצג סינון
              </button>

              {/* Clear button */}
              {draft.size > 0 && (
                <button
                  type="button"
                  onClick={handleClear}
                  className="mt-3 flex h-[60px] w-full items-center justify-center rounded-[999px] bg-white px-6 text-center text-base font-bold leading-6 text-[#201C44] transition hover:bg-slate-50 active:scale-[0.98]"
                >
                  נקה הכל
                </button>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
