import { eventConceptArticleDefaultHero, eventConceptArticleDefaults } from "@/shared/data/event-concept-article.defaults";
import { eventConceptTemplatesMock } from "@/shared/data/event-concept-templates.mock";
import type { EventConceptArticle } from "@/shared/types/event-concept-article";

const validSlugs = new Set(eventConceptTemplatesMock.map((t) => t.id));

export function isEventConceptArticleSlug(slug: string): boolean {
  return validSlugs.has(slug);
}

/** Every listing “Continue reading” opens the same long-form article (Figma pool party). */
export function getEventConceptArticle(slug: string): EventConceptArticle | null {
  if (!isEventConceptArticleSlug(slug)) return null;

  return {
    slug,
    hero: eventConceptArticleDefaultHero,
    ...eventConceptArticleDefaults,
  };
}

export function getEventConceptArticleStaticParams(): { slug: string }[] {
  return eventConceptTemplatesMock.map((t) => ({ slug: t.id }));
}
