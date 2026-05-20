"use client";

import Image from "next/image";
import type { SupplierPlanCheckoutDefinition } from "@/shared/lib/supplier-join-plan";
import { SUPPLIER_JOIN_PROGRAM_FEATURES, formatIls } from "@/shared/lib/supplier-join-plan";
import { getCheckoutTotals } from "@/shared/lib/subscription-plan";
import { marketingPloniFont } from "@/shared/lib/marketing-typography";

type Props = {
  plan: SupplierPlanCheckoutDefinition;
  styleFont?: string;
  /** Admin registration payment matches Figma without help card and with plan picker header. */
  variant?: "default" | "admin";
};

function FeatureBullet({ children }: { children: string }) {
  return (
    <li className="flex w-full min-w-0 flex-row items-start gap-3">
      <Image
        src="/icons/verified.svg"
        alt=""
        width={15}
        height={15}
        className="mt-0.5 size-[15px] shrink-0 object-contain"
        unoptimized
        aria-hidden
      />
      <span className="min-w-0 flex-1 text-right text-[14px] font-normal leading-5 text-black/70">
        {children}
      </span>
    </li>
  );
}

function ChevronDownIcon() {
  return (
    <svg
      width="10"
      height="5"
      viewBox="0 0 10 5"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
      className="shrink-0"
    >
      <path
        d="M1 1L5 4L9 1"
        stroke="#6B7280"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function SupplierJoinCheckoutSummary({
  plan,
  styleFont,
  variant = "default",
}: Props) {
  const font = styleFont ?? marketingPloniFont;
  const { pretax, vat, total } = getCheckoutTotals(plan);
  const featureLines =
    plan.features?.length ? plan.features : SUPPLIER_JOIN_PROGRAM_FEATURES;
  const isAdmin = variant === "admin";
  const vatPercentLabel =
    plan.vatShekels != null && plan.pretaxSubtotal > 0
      ? `מע"מ (${Math.round((plan.vatShekels / plan.pretaxSubtotal) * 100)}%)`
      : 'מע"מ (18%)';

  return (
    <div
      className="flex w-full min-w-0 flex-col gap-6"
      style={{ fontFamily: font }}
    >
      <div
        className="w-full min-w-0 overflow-hidden rounded-[24px] border border-black bg-[rgba(134,85,246,0.06)] backdrop-blur-[6px]"
        dir="rtl"
        lang="he"
      >
        <div className="relative flex h-32 w-full items-center justify-center overflow-hidden bg-[rgba(134,85,246,0.2)]">
          <Image
            src={isAdmin ? "/images/payment_overlay.png" : "/images/background-1.png"}
            alt=""
            fill
            className="object-cover opacity-30 mix-blend-overlay"
            unoptimized
            aria-hidden
          />
          {isAdmin ? null : (
            <p className="relative z-[1] text-center text-[24px] font-bold leading-6 text-black">
              מנוי שותפים לדרך
            </p>
          )}
        </div>

        <div className="flex w-full flex-col gap-6 p-6">
          {isAdmin ? (
            <div className="flex w-full flex-col gap-2">
              <button
                type="button"
                className="flex flex-row items-center gap-2 text-right text-[20px] font-normal leading-4 text-black"
                aria-haspopup="listbox"
                aria-expanded={false}
              >
                <span>בחירת מנוי</span>
                <ChevronDownIcon />
              </button>
              <p className="w-full text-right text-[16px] font-bold leading-6 text-black">
                {plan.summaryTitle}
              </p>
            </div>
          ) : (
            <div className="flex w-full flex-row items-start justify-between gap-3 border-b border-black/5 pb-4">
              <div className="h-5 w-[68px] shrink-0" aria-hidden />
              <div className="min-w-0 max-w-[calc(100%-80px)] text-right">
                <p className="text-[12px] font-normal leading-4 text-black/50">
                  תקופת מנוי
                </p>
                <p className="break-words text-[16px] font-bold leading-6 text-black">
                  {plan.summaryTitle}
                </p>
              </div>
            </div>
          )}

          <div className="flex w-full flex-col gap-4">
            <h4 className="w-full text-right text-[14px] font-bold leading-5 text-black">
              מה כלול בתוכנית:
            </h4>
            <ul className="flex w-full flex-col gap-3">
              {featureLines.map((line) => (
                <FeatureBullet key={line}>{line}</FeatureBullet>
              ))}
            </ul>
          </div>

          <div className="w-full border-t border-black pt-6">
            <div className="flex w-full flex-col gap-2">
              <div className="flex w-full flex-row items-baseline justify-between gap-4 text-[14px] font-normal leading-5 text-black">
                <span className="min-w-0 shrink text-right">מחיר מנוי</span>
                <span className="shrink-0 tabular-nums" dir="ltr">
                  {formatIls(pretax)}
                </span>
              </div>
              <div className="flex w-full flex-row items-baseline justify-between gap-4 text-[14px] font-normal leading-5 text-black">
                <span className="min-w-0 shrink text-right">{vatPercentLabel}</span>
                <span className="shrink-0 tabular-nums" dir="ltr">
                  {formatIls(vat)}
                </span>
              </div>
            </div>

            <div className="mt-4 flex w-full flex-row items-center justify-between gap-4 mb-8">
              <p className="max-w-[180px] shrink-0 text-right text-[24px] font-bold leading-7 text-black">
                סה&quot;כ לתשלום
              </p>
              <div className="min-w-0 text-left">
                <p
                  className="text-[30px] font-bold leading-9 text-black tabular-nums"
                  dir="ltr"
                >
                  {formatIls(total)}
                </p>
                <p className="text-right text-[10px] font-normal leading-[15px] text-black">
                  {plan.totalPeriodNote}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {isAdmin ? null : (
        <div
          className="flex w-full min-w-0 flex-row items-center gap-4 rounded-[24px] border border-black bg-[rgba(134,85,246,0.06)] p-4 backdrop-blur-[6px]"
          dir="rtl"
          lang="he"
        >
          <div
            className="flex size-10 shrink-0 items-center justify-center rounded-full bg-black/5"
            aria-hidden
          >
            <Image
              src="/icons/customer-help.svg"
              alt=""
              width={20}
              height={18}
              className="object-contain"
              unoptimized
            />
          </div>
          <div className="min-w-0 flex-1 text-right">
            <p className="text-[14px] font-bold leading-5 text-black">צריכים עזרה?</p>
            <p className="text-[12px] font-normal leading-4 text-black/50">
              נציגי המכירות שלנו זמינים עבורכם
            </p>
          </div>
          <div className="shrink-0">
            <button
              type="button"
              className="rounded-2xl bg-black/5 px-3 py-1.5 text-[12px] font-normal leading-4 text-black transition hover:bg-black/10"
            >
              צ&apos;אט חי
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
