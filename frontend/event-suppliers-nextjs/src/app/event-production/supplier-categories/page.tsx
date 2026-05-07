import Link from "next/link";
import { MarketingPageShell } from "@/shared/components/marketing-page-shell";

const categories = [
  "מוזיקה",
  "משקאות",
  "מזון",
  "אטרקציות ותוכן אקטיבי",
  "צילום ותיעוד",
  "מתחמים",
  "עיצוב ומיתוג",
  "מתנות ממותגות",
  "לוגיסטיקה והכשרה",
  "דת",
  "ניהול הפקה",
  "הרצאות, סדנאות ותוכן",
];

export default function SupplierCategoriesPage() {
  return (
    <MarketingPageShell contentClassName="items-stretch">
      <div className="mx-auto w-full max-w-[1220px]">
        <div className="mx-auto max-w-[980px] text-center">
          <h1 className="text-[72px] leading-[0.95] text-[#1d2858]">קטגוריות ספקים לחופשה</h1>
          <p className="mt-3 text-2xl text-[#243355]">
            תכננו חופשת חברה חלומית, מותאמת לכל העובדים ולצרכים שונים.
          </p>
        </div>

        <div className="mx-auto mt-10 flex max-w-[800px] items-end justify-between text-[#243355]">
          <span className="text-3xl">75%</span>
          <div className="text-right">
            <h2 className="text-5xl leading-10">בחירת קטגוריית</h2>
            <h2 className="text-5xl leading-10 underline decoration-4 underline-offset-4">ספק</h2>
          </div>
        </div>
        <div className="mx-auto mt-2 h-1 max-w-[800px] rounded-full bg-[#a9cce1]" />

        <div className="mx-auto mt-12 grid max-w-[1220px] gap-6 md:grid-cols-3">
          {categories.map((item) => (
            <Link
              key={item}
              href={item === "משקאות" ? "/marketplace" : "#"}
              className={`rounded-[24px] border border-[#c3d3df] px-8 py-6 text-center text-[42px] leading-none text-[#252a4b] ${
                item === "משקאות"
                  ? "border-[#2f71d8] bg-[#201c44] text-white shadow-[inset_0_0_0_2px_#60b5ff]"
                  : "bg-[#eaf3fb]"
              }`}
            >
              {item}
            </Link>
          ))}
        </div>

        <div className="mt-14 text-right">
          <Link
            href="/event-production/business-types"
            className="inline-flex items-center gap-3 rounded-full border border-slate-400 px-8 py-3 text-xl text-[#3a4362]"
          >
            <span>←</span> חזרה
          </Link>
        </div>
      </div>
    </MarketingPageShell>
  );
}
