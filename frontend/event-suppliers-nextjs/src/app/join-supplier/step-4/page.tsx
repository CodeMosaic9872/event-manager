"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useCallback } from "react";
import {
  SupplierPricingPlanCard,
  type SupplierPricingPlanCardProps,
} from "@/shared/components/supplier-join/supplier-pricing-plan-card";
import { SupplierJoinGlassCard } from "@/shared/components/supplier-join/supplier-join-glass-card";
import { SupplierJoinProgress } from "@/shared/components/supplier-join/supplier-join-progress";
import { MarketingPageShell } from "@/shared/components/marketing-page-shell";
import type { SupplierPlanId } from "@/shared/lib/supplier-join-plan";
import { marketingPloniFont } from "@/shared/lib/marketing-typography";

const FEATURE_SMS =
  "Receive SMS about job offers in real time";

const TRUST_STRIP_ITEMS = [
  { src: "/guarantee.svg", label: "Guarantee", w: 56, h: 46 },
  { src: "/paypal.svg", label: "PayPal", w: 35, h: 46 },
  { src: "/visa-mc.svg", label: "Visa / MC", w: 46, h: 46 },
  { src: "/ssl-secure.svg", label: "SSL Secure", w: 57, h: 46 },
] as const;

export default function JoinSupplierStep4Page() {
  const router = useRouter();

  const persistPlan = useCallback((id: SupplierPlanId) => {
    try {
      sessionStorage.setItem(
        "supplierJoinPlan",
        JSON.stringify({ planId: id, at: Date.now() }),
      );
    } catch {
      /* ignore */
    }
  }, []);

  const handleCompletionAndPayment = useCallback(() => {
    router.push("/join-supplier/step-5");
  }, [router]);

  const plans: {
    id: SupplierPlanId;
    props: Omit<SupplierPricingPlanCardProps, "onSelect">;
  }[] = [
    {
      id: "two_year",
      props: {
        title: "Two years — partners in fire and water",
        badges: ["The most affordable"],
        periodAmount: "₪1,990",
        periodCaption: "/ Two years",
        monthlyAmount: "₪82",
        monthlyCaption: "/ per month",
        features: [FEATURE_SMS],
        ctaLabel: "Choosing this route",
        ctaVariant: "outline",
      },
    },
    {
      id: "annual",
      props: {
        title: "A year — partners on the journey",
        badges: ["The most chosen"],
        recommended: true,
        periodAmount: "₪1,390",
        periodCaption: "/ year",
        monthlyAmount: "₪115",
        monthlyCaption: "/ per month",
        features: [FEATURE_SMS],
        ctaLabel: "Choosing an annual track",
        ctaVariant: "filled",
      },
    },
    {
      id: "six_month",
      props: {
        title: "Six months — no obligation relationship",
        periodAmount: "₪790",
        periodCaption: "/ Half a year",
        monthlyAmount: "₪131",
        monthlyCaption: "/ per month",
        features: [FEATURE_SMS],
        ctaLabel: "Choosing this route",
        ctaVariant: "outline",
      },
    },
  ];

  return (
    <MarketingPageShell
      showBackgroundImage
      className="bg-white!"
      dir="rtl"
      lang="he"
    >
      <div className="mx-auto flex w-full max-w-[1120px] flex-col items-stretch px-2 sm:px-0">
        <SupplierJoinProgress
          percent={100}
          stepLabel="Step 4 of 4"
          title="Choose your route"
        />

        <SupplierJoinGlassCard
          className="w-full px-4 py-8 sm:px-8 sm:py-10"
          style={{ fontFamily: marketingPloniFont }}
        >
          <div className="flex flex-col gap-10" dir="ltr" lang="en">
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3 lg:items-stretch lg:gap-5">
              {plans.map(({ id, props }) => (
                <SupplierPricingPlanCard
                  key={id}
                  {...props}
                  onSelect={() => persistPlan(id)}
                />
              ))}
            </div>

            <div className="flex flex-col items-center gap-8 border-t border-white/10 pt-8">
              <button
                type="button"
                onClick={handleCompletionAndPayment}
                className="flex h-[68px] w-full max-w-[448px] flex-row items-center justify-center gap-3 rounded-[99px] bg-[#201C44] px-6 text-[20px] font-normal leading-7 text-white shadow-[0_8px_24px_rgba(32,28,68,0.25)] transition hover:bg-[#151238]"
                style={{ fontFamily: marketingPloniFont }}
              >
                <Image
                  src="/right_arrow.svg"
                  alt=""
                  width={16}
                  height={16}
                  className="size-4 shrink-0 -scale-x-100 brightness-0 invert"
                  unoptimized
                  aria-hidden
                />
                <span>Completion and payment</span>
              </button>

              <div
                className="flex max-w-full flex-wrap items-stretch justify-center py-4 sm:gap-12"
                style={{ fontFamily: "var(--font-assistant), Space Grotesk, sans-serif" }}
              >
                {TRUST_STRIP_ITEMS.map(({ src, label, w, h }) => (
                  <div
                    key={src}
                    className="flex flex-col items-center gap-2 text-white"
                  >
                    <Image
                      src={src}
                      alt=""
                      width={w}
                      height={h}
                      unoptimized
                      aria-hidden
                    />
                    <span className="text-center text-[10px] font-bold uppercase leading-[15px] tracking-wide">
                      {label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </SupplierJoinGlassCard>
      </div>
    </MarketingPageShell>
  );
}
