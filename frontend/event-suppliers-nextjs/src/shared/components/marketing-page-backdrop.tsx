/**
 * Decorative Figma-style background: optional hero texture + three blurred gradient orbs.
 * Compose with `MarketingPageShell` for shared marketing funnels (AI planner, join supplier, event production, etc.).
 */
type MarketingPageBackdropProps = {
  /** Wide centered `/2.png` layer (see home / design specs). */
  showBackgroundImage?: boolean;
};

export function MarketingPageBackdrop({ showBackgroundImage = false }: MarketingPageBackdropProps) {
  void showBackgroundImage;
  return (
    null
  );
}
