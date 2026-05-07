"use client";

import Image from "next/image";
import Link from "next/link";
import { useId } from "react";
import { useRouter } from "next/navigation";
import { MarketingModal, MARKETING_ICE_SURFACE_CLASS } from "@/shared/components/marketing-modal";

export type SupplierSelectionSuccessModalProps = {
  open: boolean;
  onClose: () => void;
  supplierName: string;
  supplierPhone: string;
  /** Defaults to home dashboard */
  backHref?: string;
  ratingPageHref?: string;
};

function SuccessBadgeCheckIcon() {
  return (
    <span className="flex size-[29px] shrink-0 items-center justify-center rounded-full bg-[#201C44]" aria-hidden>
      <svg width="14" height="11" viewBox="0 0 14 11" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
          d="M1 5.5L4.5 9L13 1"
          stroke="white"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </span>
  );
}

export function SupplierSelectionSuccessModal({
  open,
  onClose,
  supplierName,
  supplierPhone,
  backHref = "/user/dashboard",
  ratingPageHref = "/marketplace",
}: SupplierSelectionSuccessModalProps) {
  const router = useRouter();
  const titleId = useId();

  const handleBack = () => {
    onClose();
    router.push(backHref);
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
        <h2 id={titleId} className="sr-only">
          The supplier has been successfully selected
        </h2>

        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 text-[28px] leading-6 text-[#A1A1A1] transition hover:opacity-70"
          aria-label="Close"
        >
          ×
        </button>

        <div className="flex flex-col items-center gap-3 text-center sm:gap-4">
          <div className="flex max-w-[339px] flex-row items-center justify-center gap-2 rounded-[99px] bg-[#6AB7FF] px-3 py-2 sm:gap-3.5 sm:px-4 sm:py-2.5">
            <p className="max-w-[226px] text-balance text-center text-base font-normal leading-tight tracking-[0.3px] text-[#201C44] sm:text-xl sm:leading-snug">
              The supplier has been successfully selected!
            </p>
            <SuccessBadgeCheckIcon />
          </div>

          <p className="max-w-[379px] text-pretty text-[18px] font-normal leading-[29px] text-black">
            How fun that you chose {supplierName}! Contact information has been forwarded to the supplier.
          </p>

          <p className="max-w-[379px] text-pretty text-xl font-normal leading-[29px] text-black">
            To contact the supplier: {supplierPhone}
          </p>

          <Link
            href={ratingPageHref}
            className="mt-0.5 inline-flex items-center gap-1 text-sm leading-[29px] text-[#4721DF] underline-offset-2 hover:underline"
            onClick={onClose}
          >
            <span className="text-base leading-none text-[#4721DF]" aria-hidden>
              ←
            </span>
            To the supplier rating page
          </Link>

          <div className="mt-2 w-full max-w-[379px] pt-2">
            <button
              type="button"
              onClick={handleBack}
              className="relative isolate flex h-14 w-full flex-row items-center justify-center gap-2 rounded-[99px] bg-[#201C44] px-8 py-4 text-base font-normal leading-6 text-white transition hover:opacity-95"
            >
              <Image
                src="/left-arrow.svg"
                alt=""
                width={13}
                height={13}
                className="size-[13px] shrink-0 brightness-0 invert"
                aria-hidden
              />
              Back to main page
            </button>
          </div>
        </div>
      </div>
    </MarketingModal>
  );
}
