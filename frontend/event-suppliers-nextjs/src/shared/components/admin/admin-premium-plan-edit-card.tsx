"use client";

import { SupplierPlanVerifiedFeatureRow } from "@/shared/components/supplier-join/supplier-pricing-plan-card";
import { marketingPloniFont } from "@/shared/lib/marketing-typography";

export type AdminPremiumPlanEditCardProps = {
  badge?: string;
  featured?: boolean;
  title: string;
  onTitleChange: (value: string) => void;
  pretaxShekels: number;
  onPretaxChange: (value: number) => void;
  months: number;
  periodCaption: string;
  monthlyCaption: string;
  featureLines: string[];
  ctaVariant: "outline" | "filled";
  onSave: () => void;
};

function EditingCornerLabel() {
  return (
    <span
      className="pointer-events-none absolute left-4 top-4 text-[10px] font-normal uppercase tracking-[0.2em] text-black/25"
      style={{ fontFamily: marketingPloniFont }}
    >
      Editing
    </span>
  );
}

function formatShekels(n: number): string {
  return new Intl.NumberFormat("en-US").format(Math.max(0, Math.round(n)));
}

export function AdminPremiumPlanEditCard({
  badge,
  featured = false,
  title,
  onTitleChange,
  pretaxShekels,
  onPretaxChange,
  months,
  periodCaption,
  monthlyCaption,
  featureLines,
  ctaVariant,
  onSave,
}: AdminPremiumPlanEditCardProps) {
  const monthly = months > 0 ? Math.round(pretaxShekels / months) : 0;

  const shell = featured
    ? "relative z-[1] -mt-1 mb-1 flex min-h-0 flex-col rounded-2xl border-2 border-[#4721DF] bg-white px-6 pb-6 pt-10 shadow-[0_25px_50px_-12px_rgba(0,0,0,0.15)] sm:px-7"
    : badge
      ? "relative flex min-h-0 flex-col rounded-2xl border border-[#E2E8F0] bg-[#F1F5F9] px-6 pb-6 pt-10 sm:px-7"
      : "relative flex min-h-0 flex-col rounded-2xl border border-[#E2E8F0] bg-[#F1F5F9] px-6 pb-6 pt-8 sm:px-7";

  return (
    <div className={`${shell} dir-ltr`} lang="en">
      <EditingCornerLabel />
      {badge ? (
        <div className="pointer-events-none absolute top-0 z-2 flex max-w-[95%] -translate-x-1/2 -translate-y-1/2 flex-wrap justify-center gap-2 inset-s-1/2">
          <span
            className="rounded-full bg-[#4721DF] px-3 py-1 text-[10px] font-normal uppercase tracking-wide text-white sm:px-4 sm:text-[11px]"
            style={{ fontFamily: marketingPloniFont }}
          >
            {badge}
          </span>
        </div>
      ) : null}

      <input
        value={title}
        onChange={(e) => onTitleChange(e.target.value)}
        className="mt-1 w-full border-0 border-b border-black/15 bg-transparent text-left text-[20px] font-normal leading-7 text-black outline-none focus:border-[#4721DF]"
        style={{ fontFamily: marketingPloniFont }}
        aria-label="Plan title"
      />

      <div className="mt-6 flex flex-col gap-4">
        <div className="flex flex-row items-end justify-between gap-2">
          <span className="text-[16px] leading-5 text-black">{periodCaption}</span>
          <label className="flex shrink-0 flex-row items-baseline gap-1 tabular-nums">
            <span
              className="text-[22px] font-normal leading-none text-black sm:text-[28px]"
              style={{ fontFamily: marketingPloniFont }}
            >
              ₪
            </span>
            <input
              type="number"
              min={0}
              step={10}
              value={Number.isFinite(pretaxShekels) ? pretaxShekels : 0}
              onChange={(e) => onPretaxChange(Number(e.target.value) || 0)}
              className="w-22 border-0 border-b border-black/20 bg-transparent text-right text-[30px] font-normal leading-10 text-black outline-none focus:border-[#4721DF] sm:w-32 sm:text-[36px]"
              style={{ fontFamily: marketingPloniFont }}
              aria-label="Total subscription price before VAT"
            />
          </label>
        </div>
        <div className="flex flex-row items-end justify-between gap-2">
          <span className="text-[16px] leading-5 text-black">{monthlyCaption}</span>
          <span
            className="shrink-0 text-[36px] font-normal leading-10 text-black tabular-nums"
            style={{ fontFamily: marketingPloniFont }}
          >
            ₪{formatShekels(monthly)}
          </span>
        </div>
      </div>

      {featureLines.length > 0 ? (
        <ul className="mt-6 flex flex-col gap-4 border-t border-black/10 pt-6">
          {featureLines.map((line) => (
            <li key={line}>
              <SupplierPlanVerifiedFeatureRow>{line}</SupplierPlanVerifiedFeatureRow>
            </li>
          ))}
        </ul>
      ) : null}

      <div className="mt-8">
        <button
          type="button"
          onClick={onSave}
          className={
            ctaVariant === "filled"
              ? "flex h-[58px] w-full items-center justify-center rounded-[99px] bg-[#4721DF] px-4 text-[18px] font-normal leading-6 text-white transition hover:bg-[#3b1cb8]"
              : "flex h-[50px] w-full items-center justify-center rounded-[99px] border border-[#4721DF] bg-transparent px-4 text-[16px] font-normal leading-6 text-[#4721DF] transition hover:bg-[#4721DF]/10"
          }
          style={{ fontFamily: marketingPloniFont }}
        >
          Save changes
        </button>
      </div>
    </div>
  );
}
