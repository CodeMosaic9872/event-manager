"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { AdminPremiumPlanEditCard } from "@/shared/components/admin/admin-premium-plan-edit-card";
import { MarketingPageShell } from "@/shared/components/marketing-page-shell";
import { ProtectedRoute } from "@/shared/components/protected-route";
import { useGetSubscriptionPlansQuery } from "@/shared/api/api";
import type { SubscriptionPlanDto } from "@/shared/api/types/subscription-plan";
import {
  formatPlanBadge,
  periodCaptionForMonths,
} from "@/shared/lib/subscription-plan";
import { marketingPloniFont } from "@/shared/lib/marketing-typography";

const PLAN_KEY_ORDER = ["two_year", "annual", "six_month"] as const;

function sortPlans(plans: SubscriptionPlanDto[]): SubscriptionPlanDto[] {
  return [...plans].sort((a, b) => {
    const ai = PLAN_KEY_ORDER.indexOf(a.key as (typeof PLAN_KEY_ORDER)[number]);
    const bi = PLAN_KEY_ORDER.indexOf(b.key as (typeof PLAN_KEY_ORDER)[number]);
    const ao = ai >= 0 ? ai : a.sortOrder;
    const bo = bi >= 0 ? bi : b.sortOrder;
    return ao - bo || a.sortOrder - b.sortOrder;
  });
}

function BreadcrumbChevron({ className = "" }: { className?: string }) {
  return (
    <span className={`shrink-0 text-[10px] text-[#757682] ${className}`.trim()} aria-hidden>
      ›
    </span>
  );
}

function parsePretax(plan: SubscriptionPlanDto): number {
  const n = Number.parseFloat(plan.pretaxAmount);
  return Number.isFinite(n) ? Math.round(n) : 0;
}

export default function AdminPremiumPackagesPage() {
  const { data: plans = [], isLoading, isError, refetch } = useGetSubscriptionPlansQuery();
  const sortedPlans = useMemo(() => sortPlans(plans), [plans]);

  const [drafts, setDrafts] = useState<Record<string, { title: string; pretax: number }>>({});
  const [saveHint, setSaveHint] = useState<string | null>(null);

  useEffect(() => {
    if (sortedPlans.length === 0) return;
    setDrafts((prev) => {
      const next = { ...prev };
      for (const plan of sortedPlans) {
        if (!next[plan.id]) {
          next[plan.id] = { title: plan.name, pretax: parsePretax(plan) };
        }
      }
      return next;
    });
  }, [sortedPlans]);

  const dismissHint = useCallback(() => setSaveHint(null), []);

  useEffect(() => {
    if (!saveHint) return;
    const t = window.setTimeout(() => setSaveHint(null), 3200);
    return () => window.clearTimeout(t);
  }, [saveHint]);

  const onSave = useCallback((plan: SubscriptionPlanDto) => {
    setSaveHint(`נשמרו שינויים עבור ${plan.name} (ממשק בלבד — חיבור שמירה לשרת בהמשך).`);
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
            <nav
              className="flex flex-wrap items-center justify-start gap-2 uppercase leading-4 tracking-[1.2px]"
              aria-label="מיקום בעמוד"
            >
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
            {isLoading ? (
              <div
                className="grid min-h-[320px] grid-cols-1 gap-6 lg:grid-cols-3"
                aria-busy
                aria-label="טוען חבילות"
              >
                {[0, 1, 2].map((i) => (
                  <div key={i} className="h-[400px] animate-pulse rounded-2xl bg-white/20" />
                ))}
              </div>
            ) : isError || sortedPlans.length === 0 ? (
              <div className="flex flex-col items-center gap-4 py-12 text-center">
                <p className="text-base text-[#00113A]">לא ניתן לטעון חבילות מהשרת.</p>
                <button
                  type="button"
                  onClick={() => refetch()}
                  className="rounded-full border border-[#4721DF] px-6 py-2 text-sm font-bold text-[#4721DF]"
                >
                  נסה שוב
                </button>
              </div>
            ) : (
              <div
                className="grid w-full min-w-0 grid-cols-1 gap-6 sm:gap-7 lg:auto-rows-fr lg:grid-cols-3 lg:items-stretch"
                dir="ltr"
              >
                {sortedPlans.map((plan) => {
                  const d = drafts[plan.id];
                  if (!d) return null;
                  const badge = formatPlanBadge(plan.badge);
                  return (
                    <AdminPremiumPlanEditCard
                      key={plan.id}
                      badge={badge}
                      featured={plan.isFeatured}
                      title={d.title}
                      onTitleChange={(title) =>
                        setDrafts((prev) => ({
                          ...prev,
                          [plan.id]: { ...prev[plan.id], title },
                        }))
                      }
                      pretaxShekels={d.pretax}
                      onPretaxChange={(pretax) =>
                        setDrafts((prev) => ({
                          ...prev,
                          [plan.id]: { ...prev[plan.id], pretax },
                        }))
                      }
                      months={plan.billingMonths}
                      periodCaption={periodCaptionForMonths(plan.billingMonths)}
                      monthlyCaption="/ פר חודש"
                      featureLines={
                        plan.features?.length
                          ? plan.features
                          : ["קבלת סמס לגבי הצעות עבודה בזמן אמת"]
                      }
                      ctaVariant={plan.isFeatured ? "filled" : "outline"}
                      onSave={() => onSave(plan)}
                    />
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </MarketingPageShell>
    </ProtectedRoute>
  );
}
