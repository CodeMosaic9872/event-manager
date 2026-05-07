"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { MarketingGradientSurface } from "@/shared/components/marketing-modal";
import { MarketingPageShell } from "@/shared/components/marketing-page-shell";
import { marketingPloniFont } from "@/shared/lib/marketing-typography";

const SUPPLIER_CATEGORIES = [
  "Music & DJ",
  "Catering",
  "Photography & video",
  "Venues",
  "Design & branding",
  "Attractions",
  "Other",
] as const;

/** RTL inputs: pill, icon on inline-start (physical right); text anchored right. */
const inputShell =
  "box-border h-[52px] w-full rounded-full border border-[#1E293B]/22 bg-white py-3 ps-11 pe-4 text-right text-[16px] text-[#0f172a] shadow-[inset_0_1px_2px_rgba(15,23,42,0.04)] outline-none placeholder:text-[#94A3B8] focus:border-[#201C44]/35 focus:ring-2 focus:ring-[#6AB7FF]/40";

const inputShellPlain =
  "box-border h-[52px] w-full rounded-full border border-[#1E293B]/22 bg-white px-4 py-3 text-right text-[16px] text-[#0f172a] shadow-[inset_0_1px_2px_rgba(15,23,42,0.04)] outline-none placeholder:text-[#94A3B8] focus:border-[#201C44]/35 focus:ring-2 focus:ring-[#6AB7FF]/40";

export default function JoinSupplierPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [category, setCategory] = useState<string>(SUPPLIER_CATEGORIES[0]);
  const [businessName, setBusinessName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");

  const handleContinue = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    try {
      sessionStorage.setItem(
        "supplierJoinStep1",
        JSON.stringify({ fullName, category, businessName, phone, email }),
      );
    } catch {
      /* ignore quota / private mode */
    }
    router.push("/join-supplier/step-2");
  };

  return (
    <MarketingPageShell showBackgroundImage dir="rtl" lang="he">
      <div className="mx-auto flex w-full max-w-[720px] flex-col items-stretch">
        {/* Progress — RTL: 25% inline-start; fill grows from the right */}
        <div
          className="mb-8 w-full px-1"
          style={{ fontFamily: marketingPloniFont }}
        >
          <div className="mb-3 flex items-end justify-between gap-4">
            <div className="text-right">
              <p className="text-[11px] font-medium uppercase tracking-wide text-[#64748B] sm:text-xs">
                Step 1 of 4
              </p>
              <p className="mt-1 pb-1 text-[18px] font-medium leading-tight text-[#201C44] sm:text-[22px]">
                Basic details
              </p>
            </div>
            <span className="text-[22px] font-medium tabular-nums text-[#8656F6] sm:text-[26px]">
              25%
            </span>
          </div>
          <div
            className="flex h-2 w-full overflow-hidden rounded-full bg-[#E2E8F0]"
            dir="rtl"
          >
            <div className="h-full w-1/4 rounded-full bg-[#8656F6]" />
          </div>
        </div>

        {/* Registration card */}
        <MarketingGradientSurface
          className="box-border mx-auto w-full max-w-[576px] px-6 py-10 sm:px-10 sm:py-12"
          style={{ fontFamily: marketingPloniFont }}
        >
          <div className="text-center">
            <h1 className="text-[28px] font-normal leading-tight tracking-tight text-[#201C44] sm:text-[34px]">
              Join our supplier network
            </h1>
            <p className="mt-3 text-[15px] leading-relaxed text-[#475569] sm:text-[16px]">
              Fill in the basic details to begin the registration process.
            </p>
          </div>

          <form
            className="mt-10 flex flex-col gap-6"
            dir="rtl"
            onSubmit={handleContinue}
          >
            <label className="flex flex-col gap-2">
              <span className="text-right text-[14px] font-medium leading-5 text-[#0f172a]">
                Full name
              </span>
              <div className="relative">
                <input
                  required
                  autoComplete="name"
                  placeholder="Full name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className={inputShell}
                />
                <span
                  className="pointer-events-none absolute top-1/2 inset-s-3 -translate-y-1/2 text-[#475569]"
                  aria-hidden
                >
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.75"
                  >
                    <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                </span>
              </div>
            </label>

            {/* RTL grid: first column = inline-start = physical right → Business name first */}
            <div className="grid gap-6 sm:grid-cols-2">
              <label className="flex flex-col gap-2">
                <span className="text-right text-[14px] font-medium leading-5 text-[#0f172a]">
                  Business name
                </span>
                <input
                  required
                  autoComplete="organization"
                  placeholder="Your business name"
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  className={inputShellPlain}
                />
              </label>
              <label className="flex flex-col gap-2">
                <span className="text-right text-[14px] font-medium leading-5 text-[#0f172a]">
                  category
                </span>
                <div className="relative">
                  <select
                    required
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="box-border h-[52px] w-full appearance-none rounded-full border border-[#1E293B]/22 bg-[#334155] py-3 ps-4 pe-10 text-right text-[14px] text-white shadow-[inset_0_1px_2px_rgba(0,0,0,0.12)] outline-none focus:border-white/20 focus:ring-2 focus:ring-[#6AB7FF]/40"
                  >
                    {SUPPLIER_CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                  {/* Chevron on inline-end = physical left in RTL */}
                  <span
                    className="pointer-events-none absolute top-1/2 inset-e-3 -translate-y-1/2 text-white"
                    aria-hidden
                  >
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path
                        d="M6 9l6 6 6-6"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </span>
                </div>
              </label>
            </div>

            <div className="grid gap-6 sm:grid-cols-2">
              <label className="flex flex-col gap-2">
                <span className="text-right text-[14px] font-medium leading-5 text-[#0f172a]">
                  Email
                </span>
                <div className="relative">
                  <input
                    required
                    type="email"
                    autoComplete="email"
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    dir="ltr"
                    className={`${inputShell} text-end font-mono text-[15px]`}
                  />
                  <span
                    className="pointer-events-none absolute top-1/2 inset-s-3 -translate-y-1/2 text-[#475569]"
                    aria-hidden
                  >
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.75"
                    >
                      <path
                        d="M4 6h16v12H4V6zm0 0l8 6 8-6"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </span>
                </div>
              </label>
              <label className="flex flex-col gap-2">
                <span className="text-right text-[14px] font-medium leading-5 text-[#0f172a]">
                  Phone number
                </span>
                <div className="relative">
                  <input
                    required
                    type="tel"
                    autoComplete="tel"
                    placeholder="050-0000000"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    dir="ltr"
                    className={`${inputShell} text-end font-mono text-[15px]`}
                  />
                  <span
                    className="pointer-events-none absolute top-1/2 inset-s-3 -translate-y-1/2 text-[#475569]"
                    aria-hidden
                  >
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.75"
                    >
                      <rect x="5" y="2" width="14" height="20" rx="2" />
                      <path d="M12 18h.01" strokeLinecap="round" />
                    </svg>
                  </span>
                </div>
              </label>
            </div>

            <button
              type="submit"
              className="mt-2 flex h-[56px] w-full flex-row items-center justify-center gap-3 rounded-full bg-[#201C44] px-6 text-[17px] font-medium text-white shadow-[0_10px_28px_rgba(32,28,68,0.38)] transition hover:bg-[#151238] hover:shadow-[0_12px_32px_rgba(32,28,68,0.42)]"
            >
              <span>Continue to the next step</span>
              <span
                className="block h-5 w-6 shrink-0 rotate-180 bg-white mask-[url(/right_arrow.svg)] mask-contain mask-center mask-no-repeat"
                aria-hidden
              />
            </button>

            <p
              className="text-center text-[13px] leading-snug text-[#64748B]"
              dir="ltr"
              lang="en"
            >
              By clicking Continue, you agree to our{" "}
              <Link
                href="/contact-us"
                className="underline! decoration-[#201C44] underline-offset-2"
              >
                Terms of Use
              </Link>
              .
            </p>
          </form>
        </MarketingGradientSurface>
      </div>
    </MarketingPageShell>
  );
}
