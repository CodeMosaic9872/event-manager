"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { SupplierJoinCheckoutSummary } from "@/shared/components/supplier-join/supplier-join-checkout-summary";
import { SupplierJoinPaymentPanel } from "@/shared/components/supplier-join/supplier-join-payment-panel";
import { MarketingPageShell } from "@/shared/components/marketing-page-shell";
import { useGetSubscriptionPlansQuery } from "@/shared/api/api";
import { marketingPloniFont } from "@/shared/lib/marketing-typography";
import type { SupplierPlanCheckoutDefinition } from "@/shared/lib/supplier-join-plan";
import {
  parseStoredSupplierPlan,
  resolveStoredPlan,
  subscriptionPlanToCheckout,
} from "@/shared/lib/subscription-plan";

export default function JoinSupplierStep5Page() {
  const router = useRouter();
  const { data: plans = [], isLoading: plansLoading } = useGetSubscriptionPlansQuery();
  const [stored, setStored] = useState<ReturnType<typeof parseStoredSupplierPlan> | undefined>(
    undefined,
  );

  useEffect(() => {
    queueMicrotask(() => {
      const s = parseStoredSupplierPlan();
      if (!s) {
        router.replace("/join-supplier/step-4");
        setStored(null);
        return;
      }
      setStored(s);
    });
  }, [router]);

  const checkoutPlan: SupplierPlanCheckoutDefinition | null = useMemo(() => {
    if (stored === undefined || stored === null || plansLoading) return null;
    const match = resolveStoredPlan(plans, stored);
    if (!match) return null;
    return subscriptionPlanToCheckout(match);
  }, [stored, plans, plansLoading]);

  useEffect(() => {
    if (stored === null || plansLoading || checkoutPlan) return;
    router.replace("/join-supplier/step-4");
  }, [stored, plansLoading, checkoutPlan, router]);

  if (stored === undefined || plansLoading || !checkoutPlan) {
    return (
      <MarketingPageShell
        showBackgroundImage
        className="bg-white!"
        dir="rtl"
        lang="he"
      >
        <div
          className="mx-auto h-40 w-full max-w-[1100px] animate-pulse rounded-2xl bg-slate-200/80"
          aria-busy
          aria-label="טוען"
        />
      </MarketingPageShell>
    );
  }

  return (
    <MarketingPageShell
      showBackgroundImage
      className="bg-white!"
      dir="rtl"
      lang="he"
    >
      <div className="mx-auto flex w-full max-w-[1100px] flex-col items-stretch gap-8 px-4 sm:px-6 lg:px-0">
        <header
          className="flex w-full flex-col items-start gap-4"
          style={{ fontFamily: marketingPloniFont }}
        >
          <nav
            className="flex w-fit max-w-full flex-row flex-wrap items-center justify-start gap-2 self-start text-[14px] font-normal leading-5"
            aria-label="תשלום"
          >
            <Link
              href="/join-supplier/step-4"
              className="text-[#4721DF] transition hover:underline"
            >
              תוכניות מנוי
            </Link>
            <span className="px-0.5 text-[#4721DF]" aria-hidden>
              ‹
            </span>
            <span className="text-black">תשלום מאובטח</span>
          </nav>
          <div className="flex w-full flex-col items-start gap-2">
            <h1 className="w-full text-right text-[36px] font-bold leading-10 text-black">
              השלמת רישום
            </h1>
            <p className="w-full text-right text-[16px] font-normal leading-6 text-black">
              צעד אחרון לפני שתצטרפו לקהילת הספקים המובילה בישראל
            </p>
          </div>
        </header>

        <div
          className="grid w-full grid-cols-1 gap-8 xl:grid-cols-[439px_628px] xl:gap-8"
          dir="rtl"
          lang="he"
        >
          <SupplierJoinCheckoutSummary
            plan={checkoutPlan}
            styleFont={marketingPloniFont}
          />
          <SupplierJoinPaymentPanel
            styleFont={marketingPloniFont}
            planId={checkoutPlan.id}
            planKey={checkoutPlan.key}
            paymentSuccessHref="/join-supplier/payment-result?payment=success"
          />
        </div>
      </div>
    </MarketingPageShell>
  );
}
