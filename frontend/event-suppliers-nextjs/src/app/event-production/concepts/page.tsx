import { EventConceptsClient } from "@/app/event-production/concepts/event-concepts-client";
import { MarketingPageShell } from "@/shared/components/marketing-page-shell";

export default function EventProductionConceptsPage() {
  return (
    <MarketingPageShell
      dir="rtl"
      lang="he"
      showBackgroundImage
      contentClassName="items-stretch pt-20 sm:pt-24 lg:pt-[150px]"
    >
      <EventConceptsClient />
    </MarketingPageShell>
  );
}
