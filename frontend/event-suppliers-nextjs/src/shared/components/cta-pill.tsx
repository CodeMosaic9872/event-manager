import Link from "next/link";
import type { ButtonHTMLAttributes, CSSProperties, ReactNode } from "react";

export type CtaPillProps = {
  children: ReactNode;
  href?: string;
  variant?: "primary" | "outline" | "outlineAccent" | "soft" | "field";
  /** Ignored when `variant` is `field` (field uses its own sizing). */
  size?: "responsive" | "lg" | "xl";
  endIcon?: "none" | "arrowCircle";
  className?: string;
} & Omit<ButtonHTMLAttributes<HTMLButtonElement>, "className" | "children">;

const variantClasses: Record<NonNullable<CtaPillProps["variant"]>, string> = {
  primary:
    "bg-[#201C44] text-white! visited:text-white! hover:text-white! focus:text-white!",
  outline:
    "border-2 border-[#201C44] bg-white text-black! visited:text-black! hover:text-black! focus:text-black!",
  outlineAccent:
    "border-2 border-[#201C44] bg-white text-[#201C44]! visited:text-[#201C44]! hover:text-[#201C44]! focus:text-[#201C44]!",
  soft: "bg-[#6AB7FF] text-black! visited:text-black! hover:text-black! focus:text-black!",
  field:
    "border border-[#201C44] bg-transparent text-[#201C44] hover:bg-[#201C44]/[0.06]",
};

const sizeClasses: Record<NonNullable<CtaPillProps["size"]>, string> = {
  responsive:
    "min-h-[46px] px-5 text-[16px] leading-[14px] sm:min-h-[52px] sm:px-6 sm:text-[18px] lg:min-h-[60px] lg:px-7 lg:text-[22px]",
  lg: "min-h-[48px] px-8 text-[16px] leading-6",
  xl: "min-h-[58px] px-4 text-[18px] font-normal leading-none sm:min-h-[64px] sm:px-6 sm:text-[22px] md:min-h-[72px] md:text-[26px] lg:min-h-[78px] lg:px-8 lg:text-[30px]",
};

const fieldSizeClasses =
  "min-h-[40px] w-full max-w-full px-4 text-[14px] leading-[14px] sm:min-h-[44px] sm:max-w-[560px] lg:min-h-[46px] lg:w-full lg:max-w-[653px] lg:px-8";

const xlDisplayFont: CSSProperties = {
  fontFamily: "PloniMLv2AAA-Regular, var(--font-assistant), sans-serif",
};

function PillArrowInCircle() {
  return (
    <span
      className="pointer-events-none flex size-12 shrink-0 items-center justify-center rounded-full bg-white sm:size-14 md:size-16 lg:size-[70px]"
      aria-hidden="true"
    >
      <svg
        className="h-5 w-6 text-[#201C44] sm:h-5 sm:w-7 md:h-6 md:w-8 lg:h-7 lg:w-9"
        viewBox="0 0 16 16"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <path
          d="M12.175 9H0V7H12.175L6.575 1.4L8 0L16 8L8 16L6.575 14.6L12.175 9Z"
          fill="currentColor"
        />
      </svg>
    </span>
  );
}

const baseClasses =
  "inline-flex max-w-full min-w-0 items-center rounded-[99px] text-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6AB7FF] focus-visible:ring-offset-2";

export function CtaPill({
  children,
  href,
  variant = "primary",
  size = "responsive",
  endIcon = "none",
  className = "",
  type = "button",
  style,
  ...buttonProps
}: CtaPillProps) {
  const isField = variant === "field";
  const useArrow = !isField && endIcon === "arrowCircle" && variant === "primary";
  const isXl = !isField && size === "xl";
  const mergedStyle: CSSProperties | undefined = isXl
    ? { ...xlDisplayFont, ...style }
    : style;

  const effectiveSize = isField ? fieldSizeClasses : sizeClasses[size];

  const layoutClasses = useArrow
    ? "relative justify-between gap-2 pl-4 pr-1 dir-ltr sm:gap-3 sm:pl-6 lg:pl-8"
    : isField
      ? "gap-2"
      : size === "xl"
        ? "justify-center gap-2"
        : "justify-center gap-2";

  const classes = [
    baseClasses,
    effectiveSize,
    variantClasses[variant],
    layoutClasses,
    className,
  ]
    .join(" ")
    .trim();

  const content = useArrow ? (
    <>
      <span className="min-w-0 flex-1 text-left text-inherit">{children}</span>
      <PillArrowInCircle />
    </>
  ) : (
    children
  );

  if (href) {
    return (
      <Link
        href={href}
        className={classes}
        style={mergedStyle}
        {...(useArrow ? { dir: "ltr" as const } : {})}
      >
        {content}
      </Link>
    );
  }

  return (
    <button type={type} className={classes} style={mergedStyle} {...buttonProps}>
      {content}
    </button>
  );
}
