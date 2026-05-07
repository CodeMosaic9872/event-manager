"use client";

import { useEffect, type CSSProperties, type MouseEvent, type ReactNode } from "react";
import { useModalScrollLock } from "@/shared/hooks/use-modal-scroll-lock";

/** Join-supplier card + AI quota modal — soft blue → white gradient panel. */
export const MARKETING_GRADIENT_SURFACE_CLASS =
  "rounded-[24px] border border-[rgba(134,85,246,0.2)] bg-[linear-gradient(180deg,#B5D4F3_0%,#FFFFFF_100%)] shadow-[0px_8px_32px_rgba(0,0,0,0.37)] backdrop-blur-[6px]";

/** Supplier rating and similar frosted panels. */
export const MARKETING_ICE_SURFACE_CLASS =
  "rounded-[24px] border border-[rgba(134,85,246,0.2)] bg-[#E3F0FC] shadow-[0px_8px_32px_rgba(0,0,0,0.37)] backdrop-blur-[6px] [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden";

/** Contact / confirmation dialogs — light blue solid. */
export const MARKETING_SOFT_SURFACE_CLASS =
  "rounded-[24px] border border-[rgba(134,85,246,0.2)] bg-[#deecfd] shadow-[0px_8px_32px_rgba(0,0,0,0.37)] backdrop-blur-[6px]";

const backdropPreset = {
  dim: "bg-black/45 backdrop-blur-[2px]",
  slate: "bg-[rgba(15,23,42,0.5)]",
} as const;

export type MarketingModalProps = {
  open: boolean;
  onClose?: () => void;
  children: ReactNode;
  backdrop?: keyof typeof backdropPreset;
  /** z-[100] default (AI quota); z-[200] for overlays above other UI. */
  zClass?: "z-[100]" | "z-[200]";
  closeOnBackdropClick?: boolean;
  closeOnEscape?: boolean;
  lockScroll?: boolean;
  className?: string;
  role?: "dialog" | "presentation";
  "aria-modal"?: boolean;
  "aria-labelledby"?: string;
  dir?: "ltr" | "rtl";
};

export function MarketingModal({
  open,
  onClose,
  children,
  backdrop = "dim",
  zClass = "z-[100]",
  closeOnBackdropClick = false,
  closeOnEscape = false,
  lockScroll = true,
  className = "",
  role = "presentation",
  "aria-modal": ariaModal,
  "aria-labelledby": ariaLabelledBy,
  dir,
}: MarketingModalProps) {
  useModalScrollLock(lockScroll && open);

  useEffect(() => {
    if (!open || !closeOnEscape || !onClose) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, closeOnEscape, onClose]);

  if (!open) return null;

  const handleBackdropMouseDown =
    closeOnBackdropClick && onClose
      ? (e: MouseEvent<HTMLDivElement>) => {
          if (e.target === e.currentTarget) onClose();
        }
      : undefined;

  return (
    <div
      role={role}
      aria-modal={ariaModal}
      aria-labelledby={ariaLabelledBy}
      dir={dir}
      className={`fixed inset-0 ${zClass} flex min-h-0 items-center justify-center overflow-x-hidden overflow-y-auto px-4 pt-[max(1rem,env(safe-area-inset-top))] pb-[max(1rem,env(safe-area-inset-bottom))] sm:px-6 ${backdropPreset[backdrop]} ${className}`.trim()}
      onMouseDown={handleBackdropMouseDown}
    >
      {children}
    </div>
  );
}

type MarketingGradientSurfaceProps = {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
};

/** Same visual as marketing modals — for in-page funnel cards (e.g. join supplier). */
export function MarketingGradientSurface({ children, className = "", style }: MarketingGradientSurfaceProps) {
  return (
    <div className={`${MARKETING_GRADIENT_SURFACE_CLASS} ${className}`.trim()} style={style}>
      {children}
    </div>
  );
}
