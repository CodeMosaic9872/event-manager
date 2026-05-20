/** Public subscription plan from `GET /v1/plans` (matches backend SubscriptionPlanDto). */
export type SubscriptionPlanDto = {
  id: string;
  key: string;
  name: string;
  summaryTitle: string | null;
  totalPeriodNote: string | null;
  interval: string;
  pretaxAmount: string;
  totalWithVat: string;
  vatAmount: string;
  currency: string;
  billingMonths: number;
  badge: string | null;
  isFeatured: boolean;
  sortOrder: number;
  isActive: boolean;
  features: string[];
  createdAt: string;
  updatedAt: string;
};
