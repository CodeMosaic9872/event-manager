"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import type { EventConceptTemplate } from "@/shared/types/event-concept-template";
import { EventConceptVendorRow } from "@/shared/components/event-concepts/event-concept-vendor-row";

export type EventConceptCardProps = {
  concept: EventConceptTemplate;
  continueReadingLabel?: string;
  favoriteLabels?: { add: string; remove: string };
};

function HeartIcon({ filled }: { filled: boolean }) {
  return (
    <svg viewBox="0 0 24 22" fill="none" className="h-[18px] w-5" aria-hidden>
      <path
        d="M12 19.35l-1.45-1.32C5.4 12.36 2 9.28 2 5.5 2 3.42 3.42 2 5.5 2c1.74 0 3.41 1.01 4.5 2.09C11.09 3.01 12.76 2 14.5 2 16.58 2 18 3.42 18 5.5c0 3.78-3.4 6.86-8.55 12.54L12 19.35z"
        stroke="#94A3B8"
        strokeWidth="1.5"
        fill={filled ? "#94A3B8" : "none"}
      />
    </svg>
  );
}

export function EventConceptCard({
  concept,
  continueReadingLabel = "Continue reading",
  favoriteLabels = { add: "Save concept", remove: "Remove from saved" },
}: EventConceptCardProps) {
  const [favorited, setFavorited] = useState(false);

  return (
    <article className="flex w-full max-w-[min(100%,350px)] flex-col overflow-hidden rounded-2xl border border-[#E2E8F0] bg-white shadow-[0px_1px_2px_rgba(0,0,0,0.05)] sm:max-w-[350px]">
      <div className="relative isolate aspect-[350/218.75] w-full overflow-hidden">
        <Image
          src={concept.imageSrc}
          alt={concept.imageAlt}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 350px"
        />
        <div
          className="pointer-events-none absolute inset-0 z-[1]"
          style={{
            background: "linear-gradient(0deg, rgba(15, 23, 42, 0.6) 0%, rgba(15, 23, 42, 0) 100%)",
          }}
        />
        {concept.badge ? (
          <div
            className={`absolute left-4 top-3 z-[2] rounded-full px-3 py-0.5 font-sans text-[10px] font-bold uppercase leading-[15px] tracking-[0.05em] text-white ${
              concept.badge === "new" ? "bg-[#2563EB]" : "bg-[#201C44]"
            }`}
          >
            {concept.badge === "new" ? "New" : "Popular"}
          </div>
        ) : null}
      </div>

      <div className="flex flex-1 flex-col justify-between gap-6 p-6">
        <div className="flex flex-col gap-4">
          <h3 className="text-right text-xl font-normal leading-7 tracking-normal text-[#0F172A]">{concept.title}</h3>
          <p className="text-right text-sm leading-5 text-[#201C44]">{concept.description}</p>
          <div className="flex flex-col gap-3">
            {concept.vendors.map((v, i) => (
              <EventConceptVendorRow key={`${concept.id}-v-${i}`} item={v} />
            ))}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setFavorited((v) => !v)}
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-[#E2E8F0] transition-colors hover:bg-slate-50"
            aria-pressed={favorited}
            aria-label={favorited ? favoriteLabels.remove : favoriteLabels.add}
          >
            <HeartIcon filled={favorited} />
          </button>
          <Link
            href={concept.href}
            className="flex min-h-12 flex-1 items-center justify-center rounded-full bg-[#201C44] px-4 text-center text-sm leading-5 text-white! visited:text-white! hover:text-white!"
          >
            {continueReadingLabel}
          </Link>
        </div>
      </div>
    </article>
  );
}
