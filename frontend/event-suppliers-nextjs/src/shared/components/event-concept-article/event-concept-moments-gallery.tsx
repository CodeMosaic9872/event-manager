/* eslint-disable @next/next/no-img-element */
"use client";

import { useState } from "react";
import type { EventConceptArticleGalleryImage } from "@/shared/types/event-concept-article";
import { CarouselArrowImg } from "@/shared/components/carousel-arrow-img";

/** Number of photos visible per “page” — matches full-width row in design (4 squares). */
const PAGE_SIZE = 4;

export function EventConceptMomentsGallery({
  title,
  images,
}: {
  title: string;
  images: EventConceptArticleGalleryImage[];
}) {
  const [slideIndex, setSlideIndex] = useState(0);
  const n = images.length;
  const maxSlideIndex = Math.max(n - PAGE_SIZE, 0);
  const visible = images.slice(slideIndex, slideIndex + PAGE_SIZE);

  if (n === 0) return null;

  return (
    <div className="flex w-full flex-col gap-5 sm:gap-6 lg:gap-8">
      <h2
        id="moments-gallery-heading"
        className="w-full text-xl font-bold leading-7 text-[#0F172A] sm:text-2xl sm:leading-8"
      >
        {title}
      </h2>
      <div
        className="flex w-full items-center gap-2 sm:gap-3 md:gap-4 lg:gap-8"
        dir="ltr"
      >
        <button
          type="button"
          aria-label="תמונות קודמות"
          onClick={() => setSlideIndex((prev) => Math.max(prev - 1, 0))}
          disabled={slideIndex === 0}
          className="flex size-11 shrink-0 items-center justify-center rounded-full border border-[#E2E8F0] bg-white shadow-[0px_1px_2px_rgba(0,0,0,0.06)] transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-35 sm:size-[52px] md:size-[58px]"
        >
          <CarouselArrowImg direction="left" className="h-5 w-auto sm:h-6" />
        </button>

        <div className="grid min-w-0 flex-1 grid-cols-2 gap-3 sm:gap-4 md:grid-cols-4 md:gap-4 lg:gap-5">
          {visible.map((img, i) => (
            <div
              key={`${slideIndex}-${i}-${img.src}`}
              className="relative aspect-square w-full min-w-0 overflow-hidden rounded-xl shadow-[0px_1px_2px_rgba(0,0,0,0.05)] sm:rounded-2xl"
            >
              <img
                src={img.src}
                alt={img.alt}
                className="h-full w-full object-cover"
                loading={slideIndex + i > 0 ? "lazy" : "eager"}
              />
            </div>
          ))}
        </div>

        <button
          type="button"
          aria-label="תמונות הבאות"
          onClick={() => setSlideIndex((prev) => Math.min(prev + 1, maxSlideIndex))}
          disabled={slideIndex === maxSlideIndex}
          className="flex size-11 shrink-0 items-center justify-center rounded-full border border-[#E2E8F0] bg-white shadow-[0px_1px_2px_rgba(0,0,0,0.06)] transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-35 sm:size-[52px] md:size-[58px]"
        >
          <CarouselArrowImg direction="right" className="h-5 w-auto sm:h-6" />
        </button>
      </div>
    </div>
  );
}
