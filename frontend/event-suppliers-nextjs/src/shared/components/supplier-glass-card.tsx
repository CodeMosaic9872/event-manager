/* eslint-disable @next/next/no-img-element */
import Link from "next/link";

type SupplierGlassCardProps = {
  name: string;
  subtitle: string;
  description: string;
  location: string;
  rating: string;
  imageUrl?: string;
  compactLocation?: boolean;
  /** When set, the whole card navigates to the supplier profile. */
  href?: string;
};

export function SupplierGlassCard({
  name,
  subtitle,
  description,
  location,
  rating,
  imageUrl = "/avatars/1.jpg",
  compactLocation = false,
  href,
}: SupplierGlassCardProps) {
  const inner = (
    <article className="flex h-[362px] flex-col justify-center pt-12">
      <div className="relative flex h-[314px] flex-col items-center rounded-2xl border border-black/10 bg-[linear-gradient(180deg,rgba(185,185,185,0.308)_0%,rgba(255,255,255,0.1232)_100%)] px-6 pb-6 pt-12 backdrop-blur-[6px]">
        <div className="flex w-full flex-col items-center gap-1">
          <h3 className="text-center text-[20px] leading-7 text-black">{name}</h3>
          <p className="text-center text-xs uppercase tracking-[0.3px] text-black">{subtitle}</p>
        </div>

        <div className="mt-3 flex items-center gap-3 text-black">
          <img src="/icons/camera.svg" alt="camera" className="size-[15px]" />
          <img src="/icons/message.svg" alt="message" className="h-3 w-[15px]" />
          <img src="/icons/share.svg" alt="share" className="size-[15px]" />
        </div>

        <div className="mt-3 flex gap-2 pb-2">
          <span className="flex size-12 items-center justify-center rounded border border-black/10 bg-black/5 text-[10px] text-black">
            image
          </span>
          <span className="flex size-12 items-center justify-center rounded border border-black/10 bg-black/5 text-[10px] text-black">
            image
          </span>
          <span className="flex size-12 items-center justify-center rounded border border-black/10 bg-black/5 text-[10px] text-black">
            image
          </span>
        </div>

        <div className="mt-1 h-12 w-full max-w-[232px] overflow-auto">
          <p className="text-center text-xs leading-4 text-black">{description}</p>
        </div>

        <div className="mt-3 w-full border-t border-black/5 pt-3 text-center text-xs text-black">
          {compactLocation ? location : location}
        </div>

        <div className="absolute left-1/2 top-[-47px] flex size-24 -translate-x-1/2 items-center justify-center rounded-full border-4 border-[#6AB7FF] bg-[rgba(71,71,71,0.002)]">
          <img src={imageUrl || "/avatars/1.jpg"} alt={name} className="size-[88px] rounded-full object-cover" />
        </div>

        <div className="mt-2 flex items-center gap-1 text-[#FEC324]">
          <span>★</span>
          <span className="text-base text-[#FEC324]">{rating}</span>
        </div>
      </div>
    </article>
  );

  if (href) {
    return (
      <Link
        href={href}
        className="block rounded-3xl outline-none ring-offset-2 focus-visible:ring-2 focus-visible:ring-[#6AB7FF]"
      >
        {inner}
      </Link>
    );
  }

  return inner;
}
