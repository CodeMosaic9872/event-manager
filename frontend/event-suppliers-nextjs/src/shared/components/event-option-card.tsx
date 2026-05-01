import Link from "next/link";

type EventOptionCardProps = {
  label: string;
  href: string;
  featured?: boolean;
  badgeText?: string;
};

export function EventOptionCard({ label, href, featured = false, badgeText }: EventOptionCardProps) {
  return (
    <Link
      href={href}
      className={`relative flex h-[104px] items-center justify-center rounded-[24px] border px-10 text-center text-[30px] leading-8 backdrop-blur-[6px] lg:text-[36px] ${
        featured
          ? "border-4 border-[#6AB7FF] bg-[#201C44] text-white! visited:text-white! hover:text-white! shadow-[0px_0px_20px_rgba(251,191,36,0.15)]"
          : "border-black/10 bg-black/3 text-black! visited:text-black! hover:text-black!"
      }`}
    >
      {label}
      {featured && badgeText ? (
        <span className="absolute right-3 top-3 rounded-full border border-[#6AB7FF] bg-white/20 px-2 py-0.5 text-[10px] uppercase tracking-[0.5px] text-white">
          {badgeText}
        </span>
      ) : null}
    </Link>
  );
}
