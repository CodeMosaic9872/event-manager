"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo } from "react";
import { SupplierJoinGlassCard } from "@/shared/components/supplier-join/supplier-join-glass-card";
import { MarketingPageShell } from "@/shared/components/marketing-page-shell";
import { getSafeInternalRedirectPath } from "@/shared/lib/safe-redirect-path";
import { marketingPloniFont } from "@/shared/lib/marketing-typography";
import { useGetSubscriptionPlansQuery } from "@/shared/api/api";
import {
  getCheckoutTotals,
  parseStoredSupplierPlan,
  resolveStoredPlan,
  subscriptionPlanToCheckout,
} from "@/shared/lib/subscription-plan";

export type SupplierPaymentOutcome = "success" | "failure";

type SummaryLine = {
  value: string;
  label: string;
  icon: "plan" | "amount" | "approval";
};

function RowIcon({ kind }: { kind: SummaryLine["icon"] }) {
  const accent = "text-[#201C44]";
  if (kind === "plan") {
    return (
      <svg width="16" height="21" viewBox="0 0 16 21" className={accent} aria-hidden>
        <path
          fill="currentColor"
          d="M8 0L0 4v7c0 5.55 3.84 10.74 8 12 4.16-1.26 8-6.45 8-12V4L8 0zm0 2.18l6 3v5.82c0 4.54-3.07 8.83-6 9.93-2.93-1.1-6-5.39-6-9.93V5.18l6-3z"
        />
      </svg>
    );
  }
  if (kind === "amount") {
    return (
      <svg width="22" height="16" viewBox="0 0 22 16" className={accent} aria-hidden>
        <path
          fill="currentColor"
          d="M20 0H2C.9 0 0 .9 0 2v12c0 1.1.9 2 2 2h18c1.1 0 2-.9 2-2V2c0-1.1-.9-2-2-2zm0 14H2V4h18v10zM4 6h6v2H4V6zm0 3h10v2H4V9z"
        />
      </svg>
    );
  }
  return (
    <svg width="18" height="20" viewBox="0 0 18 20" className={accent} aria-hidden>
      <path
        fill="currentColor"
        d="M14 2H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h10c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 16H4V4h10v14zM6 10h6v2H6v-2zm0-3h6v2H6V7zm0 6h4v2H6v-2z"
      />
    </svg>
  );
}

function SuccessGlyph() {
  return (
    <div className="relative flex size-24 shrink-0 items-center justify-center">
      <div
        className="absolute -inset-6 rounded-full bg-[rgba(34,197,94,0.2)] blur-[20px]"
        aria-hidden
      />
      <div className="relative flex size-24 items-center justify-center rounded-full bg-[#22C55E] shadow-[0_0_40px_rgba(34,197,94,0.3)]">
        <svg width="36" height="28" viewBox="0 0 36 28" aria-hidden>
          <path
            fill="black"
            d="M12 28L0 16l4.12-4.24L12 19.53 31.88 0 36 4.24 12 28z"
          />
        </svg>
      </div>
    </div>
  );
}

function FailureGlyph() {
  return (
    <div className="relative flex size-24 shrink-0 items-center justify-center">
      <div
        className="absolute -inset-6 rounded-full bg-[rgba(255,116,103,0.3)] blur-[20px]"
        aria-hidden
      />
      <div className="relative flex size-24 items-center justify-center rounded-full bg-[#FF7467]">
        <span className="text-[2.75rem] font-normal leading-none tracking-tight text-black">
          ×
        </span>
      </div>
    </div>
  );
}

function usePurchaseSummaryLines(): SummaryLine[] {
  const { data: plans = [] } = useGetSubscriptionPlansQuery();

  return useMemo(() => {
    const stored = parseStoredSupplierPlan();
    const match = resolveStoredPlan(plans, stored);
    if (match) {
      const checkout = subscriptionPlanToCheckout(match);
      const { total } = getCheckoutTotals(checkout);
      return [
        { value: checkout.summaryTitle, label: "סוג מנוי", icon: "plan" },
        {
          value: `₪ ${total.toLocaleString("he-IL", {
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
          })}`,
          label: "סכום לתשלום",
          icon: "amount",
        },
        { value: "XXXX-XXXX-XXXX", label: "מספר אישור", icon: "approval" },
      ];
    }
    return [
      { value: "—", label: "סוג מנוי", icon: "plan" },
      { value: "—", label: "סכום לתשלום", icon: "amount" },
      { value: "XXXX-XXXX-XXXX", label: "מספר אישור", icon: "approval" },
    ];
  }, [plans]);
}


export type SupplierAuthPaymentResultViewProps = {
  outcome: SupplierPaymentOutcome;
  onOutcomeChange: (o: SupplierPaymentOutcome) => void;
  /** Dev-only: segmented control to flip success / failure */
  showPreviewToggle: boolean;
  nextPath: string;
  /** e.g. step-5 checkout */
  backToCheckoutHref: string;
};

export function SupplierAuthPaymentResultView({
  outcome,
  onOutcomeChange,
  showPreviewToggle,
  nextPath,
  backToCheckoutHref,
}: SupplierAuthPaymentResultViewProps) {
  const router = useRouter();
  const dashboardHref = getSafeInternalRedirectPath(nextPath, "/supplier/dashboard");
  const summaryLines = usePurchaseSummaryLines();

  return (
    <MarketingPageShell
      showBackgroundImage
      className="bg-white!"
      dir="rtl"
      lang="he"
    >
      <div
        className="mx-auto flex w-full max-w-[744px] flex-col items-center px-4 pb-16 pt-8 sm:pt-12"
        style={{ fontFamily: marketingPloniFont }}
      >
        {showPreviewToggle ? (
          <div
            className="relative z-20 mb-6 flex w-full flex-col items-center gap-2"
            role="region"
            aria-label="תצוגה מקדימה לתוצאת תשלום (פיתוח)"
          >
            <span className="text-center text-[12px] font-medium uppercase tracking-wide text-[#64748B]">
              תצוגה מקדימה — תוצאת תשלום
            </span>
            <div className="inline-flex rounded-full border border-black/10 bg-white/95 p-1 shadow-md backdrop-blur-sm">
              <button
                type="button"
                onClick={() => onOutcomeChange("success")}
                className={`rounded-full px-4 py-2 text-[14px] leading-5 transition ${
                  outcome === "success"
                    ? "bg-[#201C44] text-white"
                    : "text-black hover:bg-black/5"
                }`}
              >
                הצלחה
              </button>
              <button
                type="button"
                onClick={() => onOutcomeChange("failure")}
                className={`rounded-full px-4 py-2 text-[14px] leading-5 transition ${
                  outcome === "failure"
                    ? "bg-[#201C44] text-white"
                    : "text-black hover:bg-black/5"
                }`}
              >
                כישלון
              </button>
            </div>
          </div>
        ) : null}

        <SupplierJoinGlassCard className="flex w-full min-h-[min(839px,calc(100vh-200px))] flex-col items-center px-6 py-10 sm:px-12 sm:py-14">
          <div dir="rtl" lang="he" className="flex w-full max-w-[640px] flex-col items-center">
          {outcome === "success" ? (
            <>
              <div className="mb-8 flex flex-col items-center">
                <SuccessGlyph />
              </div>
              <h1 className="mb-4 max-w-[461px] text-center text-[clamp(28px,5vw,48px)] font-bold leading-tight tracking-tight text-black">
                התשלום בוצע בהצלחה!
              </h1>
              <p className="mb-10 max-w-[512px] px-2 text-center text-[20px] font-normal leading-7 text-black">
                החשבון שלך פעיל כעת והנך מוזמן לקבל לידים חדשים
              </p>

              <div className="mb-10 w-full max-w-[640px] rounded-2xl border border-black/10 bg-[rgba(0,0,0,0.03)] p-8 shadow-[0px_25px_50px_-12px_rgba(0,0,0,0.25)] backdrop-blur-[10px]">
                <div className="flex flex-col gap-6">
                  {summaryLines.map((row, i) => (
                    <div
                      key={row.label}
                      className={`flex flex-row items-center justify-between gap-4 ${
                        i < summaryLines.length - 1
                          ? "border-b border-black/5 pb-4"
                          : ""
                      }`}
                    >
                      <span className="text-left text-[18px] font-semibold leading-7 text-black tabular-nums" dir="ltr">
                        {row.value}
                      </span>
                      <span className="flex shrink-0 flex-row items-center gap-3 text-right text-[16px] font-normal leading-6 text-black">
                        <span>{row.label}</span>
                        <RowIcon kind={row.icon} />
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mb-10 flex w-full max-w-[640px] flex-col items-stretch justify-center gap-4 sm:flex-row sm:gap-4">
                <Link
                  href={dashboardHref}
                  className="flex h-14 min-w-[200px] flex-1 items-center justify-center gap-2 rounded-[99px] bg-[#201C44] px-8 text-[18px] font-bold leading-7 text-white transition hover:bg-[#151238]"
                >
                  <Image
                    src="/icons/right_arrow.svg"
                    alt=""
                    width={16}
                    height={16}
                    className="rotate-180 opacity-95 brightness-0 invert"
                    unoptimized
                  />
                  <span>מעבר לדשבורד הראשי</span>
                </Link>
                <button
                  type="button"
                  className="flex h-14 min-w-[200px] flex-1 items-center justify-center gap-2 rounded-3xl border border-black/10 bg-white px-8 text-[18px] font-normal leading-7 text-black transition hover:bg-black/5"
                >
                  <span>צפייה בחשבונית</span>
                  <Image
                    src="/icons/file.svg"
                    alt=""
                    width={16}
                    height={16}
                    className="opacity-80"
                    unoptimized
                  />
                </button>
              </div>

              <p className="text-center text-[14px] font-normal leading-5 text-[#64748B]">
                נתקלת בבעיה?{" "}
                <Link href="/contact-us" className="font-normal text-[#201C44] underline underline-offset-2 transition hover:text-[#151238]">
                  צור קשר עם התמיכה הטכנית
                </Link>
              </p>
            </>
          ) : (
            <>
              <div className="mb-8 flex flex-col items-center">
                <FailureGlyph />
              </div>
              <h1 className="mb-4 max-w-[461px] text-center text-[clamp(28px,5vw,48px)] font-bold leading-tight tracking-tight text-black">
                התשלום נדחה
              </h1>
              <p className="mb-12 max-w-[512px] px-2 text-center text-[20px] font-normal leading-7 text-black">
                אנא נסה שנית
              </p>

              <button
                type="button"
                onClick={() => router.push(backToCheckoutHref)}
                className="mb-12 flex h-14 w-full max-w-[311px] items-center justify-center gap-2 rounded-[99px] bg-[#201C44] px-8 text-[18px] font-bold leading-7 text-white transition hover:bg-[#151238]"
              >
                <Image
                  src="/icons/right_arrow.svg"
                  alt=""
                  width={16}
                  height={16}
                  className="rotate-180 brightness-0 invert"
                  unoptimized
                />
                <span>חזרה לתשלום מחדש</span>
              </button>

              <p className="text-center text-[14px] font-normal leading-5 text-[#64748B]">
                נתקלת בבעיה?{" "}
                <Link href="/contact-us" className="font-normal text-[#201C44] underline underline-offset-2 transition hover:text-[#151238]">
                  צור קשר עם התמיכה הטכנית
                </Link>
              </p>
            </>
          )}
          </div>
        </SupplierJoinGlassCard>
      </div>
    </MarketingPageShell>
  );
}

/** `from=purchase` in the URL — after checkout, user lands on auth with this flag. */
export function isSupplierAuthFromPurchase(
  searchParams: URLSearchParams | { get: (k: string) => string | null },
): boolean {
  return searchParams.get("from") === "purchase";
}

export function initialPaymentOutcomeFromSearch(
  searchParams: URLSearchParams | { get: (k: string) => string | null },
): SupplierPaymentOutcome {
  const p = searchParams.get("payment");
  if (p === "failure" || p === "failed") return "failure";
  return "success";
}
