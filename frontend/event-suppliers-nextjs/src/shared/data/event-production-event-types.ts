/** Visual grid order: 3×3 row-major (matches design: row1 חינה · אירוע עסקי · רווקים/רווקות, …). */
export type EventProductionTypeItem = {
  slug: string;
  label: string;
  featured?: boolean;
};

export const EVENT_PRODUCTION_TYPES: EventProductionTypeItem[] = [
  { slug: "bachelors", label: "רווקים/רווקות" },
  { slug: "business", label: "אירוע עסקי", featured: true },
  { slug: "henna", label: "חינה" },
  { slug: "challah", label: "הפרשת חלה" },
  { slug: "wedding", label: "חתונה" },
  { slug: "brit", label: "ברית/ה" },
  { slug: "birthdays", label: "ימי הולדת" },
  { slug: "bar-bat-mitzvah", label: "בר/בת מצווה" },
  { slug: "luxury", label: "יוקרה ופנאי" },
];

export function labelForEventProductionSlug(slug: string | undefined): string | null {
  if (!slug) return null;
  const row = EVENT_PRODUCTION_TYPES.find((t) => t.slug === slug);
  return row?.label ?? null;
}
