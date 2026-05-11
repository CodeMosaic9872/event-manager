"use client";

import Image from "next/image";

export type TenderSupplierProposal = {
  id: string;
  businessName: string;
  rating: string;
  reviewCount: string;
  badges: string[];
  phone: string;
  priceNis: number;
  priceNote?: string;
  logoSrc?: string;
  logoAlt?: string;
  ctaLabel?: string;
};

const formatNis = (amount: number) =>
  new Intl.NumberFormat("he-IL", {
    style: "currency",
    currency: "ILS",
    maximumFractionDigits: 0,
  }).format(amount);

export function TenderSupplierProposalCard({
  businessName,
  rating,
  reviewCount,
  badges,
  phone,
  priceNis,
  priceNote = "Fixed price - no changes",
  logoSrc,
  logoAlt = "",
  ctaLabel = "Supplier approval and selection",
  onSelect,
}: TenderSupplierProposal & { onSelect?: () => void }) {
  return (
    <article
      dir="rtl"
      className="flex min-h-[378px] w-full max-w-[315px] shrink-0 flex-col justify-between rounded-[22px] border border-[#4721DF] bg-[#EBF4FE] p-6"
    >
      <div className="flex shrink-0 justify-between gap-4"><div className="flex size-14 shrink-0 items-center justify-center overflow-hidden rounded bg-[#F1F5F9]">
          {logoSrc ? (
            <Image
              src={logoSrc}
              alt={logoAlt || businessName}
              width={56}
              height={56}
              className="size-full object-cover"
            />
          ) : (
            <span className="flex size-full items-center justify-center bg-[#166534] px-1 text-center text-[8px] font-medium uppercase leading-tight text-white">
              Supplier
            </span>
          )}
        </div>
        <div className="flex flex-col items-start gap-0.5 text-start">
          <div className="flex items-center gap-1">
            <span className="text-sm font-normal leading-5 text-[#4721DF]">
              {rating}
            </span>
            <span className="text-[13px] leading-none text-[#4721DF]" aria-hidden>
              ★
            </span>
          </div>
          <span className="text-[10px] leading-[15px] text-black">
            {reviewCount} reviews
          </span>
        </div>
        
      </div>

      <h3 className="w-full text-start text-lg font-normal leading-7 text-[#00113A]">
        {businessName}
      </h3>

      <div className="flex w-full flex-wrap justify-start gap-1.5">
        {badges.map((label) => (
          <span
            key={label}
            className="rounded-xl bg-[#CDE5FF] px-2 py-0.5 text-[10px] font-normal uppercase leading-[15px] tracking-[-0.25px] text-[#004B74]"
          >
            {label}
          </span>
        ))}
      </div>

      <p className="w-full text-start text-sm leading-6 text-black">
        Phone: {phone}
      </p>

      <div className="rounded-[20px] bg-white/45 p-3">
        <div className="flex flex-row items-start justify-between gap-3">
          <div className="flex min-w-0 flex-col items-start gap-1 text-start">
            <p className="text-xs leading-4 text-black">Final price:</p>
            <div className="flex items-center gap-2">
              <span className="text-[11px] leading-4 text-[#0061A7]">
                {priceNote}
              </span>
              <Image
                src="/icons/verified.svg"
                alt=""
                width={12}
                height={12}
                className="mt-0.5 h-3 w-3 shrink-0"
                aria-hidden
              />
            </div>
          </div>
          <p className="shrink-0 text-xl font-normal leading-7 text-[#00113A]">
            {formatNis(priceNis)}
          </p>
        </div>
      </div>

      <button
        type="button"
        onClick={onSelect}
        className="relative isolate flex w-full items-center justify-center rounded-[99px] bg-[#201C44] py-3 text-sm font-normal leading-5 text-white transition hover:opacity-95"
      >
        {ctaLabel}
      </button>
    </article>
  );
}
