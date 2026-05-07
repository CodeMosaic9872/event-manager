"use client";

import { useId } from "react";
import { MarketingModal, MARKETING_ICE_SURFACE_CLASS } from "@/shared/components/marketing-modal";

export type SupplierSelectionConfirmModalProps = {
  open: boolean;
  onClose: () => void;
  /** Called when the user confirms supplier approval */
  onConfirm?: () => void;
};

export function SupplierSelectionConfirmModal({
  open,
  onClose,
  onConfirm,
}: SupplierSelectionConfirmModalProps) {
  const titleId = useId();

  const handleConfirm = () => {
    onConfirm?.();
  };

  return (
    <MarketingModal
      open={open}
      onClose={onClose}
      backdrop="dim"
      zClass="z-[200]"
      closeOnBackdropClick
      closeOnEscape
      role="dialog"
      aria-modal
      aria-labelledby={titleId}
      dir="ltr"
    >
      <div
        className={`relative mx-auto box-border w-full max-w-[540px] ${MARKETING_ICE_SURFACE_CLASS} px-5 pb-8 pt-11 sm:px-8`}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 text-[28px] leading-6 text-[#A1A1A1] transition hover:opacity-70"
          aria-label="Close"
        >
          ×
        </button>

        <div className="flex flex-col items-center gap-3 text-center">
          <h2
            id={titleId}
            className="max-w-[420px] text-balance text-[22px] font-normal leading-[1.15] tracking-[-0.56px] text-[#00113A] sm:text-[32px] sm:leading-9"
          >
            Do you want to confirm your choice of provider?
          </h2>

          <p className="max-w-[360px] text-pretty text-base font-normal leading-relaxed text-black sm:text-xl sm:leading-7">
            After supplier approval, the details will be transferred directly to the selected supplier.
          </p>

          <div className="mt-4 flex w-full max-w-[252px] flex-col items-center gap-3">
            <button
              type="button"
              onClick={handleConfirm}
              className="flex min-h-11 w-full max-w-[252px] items-center justify-center rounded-[99px] bg-[#00113A] px-5 py-2.5 text-center text-base font-normal leading-snug text-white transition hover:opacity-95 sm:text-lg sm:leading-tight"
            >
              Supplier approval and selection
            </button>

            <button
              type="button"
              onClick={onClose}
              className="flex min-h-11 w-full max-w-[178px] items-center justify-center rounded-[99px] border border-[#201C44] px-5 py-2.5 text-center text-base font-normal leading-snug text-[#201C44] transition hover:bg-[#201C44]/5 sm:text-lg sm:leading-tight"
            >
              Cancellation
            </button>
          </div>
        </div>
      </div>
    </MarketingModal>
  );
}
