import type { CSSProperties, ReactNode } from "react";

/** Figma “Registration Card” — frosted purple tint (step 2+ join supplier). */
const shell =
  "rounded-[24px] border border-[rgba(134,85,246,0.2)] bg-[rgba(71,33,223,0.07)] shadow-[0px_8px_32px_rgba(0,0,0,0.37)] backdrop-blur-[6px]";

export function SupplierJoinGlassCard({
  children,
  className = "",
  style,
}: {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <div className={`box-border ${shell} ${className}`.trim()} style={style}>
      {children}
    </div>
  );
}
