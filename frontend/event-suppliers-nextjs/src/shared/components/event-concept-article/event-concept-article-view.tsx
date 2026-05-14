import type { EventConceptArticle } from "@/shared/types/event-concept-article";
import { EventConceptArticleHero } from "@/shared/components/event-concept-article/event-concept-article-hero";
import { EventConceptArticleMapCard } from "@/shared/components/event-concept-article/event-concept-article-map-card";
import { EventConceptArticleSpecsCard } from "@/shared/components/event-concept-article/event-concept-article-specs-card";
import { EventConceptArticleTeamCard } from "@/shared/components/event-concept-article/event-concept-article-team-card";
import { EventConceptMomentsGallery } from "@/shared/components/event-concept-article/event-concept-moments-gallery";
import { marketingPloniFont } from "@/shared/lib/marketing-typography";

export function EventConceptArticleView({ article }: { article: EventConceptArticle }) {
  return (
    <div
      className="mx-auto flex w-full max-w-[1280px] flex-col gap-8 px-4 pb-8 sm:gap-10 sm:px-6 md:px-10 lg:gap-12 lg:px-20 lg:pb-12"
      style={{ fontFamily: marketingPloniFont }}
    >
      <EventConceptArticleHero hero={article.hero} />

      <div className="mx-auto flex w-full max-w-[1120px] flex-col-reverse gap-8 lg:flex-row lg:items-start lg:gap-10 xl:gap-12">
        <aside className="flex w-full shrink-0 flex-col gap-8 lg:max-w-[341px] lg:gap-10">
          <EventConceptArticleSpecsCard specs={article.specs} />
        </aside>

        <div className="flex min-w-0 flex-1 flex-col gap-8 sm:gap-10 lg:gap-12">
          <section className="flex flex-col gap-4 text-right sm:gap-6">
            <h2 className="text-xl font-bold leading-7 text-[#201C44] sm:text-2xl sm:leading-8">
              {article.visionTitle}
            </h2>
            {article.visionParagraphs.map((p, i) => (
              <p key={i} className="text-base font-normal leading-7 text-[#0F172A] sm:text-lg sm:leading-[29px]">
                {p}
              </p>
            ))}
            <blockquote className="rounded-2xl border-r-4 border-[#201C44] bg-[rgba(43,58,103,0.1)] p-5 text-right text-base font-normal leading-7 text-[#334155] sm:p-8 sm:text-xl sm:leading-7">
              {article.quote}
            </blockquote>
          </section>

          <section className="flex flex-col gap-6 sm:gap-8" aria-labelledby="concept-team-heading">
            <h2 id="concept-team-heading" className="text-end text-xl font-bold leading-7 text-[#0F172A] sm:text-2xl sm:leading-8">
              {article.teamTitle}
            </h2>
            <div
              className="flex w-full flex-col items-stretch gap-6 lg:flex-row lg:items-start lg:justify-between lg:gap-8"
              dir="rtl"
            >
              <div className="grid min-w-0 flex-1 grid-cols-1 justify-items-center gap-5 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3 lg:justify-items-end">
                {article.team.map((member) => (
                  <EventConceptArticleTeamCard key={member.name} member={member} />
                ))}
              </div>
              <div className="w-full shrink-0 lg:max-w-[280px] xl:max-w-[320px]">
                <EventConceptArticleMapCard map={article.map} />
              </div>
            </div>
          </section>
        </div>
      </div>

      <section
        className="mx-auto w-full max-w-[1120px] border-y border-[#E2E8F0] py-8 sm:py-10 lg:py-12"
        aria-labelledby="moments-gallery-heading"
      >
        <EventConceptMomentsGallery title={article.galleryTitle} images={article.gallery} />
      </section>
    </div>
  );
}
