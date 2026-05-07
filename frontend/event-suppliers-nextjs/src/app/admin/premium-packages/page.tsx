"use client";

import { useCallback, useEffect, useState } from "react";
import { AdminPremiumPlanEditCard } from "@/shared/components/admin/admin-premium-plan-edit-card";
import { ProtectedRoute } from "@/shared/components/protected-route";
import type { SupplierPlanId } from "@/shared/lib/supplier-join-plan";
import { SUPPLIER_PLAN_CHECKOUT } from "@/shared/lib/supplier-join-plan";
import { marketingPloniFont } from "@/shared/lib/marketing-typography";

const FEATURE_SMS = "Receive SMS about job offers in real time";

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
    badge: "THE MOST AFFORDABLE",
    ctaVariant: "outline",
    periodCaption: "/ Two years",
    monthlyCaption: "/ per month",
    months: 24,
    defaultTitle: "Two years - partners in fire and water",
  },
  annual: {
    badge: "THE MOST CHOSEN",
    featured: true,
    ctaVariant: "filled",
    periodCaption: "/ year",
    monthlyCaption: "/ per month",
    months: 12,
    defaultTitle: "A year - partners on the journey",
  },
  six_month: {
    ctaVariant: "outline",
    periodCaption: "/ Half a year",
    monthlyCaption: "/ per month",
    months: 6,
    defaultTitle: "Six months - no obligation relationship",
  },
};

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
    const label = PLAN_META[id].defaultTitle.split(" - ")[0] ?? id;
    setSaveHint(`Saved “${label}” (UI only — connect API when ready).`);
  }, []);

  return (
    <ProtectedRoute roles={["admin"]}>
      <section
        dir="rtl"
        className="relative mx-auto min-h-screen w-full overflow-x-hidden px-4 pb-16 pt-24 sm:px-6"
        style={{ fontFamily: marketingPloniFont }}
      >

        <div className="relative z-10 mx-auto w-full max-w-6xl">
          <header className="mb-8 text-right">
            <p className="text-xs uppercase tracking-[1.2px] text-[#757682]">
              System management · Quick actions · Editing premium packages
            </p>
            <h1 className="mt-2 text-3xl font-normal leading-tight tracking-[-0.02em] text-[#00113A] sm:text-4xl sm:leading-10">
              Editing premium packages
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
                  Close
                </button>
                <span>{saveHint}</span>
              </div>
            </div>
          ) : null}

          <div className="rounded-[24px] border border-[#8655F6]/20 bg-[rgba(255,255,255,0.85)] p-6 shadow-[0px_8px_32px_rgba(0,0,0,0.12)] backdrop-blur-[6px] sm:p-8 lg:p-10">
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3 lg:items-stretch lg:gap-5" dir="ltr" lang="en">
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
      </section>
    </ProtectedRoute>
  );
}
