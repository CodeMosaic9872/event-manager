import Image from "next/image";
import type { EventConceptArticle } from "@/shared/types/event-concept-article";

export function EventConceptArticleMapCard({ map }: { map: EventConceptArticle["map"] }) {
  return (
    <div className="relative isolate flex min-h-[200px] w-full overflow-hidden rounded-2xl bg-[#E2E8F0] shadow-[0px_1px_2px_rgba(0,0,0,0.05)] sm:min-h-[229px] sm:rounded-3xl">
      <Image
        src={map.imageSrc}
        alt={map.imageAlt}
        fill
        className="object-cover opacity-60"
        sizes="(max-width: 768px) 100vw, 341px"
      />
      <div className="relative z-[1] flex w-full items-center justify-center p-6">
        <div className="relative rounded-xl border border-[rgba(236,91,19,0.2)] bg-white px-4 py-2 shadow-[0px_20px_25px_-5px_rgba(0,0,0,0.1),0px_8px_10px_-6px_rgba(0,0,0,0.1)]">
          <div dir="rtl" className="flex items-center gap-2">
            <span className="text-sm leading-5 text-[#0F172A]" dir="ltr">
              Recommended area: {map.recommendedArea}
            </span>
            <svg className="h-3 w-3 shrink-0 text-[#201C44]" viewBox="0 0 12 12" fill="none" aria-hidden>
              <path
                d="M6 1.5a3 3 0 013 3c0 2.25-3 6-3 6S3 6.75 3 4.5a3 3 0 013-3z"
                stroke="currentColor"
                strokeWidth="1.2"
              />
              <circle cx="6" cy="4.5" r="0.8" fill="currentColor" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}
