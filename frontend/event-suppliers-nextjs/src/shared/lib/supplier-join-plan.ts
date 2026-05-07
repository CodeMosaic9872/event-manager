/** Supplier join Step 4 plan ids — persisted in `sessionStorage` under `supplierJoinPlan`. */
export type SupplierPlanId = "two_year" | "annual" | "six_month";

const VAT_RATE = 0.17;

export const SUPPLIER_JOIN_PROGRAM_FEATURES = [
  "Exposure in search results.",
  "Active use and promotion by the AI producer for accurate leads.",
  "Receive real-time SMS about relevant job offers",
] as const;

export type SupplierPlanCheckoutDefinition = {
  /** Line shown next to “Subscription period” (design: e.g. Annual subscription (Annual)). */
  summaryTitle: string;
  /** Small caption under total (e.g. For one year). */
  totalPeriodNote: string;
  /** Pretax subscription amount in ILS (whole shekels). VAT is computed at 17%. */
  pretaxSubtotal: number;
};

export const SUPPLIER_PLAN_CHECKOUT: Record<
  SupplierPlanId,
  SupplierPlanCheckoutDefinition
> = {
  two_year: {
    summaryTitle: "Two-year subscription (Two years)",
    totalPeriodNote: "For two years",
    pretaxSubtotal: 1990,
  },
  annual: {
    summaryTitle: "Annual subscription (Annual)",
    totalPeriodNote: "For one year",
    pretaxSubtotal: 1390,
  },
  six_month: {
    summaryTitle: "Six-month subscription (Six months)",
    totalPeriodNote: "For six months",
    pretaxSubtotal: 790,
  },
};

export function computeVatLineShekels(pretaxShekels: number): {
  pretax: number;
  vat: number;
  total: number;
} {
  const vat = Math.round(pretaxShekels * VAT_RATE);
  return { pretax: pretaxShekels, vat, total: pretaxShekels + vat };
}

/** Format whole shekels as in UI: “1,390 ₪” */
export function formatIls(shekels: number): string {
  return `${new Intl.NumberFormat("en-US").format(shekels)} ₪`;
}

export function parseStoredSupplierPlanId(): SupplierPlanId | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem("supplierJoinPlan");
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { planId?: unknown };
    const id = parsed.planId;
    if (
      id === "two_year" ||
      id === "annual" ||
      id === "six_month"
    ) {
      return id;
    }
  } catch {
    /* ignore */
  }
  return null;
}
