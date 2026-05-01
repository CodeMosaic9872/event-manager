/* eslint-disable @next/next/no-img-element */
"use client";

import { useCallback, useEffect, useState, type MouseEvent } from "react";

type SupplierRatingModalProps = {
  open: boolean;
  onClose: () => void;
  avatarUrl: string;
  supplierName: string;
  supplierSubtitle: string;
};

const STAR_COUNT = 5;

function StarIcon({ filled }: { filled: boolean }) {
  return (
    <svg
      width={30}
      height={29}
      viewBox="0 0 30 29"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <path
        d="M15 2.25l4.09 8.26 9.16 1.33-6.63 6.47 1.56 9.12L15 23.52l-8.18 4.3 1.56-9.12-6.63-6.47 9.16-1.33L15 2.25z"
        fill={filled ? "#4721DF" : "#C5C6D2"}
      />
    </svg>
  );
}

export function SupplierRatingModal({
  open,
  onClose,
  avatarUrl,
  supplierName,
  supplierSubtitle,
}: SupplierRatingModalProps) {
  const [rating, setRating] = useState(4);
  const [fullName, setFullName] = useState("");
  const [review, setReview] = useState("");

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  const handleBackdropClick = useCallback(
    (e: MouseEvent<HTMLDivElement>) => {
      if (e.target === e.currentTarget) onClose();
    },
    [onClose],
  );

  if (!open) return null;

  return (
    <div
      role="presentation"
      className="fixed inset-0 z-200 flex items-center justify-center overflow-hidden bg-[rgba(15,23,42,0.5)] p-4 sm:p-6"
      onClick={handleBackdropClick}
    >
      <div
        role="dialog"
        aria-modal
        aria-labelledby="supplier-rating-title"
        className="relative max-h-[calc(100dvh-2rem)] w-full max-w-[712px] overflow-x-hidden overflow-y-auto overscroll-contain rounded-[24px] border border-[rgba(134,85,246,0.2)] bg-[#E3F0FC] shadow-[0px_8px_32px_rgba(0,0,0,0.37)] backdrop-blur-[6px] [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex flex-col items-center gap-10 px-6 pb-10 pt-12 sm:gap-12 sm:px-[66px] sm:pb-12 sm:pt-14">
          <h2
            id="supplier-rating-title"
            className="w-full max-w-[580px] text-center text-[48px] font-normal leading-8 tracking-[-0.6px] text-[#00113A]"
          >
            דירוג ספק
          </h2>

          <div className="flex w-full max-w-[580px] flex-col items-center gap-3">
            <div className="relative isolate box-border h-[178px] w-[178px] shrink-0 rounded-xl border border-[#4721DF]">
              <img
                src={avatarUrl}
                alt=""
                className="h-full w-full rounded-xl object-cover shadow-[0_0_0_4px_#D2E4FF]"
              />
              <div
                className="absolute -bottom-1 -right-1 z-1 flex h-[21px] w-[21px] items-center justify-center rounded-xl bg-[#4721DF] p-1 shadow-[0px_1px_2px_rgba(0,0,0,0.05)]"
                aria-hidden
              >
                <svg width={13} height={12} viewBox="0 0 13 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path
                    d="M7.5 1.5L10.5 4.5M1 11L1.5 8.5L8.2 1.8C8.6 1.4 9.2 1.4 9.6 1.8L10.2 2.4C10.6 2.8 10.6 3.4 10.2 3.8L3.5 10.5L1 11Z"
                    stroke="white"
                    strokeWidth="1.2"
                    strokeLinecap="round"
                  />
                </svg>
              </div>
            </div>

            <div className="flex flex-col items-center gap-1">
              <p className="text-center text-xl leading-7 text-black">{supplierName}</p>
              <p className="text-center text-sm leading-5 text-black">{supplierSubtitle}</p>
            </div>
          </div>

          <div className="flex w-full max-w-[580px] flex-col items-center">
            <div className="flex w-[182px] flex-col items-end gap-2">
              <div className="flex flex-row items-start gap-2" dir="ltr">
                {Array.from({ length: STAR_COUNT }, (_, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setRating(i + 1)}
                    className="flex h-[29px] w-[30px] cursor-pointer items-center justify-center rounded transition hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4721DF] focus-visible:ring-offset-2"
                    aria-label={`דירוג ${i + 1} מתוך ${STAR_COUNT}`}
                  >
                    <StarIcon filled={i < rating} />
                  </button>
                ))}
              </div>
              <p className="w-full text-right text-base leading-4 tracking-[1.2px] text-black">בחר דירוג</p>
            </div>
          </div>

          <div className="flex w-full max-w-[574px] flex-col gap-2">
            <label className="flex w-full flex-col items-end gap-2">
              <span className="text-lg leading-5 text-black">שם מלא</span>
              <input
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="שם מלא"
                dir="rtl"
                className="box-border min-h-[52px] w-full rounded-[20px] bg-white px-4 py-4 text-right text-base leading-6 text-[#757682] placeholder:text-[#757682]"
              />
            </label>
          </div>

          <div className="flex w-full max-w-[574px] flex-col gap-2">
            <label className="flex w-full flex-col items-end gap-2">
              <span className="text-lg leading-5 text-black">כתוב ביקורת</span>
              <textarea
                value={review}
                onChange={(e) => setReview(e.target.value)}
                placeholder="שתפו את החוויה שלכם עם הספק..."
                dir="rtl"
                rows={4}
                className="box-border min-h-[128px] w-full resize-none rounded-[20px] bg-white px-4 py-4 text-right text-base leading-6 text-[#757682] placeholder:text-[#757682]"
              />
            </label>
          </div>

          <div className="flex w-[332px] max-w-full flex-col items-stretch gap-3 pt-2">
            <button
              type="button"
              className="relative flex h-14 w-full items-center justify-center rounded-[99px] bg-[#201C44] text-base leading-6 text-white transition hover:bg-[#2a255b] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6AB7FF] focus-visible:ring-offset-2"
            >
              שליחת ביקורת
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex h-11 w-full items-center justify-center rounded-[99px] border border-black bg-transparent text-sm leading-5 text-black transition hover:bg-black/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6AB7FF] focus-visible:ring-offset-2"
            >
              ביטול
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
