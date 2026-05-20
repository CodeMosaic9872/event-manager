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
      className="pointer-events-none absolute left-4 top-[13px] text-sm font-medium text-[#4721DF]"
      style={{ fontFamily: marketingPloniFont }}
    >
      עריכה
    </span>
  );
}

function formatShekels(n: number): string {
  return new Intl.NumberFormat("he-IL").format(Math.max(0, Math.round(n)));
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
    ? "relative z-[1] -mt-1 mb-1 flex min-h-0 flex-col rounded-2xl border-2 border-[#4721DF] bg-white px-6 pb-6 pt-10 shadow-[0_25px_50px_-12px_rgba(0,0,0,0.25)] sm:px-7"
    : "relative flex min-h-0 flex-col rounded-2xl border border-white/10 bg-[rgba(21,21,21,0.13)] px-6 pb-6 pt-10 sm:px-7";

  return (
    <div className={shell} dir="rtl" lang="he">
      <EditingCornerLabel />
      {badge ? (
        <div className="pointer-events-none absolute left-1/2 top-0 z-2 flex max-w-[95%] -translate-x-1/2 -translate-y-1/2 flex-wrap justify-center gap-2">
          <span
            className="rounded-full bg-[#4721DF] px-[22px] py-1 text-sm font-bold uppercase tracking-[0.6px] text-white"
            style={{ fontFamily: marketingPloniFont }}
          >
            {badge}
          </span>
        </div>
      ) : null}

      <input
        value={title}
        onChange={(e) => onTitleChange(e.target.value)}
        className="mt-1 w-full max-w-[min(100%,14.5rem)] border-0 border-b border-black/15 bg-transparent text-right text-xl font-bold leading-7 text-black outline-none focus:border-[#4721DF]"
        style={{ fontFamily: marketingPloniFont }}
        aria-label="כותרת חבילה"
      />

      <div className="mt-6 flex flex-col gap-4">
        <div className="flex flex-row items-end justify-between gap-2">
          <label className="flex max-w-fit shrink-0 flex-row items-baseline gap-0.5 tabular-nums">
            <span
              className="text-[22px] font-bold leading-none text-black sm:text-[28px]"
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
              className="w-[clamp(4.25rem,28vw,5.75rem)] min-w-0 border-0 border-b border-black/20 bg-transparent text-right text-[clamp(1.5rem,4vw,2.25rem)] font-bold leading-tight text-black outline-none focus:border-[#4721DF]"
              style={{ fontFamily: marketingPloniFont }}
              aria-label="מחיר מנוי לפני מע״מ"
            />
          </label>
          <span className="text-base font-normal leading-5 text-black">{periodCaption}</span>
        </div>
        <div className="flex flex-row items-end justify-between gap-2">
          <span
            className="shrink-0 text-[clamp(1.5rem,4vw,2.25rem)] font-medium leading-tight text-black tabular-nums"
            style={{ fontFamily: marketingPloniFont }}
          >
            ₪{formatShekels(monthly)}
          </span>
          <span className="text-base font-normal leading-5 text-black">{monthlyCaption}</span>
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
              ? "flex min-h-[58px] w-full items-center justify-center rounded-[99px] bg-[#4721DF] px-4 py-3 text-[18px] font-bold leading-6 text-white transition hover:bg-[#3b1cb8]"
              : "flex min-h-[50px] w-full items-center justify-center rounded-[99px] border border-[#4721DF] bg-transparent px-4 py-3 text-[18px] font-bold leading-6 text-[#4721DF] transition hover:bg-[#4721DF]/10"
          }
          style={{ fontFamily: marketingPloniFont }}
        >
          שמור שינויים
        </button>
      </div>
    </div>
  );
}
