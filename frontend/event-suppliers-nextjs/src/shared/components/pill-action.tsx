import Link from "next/link";
import type { ButtonHTMLAttributes, ReactNode } from "react";

type PillActionProps = {
  children: ReactNode;
  href?: string;
  variant?: "dark" | "outline";
  size?: "md" | "lg";
  className?: string;
} & Omit<ButtonHTMLAttributes<HTMLButtonElement>, "className" | "children">;

const sizeClasses: Record<NonNullable<PillActionProps["size"]>, string> = {
  md: "h-12 px-5 text-[16px] leading-6",
  lg: "h-[60px] px-6 text-[22px] leading-none",
};

const variantClasses: Record<NonNullable<PillActionProps["variant"]>, string> = {
  dark:
    "bg-[#201C44] text-white! visited:text-white! hover:text-white! focus:text-white! shadow-[0_6px_18px_rgba(32,28,68,0.18)] hover:bg-[#2a255b]! visited:bg-[#2a255b]! hover:shadow-[0_10px_24px_rgba(32,28,68,0.26)]",
  outline:
    "border-2 border-black/45 bg-white/40 text-black/80 hover:bg-black/5! visited:bg-black/5! hover:border-black/60! visited:border-black/60!",
};

export function PillAction({
  children,
  href,
  variant = "outline",
  size = "md",
  className = "",
  type = "button",
  ...buttonProps
}: PillActionProps) {
  const classes = [
    "inline-flex items-center justify-center gap-3 rounded-[99px] text-center",
    "transition-all duration-200 ease-out hover:-translate-y-0.5 active:translate-y-0",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6AB7FF] focus-visible:ring-offset-2",
    sizeClasses[size],
    variantClasses[variant],
    className,
  ]
    .join(" ")
    .trim();

  if (href) {
    return (
      <Link href={href} className={classes}>
        {children}
      </Link>
    );
  }

  return (
    <button type={type} className={classes} {...buttonProps}>
      {children}
    </button>
  );
}
