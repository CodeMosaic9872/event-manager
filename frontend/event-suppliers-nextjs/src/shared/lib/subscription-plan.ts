import type { SubscriptionPlanDto } from "@/shared/api/types/subscription-plan";
import type { SupplierPricingPlanCardProps } from "@/shared/components/supplier-join/supplier-pricing-plan-card";
import type { SupplierPlanCheckoutDefinition } from "@/shared/lib/supplier-join-plan";
import { computeVatLineShekels } from "@/shared/lib/supplier-join-plan";

const BADGE_LABEL_HE: Record<string, string> = {
  "THE MOST AFFORDABLE": "המשתלם ביותר",
  "THE MOST CHOSEN": "הנבחר ביותר",
};

export type StoredSupplierPlan = {
  planId: string;
  planKey: string;
  at: number;
};

export function formatPlanBadge(badge: string | null): string | undefined {
  if (!badge?.trim()) return undefined;
  return BADGE_LABEL_HE[badge.trim()] ?? badge.trim();
}

function parseAmount(value: string | number): number {
  const n = typeof value === "number" ? value : Number.parseFloat(value);
  return Number.isFinite(n) ? Math.round(n) : 0;
}

export function periodCaptionForMonths(months: number): string {
  if (months >= 24) return "/ שנתיים";
  if (months >= 12) return "/ שנה";
  return "/ חצי שנה";
}

export function formatShekelAmount(amount: number): string {
  return `₪${new Intl.NumberFormat("he-IL").format(amount)}`;
}

export function subscriptionPlanToCheckout(
  plan: SubscriptionPlanDto,
): SupplierPlanCheckoutDefinition {
  const pretax = parseAmount(plan.pretaxAmount);
  const vat = parseAmount(plan.vatAmount);
  const total = parseAmount(plan.totalWithVat);
  return {
    id: plan.id,
    key: plan.key,
    summaryTitle: plan.summaryTitle?.trim() || plan.name,
    totalPeriodNote: plan.totalPeriodNote?.trim() || "לתקופת המנוי",
    pretaxSubtotal: pretax,
    vatShekels: vat,
    totalShekels: total,
    features: plan.features?.length ? plan.features : undefined,
  };
}

export function subscriptionPlanToPricingCardProps(
  plan: SubscriptionPlanDto,
): Omit<SupplierPricingPlanCardProps, "onSelect"> {
  const pretax = parseAmount(plan.pretaxAmount);
  const monthly =
    plan.billingMonths > 0 ? Math.round(pretax / plan.billingMonths) : pretax;
  const badge = formatPlanBadge(plan.badge);

  return {
    title: plan.name,
    badges: badge ? [badge] : undefined,
    recommended: plan.isFeatured,
    periodAmount: formatShekelAmount(pretax),
    periodCaption: periodCaptionForMonths(plan.billingMonths),
    monthlyAmount: formatShekelAmount(monthly),
    monthlyCaption: "/ פר חודש",
    features:
      plan.features?.length > 0
        ? plan.features
        : ["קבלת סמס לגבי הצעות עבודה בזמן אמת"],
    ctaLabel: "בחירה במסלול זה",
    ctaVariant: plan.isFeatured ? "filled" : "outline",
  };
}

export function getCheckoutTotals(plan: SupplierPlanCheckoutDefinition): {
  pretax: number;
  vat: number;
  total: number;
} {
  if (
    plan.vatShekels != null &&
    plan.totalShekels != null &&
    Number.isFinite(plan.vatShekels) &&
    Number.isFinite(plan.totalShekels)
  ) {
    return {
      pretax: plan.pretaxSubtotal,
      vat: plan.vatShekels,
      total: plan.totalShekels,
    };
  }
  return computeVatLineShekels(plan.pretaxSubtotal);
}

export function persistSupplierPlan(plan: { id: string; key: string }): void {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(
      "supplierJoinPlan",
      JSON.stringify({
        planId: plan.id,
        planKey: plan.key,
        at: Date.now(),
      } satisfies StoredSupplierPlan),
    );
  } catch {
    /* ignore */
  }
}

export function parseStoredSupplierPlan(): StoredSupplierPlan | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem("supplierJoinPlan");
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { planId?: unknown; planKey?: unknown; at?: unknown };
    const legacyKeys = new Set(["two_year", "annual", "six_month"]);
    let planKey = typeof parsed.planKey === "string" ? parsed.planKey : null;
    let planId = typeof parsed.planId === "string" ? parsed.planId : null;
    if (!planKey && planId && legacyKeys.has(planId)) {
      planKey = planId;
      planId = "";
    }
    if (!planKey && !planId) return null;
    return {
      planId: planId ?? "",
      planKey: planKey ?? "",
      at: typeof parsed.at === "number" ? parsed.at : Date.now(),
    };
  } catch {
    return null;
  }
}

export function resolveStoredPlan(
  plans: SubscriptionPlanDto[],
  stored: StoredSupplierPlan | null,
): SubscriptionPlanDto | null {
  if (!stored || plans.length === 0) return null;
  if (stored.planId) {
    const byId = plans.find((p) => p.id === stored.planId);
    if (byId) return byId;
  }
  if (stored.planKey) {
    const byKey = plans.find((p) => p.key === stored.planKey);
    if (byKey) return byKey;
  }
  return null;
}

export function defaultFeaturedPlan(
  plans: SubscriptionPlanDto[],
): SubscriptionPlanDto | null {
  if (plans.length === 0) return null;
  return plans.find((p) => p.isFeatured) ?? plans[0];
}
