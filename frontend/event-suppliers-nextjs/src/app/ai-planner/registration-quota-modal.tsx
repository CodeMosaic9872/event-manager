"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import { setCredentials } from "@/features/auth/auth-slice";
import { useRequestOtpMutation, useLoginMutation } from "@/shared/api/api";
import { MarketingModal, MARKETING_GRADIENT_SURFACE_CLASS } from "@/shared/components/marketing-modal";
import { HeAuth } from "@/shared/lib/he-ui";
import { marketingPloniFont } from "@/shared/lib/marketing-typography";
import { useAppDispatch } from "@/store/hooks";

const NEXT = "/ai-planner";
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE = /^(0\d{9}|\+972\d{9})$/;
const PURPOSE = "login" as const;

type Props = {
  open: boolean;
  onClose: () => void;
  freeMessageLimit: number;
};

function GoogleGlyph({ className }: { className?: string }) {
  return (
    <svg className={className} width="20" height="20" viewBox="0 0 24 24" aria-hidden>
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
    </svg>
  );
}

function validateContact(value: string, mode: "email" | "phone"): string | null {
  const trimmed = value.trim();
  if (!trimmed) return null;
  if (mode === "email" && !EMAIL_RE.test(trimmed)) return HeAuth.validEmail;
  if (mode === "phone" && !PHONE_RE.test(trimmed)) return HeAuth.validPhone;
  return null;
}

export function RegistrationQuotaModal({ open, onClose, freeMessageLimit }: Props) {
  const dispatch = useAppDispatch();
  const [requestOtp, { isLoading: isRequestingOtp }] = useRequestOtpMutation();
  const [login, { isLoading: isVerifyingOtp }] = useLoginMutation();

  const [accountTab, setAccountTab] = useState<"user" | "provider">("user");
  const [loginMethod, setLoginMethod] = useState<"phone" | "email">("email");
  const [identity, setIdentity] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [otpSent, setOtpSent] = useState(false);
  const [error, setError] = useState("");

  const contactError = useMemo(() => validateContact(identity, loginMethod), [identity, loginMethod]);
  const canRequestOtp = !isRequestingOtp && identity.trim().length > 0 && !contactError;

  const loginHref = `/auth/login?next=${encodeURIComponent(NEXT)}`;

  const handleRequestOtp = async () => {
    if (!canRequestOtp) return;
    setError("");
    try {
      await requestOtp({
        purpose: PURPOSE,
        ...(loginMethod === "email" ? { email: identity.trim() } : { phone: identity.trim() }),
      }).unwrap();
      setOtpSent(true);
    } catch {
      setError(HeAuth.otpSendFailed);
    }
  };

  const handleVerifyAndLogin = async () => {
    const otpCode = otp.join("");
    const loginIdentity = identity.trim();

    if (otpCode.length !== 6) {
      setError(HeAuth.enterOtp6);
      return;
    }

    setError("");
    try {
      const payload = await login({
        code: otpCode,
        ...(loginMethod === "email" ? { email: loginIdentity } : { phone: loginIdentity }),
      }).unwrap();
      const roles = payload.user.roles.map(
        (role) => role.toLowerCase() as "user" | "supplier" | "admin",
      );
      dispatch(
        setCredentials({
          user: { id: payload.user.id, email: payload.user.email, roles },
          accessToken: payload.accessToken,
          refreshToken: payload.refreshToken,
        }),
      );
      onClose();
    } catch {
      setError(HeAuth.loginFailed);
    }
  };

  return (
    <MarketingModal open={open} backdrop="dim" zClass="z-[100]" dir="rtl">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="registration-quota-heading"
        className={`${MARKETING_GRADIENT_SURFACE_CLASS} relative box-border flex w-full max-w-[576px] shrink-0 max-h-[min(1001px,calc(100dvh-2rem))] flex-col overflow-y-auto overscroll-contain [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden`}
        style={{ fontFamily: marketingPloniFont }}
      >
          <button
            type="button"
            onClick={onClose}
            className="absolute start-[21px] top-[21px] z-10 flex size-8 items-center justify-center text-[32px] leading-6 text-black"
            aria-label="סגירה"
          >
            ×
          </button>

          <div className="relative mx-auto flex w-full max-w-[382px] flex-col items-center px-6 pb-10 pt-14 text-center sm:px-0 sm:pb-12 sm:pt-16">
            <p className="max-w-[379px] text-[20px] font-normal leading-[29px] text-black">
              עברת את מכסת ההודעות תכנון בעזרת צ&apos;אט AI, על מנת להמשיך יש להירשם / להתחבר למערכת.
              <span className="mt-2 block text-[15px] leading-snug text-black/80">
                (מגבלה חינמית: {freeMessageLimit} הודעות)
              </span>
            </p>

            <div className="relative mt-8 h-12 w-[244px] shrink-0 rounded-full bg-[#DDEDFF] p-[7px]">
              <div className="relative grid h-[35px] grid-cols-2 items-center text-[14px] leading-5">
                <button
                  type="button"
                  onClick={() => setAccountTab("provider")}
                  className={`relative z-10 h-[35px] rounded-full transition-colors ${accountTab === "provider" ? "bg-[#201C44] text-white" : "text-black"}`}
                >
                  התחברות ספק
                </button>
                <button
                  type="button"
                  onClick={() => setAccountTab("user")}
                  className={`relative z-10 h-[35px] rounded-full transition-colors ${accountTab === "user" ? "bg-[#201C44] text-white" : "text-black"}`}
                >
                  התחברות משתמש
                </button>
              </div>
            </div>

            <div className="mt-10 flex w-full max-w-[382px] flex-col items-center gap-3">
              <h2 id="registration-quota-heading" className="text-[30px] font-bold leading-9 tracking-[-0.75px] text-black">
                {accountTab === "user" ? "כניסת משתמש" : "כניסת ספק"}
              </h2>
              <p className="max-w-[348px] text-[16px] leading-6 text-black">
              בחר את שיטת ההתחברות המועדפת עליך כדי להיכנס
              </p>
            </div>

            <Link
              href={loginHref}
              className="mt-8 flex h-[50px] w-full max-w-[320px] items-center justify-center gap-3 rounded-xl border border-[#BDD8F4] bg-white px-4 text-[16px] leading-6 text-[#334155]"
            >
              <GoogleGlyph />
              <span>התחברות באמצעות Google</span>
            </Link>

            <div className="mt-8 w-full max-w-[382px] rounded-2xl border border-black/10 bg-black/10 p-1.5 backdrop-blur-sm">
              <div className="grid grid-cols-2 gap-0 text-[14px] leading-5 text-black">
                <button
                  type="button"
                  onClick={() => setLoginMethod("email")}
                  className={`relative z-0 flex h-10 items-center justify-center rounded-xl py-2.5 transition-colors ${loginMethod === "email" ? "bg-black/10" : ""}`}
                >
                  אימייל
                </button>
                <button
                  type="button"
                  onClick={() => setLoginMethod("phone")}
                  className={`relative z-1 flex h-10 items-center justify-center rounded-xl py-2.5 transition-colors ${loginMethod === "phone" ? "bg-black/10" : ""}`}
                >
                  מספר טלפון
                </button>
              </div>
            </div>

            <div className="mt-6 flex w-full max-w-[382px] flex-col items-stretch gap-6">
              <div className="flex flex-col gap-2">
                <label className="ps-1 text-right text-[14px] leading-5 text-black">אימייל / טלפון</label>
                <div className="relative">
                  <input
                    type="text"
                    value={identity}
                    onChange={(e) => setIdentity(e.target.value)}
                    placeholder="הזן את הפרטים שלך"
                    maxLength={loginMethod === "phone" ? 13 : undefined}
                    className="box-border h-[58px] w-full rounded-xl border border-black/10 bg-white/5 py-[18px] pe-4 ps-12 text-right text-[16px] leading-[19px] text-black placeholder:text-black/50 outline-none"
                  />
                  <span className="pointer-events-none absolute start-4 top-1/2 -translate-y-1/2 text-black" aria-hidden>
                   <Image src="/icons/@-icon.svg" alt="" width={16} height={16} />
                  </span>
                </div>
                {contactError && identity.trim() ? (
                  <p className="pr-1 text-right text-xs text-red-600">{contactError}</p>
                ) : null}
              </div>

              <button
                type="button"
                onClick={handleRequestOtp}
                disabled={!canRequestOtp}
                className={`flex h-14 w-full items-center justify-center rounded-[99px] text-[24px] leading-6 text-white transition ${
                  canRequestOtp ? "cursor-pointer bg-[#201C44] hover:bg-[#151238]" : "cursor-not-allowed bg-[#201C44] opacity-60"
                }`}
              >
                {isRequestingOtp ? "שולח…" : otpSent ? "שלח שוב" : "קבלת קוד"}
              </button>

              <div className="flex flex-col gap-4 border-t border-black/10 pt-4">
                <div className="flex flex-row items-center justify-between gap-4 text-[12px] leading-4">
                  <button
                    type="button"
                    onClick={handleRequestOtp}
                    disabled={!canRequestOtp}
                    className="cursor-pointer text-[12px] text-[#201C44] hover:underline disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    שלח שוב
                  </button>
                  <span className="text-[14px] leading-5 text-black">הזן קוד אימות (OTP)</span>
                </div>
                <div className="flex justify-center gap-1 sm:gap-2">
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
                      className="box-border sm:size-14 size-12 rounded-xl border border-black/10 bg-white text-center text-[20px] outline-none backdrop-blur-sm"
                    />
                  ))}
                </div>
              </div>

              {error ? <p className="text-right text-sm text-red-600">{error}</p> : null}

              <button
                type="button"
                onClick={handleVerifyAndLogin}
                disabled={isVerifyingOtp}
                className={`flex h-[58px] w-full items-center justify-center gap-2 rounded-[99px] border text-[16px] leading-6 transition ${
                  isVerifyingOtp
                    ? "cursor-not-allowed border-black/10 bg-black/10 text-black"
                    : "cursor-pointer border-black/10 bg-black/10 text-black hover:bg-black/20"
                }`}
              >
                <Image src="/icons/go-to.svg" alt="" width={16} height={16} className="" />
                {isVerifyingOtp ? "מתחבר…" : "התחברות למערכת"}
              </button>
            </div>

            <p className="mt-auto pt-12 text-center text-[16px] leading-6 text-black">
              פעם ראשונה?{" "}
              <Link href={`/auth/register?next=${encodeURIComponent(NEXT)}`} className="underline font-bold">
                הירשם כמשתמש / כספק
              </Link>
            </p>
          </div>
      </div>
    </MarketingModal>
  );
}
