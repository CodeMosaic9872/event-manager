"use client";

import { SupplierJoinCheckoutSummary } from "@/shared/components/supplier-join/supplier-join-checkout-summary";
import { SupplierJoinPaymentPanel } from "@/shared/components/supplier-join/supplier-join-payment-panel";
import { MarketingPageShell } from "@/shared/components/marketing-page-shell";
import { ProtectedRoute } from "@/shared/components/protected-route";
import { useGetSubscriptionPlansQuery } from "@/shared/api/api";
import {
  defaultFeaturedPlan,
  subscriptionPlanToCheckout,
} from "@/shared/lib/subscription-plan";
import { marketingPloniFont } from "@/shared/lib/marketing-typography";

export default function AdminSupplierRegistrationPaymentPage() {
  const { data: plans = [], isLoading } = useGetSubscriptionPlansQuery();
  const selected = defaultFeaturedPlan(plans);
  const checkoutPlan = selected ? subscriptionPlanToCheckout(selected) : null;

  return (
    <ProtectedRoute roles={["admin"]}>
      <MarketingPageShell
        showBackgroundImage
        className="min-h-screen"
        dir="rtl"
        lang="he"
        contentClassName="!max-w-[1100px] !items-stretch !px-4 !pb-16 !pt-24 sm:!px-6 sm:!pt-28 lg:!px-0 lg:!pt-32"
      >
        <div
          className="flex w-full min-w-0 flex-col gap-6 sm:gap-8"
          style={{ fontFamily: marketingPloniFont }}
        >
          <header className="flex w-full min-w-0 flex-col items-start gap-2">
            <h1 className="w-full min-w-0 text-pretty text-right text-2xl font-bold leading-tight text-black sm:text-3xl sm:leading-10 lg:text-[36px]">
              רישום ספק - תשלום
            </h1>
            <p className="w-full min-w-0 text-pretty text-right text-sm font-normal leading-6 text-black sm:text-base">
              צעד אחרון לפני שתצטרפו לקהילת הספקים המובילה בישראל
            </p>
          </header>

          {isLoading || !checkoutPlan ? (
            <div
              className="grid min-h-[280px] w-full grid-cols-1 gap-6 sm:gap-8 lg:grid-cols-[minmax(0,2.5fr)_minmax(0,3.5fr)]"
              aria-busy
              aria-label="טוען מסלול מנוי"
            >
              <div className="h-64 animate-pulse rounded-[24px] bg-slate-200/80" />
              <div className="h-64 animate-pulse rounded-[24px] bg-slate-200/80" />
            </div>
          ) : (
            <div
              className="grid w-full min-w-0 grid-cols-1 items-start gap-6 sm:gap-8 lg:grid-cols-[minmax(0,2.5fr)_minmax(0,3.5fr)]"
              dir="ltr"
            >
              <SupplierJoinCheckoutSummary
                plan={checkoutPlan}
                styleFont={marketingPloniFont}
                variant="admin"
              />
              <SupplierJoinPaymentPanel
                styleFont={marketingPloniFont}
                planId={checkoutPlan.id}
                planKey={checkoutPlan.key}
                successRedirectPath="/admin"
                showSecurityFooter={false}
                termsFooterPlain
              />
            </div>
          )}
        </div>
      </MarketingPageShell>
    </ProtectedRoute>
  );
}
