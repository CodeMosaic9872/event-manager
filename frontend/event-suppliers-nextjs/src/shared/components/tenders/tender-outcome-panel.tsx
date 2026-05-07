"use client";

import Image from "next/image";
import Link from "next/link";
import { marketingPloniFont } from "@/shared/lib/marketing-typography";
import { useAppSelector } from "@/store/hooks";

const PANEL_CLASS =
  "mx-auto w-full max-w-[576px] rounded-[24px] border border-[rgba(134,85,246,0.2)] bg-[rgba(71,33,223,0.07)] px-8 pb-10 pt-8 text-center shadow-[0px_8px_32px_rgba(0,0,0,0.37)] backdrop-blur-[6px]";

export type TenderOutcomePanelProps = {
  title: string;
  description: string;
  primaryHref: string;
  primaryLabel: string;
  /** Defaults to user vs supplier dashboard */
  secondaryHref?: string;
  secondaryLabel?: string;
  footerHelpLine?: string;
};

export function TenderOutcomePanel({
  title,
  description,
  primaryHref,
  primaryLabel,
  secondaryHref: secondaryHrefProp,
  secondaryLabel = "To my dashboard",
  footerHelpLine = "Need help? Our team is here for you.",
}: TenderOutcomePanelProps) {
  const user = useAppSelector((state) => state.auth.user);
  const dashboardHref =
    user?.roles.includes("supplier") || user?.roles.includes("admin")
      ? "/supplier/dashboard"
      : "/user/dashboard";
  const secondaryHref = secondaryHrefProp ?? dashboardHref;

  return (
    <article className={PANEL_CLASS} style={{ fontFamily: marketingPloniFont }}>
      <div className="mx-auto mb-4 flex size-[60px] items-center justify-center">
        <Image src="/submitted.svg" alt="" width={60} height={60} unoptimized />
      </div>
      <h1 className="mx-auto max-w-[379px] text-balance text-[36px] font-normal leading-10 tracking-[-0.72px] text-[#00113A]">
        {title}
      </h1>
      <p className="mx-auto mt-4 max-w-[379px] text-balance text-[18px] leading-[29px] text-[#444650]">
        {description}
      </p>

      <div className="mx-auto mt-8 flex w-full max-w-[379px] flex-col gap-4">
        <Link
          href={primaryHref}
          className="inline-flex h-14 w-full items-center justify-center gap-2 rounded-[99px] bg-[#201C44] px-8 text-center text-base leading-6 text-white!"
        >
          {primaryLabel}
          <Image src="/left-arrow.svg" alt="" width={14} height={14} className="brightness-0 invert" unoptimized />
        </Link>

        <Link
          href={secondaryHref}
          className="inline-flex h-14 w-full items-center justify-center gap-2 rounded-[4px] px-8 text-center text-base leading-6 text-[#00113A]"
        >
          {secondaryLabel}
          <Image src="/dashboard.svg" alt="" width={15} height={15} className="brightness-0 saturate-100" unoptimized />
        </Link>
      </div>

      <div className="mx-auto mt-6 w-full max-w-[379px] border-t border-[rgba(197,198,210,0.2)] pt-4">
        <p className="text-xs leading-4 text-[rgba(68,70,80,0.6)]">{footerHelpLine}</p>
        <Link href="/contact-us" className="text-xs leading-4 text-[#0061A7] hover:underline">
          Contact us
        </Link>
      </div>
    </article>
  );
}
