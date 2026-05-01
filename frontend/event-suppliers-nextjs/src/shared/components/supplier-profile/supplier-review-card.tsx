type SupplierReviewCardProps = {
  author: string;
  dateLabel: string;
  body: string;
  badgeLabel?: string;
};

export function SupplierReviewCard({ author, dateLabel, body, badgeLabel }: SupplierReviewCardProps) {
  return (
    <article className="flex w-full max-w-[1360px] flex-col gap-2 rounded-xl border border-[#F1F5F9] bg-white p-4 shadow-[0px_1px_2px_rgba(0,0,0,0.05)]">
      <div className="flex w-full items-start justify-between gap-4">
        <div className="flex items-center gap-2">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-[#6AB7FF] text-sm font-semibold text-[#4721DF]">
            {badgeLabel ?? "★"}
          </div>
          <div className="text-right">
            <p className="text-sm leading-5 text-[#0F172A]">{author}</p>
            <p className="text-xs leading-4 text-[#64748B]">{dateLabel}</p>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-1">
          {Array.from({ length: 5 }).map((_, i) => (
            <span key={i} className="text-[10px] leading-3 text-[#4721DF]" aria-hidden>
              ★
            </span>
          ))}
        </div>
      </div>

      <p className="w-full text-right text-sm leading-5 text-[#475569]">{body}</p>
    </article>
  );
}
