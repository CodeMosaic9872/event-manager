"use client";

import { IconChevronDown } from "@/shared/components/event-concepts/icons";
import type { ConceptFilterKey } from "@/shared/types/event-concept-template";

export type EventConceptFilterPillsProps = {
  value: ConceptFilterKey;
  onChange: (next: ConceptFilterKey) => void;
  labels?: Partial<Record<ConceptFilterKey, string>>;
  className?: string;
};

const defaultLabels: Record<ConceptFilterKey, string> = {
  all: "כל הקונספטים",
  business: "עסקי",
  private: "פרטי",
};

export function EventConceptFilterPills({
  value,
  onChange,
  labels = {},
  className = "",
}: EventConceptFilterPillsProps) {
  const l = { ...defaultLabels, ...labels };

  return (
    <div
      className={`flex flex-wrap items-center justify-center gap-2 pb-6 sm:justify-end sm:gap-3 sm:pb-8 ${className}`.trim()}
    >
      <button
        type="button"
        onClick={() => onChange("all")}
        className={`inline-flex min-h-10 items-center justify-center rounded-full px-4 text-sm leading-5 transition-colors sm:px-6 ${
          value === "all"
            ? "bg-[#201C44] text-white!"
            : "border border-[#E2E8F0] bg-white text-[#334155]"
        }`}
      >
        {l.all}
      </button>
      {(["business", "private"] as const).map((key) => (
        <button
          key={key}
          type="button"
          onClick={() => onChange(key)}
          className={`inline-flex min-h-10 items-center justify-center gap-2 rounded-full border px-4 text-sm leading-5 transition-colors sm:px-6 ${
            value === key
              ? "border-[#201C44] bg-[#201C44] text-white! [&_svg]:text-white"
              : "border-[#E2E8F0] bg-white text-[#334155]"
          }`}
        >
          {l[key]}
          <IconChevronDown />
        </button>
      ))}
    </div>
  );
}
