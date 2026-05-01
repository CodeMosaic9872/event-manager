/* eslint-disable @next/next/no-img-element */

type SupplierProfileHeroProps = {
  bannerUrl: string;
  avatarUrl: string;
  name: string;
};

export function SupplierProfileHero({ bannerUrl, avatarUrl, name }: SupplierProfileHeroProps) {
  return (
    <div className="relative w-full">
      <div className="relative isolate h-[333px] w-full overflow-hidden">
        <img src={bannerUrl} alt="" className="h-full w-full object-cover" />
        <div
          className="absolute inset-x-0 bottom-0 top-[134px] bg-gradient-to-t from-[rgba(248,250,252,0.83)] via-[rgba(8,44,80,0)] to-transparent"
          aria-hidden
        />
        <div
          className="absolute inset-x-0 top-0 bottom-[199px] bg-gradient-to-b from-[rgba(224,241,249,0.88)] via-[rgba(8,44,80,0)] to-transparent"
          aria-hidden
        />
      </div>

      <div className="relative z-10 mx-auto flex max-w-[1440px] justify-center px-6">
        <div className="-mt-[135px] flex flex-col items-center">
          <div
            className="flex size-[min(347px,85vw)] items-center justify-center rounded-full border-4 border-[#F8FAFC] bg-white shadow-[0px_20px_25px_-5px_rgba(0,0,0,0.1),0px_8px_10px_-6px_rgba(0,0,0,0.1)]"
          >
            <img
              src={avatarUrl}
              alt={name}
              className="size-[min(339px,calc(85vw-8px))] rounded-full object-cover"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
