"use client";

import Link from "next/link";
import { useState } from "react";
import type { SupplierSummary } from "@/shared/data/supplier-catalog";
import { SupplierContactIconsRow } from "@/shared/components/supplier-profile/supplier-contact-icons-row";
import { SupplierGalleryCarousel } from "@/shared/components/supplier-profile/supplier-gallery-carousel";
import { SupplierProfileBackground } from "@/shared/components/supplier-profile/supplier-profile-background";
import { SupplierProfileCtaRow } from "@/shared/components/supplier-profile/supplier-profile-cta-row";
import { SupplierProfileHero } from "@/shared/components/supplier-profile/supplier-profile-hero";
import { SupplierProfileSummary } from "@/shared/components/supplier-profile/supplier-profile-summary";
import { SupplierReviewCard } from "@/shared/components/supplier-profile/supplier-review-card";
import { SupplierSimilarSuppliersSection } from "@/shared/components/supplier-profile/supplier-similar-suppliers-section";
import { SupplierRatingModal } from "@/shared/components/supplier-profile/supplier-rating-modal";
import Image from "next/image";

type SupplierProfileViewProps = {
  profile: SupplierSummary;
};

export function SupplierProfileView({ profile }: SupplierProfileViewProps) {
  const [showRating, setShowRating] = useState(false);

  const headline = profile.profileHeadline ?? profile.name;
  const sub = profile.profileSubtitle ?? profile.subtitle;
  const loc = profile.locationLine ?? profile.location;
  const banner = profile.heroBannerUrl ?? profile.imageUrl ?? "";
  const avatar = profile.imageUrl ?? "";
  const gallery = profile.gallery ?? [];
  const reviews = profile.reviews ?? [];
  const score = profile.reviewScore ?? Number(profile.rating);
  const count = profile.reviewCount ?? 0;
  const similar =
    profile.similar?.map((s) => ({
      id: s.id,
      name: s.name,
      subtitle: s.subtitle,
      rating: s.rating,
      imageUrl: s.heroBannerUrl ?? s.imageUrl ?? banner,
    })) ?? [];

  return (
    <section className="relative mx-auto w-full overflow-x-hidden bg-white pb-24">
      <SupplierProfileBackground />

      <div className="relative z-10 mx-auto w-full pt-20 sm:pt-24 lg:pt-[119px]">
        <SupplierProfileHero bannerUrl={banner} avatarUrl={avatar} name={profile.name} />

        <div className="mx-auto flex max-w-[1440px] flex-col items-center px-4 pt-8 sm:px-6 sm:pt-10">
          <SupplierProfileSummary
            headline={headline}
            subtitle={sub}
            location={loc}
            aboutTitle={profile.aboutTitle ?? "קצת עלינו"}
            aboutBody={profile.aboutBody ?? profile.description}
            contactIcons={<SupplierContactIconsRow />}
          />

          <div className="mt-10 w-full">
            <SupplierGalleryCarousel images={gallery} />
          </div>

          <div className="mt-10 flex w-full max-w-[1392px] flex-col items-stretch gap-6 px-2 pb-4 sm:px-4">
            <div className="flex w-full max-w-[1360px] flex-wrap items-center justify-between gap-3 self-center">
              <h3 className="text-2xl leading-7 text-[#0F172A]">ביקורות</h3>
              <div className="flex items-center gap-2">
                <span className="text-base font-bold leading-6 text-[#4721DF]">{score.toFixed(1)}</span>
                <span className="text-sm text-[#4721DF]" aria-hidden>
                  ★
                </span>
                <span className="text-sm leading-5 text-[#94A3B8]">({count})</span>
              </div>
            </div>

            {reviews.map((r) => (
              <SupplierReviewCard
                key={r.id}
                author={r.author}
                dateLabel={r.dateLabel}
                body={r.body}
                badgeLabel={r.badgeLabel}
              />
            ))}

            <SupplierProfileCtaRow onRate={() => setShowRating(true)} />
          </div>
        </div>
      </div>

      {similar.length > 0 ? <SupplierSimilarSuppliersSection items={similar} /> : null}

      <div className="relative z-10 mx-auto flex justify-start px-4 pb-16 pt-8 sm:px-6">
        <Link
          href="/vacation-selection-suppliers"
          className="inline-flex h-12 w-full max-w-[260px] items-center justify-center gap-2 rounded-[99px] border-2 border-[rgba(98,98,98,0.46)] bg-white px-4 text-base leading-6 text-[rgba(0,0,0,0.66)]"
        >
          <Image src="/right_arrow.svg" alt="" width={16} height={16} className="h-4 w-4" /> חזרה לזירת הספקים
        </Link>
      </div>

      <SupplierRatingModal
        key={showRating ? "supplier-rating-open" : "supplier-rating-closed"}
        open={showRating}
        onClose={() => setShowRating(false)}
        avatarUrl={avatar}
        supplierName={profile.name}
        supplierSubtitle={sub}
      />
    </section>
  );
}
