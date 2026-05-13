"use client";

import type { CSSProperties, ElementType, HTMLAttributes, ReactNode } from "react";

export type SupplierDashboardSectionCardProps = {
  as?: ElementType;
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
} & Omit<HTMLAttributes<HTMLElement>, "children" | "className" | "style">;

const outerClass =
  "relative isolate box-border flex w-full min-w-0 flex-col items-stretch gap-6 overflow-hidden border bg-clip-padding text-inherit";

const outerStyleBase: CSSProperties = {
  borderRadius: "var(--supplier-dashboard-card-radius)",
  borderColor: "var(--supplier-dashboard-card-border)",
  backgroundColor: "var(--supplier-dashboard-card-surface)",
  boxShadow: "var(--supplier-dashboard-card-elevation-shadow)",
  padding: "var(--supplier-dashboard-card-padding)",
  backdropFilter: "blur(var(--supplier-dashboard-card-backdrop))",
  WebkitBackdropFilter: "blur(var(--supplier-dashboard-card-backdrop))",
};

const glowClass =
  "pointer-events-none absolute inset-0 z-0 rounded-[var(--supplier-dashboard-card-glow-radius)] shadow-[var(--supplier-dashboard-card-glow-shadow)]";

const contentShellClass = "relative z-[1] flex min-h-0 w-full min-w-0 flex-1 flex-col gap-6";

function mergeClass(a: string, b?: string) {
  return b ? `${a} ${b}` : a;
}

/**
 * Glass-style dashboard panel: frosted surface, brand border, elevation + soft inner glow (Figma layers).
 * Tokens live in `globals.css` (`--supplier-dashboard-*`). Use {@link SupplierDashboardSectionCard.InnerWell} for nested blocks (e.g. referral row).
 */
function SupplierDashboardSectionCardBase({
  as,
  children,
  className,
  style: userStyle,
  ...rest
}: SupplierDashboardSectionCardProps) {
  const Tag = (as ?? "section") as ElementType;
  const mergedStyle = userStyle ? { ...outerStyleBase, ...userStyle } : outerStyleBase;
  return (
    <Tag className={mergeClass(outerClass, className)} style={mergedStyle} {...rest}>
      <div aria-hidden className={glowClass} />
      <div className={contentShellClass}>{children}</div>
    </Tag>
  );
}

const innerWellClass =
  "relative z-[2] box-border flex w-full min-w-0 flex-col border bg-clip-padding";

const innerWellStyle: CSSProperties = {
  borderRadius: "var(--supplier-dashboard-inner-radius)",
  borderColor: "var(--supplier-dashboard-inner-border)",
  backgroundColor: "var(--supplier-dashboard-inner-surface)",
  padding: "var(--supplier-dashboard-inner-padding)",
};

function InnerWell({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={mergeClass(innerWellClass, className)} style={innerWellStyle}>
      {children}
    </div>
  );
}

export const SupplierDashboardSectionCard = Object.assign(SupplierDashboardSectionCardBase, {
  InnerWell,
});
