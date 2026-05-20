"use client";

import { useCallback, useEffect, useState } from "react";
import { AdminPremiumPlanEditCard } from "@/shared/components/admin/admin-premium-plan-edit-card";
import { MarketingPageShell } from "@/shared/components/marketing-page-shell";
import { ProtectedRoute } from "@/shared/components/protected-route";
import type { SupplierPlanId } from "@/shared/lib/supplier-join-plan";
import { SUPPLIER_PLAN_CHECKOUT } from "@/shared/lib/supplier-join-plan";
import { marketingPloniFont } from "@/shared/lib/marketing-typography";

const FEATURE_SMS = "קבלת סמס לגבי הצעות עבודה בזמן אמת";

const PLAN_ORDER: SupplierPlanId[] = ["two_year", "annual", "six_month"];

const PLAN_META: Record<
  SupplierPlanId,
  {
    badge?: string;
    featured?: boolean;
    ctaVariant: "outline" | "filled";
    periodCaption: string;
    monthlyCaption: string;
    months: number;
    defaultTitle: string;
  }
> = {
  two_year: {
    badge: "המשתלם ביותר",
    ctaVariant: "outline",
    periodCaption: "/ שנתיים",
    monthlyCaption: "/ פר חודש",
    months: 24,
    defaultTitle: "שנתיים - שותפים באש ובמים",
  },
  annual: {
    badge: "הנבחר ביותר",
    featured: true,
    ctaVariant: "filled",
    periodCaption: "/ שנה",
    monthlyCaption: "/ פר חודש",
    months: 12,
    defaultTitle: "שנה - שותפים לדרך",
  },
  six_month: {
    ctaVariant: "outline",
    periodCaption: "/ חצי שנה",
    monthlyCaption: "/ פר חודש",
    months: 6,
    defaultTitle: "חצי שנה - קשר לא מחייב",
  },
};

const PLAN_SAVE_LABEL: Record<SupplierPlanId, string> = {
  two_year: "שנתיים",
  annual: "שנה",
  six_month: "חצי שנה",
};

function BreadcrumbChevron({ className = "" }: { className?: string }) {
  return (
    <span className={`shrink-0 text-[10px] text-[#757682] ${className}`.trim()} aria-hidden>
      ›
    </span>
  );
}

function buildInitialDrafts(): Record<SupplierPlanId, { title: string; pretax: number }> {
  return {
    two_year: {
      title: PLAN_META.two_year.defaultTitle,
      pretax: SUPPLIER_PLAN_CHECKOUT.two_year.pretaxSubtotal,
    },
    annual: {
      title: PLAN_META.annual.defaultTitle,
      pretax: SUPPLIER_PLAN_CHECKOUT.annual.pretaxSubtotal,
    },
    six_month: {
      title: PLAN_META.six_month.defaultTitle,
      pretax: SUPPLIER_PLAN_CHECKOUT.six_month.pretaxSubtotal,
    },
  };
}

export default function AdminPremiumPackagesPage() {
  const [drafts, setDrafts] = useState(buildInitialDrafts);
  const [saveHint, setSaveHint] = useState<string | null>(null);

  const dismissHint = useCallback(() => setSaveHint(null), []);

  useEffect(() => {
    if (!saveHint) return;
    const t = window.setTimeout(() => setSaveHint(null), 3200);
    return () => window.clearTimeout(t);
  }, [saveHint]);

  const onSave = useCallback((id: SupplierPlanId) => {
    const label = PLAN_SAVE_LABEL[id];
    setSaveHint(`נשמרו שינויים עבור ${label} (ממשק בלבד — חיבור API בהמשך).`);
  }, []);

  return (
    <ProtectedRoute roles={["admin"]}>
      <MarketingPageShell
        showBackgroundImage
        className="min-h-screen bg-transparent"
        dir="rtl"
        lang="he"
        contentClassName="!w-full !max-w-[min(100%,70rem)] !items-stretch !px-4 !pb-16 !pt-24 sm:!px-6 sm:!pt-28 lg:!pt-32"
      >
        <div className="w-full min-w-0" style={{ fontFamily: marketingPloniFont }}>
          <header className="mb-8 flex w-full min-w-0 flex-col gap-3 text-right">
            <nav className="flex flex-wrap items-center justify-start gap-2 uppercase leading-4 tracking-[1.2px]" aria-label="מיקום בעמוד">
              <span className="text-xs font-normal text-[#757682]">ניהול מערכת</span>
              <BreadcrumbChevron />
              <span className="text-xs font-normal text-[#757682]">פעולות מהירות</span>
              <BreadcrumbChevron />
              <span className="text-xs font-bold text-[#00113A]">עריכת חבילות פרימיום</span>
            </nav>
            <h1 className="text-[clamp(1.75rem,4.5vw,2.25rem)] font-bold leading-tight tracking-[-1.08px] text-[#00113A]">
              עריכת חבילות פרימיום
            </h1>
          </header>

          {saveHint ? (
            <div
              role="status"
              className="mb-6 rounded-2xl border border-[#4721DF]/30 bg-white/90 px-4 py-3 text-right text-sm text-[#201C44] shadow-sm"
            >
              <div className="flex flex-row-reverse items-center justify-between gap-3">
                <button
                  type="button"
                  className="shrink-0 text-[#64748B] underline-offset-2 hover:underline"
                  onClick={dismissHint}
                >
                  סגור
                </button>
                <span>{saveHint}</span>
              </div>
            </div>
          ) : null}

          <div className="rounded-[24px] border border-[rgba(134,85,246,0.2)] bg-[rgba(71,33,223,0.07)] p-6 shadow-[0px_8px_32px_rgba(0,0,0,0.37)] backdrop-blur-[6px] sm:p-8 lg:p-10">
            <div
              className="grid w-full min-w-0 grid-cols-1 gap-6 sm:gap-7 lg:auto-rows-fr lg:grid-cols-3 lg:items-stretch"
              dir="ltr"
            >
              {PLAN_ORDER.map((id) => {
                const meta = PLAN_META[id];
                const d = drafts[id];
                return (
                  <AdminPremiumPlanEditCard
                    key={id}
                    badge={meta.badge}
                    featured={meta.featured}
                    title={d.title}
                    onTitleChange={(title) =>
                      setDrafts((prev) => ({ ...prev, [id]: { ...prev[id], title } }))
                    }
                    pretaxShekels={d.pretax}
                    onPretaxChange={(pretax) =>
                      setDrafts((prev) => ({ ...prev, [id]: { ...prev[id], pretax } }))
                    }
                    months={meta.months}
                    periodCaption={meta.periodCaption}
                    monthlyCaption={meta.monthlyCaption}
                    featureLines={[FEATURE_SMS]}
                    ctaVariant={meta.ctaVariant}
                    onSave={() => onSave(id)}
                  />
                );
              })}
            </div>
          </div>
        </div>
      </MarketingPageShell>
    </ProtectedRoute>
  );
}
