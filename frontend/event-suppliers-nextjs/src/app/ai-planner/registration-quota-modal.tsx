"use client";

import Link from "next/link";
import { useState } from "react";
import { MarketingModal, MARKETING_GRADIENT_SURFACE_CLASS } from "@/shared/components/marketing-modal";
import { marketingPloniFont } from "@/shared/lib/marketing-typography";

const NEXT = "/ai-planner";

type Props = {
  open: boolean;
  onClose: () => void;
  freeMessageLimit: number;
};

function ThankYouHeroIcon() {
  return (
    <div className="flex size-[60px] shrink-0 items-center justify-center rounded-full bg-[#201C44]">
      <svg width="26" height="26" viewBox="0 0 22 22" fill="none" aria-hidden>
        <path
          d="M6 9.5C6 7 8 5 10.5 5h4a2.5 2.5 0 012.5 2.5V11a3 3 0 01-3 3H11l-4 2.5V14a3 3 0 01-3-3V9.5z"
          stroke="white"
          strokeWidth="1.75"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
}

function GoogleGlyph({ className }: { className?: string }) {
  return (
    <svg className={className} width="20" height="20" viewBox="0 0 24 24" aria-hidden>
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

type ModalStep = "gate" | "thankYou";

export function RegistrationQuotaModal({ open, onClose, freeMessageLimit }: Props) {
  const [step, setStep] = useState<ModalStep>("gate");
  const [accountTab, setAccountTab] = useState<"user" | "provider">("user");
  const [loginMethod, setLoginMethod] = useState<"phone" | "email">("email");
  const [identity, setIdentity] = useState("");
  const [otp, setOtp] = useState(["", "", "", ""]);

  const loginHref = `/auth/login?next=${encodeURIComponent(NEXT)}`;

  return (
    <MarketingModal open={open} backdrop="dim" zClass="z-[100]" dir="ltr">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={step === "thankYou" ? "registration-thank-you-heading" : "registration-quota-heading"}
        className={`${MARKETING_GRADIENT_SURFACE_CLASS} relative box-border flex w-full max-w-[576px] shrink-0 flex-col overflow-y-auto overscroll-contain ${
          step === "thankYou"
            ? "min-h-[min(560px,calc(100dvh-2rem))] max-h-[min(560px,calc(100dvh-2rem))]"
            : "max-h-[min(1001px,calc(100dvh-2rem))]"
        }`}
        style={{ fontFamily: marketingPloniFont }}
      >
          <button
            type="button"
            onClick={onClose}
            className="absolute right-[21px] top-[21px] z-10 flex size-8 items-center justify-center text-[32px] leading-6 text-black"
            aria-label="Close"
          >
            ×
          </button>

          {step === "thankYou" ? (
            <div className="flex flex-col items-center px-6 pb-12 pt-[60px] text-center sm:px-8">
              <ThankYouHeroIcon />
              <div className="mt-8 flex max-w-[379px] flex-col items-center gap-8">
                <h2
                  id="registration-thank-you-heading"
                  className="max-w-[362px] text-[36px] font-normal leading-10 tracking-[-0.72px] text-black"
                >
                  Thank you for registering as a user!
                </h2>
                <p className="max-w-[379px] text-[18px] font-normal leading-[29px] text-black">
                  We are excited to plan unforgettable events with you, a whole world of suppliers and concepts
                  awaits you.
                </p>
              </div>
            </div>
          ) : (
          <div className="relative mx-auto flex w-full max-w-[382px] flex-col items-center px-6 pb-10 pt-14 text-center sm:px-0 sm:pb-12 sm:pt-16">
            {/* Main messaging */}
            <p className="max-w-[379px] text-[20px] font-normal leading-[29px] text-black">
              You have exceeded the message quota Planning with AI Chat, in order to continue you must
              register / log in to the system.
              <span className="mt-2 block text-[15px] leading-snug text-black/80">
                (Free limit: {freeMessageLimit} messages.)
              </span>
            </p>

            {/* Frame 77 — User / Provider */}
            <div className="relative mt-8 h-12 w-[244px] shrink-0 rounded-full bg-[#DDEDFF] p-[7px]">
              <div className="relative grid h-[35px] grid-cols-2 items-center text-[14px] leading-5">
                <button
                  type="button"
                  onClick={() => setAccountTab("user")}
                  className={`relative z-10 h-[35px] rounded-full transition-colors ${
                    accountTab === "user" ? "bg-[#201C44] text-white" : "text-black"
                  }`}
                >
                  User login
                </button>
                <button
                  type="button"
                  onClick={() => setAccountTab("provider")}
                  className={`relative z-10 h-[35px] rounded-full transition-colors ${
                    accountTab === "provider" ? "bg-[#201C44] text-white" : "text-black"
                  }`}
                >
                  Provider login
                </button>
              </div>
            </div>

            {/* Heading + subtitle (before Google per layout) */}
            <div className="mt-10 flex w-full max-w-[382px] flex-col items-center gap-3">
              <h2
                id="registration-quota-heading"
                className="text-[30px] font-normal leading-9 tracking-[-0.75px] text-black"
              >
                User login
              </h2>
              <p className="max-w-[348px] text-[16px] leading-6 text-black">
                Select your preferred login method to log in.
              </p>
            </div>

            <Link
              href={loginHref}
              className="mt-8 flex h-[50px] w-full max-w-[320px] items-center justify-center gap-3 rounded-xl border border-[#BDD8F4] bg-white px-4 text-[16px] leading-6 text-[#334155]"
            >
              <span>Sign in with Google</span>
              <GoogleGlyph />
            </Link>

            {/* Login method switcher */}
            <div className="mt-8 w-full max-w-[382px] rounded-2xl border border-black/10 bg-black/10 p-1.5 backdrop-blur-sm">
              <div className="grid grid-cols-2 gap-0 text-[14px] leading-5 text-black">
                <button
                  type="button"
                  onClick={() => setLoginMethod("phone")}
                  className={`relative z-1 flex h-10 items-center justify-center rounded-xl py-2.5 transition-colors ${
                    loginMethod === "phone" ? "bg-black/10" : ""
                  }`}
                >
                  Phone number
                </button>
                <button
                  type="button"
                  onClick={() => setLoginMethod("email")}
                  className={`relative z-0 flex h-10 items-center justify-center rounded-xl py-2.5 transition-colors ${
                    loginMethod === "email" ? "bg-black/10" : ""
                  }`}
                >
                  Email
                </button>
              </div>
            </div>

            {/* Input fields */}
            <div className="mt-6 flex w-full max-w-[382px] flex-col items-stretch gap-6">
              <div className="flex flex-col gap-2">
                <label className="pr-1 text-right text-[14px] leading-5 text-black">Email / Phone</label>
                <div className="relative">
                  <input
                    type="text"
                    value={identity}
                    onChange={(e) => setIdentity(e.target.value)}
                    placeholder="Enter your details"
                    className="box-border h-[58px] w-full rounded-xl border border-black/10 bg-white/5 py-[18px] pl-4 pr-12 text-right text-[16px] leading-[19px] text-black placeholder:text-black/50 outline-none"
                  />
                  <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-black" aria-hidden>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                      <path
                        d="M4 6h16v12H4V6zm0 0l8 6 8-6"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </span>
                </div>
              </div>

              <button
                type="button"
                className="flex h-14 w-full items-center justify-center rounded-[99px] bg-[#201C44] text-[24px] leading-6 text-white"
              >
                Getting a code
              </button>

              {/* OTP section (visible state) */}
              <div className="flex flex-col gap-4 border-t border-black/10 pt-4">
                <div className="flex flex-row-reverse items-center justify-between gap-4 text-[12px] leading-4">
                  <span className="text-[14px] leading-5 text-black">Enter verification code (OTP)</span>
                  <button type="button" className="text-[12px] text-[#201C44]">
                    Send again
                  </button>
                </div>
                <div className="flex justify-center gap-[29px]">
                  {otp.map((d, i) => (
                    <input
                      key={i}
                      inputMode="numeric"
                      maxLength={1}
                      value={d}
                      onChange={(e) => {
                        const v = e.target.value.replace(/\D/g, "").slice(0, 1);
                        const next = [...otp];
                        next[i] = v;
                        setOtp(next);
                      }}
                      className="box-border size-14 rounded-xl border border-black/10 bg-white text-center text-[20px] outline-none backdrop-blur-sm"
                    />
                  ))}
                </div>
              </div>

              <button
                type="button"
                onClick={() => setStep("thankYou")}
                className="flex h-[58px] w-full cursor-pointer items-center justify-center gap-2 rounded-[99px] border border-black/10 bg-black/10 text-[16px] leading-6 text-black"
              >
                Logging in to the system
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
                  <path
                    d="M5 12h14M13 6l6 6-6 6"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            </div>

            <p className="mt-auto pt-12 text-center text-[16px] leading-6 text-black">
              First time?{" "}
              <Link href={`/auth/register?next=${encodeURIComponent(NEXT)}`} className="underline">
                Register as a user / supplier
              </Link>
            </p>
          </div>
          )}
      </div>
    </MarketingModal>
  );
}
