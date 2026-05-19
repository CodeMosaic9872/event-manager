import { toSlug } from "@/shared/lib/to-slug";

export const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const SLUG_PATTERN = /^[a-z0-9-]+$/;

/** Normalize to local Israeli mobile `05XXXXXXXX` (10 digits) or return null if invalid. */
export function normalizeIsraeliMobileLocal(raw: string): string | null {
  const digits = raw.replace(/\D/g, "");
  if (!digits) return null;

  let local: string | null = null;
  if (digits.startsWith("972") && digits.length === 12 && digits[3] === "5") {
    local = `0${digits.slice(3)}`;
  } else if (digits.startsWith("05") && digits.length === 10) {
    local = digits;
  } else if (digits.startsWith("5") && digits.length === 9) {
    local = `0${digits}`;
  }

  if (!local || !/^05\d{8}$/.test(local)) return null;
  return local;
}

export function isValidOptionalUrl(raw: string): boolean {
  const trimmed = raw.trim();
  if (!trimmed) return true;
  try {
    const withScheme = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
    const url = new URL(withScheme);
    return Boolean(url.hostname && url.hostname.includes("."));
  } catch {
    return false;
  }
}

export type AdminSupplierFormInput = {
  businessName: string;
  categoryId: string;
  email: string;
  phone: string;
  description: string;
  digitalLinks: {
    instagram: string;
    tiktok: string;
    whatsapp: string;
    website: string;
    youtube: string;
    facebook: string;
  };
};

export type AdminSupplierFormValidation = {
  fieldErrors: Record<string, string>;
  normalizedPhone: string | null;
  slug: string;
};

export function validateAdminSupplierForm(input: AdminSupplierFormInput): AdminSupplierFormValidation {
  const fieldErrors: Record<string, string> = {};
  const businessName = input.businessName.trim();
  const email = input.email.trim();
  const phone = input.phone.trim();
  const description = input.description.trim();

  if (!businessName) {
    fieldErrors.businessName = "שם העסק הוא שדה חובה.";
  } else if (businessName.length < 2) {
    fieldErrors.businessName = "שם העסק חייב להכיל לפחות 2 תווים.";
  } else if (businessName.length > 120) {
    fieldErrors.businessName = "שם העסק לא יכול לעלות על 120 תווים.";
  }

  const slug = toSlug(businessName);
  if (businessName && (slug.length < 3 || !SLUG_PATTERN.test(slug))) {
    fieldErrors.businessName =
      fieldErrors.businessName ??
      "שם העסק חייב לכלול אותיות באנגלית או מספרים ליצירת מזהה תקין (לפחות 3 תווים).";
  }

  if (!input.categoryId) {
    fieldErrors.categoryId = "יש לבחור קטגוריה.";
  }

  if (!email) {
    fieldErrors.email = "אימייל הוא שדה חובה.";
  } else if (!EMAIL_PATTERN.test(email)) {
    fieldErrors.email = "נא להזין כתובת אימייל תקינה.";
  }

  const normalizedPhone = normalizeIsraeliMobileLocal(phone);
  if (!phone) {
    fieldErrors.phone = "טלפון הוא שדה חובה.";
  } else if (!normalizedPhone) {
    fieldErrors.phone = "מספר הטלפון חייב להיות 10 ספרות בפורמט ישראלי (05XXXXXXXX).";
  }

  if (description.length > 500) {
    fieldErrors.description = "התיאור לא יכול לעלות על 500 תווים.";
  }

  const linkFields: Array<{ key: keyof AdminSupplierFormInput["digitalLinks"]; label: string }> = [
    { key: "instagram", label: "אינסטגרם" },
    { key: "tiktok", label: "טיקטוק" },
    { key: "whatsapp", label: "וואטסאפ" },
    { key: "website", label: "אתר" },
    { key: "youtube", label: "יוטיוב" },
    { key: "facebook", label: "פייסבוק" },
  ];

  for (const { key, label } of linkFields) {
    const value = input.digitalLinks[key];
    if (value.trim() && !isValidOptionalUrl(value)) {
      fieldErrors[`link_${key}`] = `קישור ${label}: יש להזין כתובת URL תקינה.`;
    }
  }

  return {
    fieldErrors,
    normalizedPhone,
    slug,
  };
}

export function inputWithFieldError(baseClass: string, error?: string): string {
  return error ? `${baseClass} border-red-500 focus:border-red-500` : baseClass;
}
