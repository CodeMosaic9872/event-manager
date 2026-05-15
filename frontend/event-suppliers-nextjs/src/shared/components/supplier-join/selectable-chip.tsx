"use client";

import type { ReactNode } from "react";

type SelectableChipProps = {
  selected: boolean;
  onToggle: () => void;
  children: ReactNode;
  className?: string;
};

/** Pill toggle used on supplier join steps (subcategory, area, labels). */
export function SelectableChip({ selected, onToggle, children, className = "" }: SelectableChipProps) {
  return (
    <button
      type="button"
      dir="rtl"
      onClick={onToggle}
      aria-pressed={selected}
      className={`inline-flex max-w-full shrink-0 items-center gap-2 rounded-full border px-4 py-2 text-right text-[14px] leading-5 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4721DF] focus-visible:ring-offset-2 ${
        selected
          ? "border-[#6AB7FF] bg-[#6AB7FF] text-[#0f172a]"
          : "border-black/10 bg-white text-[#0f172a] hover:bg-black/[0.02]"
      } ${className}`.trim()}
    >
      <span className="whitespace-nowrap">{children}</span>
      <span className="flex size-3 shrink-0 items-center justify-center text-[20px] font-semibold leading-none" aria-hidden>
        {selected ? "×" : "+"}
      </span>
    </button>
  );
}
