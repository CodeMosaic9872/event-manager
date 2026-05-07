import type { EventConceptArticleSpecIcon } from "@/shared/types/event-concept-article";

const iconClass = "h-4 w-4 shrink-0 text-[#2B3A67]";

export function ArticleSpecIcon({ icon }: { icon: EventConceptArticleSpecIcon }) {
  switch (icon) {
    case "wallet":
      return (
        <svg className={iconClass} viewBox="0 0 22 16" fill="none" aria-hidden>
          <path
            d="M1 4.5A2.5 2.5 0 013.5 2h12A2.5 2.5 0 0118 4.5V5h2.5A1.5 1.5 0 0122 6.5v7a1.5 1.5 0 01-1.5 1.5h-17A2.5 2.5 0 011 12.5v-8z"
            stroke="currentColor"
            strokeWidth="1.3"
          />
          <path d="M18 8.5h3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
        </svg>
      );
    case "users":
      return (
        <svg className="h-3 w-6 shrink-0 text-[#2B3A67]" viewBox="0 0 24 12" fill="none" aria-hidden>
          <circle cx="6" cy="4" r="3" stroke="currentColor" strokeWidth="1.3" />
          <circle cx="18" cy="4" r="3" stroke="currentColor" strokeWidth="1.3" />
          <path d="M1 11c1-2.5 3-4 5-4s4 1.5 5 4M13 11c1-2.5 3-4 5-4s4 1.5 5 4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
        </svg>
      );
    case "map-pin":
      return (
        <svg className="h-5 w-4 shrink-0 text-[#2B3A67]" viewBox="0 0 16 20" fill="none" aria-hidden>
          <path
            d="M8 1.5a4.5 4.5 0 014.5 4.5c0 3.5-4.5 9-4.5 9S3.5 9.5 3.5 6A4.5 4.5 0 018 1.5z"
            stroke="currentColor"
            strokeWidth="1.3"
          />
          <circle cx="8" cy="6" r="1.3" fill="currentColor" />
        </svg>
      );
    case "clock":
      return (
        <svg className={iconClass} viewBox="0 0 20 20" fill="none" aria-hidden>
          <circle cx="10" cy="10" r="7.5" stroke="currentColor" strokeWidth="1.3" />
          <path d="M10 6.5V10l3 2" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
        </svg>
      );
    default:
      return null;
  }
}
