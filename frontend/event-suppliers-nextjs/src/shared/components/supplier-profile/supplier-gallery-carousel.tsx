/* eslint-disable @next/next/no-img-element */
"use client";

import { useState } from "react";

type SupplierGalleryCarouselProps = {
  images: string[];
  title?: string;
};

export function SupplierGalleryCarousel({ images, title = "גלריה" }: SupplierGalleryCarouselProps) {
  const VISIBLE_ITEMS = 4;
  const ITEM_WIDTH = 288;
  const ITEM_GAP = 16;
  const [slideIndex, setSlideIndex] = useState(0);
  const maxSlideIndex = Math.max(images.length - VISIBLE_ITEMS, 0);
  const viewportWidth = ITEM_WIDTH * VISIBLE_ITEMS + ITEM_GAP * (VISIBLE_ITEMS - 1);
  const translateX = slideIndex * (ITEM_WIDTH + ITEM_GAP);

  return (
    <div className="w-full max-w-[1392px]">
      <div className="relative mb-4 min-h-[42px] w-full">
        <h3 className="text-start text-[28px] leading-7 text-[#0F172A] sm:text-[38px] sm:leading-7">{title}</h3>
      </div>

      <div className="flex h-[208px] items-center justify-center gap-4 px-4 pb-4 pt-0">
        <button
          type="button"
          onClick={() => setSlideIndex((prev) => Math.min(prev + 1, maxSlideIndex))}
          disabled={slideIndex === maxSlideIndex}
          className="flex size-[42px] shrink-0 cursor-pointer items-center justify-center rounded-full bg-[#201C44] text-white disabled:cursor-not-allowed disabled:opacity-40"
          aria-label="תמונות קודמות"
        >
          <span className="text-lg leading-none">→</span>
        </button>

        <div className="overflow-hidden" style={{ width: `${viewportWidth}px` }}>
          <div
            className="flex gap-4 transition-transform duration-500 ease-out"
            style={{ transform: `translateX(-${translateX}px)` }}
          >
            {images.map((src, i) => (
              <div
                key={`${src}-${i}`}
                className="h-[192px] w-[288px] shrink-0 cursor-pointer overflow-hidden rounded-xl bg-[#E2E8F0] shadow-[0px_4px_6px_-1px_rgba(0,0,0,0.1),0px_2px_4px_-2px_rgba(0,0,0,0.1)]"
              >
                <img src={src} alt="" className="h-full w-full object-cover transition-transform duration-500 hover:scale-[1.03]" />
              </div>
            ))}
          </div>
        </div>

        <button
          type="button"
          onClick={() => setSlideIndex((prev) => Math.max(prev - 1, 0))}
          disabled={slideIndex === 0}
          className="flex size-[42px] shrink-0 cursor-pointer items-center justify-center rounded-full bg-[#201C44] text-white disabled:cursor-not-allowed disabled:opacity-40"
          aria-label="תמונות הבאות"
        >
          <span className="text-lg leading-none">←</span>
        </button>
      </div>
    </div>
  );
}
