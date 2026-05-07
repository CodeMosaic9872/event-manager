import type { ConceptFilterKey } from "@/shared/types/event-concept-template";
import type { EventConceptTemplate } from "@/shared/types/event-concept-template";

export function filterEventConceptTemplates(
  items: EventConceptTemplate[],
  filter: ConceptFilterKey
): EventConceptTemplate[] {
  if (filter === "all") return items;
  return items.filter((t) => {
    if (t.audience === undefined || t.audience === "both") return true;
    return t.audience === filter;
  });
}
