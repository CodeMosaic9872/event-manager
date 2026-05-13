export const JOIN_SUPPLIER_STEP2_MAX_DESCRIPTION = 500;

/** Subcategory chips — copy matches join-supplier step 2 design. */
export const JOIN_SUPPLIER_STEP2_SUBCATEGORIES = [
  "בר יין",
  "אולם",
  "הרצאות",
  "סדנאות",
  "קיטרינג חלבי",
] as const;

/** Service area chips — order and wording match design. */
export const JOIN_SUPPLIER_STEP2_SERVICE_AREAS = [
  "צפון",
  "מרכז",
  "דרום",
  "השרון",
  "כל הארץ",
  "ירושלים",
  "אילת והערבה",
] as const;

/** General label chips — copy matches design. */
export const JOIN_SUPPLIER_STEP2_LABELS_RULES = [
  "ספק משרד הביטחון",
  "מילואימניק",
  "פתוח בשבת",
  "שקוף",
] as const;

/** Niche label chips — copy matches design (including קיטרינג spelling). */
export const JOIN_SUPPLIER_STEP2_LABELS_NICHE = [
  "קיטרינג חלבי",
  "קיטרינג בשרי",
  "ארוחות שף",
  "צמחוני",
  "טבעוני",
] as const;

export const JOIN_SUPPLIER_STEP2_LANGUAGES = [
  "אנגלית",
  "עברית",
  "ערבית",
  "רוסית",
  "צרפתית",
  "ספרדית",
] as const;

export type JoinSupplierStep2SocialField = { key: string; label: string; placeholder: string };

export const JOIN_SUPPLIER_STEP2_SOCIAL_FIELDS: JoinSupplierStep2SocialField[] = [
  { key: "instagram", label: "קישור לאינסטגרם", placeholder: "קישור לאינסטגרם" },
  { key: "tiktok", label: "קישור לטיקטוק", placeholder: "קישור לטיקטוק" },
  { key: "website", label: "אתר אינטרנט", placeholder: "אתר אינטרנט" },
  { key: "whatsapp", label: "קישור לוואטסאפ", placeholder: "קישור לוואטסאפ" },
  { key: "youtube", label: "קישור ליוטיוב", placeholder: "קישור ליוטיוב" },
  { key: "facebook", label: "קישור לפייסבוק", placeholder: "קישור לפייסבוק" },
];
