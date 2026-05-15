import { marketingPloniFont } from "@/shared/lib/marketing-typography";

export function SupplierJoinProgress({
  percent,
  stepLabel,
  title,
}: {
  percent: number;
  stepLabel: string;
  title: string;
}) {
  const clamped = Math.min(100, Math.max(0, percent));

  return (
    <div
      className="mb-8 w-full px-1"
      style={{ fontFamily: marketingPloniFont }}
    >
      <div className="mb-3 flex items-end justify-between gap-4" dir="rtl">
        <span className="shrink-0 text-[16px] font-normal tabular-nums leading-6 text-[#4721DF]">
          {clamped}%
        </span>
        <div className="min-w-0 text-right">
          <p className="text-[14px] font-bold leading-5 text-[#4721DF]">
            {stepLabel}
          </p>
          <h1 className="mt-1 pb-1 text-[28px] font-bold leading-7 text-black sm:text-[30px]">
            {title}
          </h1>
        </div>
      </div>
      <div
        className="flex h-2 w-full overflow-hidden rounded-full bg-[#C4DFEA]"
        dir="ltr"
      >
        <div
          className="h-full rounded-full bg-[#4721DF]"
          style={{ width: `${clamped}%` }}
        />
      </div>
    </div>
  );
}
