"use client";

import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { SupplierAuthGlassCard } from "@/shared/components/supplier-auth/supplier-auth-glass-card";
import { MarketingPageShell } from "@/shared/components/marketing-page-shell";
import { marketingPloniFont } from "@/shared/lib/marketing-typography";

function GoogleMark() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden>
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
  );
}

export type SupplierAuthMarketingLayoutProps = {
  userTabHref: string;
  providerTabHref?: string;
  userTabLabel: string;
  providerTabLabel: string;
  activeTab?: "user" | "provider";
  heading: string;
  subheading: string;
  contactMode: "email" | "phone";
  onContactModeChange: (mode: "email" | "phone") => void;
  children: ReactNode;
};

/**
 * Shared full-page shell for supplier login / supplier register (Figma glass card + hero).
 * Keeps spacing, typography, toggle, Google CTA, and phone/email switcher identical.
 */
export function SupplierAuthMarketingLayout({
  userTabHref,
  providerTabHref = "/auth/login/supplier",
  userTabLabel,
  providerTabLabel,
  activeTab = "provider",
  heading,
  subheading,
  contactMode,
  onContactModeChange,
  children,
}: SupplierAuthMarketingLayoutProps) {
  return (
    <MarketingPageShell
      showBackgroundImage
      dir="rtl"
      lang="he"
    >
      <div
        className="mx-auto flex w-full max-w-[480px] flex-col px-4 pb-16 pt-12 sm:px-0"
        style={{ fontFamily: marketingPloniFont }}
      >
        <SupplierAuthGlassCard className="flex w-full min-h-[min(797px,calc(100vh-180px))] flex-col px-[24px] pb-10 pt-6 sm:px-[49px] sm:pt-5">
          <div
            className="flex min-h-0 flex-1 flex-col items-center"
            dir="ltr"
            lang="en"
          >
            <div className="mb-6 w-[300px] rounded-full bg-[#D3E2F5] p-1">
              <div className="grid grid-cols-2 gap-0 text-center text-[14px] leading-5">
                {activeTab === "user" ? (
                  <span className="rounded-full bg-[#201C44] py-2 text-white">
                    {userTabLabel}
                  </span>
                ) : (
                  <Link
                    href={userTabHref}
                    className="rounded-full py-2 text-black transition hover:bg-white/40"
                  >
                    {userTabLabel}
                  </Link>
                )}
                {activeTab === "provider" ? (
                  <span className="rounded-full bg-[#201C44] py-2 text-white">
                    {providerTabLabel}
                  </span>
                ) : (
                  <Link
                    href={providerTabHref}
                    className="rounded-full py-2 text-black transition hover:bg-white/40"
                  >
                    {providerTabLabel}
                  </Link>
                )}
              </div>
            </div>

            <div className="mb-6 flex w-full max-w-[382px] flex-col items-center gap-3 text-center">
              <h1 className="text-[30px] font-semibold leading-9 tracking-tight text-[#1E1B4B]">
                {heading}
              </h1>
              <p className="text-[16px] font-normal leading-6 text-[#64748B]">
                {subheading}
              </p>
            </div>

            <button
              type="button"
              className="mb-6 flex h-[50px] w-full max-w-[320px] flex-row items-center justify-center gap-3 rounded-xl border border-[#CBD5E1] bg-white px-4 text-[16px] font-normal leading-6 text-[#334155] transition hover:bg-slate-50"
            >
              <span>Sign in with Google</span>
              <GoogleMark />
            </button>

            <div className="mb-4 flex h-[54px] w-full max-w-[382px] flex-row items-stretch rounded-2xl border border-black/10 bg-black/10 p-1.5 backdrop-blur-sm">
              <button
                type="button"
                onClick={() => onContactModeChange("phone")}
                className={`flex flex-1 items-center justify-center rounded-xl py-2.5 text-[14px] leading-5 transition ${
                  contactMode === "phone"
                    ? "bg-black/10 text-black"
                    : "text-black hover:bg-black/5"
                }`}
              >
                Phone number
              </button>
              <button
                type="button"
                onClick={() => onContactModeChange("email")}
                className={`flex flex-1 items-center justify-center rounded-xl py-2.5 text-[14px] leading-5 transition ${
                  contactMode === "email"
                    ? "bg-black/10 text-black"
                    : "text-black hover:bg-black/5"
                }`}
              >
                Email
              </button>
            </div>

            <div className="flex w-full flex-col items-center">{children}</div>
          </div>
        </SupplierAuthGlassCard>
      </div>
    </MarketingPageShell>
  );
}

/** Mail icon suffix used on the primary contact field (matches supplier login). */
export function SupplierAuthMailIcon() {
  return (
    <span className="pointer-events-none absolute inset-e-4 top-1/2 -translate-y-1/2">
      <Image
        src="/mail.svg"
        alt=""
        width={20}
        height={20}
        className="opacity-80"
        unoptimized
      />
    </span>
  );
}
