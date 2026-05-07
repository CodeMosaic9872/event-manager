export const JOIN_SUPPLIER_STEP2_MAX_DESCRIPTION = 500;

export const JOIN_SUPPLIER_STEP2_SUBCATEGORIES = [
  "Dairy catering",
  "Workshops",
  "Lectures",
  "Wellness",
  "Wine bar",
] as const;

export const JOIN_SUPPLIER_STEP2_SERVICE_AREAS = [
  "Eilat and the Arava",
  "Jerusalem",
  "The whole country",
  "Sharon",
  "South",
  "Coordinator",
  "North",
] as const;

export const JOIN_SUPPLIER_STEP2_LABELS_RULES = [
  "Email open",
  "Open on Saturday",
  "Reserved",
  "Ministry of Defense Supplier",
] as const;

export const JOIN_SUPPLIER_STEP2_LABELS_NICHE = [
  "vegan",
  "vegetarian",
  "Chef's dinner",
  "Meat catering",
  "Dairy Catering",
] as const;

export const JOIN_SUPPLIER_STEP2_LANGUAGES = [
  "English",
  "Hebrew",
  "Arabic",
  "Russian",
  "French",
  "Spanish",
] as const;

export type JoinSupplierStep2SocialField = { key: string; label: string; placeholder: string };

export const JOIN_SUPPLIER_STEP2_SOCIAL_FIELDS: JoinSupplierStep2SocialField[] = [
  { key: "tiktok", label: "Link to TikTok", placeholder: "https://" },
  { key: "instagram", label: "Link to Instagram", placeholder: "https://" },
  { key: "whatsapp", label: "WhatsApp link", placeholder: "https://" },
  { key: "website", label: "website", placeholder: "https://" },
  { key: "facebook", label: "Link to Facebook", placeholder: "https://" },
  { key: "youtube", label: "Link to YouTube", placeholder: "https://" },
];
