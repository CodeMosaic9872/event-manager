/** Carousel controls using `public/left-arrow.svg` and `public/right-arrow.svg`. */

export function CarouselArrowImg({
  direction,
  className = "",
  /** Navy strokes → reads as white on dark navy buttons (`supplier-gallery-carousel`). */
  invertOnDarkBg = false,
}: {
  direction: "left" | "right";
  className?: string;
  invertOnDarkBg?: boolean;
}) {
  const src = direction === "left" ? "/left-arrow.svg" : "/right-arrow.svg";
  return (
    <img
      src={src}
      alt=""
      aria-hidden
      className={`${invertOnDarkBg ? "brightness-0 invert" : ""} ${className}`.trim()}
    />
  );
}
