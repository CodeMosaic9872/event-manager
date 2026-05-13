import Image from "next/image";
import { EventOptionCard } from "@/shared/components/event-option-card";
import { MarketingPageShell } from "@/shared/components/marketing-page-shell";
import { PillAction } from "@/shared/components/pill-action";
import {
  BUSINESS_EVENT_SUBTYPES,
  defaultBusinessSubtypeSlug,
} from "@/shared/data/event-production-business-subtypes";
import { mergeSearchParamsToHref } from "@/shared/lib/search-params-merge";

type PageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function BusinessEventTypesPage({ searchParams }: PageProps) {
  const sp = searchParams ? await searchParams : {};
  const raw = sp.businessType;
  const querySlug =
    typeof raw === "string" ? raw : Array.isArray(raw) ? raw[0] : undefined;
  const selectedSlug = querySlug ?? defaultBusinessSubtypeSlug();

  const firstRow = BUSINESS_EVENT_SUBTYPES.slice(0, 6);
  const lastCard = BUSINESS_EVENT_SUBTYPES[6];

  return (
    <MarketingPageShell contentClassName="items-stretch">
      <div className="mx-auto w-full max-w-[1210px]">
        <header className="mx-auto flex w-full max-w-[720px] flex-col items-center gap-4 px-1 text-center sm:px-0">
          <h1 className="font-bold bg-[linear-gradient(180deg,#201C44_0%,#0657A2_100%)] bg-clip-text text-[38px] leading-[1.08] text-transparent sm:text-[48px] lg:text-[56px] lg:leading-[1.05] lg:tracking-[-1px]">
            סוגי אירועים עסקיים
          </h1>
          <p className="text-[16px] leading-7 text-black lg:text-[18px]">
            בחרו את סוג האירוע שלכם ונמצא את הספקים המתאימים ביותר!
          </p>
        </header>

        <div className="mx-auto mt-6 w-full max-w-[576px] px-1 sm:px-2">
          <div className="mb-3 flex flex-wrap items-end justify-between gap-x-4 gap-y-1">
            <h2 className="min-w-0 flex-1 text-right text-[20px] font-bold leading-7 text-black sm:text-[22px] lg:flex-none lg:text-[30px]">
              בחירת סוג אירוע עסקי
            </h2>
            <p className="shrink-0 text-[18px] font-bold leading-6 text-[#201C44] sm:text-[20px]">50%</p>
          </div>
          <div className="relative h-[6px] w-full rounded-full bg-[#BDDCE9]">
            <span className="absolute right-0 top-0 h-full w-1/2 rounded-full bg-[#201C44] shadow-[0px_0px_20px_rgba(134,85,246,0.4)]" />
          </div>
        </div>

        <div className="mx-auto mt-8 grid w-full max-w-[1210px] grid-cols-1 gap-4 sm:mt-11 sm:gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {firstRow.map((item) => (
            <EventOptionCard
              key={item.slug}
              label={item.label}
              href={mergeSearchParamsToHref("/vacation-selection-categories", sp, {
                eventType: "business",
                businessType: item.slug,
              })}
              featured={selectedSlug === item.slug}
            />
          ))}
        </div>

        {lastCard ? (
          <div className="mx-auto mt-4 flex w-full max-w-[1210px] justify-center sm:mt-6">
            <div className="w-full max-w-[min(100%,380px)] sm:max-w-[420px] lg:max-w-[calc((100%-2*1.5rem)/3)]">
              <EventOptionCard
                label={lastCard.label}
                href={mergeSearchParamsToHref("/vacation-selection-categories", sp, {
                  eventType: "business",
                  businessType: lastCard.slug,
                })}
                featured={selectedSlug === lastCard.slug}
              />
            </div>
        </div>
        ) : null}

        <div className="mt-16 flex px-2 sm:mt-24 lg:mt-28">
          <PillAction
            href={mergeSearchParamsToHref("/event-production", sp, {
              businessType: null,
            })}
            variant="outline"
            className="font-bold w-full max-w-[224px] border-black/45 bg-white! text-black! visited:bg-white! visited:text-black! hover:bg-white! hover:text-black!"
          >
            <Image src="/icons/right_arrow.svg" alt="" width={16} height={16} className="h-4 w-4 shrink-0" />
            חזרה
          </PillAction>
        </div>
      </div>
    </MarketingPageShell>
  );
}
