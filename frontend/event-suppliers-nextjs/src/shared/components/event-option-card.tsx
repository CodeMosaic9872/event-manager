import Link from "next/link";

type EventOptionCardProps = {
  label: string;
  href: string;
  featured?: boolean;
  badgeText?: string;
  className?: string;
};

export function EventOptionCard({
  label,
  href,
  featured = false,
  badgeText,
  className = "",
}: EventOptionCardProps) {
  return (
    <Link
      href={href}
      className={`font-bold relative flex min-h-[104px] items-center justify-center rounded-[24px] border px-4 py-4 text-center text-[24px] leading-7 backdrop-blur-[6px] sm:px-8 sm:text-[28px] sm:leading-8 md:px-10 md:text-[30px] lg:text-[36px] ${
        featured
          ? "border-4 border-[#6AB7FF] bg-[#201C44] text-white! visited:text-white! hover:text-white! shadow-[0px_0px_20px_rgba(251,191,36,0.15)]"
          : "border-black/10 bg-black/3 text-black! visited:text-black! hover:text-black!"
      } ${className}`.trim()}
    >
      <span className="max-w-full wrap-break-word">{label}</span>
      {featured && badgeText ? (
        <span className="absolute right-2 top-2 max-w-[calc(100%-1rem)] truncate rounded-full border border-[#6AB7FF] bg-white/20 px-2 py-0.5 text-[10px] uppercase tracking-[0.5px] text-white sm:right-3 sm:top-3">
          {badgeText}
        </span>
      ) : null}
    </Link>
  );
}
