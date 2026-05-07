/**
 * Decorative Figma-style background: optional hero texture + three blurred gradient orbs.
 * Compose with `MarketingPageShell` for shared marketing funnels (AI planner, join supplier, event production, etc.).
 */
type MarketingPageBackdropProps = {
  /** Wide centered `/2.png` layer (see home / design specs). */
  showBackgroundImage?: boolean;
};

export function MarketingPageBackdrop({ showBackgroundImage = false }: MarketingPageBackdropProps) {
  return (
    <>
      {showBackgroundImage ? (
        <div
          className="pointer-events-none absolute left-1/2 -top-px h-[min(1025px,90vh)] w-[min(1456px,220vw)] max-w-none -translate-x-1/2 bg-[url('/2.png')] bg-cover bg-center bg-no-repeat opacity-[0.95]"
          aria-hidden
        />
      ) : null}

      <div
        className="pointer-events-none absolute left-[40%] top-[132px] hidden h-[79px] w-[89px] rotate-[-161deg] rounded-full bg-[linear-gradient(180deg,#2998FF_0%,#FFFFFF_60.33%)] shadow-[2.5px_15px_15.9px_3.3px_#84C4FF] blur-[13.5px] lg:block"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute right-[-120px] top-[458px] hidden h-[396px] w-[444px] rotate-[-119.56deg] rounded-full bg-[linear-gradient(180deg,#2998FF_0%,#FFFFFF_60.33%)] shadow-[6px_36px_38.1px_8px_#84C4FF] blur-[2.5px] lg:block"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute left-[-120px] top-[151px] hidden h-[396px] w-[444px] rotate-[62.64deg] rounded-full bg-[linear-gradient(180deg,#2998FF_0%,#FFFFFF_60.33%)] shadow-[6px_36px_38.1px_8px_#84C4FF] blur-[2.5px] lg:block"
        aria-hidden
      />
    </>
  );
}
