/* eslint-disable @next/next/no-img-element */
"use client";

import { useState, useMemo } from "react";
import { useCreateSupplierReviewMutation } from "@/shared/api/api";
import { MarketingModal, MARKETING_ICE_SURFACE_CLASS } from "@/shared/components/marketing-modal";

type SupplierRatingModalProps = {
  open: boolean;
  onClose: () => void;
  supplierId: string;
  avatarUrl: string;
  supplierName: string;
  supplierSubtitle: string;
};

const STAR_COUNT = 5;
const TITLE_MIN = 2;
const TITLE_MAX = 50;
const COMMENT_MIN = 10;
const COMMENT_MAX = 500;

function StarIcon({ filled }: { filled: boolean }) {
  return (
    <svg width={30} height={29} viewBox="0 0 30 29" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
      <path d="M15 2.25l4.09 8.26 9.16 1.33-6.63 6.47 1.56 9.12L15 23.52l-8.18 4.3 1.56-9.12-6.63-6.47 9.16-1.33L15 2.25z" fill={filled ? "#4721DF" : "#C5C6D2"} />
    </svg>
  );
}

export function SupplierRatingModal({ open, onClose, supplierId, avatarUrl, supplierName, supplierSubtitle }: SupplierRatingModalProps) {
  const [rating, setRating] = useState(4);
  const [title, setTitle] = useState("");
  const [comment, setComment] = useState("");
  const [submitReview, { isLoading: isSubmitting }] = useCreateSupplierReviewMutation();
  const [error, setError] = useState("");
  const [touched, setTouched] = useState<{ title: boolean; comment: boolean }>({ title: false, comment: false });

  const fieldErrors = useMemo(() => {
    const errors: { title?: string; comment?: string } = {};
    const trimmedTitle = title.trim();
    const trimmedComment = comment.trim();

    if (touched.title) {
      if (!trimmedTitle) errors.title = "נא להזין שם מלא";
      else if (trimmedTitle.length < TITLE_MIN) errors.title = `שם חייב להכיל לפחות ${TITLE_MIN} תווים`;
    }

    if (touched.comment) {
      if (!trimmedComment) errors.comment = "נא לכתוב חוות דעת";
      else if (trimmedComment.length < COMMENT_MIN) errors.comment = `חוות דעת חייבת להכיל לפחות ${COMMENT_MIN} תווים`;
    }

    return errors;
  }, [title, comment, touched]);

  const isValid = !fieldErrors.title && !fieldErrors.comment && title.trim().length >= TITLE_MIN && comment.trim().length >= COMMENT_MIN;

  const handleSubmit = async () => {
    setTouched({ title: true, comment: true });
    if (!isValid) return;
    setError("");
    try {
      await submitReview({ supplierId, rating, title: title.trim() || undefined, comment: comment.trim() || undefined }).unwrap();
      onClose();
    } catch {
      setError("Failed to submit review. Please try again.");
    }
  };

  return (
    <MarketingModal open={open} onClose={onClose} backdrop="slate" zClass="z-[200]" closeOnBackdropClick closeOnEscape>
      <div role="dialog" aria-modal aria-labelledby="supplier-rating-title" className={`${MARKETING_ICE_SURFACE_CLASS} relative max-h-[calc(100dvh-2rem)] w-full max-w-[712px] overflow-x-hidden overflow-y-auto overscroll-contain`}>
        <div className="flex flex-col items-center gap-10 px-6 pb-10 pt-12 sm:gap-12 sm:px-[66px] sm:pb-12 sm:pt-14">
          <h2 id="supplier-rating-title" className="w-full max-w-[580px] text-center text-[48px] leading-8 tracking-[-0.6px] text-[#00113A] font-bold">דירוג ספק</h2>

          <div className="flex w-full max-w-[580px] flex-col items-center gap-3">
            <div className="relative isolate box-border h-[178px] w-[178px] shrink-0 rounded-xl border border-[#4721DF]">
              {avatarUrl ? (
                <img src={avatarUrl} alt="" className="h-full w-full rounded-xl object-cover shadow-[0_0_0_4px_#D2E4FF]" />
              ) : (
                <div className="flex h-full w-full items-center justify-center rounded-xl bg-slate-100 shadow-[0_0_0_4px_#D2E4FF]">
                  <span className="text-2xl text-slate-400">{supplierName?.charAt(0) ?? "?"}</span>
                </div>
              )}
              <div className="absolute -bottom-1 -right-1 z-1 flex h-[21px] w-[21px] items-center justify-center rounded-xl bg-[#4721DF] p-1 shadow-[0px_1px_2px_rgba(0,0,0,0.05)]" aria-hidden>
                <svg width={13} height={12} viewBox="0 0 13 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M7.5 1.5L10.5 4.5M1 11L1.5 8.5L8.2 1.8C8.6 1.4 9.2 1.4 9.6 1.8L10.2 2.4C10.6 2.8 10.6 3.4 10.2 3.8L3.5 10.5L1 11Z" stroke="white" strokeWidth="1.2" strokeLinecap="round" />
                </svg>
              </div>
            </div>

            <div className="flex flex-col items-center gap-1">
              <p className="text-center text-xl leading-7 text-black font-bold">{supplierName}</p>
              <p className="text-center text-sm leading-5 text-black">{supplierSubtitle}</p>
            </div>
          </div>

          <div className="flex w-full max-w-[580px] flex-col items-center">
            <div className="flex w-[182px] flex-col items-end gap-2">
              <div className="flex flex-row items-start gap-2" dir="ltr">
                {Array.from({ length: STAR_COUNT }, (_, i) => (
                  <button key={i} type="button" onClick={() => setRating(i + 1)} className="flex h-[29px] w-[30px] cursor-pointer items-center justify-center rounded transition hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4721DF] focus-visible:ring-offset-2" aria-label={`דירוג ${i + 1} מתוך ${STAR_COUNT}`}>
                    <StarIcon filled={i < rating} />
                  </button>
                ))}
              </div>
              <p className="w-full text-center font-bold text-base leading-4 tracking-[1.2px] text-black">בחר דירוג</p>
            </div>
          </div>

          <div className="flex w-full max-w-[574px] flex-col gap-2">
            <label className="flex w-full flex-col items-end gap-2">
              <span className="text-lg leading-5 text-black font-bold text-right w-full">שם מלא</span>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                onBlur={() => setTouched((prev) => ({ ...prev, title: true }))}
                placeholder="שם מלא"
                dir="rtl"
                maxLength={TITLE_MAX}
                className={`box-border min-h-[52px] w-full rounded-[20px] bg-white px-4 py-4 text-right text-base leading-6 placeholder:text-[#757682] ${fieldErrors.title ? "border-2 border-red-400 text-[#757682]" : "text-[#757682]"}`}
              />
              {fieldErrors.title && <p className="w-full text-right text-xs text-red-500">{fieldErrors.title}</p>}
              <span className="w-full text-left text-xs text-[#94A3B8]" dir="ltr">{title.length}/{TITLE_MAX}</span>
            </label>
          </div>

          <div className="flex w-full max-w-[574px] flex-col gap-2">
            <label className="flex w-full flex-col items-end gap-2">
              <span className="text-lg leading-5 text-black font-bold text-right w-full">כתוב חוות דעת</span>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                onBlur={() => setTouched((prev) => ({ ...prev, comment: true }))}
                placeholder="שתף את החוויה שלך עם הספק..."
                dir="rtl"
                rows={4}
                maxLength={COMMENT_MAX}
                className={`box-border min-h-[128px] w-full resize-none rounded-[20px] bg-white px-4 py-4 text-right text-base leading-6 placeholder:text-[#757682] ${fieldErrors.comment ? "border-2 border-red-400 text-[#757682]" : "text-[#757682]"}`}
              />
              {fieldErrors.comment && <p className="w-full text-right text-xs text-red-500">{fieldErrors.comment}</p>}
              <span className="w-full text-left text-xs text-[#94A3B8]" dir="ltr">{comment.length}/{COMMENT_MAX}</span>
            </label>
          </div>

          <div className="flex w-[332px] max-w-full flex-col items-stretch gap-3 pt-2">
            {error ? <p className="text-center text-sm text-red-600">{error}</p> : null}
            <button type="button" onClick={handleSubmit} disabled={isSubmitting || !isValid} className="font-bold relative flex h-14 w-full items-center justify-center rounded-[99px] bg-[#201C44] text-base leading-6 text-white transition hover:bg-[#2a255b] disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6AB7FF] focus-visible:ring-offset-2">
              {isSubmitting ? "שולח..." : "שלח ביקורת"}
            </button>
            <button type="button" onClick={onClose} className="font-bold flex h-11 w-full items-center justify-center rounded-[99px] border border-black bg-transparent text-sm leading-5 text-black transition hover:bg-black/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6AB7FF] focus-visible:ring-offset-2">ביטול</button>
          </div>
        </div>
      </div>
    </MarketingModal>
  );
}
