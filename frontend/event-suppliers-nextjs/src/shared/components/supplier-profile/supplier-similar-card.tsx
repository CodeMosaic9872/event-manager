/* eslint-disable @next/next/no-img-element */
import Image from "next/image";
import Link from "next/link";

export type SupplierSimilarCardProps = {
  id: string;
  name: string;
  subtitle: string;
  rating: string;
  imageUrl: string;
};

export function SupplierSimilarCard({ id, name, subtitle, rating, imageUrl }: SupplierSimilarCardProps) {
  return (
    <Link
      href={`/suppliers/${id}`}
      dir="ltr"
      className="group flex h-[270px] w-[262px] shrink-0 flex-col items-start overflow-hidden rounded-2xl border border-black/20 bg-[#F2F5F5] backdrop-blur-[6px]"
    >
      <div className="h-[160px] w-[260px] overflow-hidden self-stretch">
        <img src={imageUrl} alt="" className="h-full w-full object-cover transition group-hover:opacity-95" />
      </div>
      <div className="flex h-[108px] w-[260px] flex-col gap-1 p-4">
        <div className="flex h-6 w-[228px] flex-col items-stretch self-stretch" dir="rtl">
          <h4 className="line-clamp-2 w-full text-right text-base leading-6 text-black">{name}</h4>
        </div>
        <div className="flex h-4 w-[228px] flex-col items-stretch self-stretch" dir="rtl">
          <p className="w-full text-right text-xs leading-4 text-black">{subtitle}</p>
        </div>
        <div className="flex h-7 w-[228px] flex-row items-center justify-between self-stretch pt-2" dir="ltr">
          <span className="inline-flex shrink-0 items-center justify-start" aria-hidden>
            <Image src="/right_arrow.svg" alt="" width={16} height={16} className="h-4 w-4 rotate-180" />
          </span>
          <span className="shrink-0 text-sm leading-5 text-black">
            {rating} <span className="text-[#FEC324]">★</span>
          </span>
        </div>
      </div>
    </Link>
  );
}
