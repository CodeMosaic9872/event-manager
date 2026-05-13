/**
 * `vacation-selection-categories` uses short UI labels in the URL (`supplierCategory`).
 * `GET /v1/taxonomy/categories` returns `Category.name` from seed / event-taxonomy.json — spellings differ.
 */
export const VACATION_SUPPLIER_CATEGORY_TO_TAXONOMY_NAME: Record<string, string> = {
  שתיה: "שתייה",
  "אטרקציות ותוכן פעיל": "אטרקציות, תוכן פעיל וסיורים",
  "לוגיסטיקה והכשרות": "לוגיסטיקה והשכרות",
  "תמונות ממותגות": "מתנות ומזכרות מעוצבות",
  "הרצאות, סדנאות ותוכן": "הרצאות סדנאות ותוכן",
};

export function taxonomyCategoryNameFromVacationSupplierParam(decodedParam: string): string {
  const t = decodedParam.trim();
  return VACATION_SUPPLIER_CATEGORY_TO_TAXONOMY_NAME[t] ?? t;
}
