"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef } from "react";
import { CarouselArrowImg } from "@/shared/components/carousel-arrow-img";
import { SupplierGlassCard } from "@/shared/components/supplier-glass-card";
import { savedSuppliersDemo } from "@/shared/data/saved-suppliers.demo";

type AdditionalSuppliersSectionProps = {
  title?: string;
  linkHref?: string;
  linkLabel?: string;
  className?: string;
};

export function AdditionalSuppliersSection({
  title = "Additional suppliers",
  linkHref = "/marketplace",
  linkLabel = "to all suppliers",
  className = "",
}: AdditionalSuppliersSectionProps) {
  const carouselRef = useRef<HTMLDivElement>(null);

  const scrollCarousel = (dir: "next" | "prev") => {
    const el = carouselRef.current;
    if (!el) return;
    const delta = dir === "next" ? 280 : -280;
    el.scrollBy({ left: delta, behavior: "smooth" });
  };

  return (
    <section className={`w-full ${className}`} aria-labelledby="additional-suppliers-heading">
      <div className="mb-6 flex min-h-[68px] w-full items-center gap-2 sm:gap-3">
        <h2
          id="additional-suppliers-heading"
          className="max-w-[58%] shrink text-right text-[24px] leading-none text-[#201C44] sm:max-w-none sm:shrink-0 sm:whitespace-nowrap sm:text-[30px]"
        >
          <span dir="ltr" className="inline-block" style={{ unicodeBidi: "isolate" }}>
            {title}
          </span>
        </h2>
        <span className="h-px min-w-6 flex-1 border-t border-[rgba(32,28,68,0.5)]" aria-hidden />
        <Link
          href={linkHref}
          dir="ltr"
          className="inline-flex h-[40px] shrink-0 items-center justify-end gap-2 text-[18px] leading-[14px] text-[#201C44] hover:underline sm:min-w-[152px]"
        >
          <Image src="/left-arrow.svg" alt="" width={18} height={12} className="opacity-80" unoptimized />
          <span>{linkLabel}</span>
        </Link>
      </div>

      <div className="flex items-center gap-4 lg:gap-[60px]">
        <button
          type="button"
          aria-label="הקודם"
          onClick={() => scrollCarousel("prev")}
          className="flex size-12 shrink-0 items-center justify-center rounded-full bg-white text-[#201C44] shadow-sm sm:size-[58px]"
        >
          <CarouselArrowImg direction="right" className="h-6 w-auto sm:h-[26px]" />
        </button>

        <div
          ref={carouselRef}
          className="flex min-w-0 flex-1 gap-6 overflow-x-auto pb-4 pt-10 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {savedSuppliersDemo.map((supplier) => (
            <div key={supplier.name} className="w-[288px] shrink-0">
              <SupplierGlassCard
                name={supplier.name}
                subtitle={supplier.subtitle}
                description={supplier.description}
                location={supplier.location}
                rating={supplier.rating}
                imageUrl={supplier.imageUrl}
              />
            </div>
          ))}
        </div>

        <button
          type="button"
          aria-label="הבא"
          onClick={() => scrollCarousel("next")}
          className="flex size-12 shrink-0 items-center justify-center rounded-full bg-white text-[#201C44] shadow-sm sm:size-[58px]"
        >
          <CarouselArrowImg direction="left" className="h-6 w-auto sm:h-[26px]" />
        </button>
      </div>
    </section>
  );
}
