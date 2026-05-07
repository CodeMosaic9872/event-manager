import Link from "next/link";

export type EventConceptCustomCtaProps = {
  title?: string;
  description?: string;
  ctaLabel?: string;
  href?: string;
  className?: string;
};

export function EventConceptCustomCta({
  title = "Didn't find a concept?",
  description = "Our planners can help you build a custom package from scratch.",
  ctaLabel = "Talk to a planner",
  href = "#",
  className = "",
}: EventConceptCustomCtaProps) {
  return (
    <div
      className={`flex w-full max-w-[350px] flex-col items-end justify-center gap-5 rounded-2xl border-2 border-dashed border-[#D1E0F5] bg-[rgba(209,224,245,0.28)] px-4 py-10 sm:gap-6 sm:px-6 sm:py-16 ${className}`.trim()}
    >
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#6AB7FF]">
        <svg viewBox="0 0 24 24" className="h-5 w-5 text-[#201C44]" fill="none" aria-hidden>
          <path
            d="M12 5v14M5 12h14"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
      </div>
      <div className="flex w-full max-w-[270px] flex-col gap-2 self-end text-right">
        <h3 className="text-xl font-normal leading-7 text-[#0F172A]">{title}</h3>
        <p className="text-sm leading-5 text-[#64748B]">{description}</p>
      </div>
      <Link
        href={href}
        className="inline-flex h-[38px] items-center justify-center rounded-xl border border-[rgba(236,91,19,0.2)] bg-[#6AB7FF] px-6 text-sm leading-5 text-[#201C44]! visited:text-[#201C44]! transition-opacity hover:opacity-95"
      >
        {ctaLabel}
      </Link>
    </div>
  );
}
