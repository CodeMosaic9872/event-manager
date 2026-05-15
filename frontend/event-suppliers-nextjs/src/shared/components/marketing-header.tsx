"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { logout } from "@/features/auth/auth-slice";

type NavItem = { href: string; activePath: string; label: string; exact?: boolean };

const DESKTOP_LINKS: NavItem[] = [
  { href: "/jobs", activePath: "/jobs", label: "הצעות עבודה" },
  { href: "/event-production/concepts", activePath: "/event-production", label: "קונספטים" },
  { href: "/ai-planner", activePath: "/ai-planner", label: "תכנון עם AI" },
  { href: "/marketplace", activePath: "/marketplace", label: "ספקים" },
  { href: "/", activePath: "/", label: "בית", exact: true },
];

const MOBILE_LINKS: NavItem[] = [
  { href: "/jobs", activePath: "/jobs", label: "הצעות עבודה" },
  { href: "/marketplace", activePath: "/marketplace", label: "ספקים" },
  { href: "/", activePath: "/", label: "בית", exact: true },
];

function navLinkClass(active: boolean, extra = "") {
  return active
    ? `font-semibold text-[#1e1b4b] ${extra}`
    : `text-[#101426] visited:text-[#101426] hover:text-[#4721DF] ${extra}`;
}

function linkIsActive(pathname: string, item: NavItem): boolean {
  if (item.exact) return pathname === item.activePath;
  return pathname === item.activePath || pathname.startsWith(`${item.activePath}/`);
}

/** Top marketing navigation — LTR bar: logo left, links center, login / supplier CTA right. */
export function MarketingHeader() {
  const user = useAppSelector((state) => state.auth.user);
  const dispatch = useAppDispatch();
  const pathname = usePathname();

  return (
    <header
      dir="ltr"
      lang="he"
      className="absolute left-0 top-0 z-50 w-full bg-transparent"
    >
      <nav className="relative mx-auto hidden h-[84px] w-full max-w-[1440px] px-4 lg:block lg:px-6">
        <div className="relative mx-auto flex h-20 max-w-[1395px] items-center">
          <Link
            href="/"
            className={`relative z-10 text-xl font-normal leading-none text-[#1e1b4b] md:text-2xl ${navLinkClass(pathname === "/")}`}
          >
            לוגו
          </Link>

          <div className="absolute left-1/2 top-1/2 z-10 flex -translate-x-1/2 -translate-y-1/2 flex-wrap items-center justify-center gap-x-5 gap-y-1 text-[15px] leading-snug text-[#101426] md:gap-x-7 md:text-[17px]">
            {DESKTOP_LINKS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={navLinkClass(linkIsActive(pathname, item), "whitespace-nowrap px-0.5 py-1")}
              >
                {item.label}
              </Link>
            ))}
          </div>

          <div className="relative z-10 ms-auto flex h-[39px] items-center gap-3 md:gap-4">
            {user ? (
              <>
                <Link
                  href="/supplier/dashboard"
                  className="flex flex-row items-center gap-3 rounded-full border border-[#4721DF] py-1 pe-3 ps-1 text-sm text-[#4721DF] transition hover:opacity-90"
                  style={{ fontFamily: "PloniMLv2AAA-Regular, var(--font-assistant), system-ui, sans-serif" }}
                >
                  <span className="flex size-8 shrink-0 items-center justify-center rounded-full border border-[rgba(137,90,246,0.4)] bg-[rgba(137,90,246,0.2)]">
                    {user.avatarImageUrl ? (
                      <img src={user.avatarImageUrl} alt="" className="size-[30px] rounded-full object-cover" />
                    ) : (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="#4721DF" aria-hidden>
                        <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v1.2c0 .66.54 1.2 1.2 1.2h16.8c.66 0 1.2-.54 1.2-1.2v-1.2c0-3.2-6.4-4.8-9.6-4.8z" />
                      </svg>
                    )}
                  </span>
                  <span>{user.email ? `שלום, ${user.email.split("@")[0]}` : "שלום"}</span>
                </Link>
                <button
                  type="button"
                  className="flex h-[39px] items-center justify-center rounded-[99px] border border-[#6ab7ff] bg-[#e0edff] px-4 text-center text-sm leading-tight text-[#1e1b4b] transition hover:bg-[#d2e4fc]"
                  onClick={() => dispatch(logout())}
                >
                  התנתקות
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/join-supplier"
                  className="flex h-[39px] items-center justify-center rounded-[99px] border border-[#4721DF] px-4 text-center text-sm leading-tight text-[#4721DF]! visited:text-[#4721DF]! transition hover:bg-[#d2e4fc]"
                >
                  הצטרפות כספק
                </Link>
                <Link
                  href="/auth/login"
                  className="flex items-center text-base font-normal text-[#4721DF]! visited:text-[#4721DF]! underline-offset-4 hover:text-[#4721DF] hover:underline md:text-lg"
                >
                  התחברות
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      <nav className="mx-auto flex w-full max-w-[1440px] items-center justify-between gap-2 px-4 py-2 lg:hidden">
        <Link
          href="/"
          className={`text-base font-semibold tracking-wide ${navLinkClass(pathname === "/")}`}
        >
          לוגו
        </Link>
        <div className="flex max-w-[65vw] flex-wrap items-center justify-end gap-x-2 gap-y-1 text-xs">
          {MOBILE_LINKS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={navLinkClass(linkIsActive(pathname, item), "text-[#2d3255]")}
            >
              {item.label}
            </Link>
          ))}
          {!user ? (
            <>
              <Link href="/auth/login" className="text-[#4721DF]">
                התחברות
              </Link>
              <Link
                href="/join-supplier"
                className="rounded-full border border-[#6ab7ff] bg-[#e0edff] px-2 py-1 text-[#1e1b4b]"
              >
                הצטרפות
              </Link>
            </>
          ) : (
            <>
              <Link
                href="/profile"
                className="rounded-full border border-[#201C44] px-2 py-1 text-[#201C44]"
              >
                פרופיל
              </Link>
              <button
                type="button"
                className="rounded-full border border-[#4721DF] px-2 py-1 text-[#4721DF]"
                onClick={() => dispatch(logout())}
              >
                התנתקות
              </button>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}
