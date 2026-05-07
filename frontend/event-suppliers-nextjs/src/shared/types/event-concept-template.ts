import type { ReactNode } from "react";

export type ConceptFilterKey = "all" | "business" | "private";

export type EventConceptBadgeVariant = "new" | "popular";

export type EventConceptVendorItem = {
  label: string;
  /** Small icon shown after the label (RTL layout). */
  icon?: ReactNode;
};

export type EventConceptAudience = "business" | "private";

export type EventConceptTemplate = {
  id: string;
  title: string;
  description: string;
  imageSrc: string;
  imageAlt: string;
  badge?: EventConceptBadgeVariant;
  /** For filter pills; omit means shown for all segments. */
  audience?: EventConceptAudience | "both";
  vendors: EventConceptVendorItem[];
  href: string;
};
