"use client";

import Link from "next/link";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { logout } from "@/features/auth/auth-slice";

export function MainNav() {
  const user = useAppSelector((state) => state.auth.user);
  const dispatch = useAppDispatch();

  return (
    <header className="absolute left-0 top-0 z-50 w-full">
      <nav className="mx-auto hidden h-[84px] w-full max-w-[1440px] px-6 lg:block">
        <div className="mx-auto flex h-20 w-full max-w-[1395px] items-center justify-between">
          

        <div className="flex h-[39px] items-center justify-end gap-0">
            {user ? (
              <button
                type="button"
                className="h-[39px] rounded-[99px] border border-[#4721DF] px-4 text-sm leading-[14px] text-[#4721DF]"
                onClick={() => dispatch(logout())}
              >
                התנתקות
              </button>
            ) : (
              <>
                <Link href="/auth/login" className="flex h-[39px] w-[81px] items-center text-lg leading-[29px] text-[#4721DF]">
                  התחברות
                </Link>
                <Link
                  href="/auth/register"
                  className="flex h-[39px] w-[139px] items-center justify-center rounded-[99px] border border-[#4721DF] text-center text-sm leading-[14px] text-[#4721DF]"
                >
                  הצטרף כספק
                </Link>
              </>
            )}
          </div>
          <div className="flex h-[49px] items-center justify-center gap-6 text-xl leading-[29px]">
          <Link href="/contact-us" className="flex h-[49px] min-w-[71px] items-center justify-center px-2.5 text-center text-black! visited:text-black! hover:text-black!">
              צור קשר
            </Link>
            <Link href="/marketplace" className="flex h-[49px] min-w-[77px] items-center justify-center px-2.5 text-center text-black! visited:text-black! hover:text-black!">
              ספקים
            </Link>
            <Link href="/ai-planner" className="flex h-[49px] min-w-[110px] items-center justify-center px-2.5 text-center text-black! visited:text-black! hover:text-black!">
              תכנון עם AI
            </Link>
            <Link
              href="/event-production/supplier-categories"
              className="flex h-[49px] min-w-[97px] items-center justify-center px-2.5 text-center text-black! visited:text-black! hover:text-black!"
            >
              קונספטים
            </Link>
            <Link href="/jobs" className="flex h-[49px] min-w-[129px] items-center justify-center px-2.5 text-center text-black! visited:text-black! hover:text-black!">
              הצעות עבודה
            </Link>
          </div>

          <Link
            href="/"
            className="flex h-[29px] items-center text-center text-2xl font-normal leading-[29px] text-[#4721DF]"
          >
            LOGO
          </Link>
        </div>
      </nav>

      <nav className="mx-auto flex w-full max-w-[1440px] items-center justify-between px-4 py-2 lg:hidden">
        <Link href="/" className="text-base font-semibold tracking-wide text-[#4721DF]">
          LOGO
        </Link>
        <div className="flex items-center gap-3 text-xs text-[#2d3255]">
          <Link href="/contact-us">צור קשר</Link>
          <Link href="/marketplace">ספקים</Link>
          {!user ? (
            <>
              <Link href="/auth/login" className="text-[#4721DF]">
                התחברות
              </Link>
              <Link href="/auth/register" className="rounded-full border border-[#4721DF] px-2 py-1 text-[#4721DF]">
                הצטרפות
              </Link>
            </>
          ) : (
            <button
              type="button"
              className="rounded-full border border-[#4721DF] px-2 py-1 text-[#4721DF]"
              onClick={() => dispatch(logout())}
            >
              התנתקות
            </button>
          )}
        </div>
      </nav>
    </header>
  );
}
