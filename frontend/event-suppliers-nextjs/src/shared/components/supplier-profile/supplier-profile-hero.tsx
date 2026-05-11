/* eslint-disable @next/next/no-img-element */

const DEFAULT_COVER = "/cover.png";
const DEFAULT_AVATAR = "/avatars/1.jpg";

type SupplierProfileHeroProps = {
  bannerUrl?: string;
  avatarUrl?: string;
  name: string;
};

export function SupplierProfileHero({ bannerUrl, avatarUrl, name }: SupplierProfileHeroProps) {
  const banner = bannerUrl || DEFAULT_COVER;
  const avatar = avatarUrl || DEFAULT_AVATAR;

  return (
    <div className="relative w-full">
      <div className="relative isolate h-[220px] w-full overflow-hidden bg-slate-200 sm:h-[280px] lg:h-[333px]">
        <img src={banner} alt="" className="h-full w-full object-cover" />
        <div className="absolute inset-x-0 bottom-0 top-[45%] bg-linear-to-t from-[rgba(248,250,252,0.83)] via-[rgba(8,44,80,0)] to-transparent" aria-hidden />
        <div className="absolute inset-x-0 bottom-[60%] top-0 bg-linear-to-b from-[rgba(224,241,249,0.88)] via-[rgba(8,44,80,0)] to-transparent" aria-hidden />
      </div>

      <div className="relative z-10 mx-auto flex max-w-[1440px] justify-center px-4 sm:px-6">
        <div className="mt-[-84px] flex flex-col items-center sm:mt-[-110px] lg:mt-[-135px]">
          <div className="flex size-[min(220px,78vw)] items-center justify-center rounded-full border-4 border-[#F8FAFC] bg-white shadow-[0px_20px_25px_-5px_rgba(0,0,0,0.1),0px_8px_10px_-6px_rgba(0,0,0,0.1)] sm:size-[min(290px,72vw)] lg:size-[min(347px,85vw)]">
            <img
              src={avatar}
              alt={name}
              className="size-[min(212px,calc(78vw-8px))] rounded-full object-cover sm:size-[min(282px,calc(72vw-8px))] lg:size-[min(339px,calc(85vw-8px))]"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
