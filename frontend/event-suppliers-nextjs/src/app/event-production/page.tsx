import Image from "next/image";
import { EventOptionCard } from "@/shared/components/event-option-card";
import { MarketingPageShell } from "@/shared/components/marketing-page-shell";
import { PillAction } from "@/shared/components/pill-action";

const eventTypes = [
  { label: "חתונה", href: "/vacation-selection-categories" },
  { label: "אירוע עסקי", href: "/vacation-selection-categories", featured: true },
  { label: "אירוע רווקים", href: "/vacation-selection-categories" },
  { label: "ברית", href: "/vacation-selection-categories" },
  { label: "חינה", href: "/vacation-selection-categories" },
  { label: "פרישת חלה", href: "/vacation-selection-categories" },
  { label: "יוקרה ופנאי", href: "/vacation-selection-categories" },
  { label: "בר/בת מצווה", href: "/vacation-selection-categories" },
  { label: "ימי הולדת", href: "/vacation-selection-categories" },
];

export default function EventProductionPage() {
  return (
    <MarketingPageShell contentClassName="items-stretch">
      <div className="mx-auto w-full max-w-[1210px]">
        <header className="mx-auto flex w-full max-w-[634px] flex-col items-center gap-4 px-1 text-center sm:px-0">
          <h1 className="bg-[linear-gradient(180deg,#201C44_0%,#0657A2_100%)] bg-clip-text text-[42px] leading-[1.05] text-transparent sm:text-[52px] lg:text-[60px] lg:leading-[60px] lg:tracking-[-1.5px]">
            איזה אירוע חוגגים?
          </h1>
          <p className="text-[16px] leading-7 text-black lg:text-[18px]">
            בחרו את סוג האירוע ונמצא את הספקים המתאימים ביותר!
          </p>
        </header>

        <div className="mx-auto mt-6 w-full max-w-[576px] px-1 sm:px-2">
          <div className="mb-3 flex flex-wrap items-end justify-between gap-x-4 gap-y-1">
            <h2 className="min-w-0 flex-1 text-right text-[22px] leading-7 text-black lg:flex-none lg:text-[30px]">
              בחירת סוג אירוע
            </h2>
            <p className="shrink-0 text-[20px] leading-6 text-[#201C44]">25%</p>
          </div>
          <div className="relative h-[6px] w-full rounded-full bg-[#BDDCE9]">
            <span className="absolute right-0 top-0 h-full w-[32.5%] rounded-full bg-[#201C44] shadow-[0px_0px_20px_rgba(134,85,246,0.4)]" />
          </div>
        </div>

        <div className="mx-auto mt-8 grid w-full max-w-[1210px] grid-cols-1 gap-4 sm:mt-11 sm:gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {eventTypes.map((item) => (
            <EventOptionCard
              key={item.label}
              label={item.label}
              href={item.href}
              featured={item.featured}
              badgeText={item.featured ? "B2B | לעסקים" : undefined}
            />
          ))}
        </div>

        <div className="mt-20 flex justify-center px-2 sm:mt-28 lg:mt-36">
          <PillAction
            href="/"
            variant="outline"
            className="w-full max-w-[224px] bg-white! text-black! visited:bg-white! visited:text-black! hover:bg-white! hover:text-black!"
          >
            <Image src="/right_arrow.svg" alt="" width={16} height={16} className="h-4 w-4 shrink-0" />
            חזרה לתפריט הראשי
          </PillAction>
        </div>
      </div>
    </MarketingPageShell>
  );
}
