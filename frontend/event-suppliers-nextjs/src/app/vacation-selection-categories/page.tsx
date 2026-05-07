import Image from "next/image";
import { EventOptionCard } from "@/shared/components/event-option-card";
import { MarketingPageShell } from "@/shared/components/marketing-page-shell";
import { PillAction } from "@/shared/components/pill-action";

const categories = [
  "מוזיקה",
  "משקאות",
  "אוכל",
  "אטרקציות ותוכן אקטיבי",
  "צילום ותיעוד",
  "מתחמי אירוע",
  "עיצוב ומיתוג",
  "מתנות ממותגות",
  "לוגיסטיקה והכשרה",
  "דת",
  "ניהול הפקה",
  "הרצאות, סדנאות ותוכן",
  "הסעות",
  "ציוד טכני",
  "ביטחון ובטיחות",
];

export default function VacationSelectionCategoriesPage() {
  return (
    <MarketingPageShell contentClassName="items-stretch">
      <div className="mx-auto w-full max-w-[1210px]">
        <header className="mx-auto flex max-w-[634px] flex-col items-center gap-4 text-center">
          <h1 className="bg-[linear-gradient(180deg,#201C44_0%,#0657A2_100%)] bg-clip-text text-[42px] leading-[1.05] text-transparent sm:text-[52px] lg:text-[60px] lg:leading-[60px] lg:tracking-[-1.5px]">
            קטגוריות ספקים לחופשה
          </h1>
          <p className="text-[16px] leading-7 text-black lg:text-[18px]">
            תכננו חופשת חברה חלומית, מותאמת לכל העובדים ולצרכים שונים.
          </p>
        </header>

        <div className="mx-auto mt-6 w-full max-w-[576px] px-2">
          <div className="mb-3 flex items-end justify-between">
            <h2 className="text-right text-[22px] leading-7 text-black lg:text-[30px]">בחירת קטגוריית ספק</h2>
            <p className="text-[20px] leading-6 text-[#201C44]">75%</p>
          </div>
          <div className="relative h-[6px] w-full rounded-full bg-[#BDDCE9]">
            <span className="absolute right-0 top-0 h-full w-[66.61%] rounded-full bg-[#201C44] shadow-[0px_0px_20px_rgba(134,85,246,0.4)]" />
          </div>
        </div>

        <div className="mx-auto mt-11 grid w-full max-w-[1210px] grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((item) => (
            <EventOptionCard
              key={item}
              label={item}
              href="/vacation-selection-suppliers"
              featured={item === "משקאות"}
            />
          ))}
        </div>

        <div className="mt-20 mb-10 flex">
          <PillAction
            href="/event-production"
            variant="outline"
            className="w-[165px] border-[rgba(98,98,98,0.46)] bg-white! text-[rgba(0,0,0,0.66)]! visited:bg-white! visited:text-[rgba(0,0,0,0.66)]! hover:bg-white! hover:text-[rgba(0,0,0,0.66)]!"
          >
            <Image src="/right_arrow.svg" alt="" width={16} height={16} className="h-4 w-4" /> חזרה
          </PillAction>
        </div>
      </div>
    </MarketingPageShell>
  );
}
