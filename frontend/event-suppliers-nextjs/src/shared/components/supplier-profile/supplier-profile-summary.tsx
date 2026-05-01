import type { ReactNode } from "react";

type SupplierProfileSummaryProps = {
  headline: string;
  subtitle: string;
  location: string;
  aboutTitle: string;
  aboutBody: string;
  contactIcons: ReactNode;
};

export function SupplierProfileSummary({
  headline,
  subtitle,
  location,
  aboutTitle,
  aboutBody,
  contactIcons,
}: SupplierProfileSummaryProps) {
  return (
    <>
      <div className="flex flex-col items-center gap-1 text-center">
        <h1 className="text-[28px] leading-8 text-black sm:text-[34px] sm:leading-8">{headline}</h1>
        <p className="text-lg leading-6 text-[#201C44]">{subtitle}</p>
        <p className="text-base leading-5 text-black">{location}</p>
      </div>

      <div className="mt-6 w-full">{contactIcons}</div>

      <h2 className="mt-10 text-center text-[26px] leading-7 text-[#201C44]">{aboutTitle}</h2>
      <p className="mx-auto mt-4 text-center text-base leading-[26px] text-black">{aboutBody}</p>
    </>
  );
}
