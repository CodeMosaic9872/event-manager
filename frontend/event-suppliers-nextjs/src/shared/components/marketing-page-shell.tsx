import type { ReactNode } from "react";
import { MarketingPageBackdrop } from "@/shared/components/marketing-page-backdrop";

export type MarketingPageShellProps = {
  children: ReactNode;
  /** Renders first inside the section (e.g. modals that should sit above the backdrop). */
  overlay?: ReactNode;
  /** When true, shows the centered `/2.png` hero layer (join-supplier style). */
  showBackgroundImage?: boolean;
  dir?: "rtl" | "ltr";
  lang?: string;
  className?: string;
  contentClassName?: string;
};

/** Shared marketing funnel shell: slate canvas, gradient orbs, consistent max-width & vertical rhythm (AI planner, join supplier, event production, etc.). `MarketingHeader` lives in root layout. */
const contentShellClasses =
  "relative z-10 mx-auto flex w-full max-w-[1440px] flex-col items-center px-4 pb-16 pt-20 sm:px-6 sm:pb-20 sm:pt-24 lg:pt-[123px]";

export function MarketingPageShell({
  children,
  overlay,
  showBackgroundImage = false,
  dir,
  lang,
  className = "",
  contentClassName = "",
}: MarketingPageShellProps) {
  return (
    <section
      className={`relative min-h-screen w-full overflow-x-hidden ${className}`.trim()}
      {...(dir !== undefined ? { dir } : {})}
      {...(lang !== undefined ? { lang } : {})}
    >
      {overlay}
      <MarketingPageBackdrop showBackgroundImage={showBackgroundImage} />
      <div className={`${contentShellClasses} ${contentClassName}`.trim()}>{children}</div>
    </section>
  );
}
