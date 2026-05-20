"use client";

import Image from "next/image";
import type { ReactNode } from "react";
import { marketingPloniFont } from "@/shared/lib/marketing-typography";

export function SupplierPlanVerifiedFeatureRow({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-row items-center gap-3">
      <Image
        src="/icons/verified.svg"
        alt=""
        width={24}
        height={23}
        className="size-[23px] shrink-0 object-contain"
        unoptimized
        aria-hidden
      />
      <span className="min-w-0 flex-1 text-right text-[14px] font-medium leading-5 text-black">
        {children}
      </span>
    </div>
  );
}

export type SupplierPricingPlanCardProps = {
  title: string;
  badges?: string[];
  recommended?: boolean;
  periodAmount: string;
  periodCaption: string;
  monthlyAmount: string;
  monthlyCaption: string;
  features: string[];
  ctaLabel: string;
  ctaVariant: "outline" | "filled";
  onSelect: () => void;
};

export function SupplierPricingPlanCard({
  title,
  badges = [],
  recommended = false,
  periodAmount,
  periodCaption,
  monthlyAmount,
  monthlyCaption,
  features,
  ctaLabel,
  ctaVariant,
  onSelect,
}: SupplierPricingPlanCardProps) {
  const shell = recommended
    ? "relative z-[1] -mt-1 mb-1 flex min-h-0 flex-col rounded-2xl border-2 border-[#4721DF] bg-white px-6 pb-6 pt-10 shadow-[0_25px_50px_-12px_rgba(0,0,0,0.25)] sm:px-7"
    : badges.length > 0
      ? "relative flex min-h-0 flex-col rounded-2xl border border-white/10 bg-[rgba(21,21,21,0.13)] px-6 pb-6 pt-10 sm:px-7"
      : "relative flex min-h-0 flex-col rounded-2xl border border-white/10 bg-[rgba(21,21,21,0.13)] px-6 pb-6 pt-8 sm:px-7";

  return (
    <div className={shell} dir="rtl" lang="he">
      {badges.length > 0 ? (
        <div className="pointer-events-none absolute start-1/2 top-0 z-[2] flex max-w-[95%] -translate-x-1/2 -translate-y-1/2 flex-wrap justify-center gap-2">
          {badges.map((b) => (
            <span
              key={b}
              className="rounded-full bg-[#4721DF] px-3 py-1 text-[10px] font-bold uppercase tracking-wide text-white sm:px-4 sm:text-[11px]"
              style={{ fontFamily: marketingPloniFont }}
            >
              {b}
            </span>
          ))}
        </div>
      ) : null}

      <h3
        className="text-right text-[20px] font-bold leading-7 text-black"
        style={{ fontFamily: marketingPloniFont }}
      >
        {title}
      </h3>

      <div className="mt-6 flex flex-col gap-4">
        <div className="flex flex-row items-end justify-between gap-2">
          <span
            className="shrink-0 text-[36px] font-bold leading-10 text-black tabular-nums"
            style={{ fontFamily: marketingPloniFont }}
            dir="ltr"
          >
            {periodAmount}
          </span>
          <span className="text-[16px] font-normal leading-5 text-black">
            {periodCaption}
          </span>
        </div>
        <div className="flex flex-row items-end justify-between gap-2">
          <span
            className="shrink-0 text-[36px] font-bold leading-10 text-black tabular-nums"
            style={{ fontFamily: marketingPloniFont }}
            dir="ltr"
          >
            {monthlyAmount}
          </span>
          <span className="text-[16px] font-normal leading-5 text-black">
            {monthlyCaption}
          </span>
        </div>
      </div>

      {features.length > 0 ? (
        <ul className="mt-6 flex flex-col gap-4 border-t border-black/10 pt-6">
          {features.map((line) => (
            <li key={line}>
              <SupplierPlanVerifiedFeatureRow>{line}</SupplierPlanVerifiedFeatureRow>
            </li>
          ))}
        </ul>
      ) : null}

      <div className="mt-8">
        <button
          type="button"
          onClick={onSelect}
          className={
            ctaVariant === "filled"
              ? "flex h-[58px] w-full items-center justify-center rounded-[99px] bg-[#4721DF] px-4 text-[18px] font-bold leading-6 text-white transition hover:bg-[#3b1cb8]"
              : "flex h-[50px] w-full items-center justify-center rounded-[99px] border border-[#4721DF] bg-transparent px-4 text-[16px] font-bold leading-6 text-[#4721DF] transition hover:bg-[#4721DF]/10"
          }
          style={{ fontFamily: marketingPloniFont }}
        >
          {ctaLabel}
        </button>
      </div>
    </div>
  );
}
