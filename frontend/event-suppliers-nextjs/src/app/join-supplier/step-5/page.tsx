"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { SupplierJoinCheckoutSummary } from "@/shared/components/supplier-join/supplier-join-checkout-summary";
import { SupplierJoinPaymentPanel } from "@/shared/components/supplier-join/supplier-join-payment-panel";
import { MarketingPageShell } from "@/shared/components/marketing-page-shell";
import { marketingPloniFont } from "@/shared/lib/marketing-typography";
import {
  SUPPLIER_PLAN_CHECKOUT,
  type SupplierPlanId,
  parseStoredSupplierPlanId,
} from "@/shared/lib/supplier-join-plan";

export default function JoinSupplierStep5Page() {
  const router = useRouter();
  const [planId, setPlanId] = useState<SupplierPlanId | null | undefined>(
    undefined,
  );

  useEffect(() => {
    queueMicrotask(() => {
      const id = parseStoredSupplierPlanId();
      if (!id) {
        router.replace("/join-supplier/step-4");
        setPlanId(null);
        return;
      }
      setPlanId(id);
    });
  }, [router]);

  if (planId === undefined) {
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
          aria-label="Loading"
        />
      </MarketingPageShell>
    );
  }

  if (planId === null) {
    return null;
  }

  const plan = SUPPLIER_PLAN_CHECKOUT[planId];

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
            className="flex w-fit max-w-full flex-row flex-wrap items-center justify-start gap-2 self-start text-[14px] leading-5"
            aria-label="Checkout"
          >
            <span className="text-black">Secure payment</span>
            <span className="px-0.5 text-[#4721DF]" aria-hidden>
              ‹
            </span>
            <Link
              href="/join-supplier/step-4"
              className="text-[#4721DF] transition hover:underline"
            >
              Subscription plans
            </Link>
          </nav>
          <div className="flex w-full flex-col items-start gap-2">
            <h1 className="w-full text-right text-[36px] font-normal leading-10 text-black">
              Registration completion
            </h1>
            <p className="w-full text-right text-[16px] font-normal leading-6 text-black">
              One last step before joining the leading supplier community in
              Israel
            </p>
          </div>
        </header>

        {/* Design: 1100px row, 439.66px summary + 32px gap + 628.33px payment — side-by-side from xl */}
        <div
          className="grid w-full grid-cols-1 gap-8 xl:grid-cols-[439px_628px] xl:gap-8"
          dir="ltr"
          lang="en"
        >
          <SupplierJoinCheckoutSummary
            plan={plan}
            styleFont={marketingPloniFont}
          />
          <SupplierJoinPaymentPanel styleFont={marketingPloniFont} />
        </div>
      </div>
    </MarketingPageShell>
  );
}
