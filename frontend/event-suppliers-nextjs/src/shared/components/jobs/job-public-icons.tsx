import type { ImgHTMLAttributes } from "react";

type IconImgProps = Omit<ImgHTMLAttributes<HTMLImageElement>, "src" | "alt">;

/** Event / date — uses `public/file.svg` (no dedicated calendar asset in repo). */
export function JobIconDate(props: IconImgProps) {
  return <img src="/file.svg" alt="" aria-hidden {...props} />;
}

/** Location — uses `public/link.svg` (globe; matches “אתר” icon style in contact row). */
export function JobIconLocation(props: IconImgProps) {
  return <img src="/link.svg" alt="" aria-hidden {...props} />;
}

/** Close — `public/cross.svg`. */
export function JobIconClose(props: IconImgProps) {
  return <img src="/cross.svg" alt="" aria-hidden {...props} />;
}

/** Gated / verified contact — `public/verified.svg`. */
export function JobIconContactLock(props: IconImgProps) {
  return <img src="/verified.svg" alt="" aria-hidden {...props} />;
}

/** Success / check — `public/verified.svg`. */
export function JobIconSuccessCheck(props: IconImgProps) {
  return <img src="/submitted.svg" alt="" aria-hidden {...props} />;
}

/** Back chevron — `public/left-arrow.svg` (use `scale-x-[-1]` in RTL if needed). */
export function JobIconBackArrow(props: IconImgProps) {
  return <img src="/left-arrow.svg" alt="" aria-hidden {...props} />;
}
