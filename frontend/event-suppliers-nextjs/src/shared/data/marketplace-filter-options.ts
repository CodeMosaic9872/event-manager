/** URL / API keys are ASCII; labels are Hebrew (Figma). */

export const MARKETPLACE_GENERAL_FILTERS = [
  { key: "mod", label: "ספק משרד הביטחון" },
  { key: "reservist", label: "מילואימניק" },
  { key: "insurance", label: "ביטוח" },
  { key: "shabbat", label: "עובד / פתוח בשבת" },
] as const;

export const MARKETPLACE_LANGUAGE_OPTIONS = [
  { value: "", label: "בחר שפה" },
  { value: "en", label: "אנגלית" },
  { value: "ar", label: "ערבית" },
  { value: "ru", label: "רוסית" },
  { value: "am", label: "אמהרית" },
] as const;

export const MARKETPLACE_NICHE_TAGS = [
  { key: "mehadrin", label: "כשר למהדרין" },
  { key: "accessible", label: "נגיש" },
  { key: "parking", label: "חניה חינם" },
  { key: "disability", label: "גישה לנכים" },
  { key: "outdoor", label: "אירוע חוץ" },
] as const;

export type MarketplaceGeneralFilterKey = (typeof MARKETPLACE_GENERAL_FILTERS)[number]["key"];
export type MarketplaceNicheTagKey = (typeof MARKETPLACE_NICHE_TAGS)[number]["key"];

export function parseCommaKeys(param: string | null): string[] {
  if (!param) return [];
  return param
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

export function serializeCommaKeys(keys: string[]): string | undefined {
  if (!keys.length) return undefined;
  return keys.join(",");
}
