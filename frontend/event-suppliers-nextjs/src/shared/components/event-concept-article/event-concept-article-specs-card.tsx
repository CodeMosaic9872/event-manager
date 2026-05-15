import Link from "next/link";
import type { EventConceptArticle } from "@/shared/types/event-concept-article";
import { ArticleSpecIcon } from "@/shared/components/event-concept-article/article-spec-icon";
import { ConceptDetailRow } from "@/shared/components/event-concept-article/concept-detail-row";
import Image from "next/image";

function InfoIcon() {
  return (
    <svg className="h-5 w-5 shrink-0 text-[#201C44]" viewBox="0 0 20 20" fill="none" aria-hidden>
      <circle cx="10" cy="10" r="7.5" stroke="currentColor" strokeWidth="1.4" />
      <path d="M10 9v5M10 6.5v.01" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

function ChatIcon() {
  return (
    <Image src="/icons/chat.svg" alt="" width={16} height={16} className="shrink-0" aria-hidden unoptimized />
  );
}

export function EventConceptArticleSpecsCard({
  specs,
  plannerHref = "#",
  plannerLabel = "דברו עם מתכנן",
}: {
  specs: EventConceptArticle["specs"];
  plannerHref?: string;
  plannerLabel?: string;
}) {
  return (
    <div
      dir="rtl"
      className="relative isolate flex flex-col gap-6 rounded-2xl border border-[#E2E8F0] bg-white p-5 shadow-[0px_10px_15px_-3px_rgba(0,0,0,0.1),0px_4px_6px_-4px_rgba(0,0,0,0.1)] sm:gap-8 sm:rounded-3xl sm:p-8"
    >
      <div className="flex flex-row items-center gap-2">
        <InfoIcon />
        <h2 className="text-xl font-bold leading-7 text-[#0F172A]">פרטי הקונספט</h2>
      </div>
      <div className="flex flex-col gap-6">
        {specs.map((row, i) => (
          <ConceptDetailRow
            key={row.label}
            label={row.label}
            value={row.value}
            icon={<ArticleSpecIcon icon={row.icon} />}
            showDivider={i < specs.length - 1}
          />
        ))}
      </div>
      <Link
        href={plannerHref}
        className="mt-2 inline-flex h-14 w-full items-center justify-center gap-2 rounded-full bg-[#F1F5F9] text-base font-bold leading-6 text-[#0F172A]! visited:text-[#0F172A]! transition-colors hover:bg-slate-200/80"
      >
        <ChatIcon />
        <span>{plannerLabel}</span>
      </Link>
    </div>
  );
}
