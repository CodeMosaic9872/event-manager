import type { EventConceptVendorItem } from "@/shared/types/event-concept-template";

export type EventConceptVendorRowProps = {
  item: EventConceptVendorItem;
};

/** Single vendor line: label + optional icon, aligned for RTL pages. */
export function EventConceptVendorRow({ item }: EventConceptVendorRowProps) {
  return (
    <div className="flex w-full items-center justify-end gap-2 text-sm leading-5 text-[#64748B]">
      <span className="min-w-0 text-right">{item.label}</span>
      {item.icon ? <span className="flex shrink-0 items-center">{item.icon}</span> : null}
    </div>
  );
}
