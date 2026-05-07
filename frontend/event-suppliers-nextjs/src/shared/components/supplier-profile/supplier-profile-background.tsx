/** Decorative background layers (1440px design reference). */
export function SupplierProfileBackground() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      <div className="absolute inset-x-0 top-0 h-[58%] bg-[linear-gradient(180deg,#9BD3EF_0%,#FFFFFF_58%)]" />
      <div className="absolute inset-x-0 bottom-0 h-[48%] rotate-180 bg-[linear-gradient(180deg,#9BD3EF_0%,#FFFFFF_58%)]" />

      <div className="absolute left-[28%] top-[13%] h-[233px] w-[261px] rotate-149 rounded-full bg-[linear-gradient(180deg,#2998FF_0%,#FFFFFF_60.33%)] blur-[20.5px]" />
      <div
        className="absolute right-[-12%] top-[18%] hidden h-[396px] w-[444px] rotate-[-120deg] rounded-full bg-[linear-gradient(180deg,#2998FF_0%,#FFFFFF_60.33%)] blur-[2.5px] lg:block"
      />
      <div
        className="absolute left-[14%] top-[66%] hidden h-[396px] w-[444px] rotate-63 rounded-full bg-[linear-gradient(180deg,#2998FF_0%,#FFFFFF_60.33%)] blur-[2.5px] lg:block"
      />
      <div
        className="absolute left-[-8%] top-[72%] h-[220px] w-[240px] rotate-99 rounded-full bg-[linear-gradient(180deg,#2998FF_0%,#FFFFFF_60%)] blur-xs sm:h-[260px] sm:w-[280px]"
      />
      <div
        className="absolute right-[8%] top-[57%] h-[150px] w-[180px] rotate-149 rounded-full bg-[linear-gradient(180deg,#2998FF_0%,#FFFFFF_60%)] blur-lg sm:h-[190px] sm:w-[220px]"
      />
      <div
        className="absolute left-[40%] top-[52%] hidden h-[79px] w-[89px] rotate-[-161deg] rounded-full bg-[linear-gradient(180deg,#2998FF_0%,#FFFFFF_60.33%)] blur-[13.5px] min-[1100px]:block"
      />
      <div
        className="absolute left-[35%] top-[88%] hidden h-[79px] w-[89px] rotate-[-161deg] rounded-full bg-[linear-gradient(180deg,#2998FF_0%,#FFFFFF_60.33%)] blur-[13.5px] min-[1100px]:block"
      />
    </div>
  );
}
