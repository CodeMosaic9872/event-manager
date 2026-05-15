/** Business-only step (50%): grid order matches design (row1 L→R in RTL flow: …). */
export type BusinessEventSubtype = {
  slug: string;
  label: string;
  /** Default highlighted card when no `businessType` query */
  defaultSelected?: boolean;
};

export const BUSINESS_EVENT_SUBTYPES: BusinessEventSubtype[] = [
  { slug: "day-evening", label: "אירוע יום/ערב" },
  { slug: "retreat", label: "נופש", defaultSelected: true },
  { slug: "team-building", label: "ימי גיבוש" },
  { slug: "conferences", label: "כנסים" },
  { slug: "marketing", label: "שיווק" },
  { slug: "public", label: "לקהל הרחב" },
  { slug: "happy-hour", label: "האפי האוור" },
];

export function labelForBusinessSubtypeSlug(slug: string | undefined): string | null {
  if (!slug) return null;
  return BUSINESS_EVENT_SUBTYPES.find((t) => t.slug === slug)?.label ?? null;
}

export function defaultBusinessSubtypeSlug(): string {
  return BUSINESS_EVENT_SUBTYPES.find((t) => t.defaultSelected)?.slug ?? "retreat";
}
