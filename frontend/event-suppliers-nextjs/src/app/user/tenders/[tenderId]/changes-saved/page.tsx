"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { MarketingPageShell } from "@/shared/components/marketing-page-shell";
import { TenderOutcomePanel } from "@/shared/components/tenders/tender-outcome-panel";
import { useAppSelector } from "@/store/hooks";

export default function TenderChangesSavedPage() {
  const router = useRouter();
  const pathname = usePathname();
  const sessionUser = useAppSelector((state) => state.auth.user);

  useEffect(() => {
    if (sessionUser) return;
    router.replace(`/auth/login?next=${encodeURIComponent(pathname)}`);
  }, [sessionUser, router, pathname]);

  if (!sessionUser) return null;

  return (
    <MarketingPageShell
      showBackgroundImage
      className="min-h-screen bg-white"
      contentClassName="!max-w-[1440px] !px-4 !pb-24 !pt-20 sm:!px-6 sm:!pt-24 lg:!pt-[123px]"
    >
      <section className="mx-auto w-full max-w-[896px]">
        <TenderOutcomePanel
          title="The changes were successfully applied!"
          description="We are happy to plan unforgettable events with you, a whole world of suppliers and concepts awaits you."
          primaryHref="/jobs"
          primaryLabel="To the proposal board"
        />
      </section>
    </MarketingPageShell>
  );
}
