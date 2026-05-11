import type { ReactNode } from "react";

export type MarketingPageShellProps = {
  children: ReactNode;
  overlay?: ReactNode;
  showBackgroundImage?: boolean;
  dir?: "rtl" | "ltr";
  lang?: string;
  className?: string;
  contentClassName?: string;
};

const contentShellClasses =
  "relative z-10 mx-auto flex w-full max-w-[1440px] flex-col items-center px-4 pb-16 pt-20 sm:px-6 sm:pb-20 sm:pt-24 lg:pt-[123px]";

export function MarketingPageShell({
  children,
  overlay,
  showBackgroundImage: _bg,
  dir,
  lang,
  className = "",
  contentClassName = "",
}: MarketingPageShellProps) {
  return (
    <section
      className={`relative min-h-screen w-full overflow-x-hidden ${className}`.trim()}
      {...(dir !== undefined ? { dir } : {})}
      {...(lang !== undefined ? { lang } : {})}
    >
      {overlay}
      <div className={`${contentShellClasses} ${contentClassName}`.trim()}>{children}</div>
    </section>
  );
}
