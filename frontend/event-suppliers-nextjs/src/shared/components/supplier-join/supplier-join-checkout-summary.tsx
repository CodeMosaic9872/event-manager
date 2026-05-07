"use client";

import Image from "next/image";
import type { SupplierPlanCheckoutDefinition } from "@/shared/lib/supplier-join-plan";
import {
  SUPPLIER_JOIN_PROGRAM_FEATURES,
  computeVatLineShekels,
  formatIls,
} from "@/shared/lib/supplier-join-plan";
import { marketingPloniFont } from "@/shared/lib/marketing-typography";

type Props = {
  plan: SupplierPlanCheckoutDefinition;
  styleFont?: string;
};

function FeatureBullet({ children }: { children: string }) {
  return (
    <li className="flex w-full min-w-0 items-start justify-between gap-3">
      <span className="min-w-0 flex-1 text-right text-[14px] leading-5 text-black/70">
        {children}
      </span>
      <Image
        src="/verified.svg"
        alt=""
        width={24}
        height={23}
        className="mt-0.5 size-[15px] shrink-0 object-contain"
        unoptimized
        aria-hidden
      />
    </li>
  );
}

export function SupplierJoinCheckoutSummary({ plan, styleFont }: Props) {
  const font = styleFont ?? marketingPloniFont;
  const { pretax, vat, total } = computeVatLineShekels(plan.pretaxSubtotal);

  return (
    <div
      className="flex w-full min-w-0 flex-col gap-6"
      style={{ fontFamily: font }}
    >
      <div
        className="w-full min-w-0 overflow-hidden rounded-[24px] border border-black bg-[rgba(134,85,246,0.06)] backdrop-blur-[6px]"
        dir="ltr"
        lang="en"
      >
        <div className="relative flex h-32 w-full items-center justify-center bg-[rgba(134,85,246,0.2)]">
          <p className="relative z-[1] text-center text-[24px] font-normal leading-6 text-black">
            Partner subscription
          </p>
        </div>

        <div className="flex w-full flex-col gap-6 p-6">
          <div className="flex w-full flex-row items-start justify-between gap-3 border-b border-black/5 pb-4">
            <div className="h-5 w-[68px] shrink-0" aria-hidden />
            <div className="min-w-0 max-w-[calc(100%-80px)] text-right">
              <p className="text-[12px] leading-4 text-black/50">
                Subscription period
              </p>
              <p className="break-words text-[16px] font-normal leading-6 text-black">
                {plan.summaryTitle}
              </p>
            </div>
          </div>

          <div className="flex w-full flex-col gap-4">
            <h4 className="w-full text-right text-[14px] font-normal leading-5 text-black">
              What is included in the program:
            </h4>
            <ul className="flex w-full flex-col gap-3">
              {SUPPLIER_JOIN_PROGRAM_FEATURES.map((line) => (
                <FeatureBullet key={line}>{line}</FeatureBullet>
              ))}
            </ul>
          </div>

          <div className="w-full border-t border-black pt-6">
            <div className="flex w-full flex-col gap-2">
              <div className="flex w-full flex-row items-baseline justify-between gap-4 text-[14px] leading-5 text-black">
                <span className="min-w-0 shrink text-left text-[14px]">
                  Subscription price
                </span>
                <span className="shrink-0 tabular-nums" dir="ltr">
                  {formatIls(pretax)}
                </span>
              </div>
              <div className="flex w-full flex-row items-baseline justify-between gap-4 text-[14px] leading-5 text-black">
                <span className="min-w-0 shrink text-left text-[14px]">
                  VAT (17%)
                </span>
                <span className="shrink-0 tabular-nums" dir="ltr">
                  {formatIls(vat)}
                </span>
              </div>
            </div>

            <div className="mt-4 flex w-full flex-row items-end justify-between gap-4">
              <div className="min-w-0 text-left">
                <p
                  className="text-[30px] font-normal leading-9 text-black tabular-nums"
                  dir="ltr"
                >
                  {formatIls(total)}
                </p>
                <p className="text-[10px] leading-[15px] text-black">
                  {plan.totalPeriodNote}
                </p>
              </div>
              <p className="max-w-[180px] shrink-0 text-right text-[24px] font-normal leading-7 text-black">
                Total to be paid
              </p>
            </div>
          </div>
        </div>
      </div>

      <div
        className="flex w-full min-w-0 flex-row items-center gap-4 rounded-[24px] border border-black bg-[rgba(134,85,246,0.06)] p-4 backdrop-blur-[6px]"
        dir="ltr"
        lang="en"
      >
        <div className="shrink-0">
          <button
            type="button"
            className="rounded-2xl bg-black/5 px-3 py-1.5 text-[12px] font-normal leading-4 text-black transition hover:bg-black/10"
          >
            Live chat
          </button>
        </div>
        <div className="min-w-0 flex-1 text-right">
          <p className="text-[14px] leading-5 text-black">Need help?</p>
          <p className="text-[12px] leading-4 text-black/50">
            Our sales representatives are available for you.
          </p>
        </div>
        <div
          className="flex size-10 shrink-0 items-center justify-center rounded-full bg-black/5"
          aria-hidden
        >
          <Image
            src="/customer-help.svg"
            alt=""
            width={20}
            height={18}
            className="object-contain"
            unoptimized
          />
        </div>
      </div>
    </div>
  );
}
