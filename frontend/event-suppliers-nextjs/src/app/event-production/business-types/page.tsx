import Link from "next/link";
import { MarketingPageShell } from "@/shared/components/marketing-page-shell";

const businessTypes = [
  "ימי גיבוש",
  "נופש",
  "אירוע יום/ערב",
  "לציבור הרחב",
  "שיווק",
  "כנסים",
  "Happy Hour",
];

export default function BusinessTypesPage() {
  return (
    <MarketingPageShell contentClassName="items-stretch">
      <div className="mx-auto w-full max-w-[1220px]">
        <div className="mx-auto max-w-[980px] text-center">
          <h1 className="text-[72px] leading-[0.95] text-[#1d2858]">סוגי אירועי חברה</h1>
          <p className="mt-3 text-2xl text-[#243355]">
            בחרו את סוג האירוע ונמצא את הספקים המתאימים ביותר!
          </p>
        </div>

        <div className="mx-auto mt-10 flex max-w-[800px] items-end justify-between text-[#243355]">
          <span className="text-3xl">50%</span>
          <div className="text-right">
            <h2 className="text-5xl leading-10">בחירת סוג אירוע</h2>
            <h2 className="text-5xl leading-10 underline decoration-4 underline-offset-4">עסקי</h2>
          </div>
        </div>
        <div className="mx-auto mt-2 h-1 max-w-[800px] rounded-full bg-[#a9cce1]" />

        <div className="mx-auto mt-12 grid max-w-[1220px] gap-6 md:grid-cols-3">
          {businessTypes.map((item) => (
            <Link
              key={item}
              href={item === "נופש" ? "/event-production/supplier-categories" : "#"}
              className={`rounded-[24px] border border-[#c3d3df] px-8 py-6 text-center text-[48px] leading-none text-[#252a4b] ${
                item === "נופש"
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
            href="/event-production"
            className="inline-flex items-center gap-3 rounded-full border border-slate-400 px-8 py-3 text-xl text-[#3a4362]"
          >
            <span>←</span> חזרה
          </Link>
        </div>
      </div>
    </MarketingPageShell>
  );
}
