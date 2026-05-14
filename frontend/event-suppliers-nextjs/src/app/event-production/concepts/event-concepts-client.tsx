"use client";

import { useMemo, useState } from "react";
import { EventConceptCard, EventConceptCustomCta, EventConceptFilterPills } from "@/shared/components/event-concepts";
import type { ConceptFilterKey } from "@/shared/types/event-concept-template";
import { eventConceptTemplatesMock } from "@/shared/data/event-concept-templates.mock";
import { filterEventConceptTemplates } from "@/shared/lib/filter-event-concept-templates";
import { marketingPloniFont } from "@/shared/lib/marketing-typography";

export function EventConceptsClient() {
  const [filter, setFilter] = useState<ConceptFilterKey>("all");
  const visible = useMemo(
    () => filterEventConceptTemplates(eventConceptTemplatesMock, filter),
    [filter]
  );

  return (
    <div
      className="mx-auto flex w-full max-w-[1280px] flex-col items-stretch px-4 sm:px-6 md:px-10 lg:px-20"
      style={{ fontFamily: marketingPloniFont }}
    >
      <header className="mx-auto flex w-full max-w-[1120px] flex-col items-center gap-3 pb-8 text-center sm:gap-4 sm:pb-10">
        <h1 className="w-full text-balance text-[clamp(1.75rem,4vw,3rem)] font-bold leading-tight tracking-[-0.025em] text-[#0F172A] sm:leading-none">
          קונספטים מוכנים לאירועים
        </h1>
        <p className="max-w-[672px] text-base font-normal leading-7 text-black sm:text-lg sm:leading-[29px]">
          דלגו על הלחץ של תכנון מאפס, קחו השראה מחבילה מוכנה והתחילו לתכנן את האירוע המושלם שלכם עכשיו.
        </p>
      </header>

      <EventConceptFilterPills value={filter} onChange={setFilter} labels={{ all: "כל הקונספטים" }} />

      <div className="mx-auto grid w-full max-w-[1120px] grid-cols-1 justify-items-center gap-5 sm:gap-6 md:grid-cols-2 md:justify-items-stretch lg:justify-items-end xl:grid-cols-3">
        {visible.map((concept) => (
          <EventConceptCard key={concept.id} concept={concept} />
        ))}
        <EventConceptCustomCta className="min-h-[280px] xl:min-h-[320px]" />
      </div>
    </div>
  );
}
