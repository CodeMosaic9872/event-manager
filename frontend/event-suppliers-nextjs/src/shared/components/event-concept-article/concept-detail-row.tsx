import type { ReactNode } from "react";

export type ConceptDetailRowProps = {
  label: string;
  value: string;
  icon: ReactNode;
  showDivider?: boolean;
};

/** Single RTL row for concept specs: label + icon on the inline-start (right in Hebrew), value on the inline-end (left). */
export function ConceptDetailRow({ label, value, icon, showDivider = true }: ConceptDetailRowProps) {
  return (
    <div
      className={`flex flex-col gap-2 pb-4 sm:flex-row sm:items-center sm:justify-between sm:gap-4 ${
        showDivider ? "border-b border-[#F1F5F9]" : ""
      }`}
    >
      <div className="flex min-w-0 shrink items-center gap-3">
        <span className="flex shrink-0">{icon}</span>
        <span className="text-sm font-bold leading-5 text-[#0F172A]">{label}</span>
      </div>
      <p className="min-w-0 text-end text-base font-normal leading-6 text-[#334155] sm:ps-4" dir="ltr">
        {value}
      </p>
    </div>
  );
}
