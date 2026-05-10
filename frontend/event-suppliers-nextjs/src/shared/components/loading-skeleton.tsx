export function LoadingSkeleton({ className = "" }: { className?: string }) {
  return (
    <div className={`mx-auto w-full max-w-[896px] ${className}`}>
      <div className="relative rounded-[14px] border border-[#4721DF]/20 bg-[rgba(230,241,255,0.64)] px-5 pb-8 pt-8 text-right shadow-[1px_1px_2px_#4721DF]/20 sm:px-8" dir="rtl">
        <div className="absolute end-5 top-5 h-6 w-6 animate-pulse rounded bg-[#4721DF]/10" />

        <header className="mb-10 pe-2 sm:pe-0">
          <div className="mb-3 h-9 w-3/4 animate-pulse rounded-lg bg-[#4721DF]/10" />
          <div className="h-6 w-1/2 animate-pulse rounded-lg bg-[#4721DF]/6" />
        </header>

        <section>
          <div className="mb-5 flex items-center justify-start gap-3">
            <div className="h-6 w-1.5 animate-pulse rounded-xl bg-[#4721DF]/10" />
            <div className="h-7 w-32 animate-pulse rounded-lg bg-[#4721DF]/8" />
          </div>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="flex flex-col items-end gap-2">
                <div className="h-5 w-20 animate-pulse rounded bg-[#4721DF]/6" />
                <div className="h-12 w-full animate-pulse rounded bg-[#4721DF]/8" />
              </div>
            ))}
          </div>
        </section>

        <section className="mt-10">
          <div className="mb-5 flex items-center justify-start gap-3">
            <div className="h-6 w-1.5 animate-pulse rounded-xl bg-[#4721DF]/10" />
            <div className="h-7 w-32 animate-pulse rounded-lg bg-[#4721DF]/8" />
          </div>
          <div className="h-[81px] w-full max-w-[448px] animate-pulse rounded-lg bg-[#4721DF]/8" />
        </section>

        <section className="mt-10">
          <div className="mb-5 flex items-center justify-start gap-3">
            <div className="h-6 w-1.5 animate-pulse rounded-xl bg-[#4721DF]/10" />
            <div className="h-7 w-36 animate-pulse rounded-lg bg-[#4721DF]/8" />
          </div>
          <div className="h-[170px] w-full animate-pulse rounded-lg bg-[#4721DF]/8" />
        </section>

        <div className="mt-10 flex justify-end gap-3">
          <div className="h-[53px] w-[160px] animate-pulse rounded-[99px] bg-[#4721DF]/8 sm:w-[174px]" />
          <div className="h-[53px] w-[180px] animate-pulse rounded-[99px] bg-[#4721DF]/15 sm:w-[224px]" />
        </div>
      </div>
    </div>
  );
}
