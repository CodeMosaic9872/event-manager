import Image from "next/image";
import type { EventConceptArticle } from "@/shared/types/event-concept-article";

export function EventConceptArticleHero({ hero }: { hero: EventConceptArticle["hero"] }) {
  return (
    <div className="relative mx-auto w-full max-w-[1120px] overflow-hidden rounded-2xl shadow-[0px_25px_50px_-12px_rgba(0,0,0,0.25)] sm:rounded-3xl">
      <div className="relative aspect-[4/3] min-h-[220px] w-full sm:aspect-[1120/500] sm:min-h-[320px] lg:h-[500px] lg:min-h-0 lg:aspect-auto">
        <Image
          src={hero.imageSrc}
          alt={hero.imageAlt}
          fill
          className="object-cover"
          sizes="(max-width: 640px) 100vw, (max-width: 1120px) 100vw, 1120px"
          priority
        />
        <div
          className="absolute inset-0 flex flex-col justify-end"
          style={{
            background:
              "linear-gradient(0deg, rgba(26, 28, 44, 0.9) 0%, rgba(26, 28, 44, 0.3) 50%, rgba(26, 28, 44, 0) 100%)",
          }}
        >
          <div className="flex w-full flex-col gap-3 px-4 pb-8 pt-16 sm:gap-4 sm:px-8 sm:pb-12 sm:pt-24 md:px-12 md:pb-16">
            {hero.badgeLabel.trim() ? (
              <span className="rounded-full bg-[#201C44] px-3 py-1 text-[10px] font-bold uppercase tracking-[0.06em] text-white sm:px-4 sm:text-xs">
                {hero.badgeLabel}
              </span>
            ) : null}
            <h1 className="text-balance text-[clamp(1.625rem,6vw,3.75rem)] font-bold leading-tight text-white sm:leading-none">
              {hero.title}
            </h1>
            <p className="text-sm font-normal leading-6 text-white sm:text-lg sm:leading-7">{hero.subtitle}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
