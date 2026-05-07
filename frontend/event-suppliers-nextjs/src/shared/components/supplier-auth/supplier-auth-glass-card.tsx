import type { CSSProperties, ReactNode } from "react";

/** Supplier login/register card — light lavender panel per design (not purple join funnel glass). */
const shell =
  "rounded-[24px] border border-[#E2E8F0] bg-[#F5F6FF] shadow-[0px_8px_32px_rgba(0,0,0,0.14)]";

export function SupplierAuthGlassCard({
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

/** Primary contact field — white fill like design mockups. */
export const supplierAuthContactInputClass =
  "box-border h-[58px] w-full rounded-xl border border-black/10 bg-white py-[18px] pe-12 ps-4 text-right text-[16px] leading-[19px] text-black outline-none placeholder:text-black/40 focus:ring-2 focus:ring-[#4721DF]/25";
