"use client";

import Image from "next/image";
import Link from "next/link";
import { FormEvent, Suspense, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { setCredentials } from "@/features/auth/auth-slice";
import { useLoginMutation, useRequestOtpMutation, useVerifyOtpMutation } from "@/shared/api/api";
import { supplierAuthContactInputClass } from "@/shared/components/supplier-auth/supplier-auth-glass-card";
import {
  SupplierAuthMailIcon,
  SupplierAuthMarketingLayout,
} from "@/shared/components/supplier-auth/supplier-auth-marketing-layout";
import {
  getPostLoginFallbackPath,
  getSafeInternalRedirectPath,
} from "@/shared/lib/safe-redirect-path";
import { useAppDispatch } from "@/store/hooks";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE = /^(0\d{9}|\+972\d{9})$/;
const PURPOSE = "login" as const;

function validateContact(value: string, mode: "email" | "phone"): string | null {
  const trimmed = value.trim();
  if (!trimmed) return "Please enter your email or phone number.";
  if (mode === "email" && !EMAIL_RE.test(trimmed)) return "Please enter a valid email address.";
  if (mode === "phone" && !PHONE_RE.test(trimmed)) return "Please enter a valid Israeli phone number (05XXXXXXXX or +972XXXXXXXXX).";
  return null;
}

function LoginForm() {
  const dispatch = useAppDispatch();
  const [login, { isLoading: isLoggingIn }] = useLoginMutation();
  const [requestOtp, { isLoading: isRequestingOtp }] = useRequestOtpMutation();
  const [verifyOtp, { isLoading: isVerifyingOtp }] = useVerifyOtpMutation();
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextParam = searchParams.get("next");
  const supplierLoginHref = nextParam
    ? `/auth/login/supplier?next=${encodeURIComponent(nextParam)}`
    : "/auth/login/supplier";
  const [contact, setContact] = useState("");
  const [contactMode, setContactMode] = useState<"email" | "phone">("email");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [otpSent, setOtpSent] = useState(false);
  const [error, setError] = useState("");

  const contactError = useMemo(() => validateContact(contact, contactMode), [contact, contactMode]);
  const canRequestOtp = !isRequestingOtp && contact.trim().length > 0 && !contactError;

  const handleRequestOtp = async () => {
    if (!canRequestOtp) return;
    setError("");
    try {
      await requestOtp({ phone: contact.trim(), purpose: PURPOSE }).unwrap();
      setOtpSent(true);
    } catch {
      setError("Failed to send verification code. Please try again.");
    }
  };

  const otpComplete = otp.every((digit) => digit.length === 1);

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    const otpCode = otp.join("");
    const loginIdentity = contact.trim();

    if (!loginIdentity) {
      setError("Please enter your email or phone number.");
      return;
    }
    if (otpCode.length !== 6) {
      setError("Please enter a 6-digit verification code.");
      return;
    }

    try {
      await verifyOtp({ phone: loginIdentity, code: otpCode, purpose: PURPOSE }).unwrap();
    } catch {
      setError("Invalid verification code. Please try again.");
      return;
    }

    try {
      const payload = await login({ email: loginIdentity, phone: loginIdentity }).unwrap();
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
      router.push(
        getSafeInternalRedirectPath(nextParam, getPostLoginFallbackPath(roles)),
      );
    } catch {
      setError("Login failed. Please try again.");
    }
  };

  const setOtpDigit = (index: number, value: string) => {
    const v = value.replace(/\D/g, "").slice(-1);
    const nextOtp = [...otp];
    nextOtp[index] = v;
    setOtp(nextOtp);
    if (v && index < 5) {
      document.getElementById(`user-otp-${index + 1}`)?.focus();
    }
  };

  const isLoading = isRequestingOtp || isVerifyingOtp || isLoggingIn;

  return (
    <SupplierAuthMarketingLayout
      userTabHref="/auth/login"
      providerTabHref={supplierLoginHref}
      userTabLabel="User login"
      providerTabLabel="Provider login"
      activeTab="user"
      heading="User login"
      subheading="Choose your preferred login method to log into our platform."
      contactMode={contactMode}
      onContactModeChange={setContactMode}
    >
      <form
        className="flex w-full max-w-[382px] flex-col gap-6"
        onSubmit={onSubmit}
      >
        <div className="flex flex-col gap-2">
          <label className="w-full pe-1 text-right text-[14px] leading-5 text-black">
            Email / Phone
          </label>
          <div className="relative">
            <input
              className={supplierAuthContactInputClass}
              placeholder="Enter your details"
              value={contact}
              onChange={(event) => setContact(event.target.value)}
              autoComplete={contactMode === "email" ? "email" : "tel"}
              maxLength={contactMode === "phone" ? 13 : undefined}
            />
            <SupplierAuthMailIcon />
          </div>
          {contactError && contact.trim() ? (
            <p className="pe-1 text-right text-xs text-red-600">{contactError}</p>
          ) : null}
        </div>

        <button
          type="button"
          onClick={handleRequestOtp}
          disabled={!canRequestOtp}
          className={`flex h-14 w-full flex-col items-center justify-center rounded-[99px] px-4 text-[24px] font-normal leading-6 text-white transition ${
            canRequestOtp
              ? "cursor-pointer bg-[#201C44] hover:bg-[#151238]"
              : "cursor-not-allowed bg-[#201C44] opacity-60"
          }`}
        >
          {isRequestingOtp ? "Sending..." : otpSent ? "Send again" : "Getting a code"}
        </button>

        <div className="flex w-full flex-col gap-4 border-t border-black/10 pt-4">
          <div className="flex w-full flex-row items-center justify-between gap-4">
            <button
              type="button"
              onClick={handleRequestOtp}
              disabled={!canRequestOtp}
              className="shrink-0 cursor-pointer text-left text-[12px] leading-4 text-[#201C44] hover:underline disabled:cursor-not-allowed disabled:opacity-50"
            >
              Send again
            </button>
            <span className="text-right text-[14px] leading-5 text-black">
              Enter verification code (OTP)
            </span>
          </div>
          <div className="flex w-full flex-row justify-center gap-2">
            {otp.map((digit, index) => (
              <input
                key={index}
                id={`user-otp-${index}`}
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(event) => setOtpDigit(index, event.target.value)}
                className="box-border size-14 rounded-xl border border-black/10 bg-white text-center text-[18px] tabular-nums outline-none backdrop-blur-sm focus:ring-2 focus:ring-[#4721DF]/30"
                aria-label={`Digit ${index + 1}`}
              />
            ))}
          </div>
        </div>

        {error ? <p className="text-right text-sm text-red-700">{error}</p> : null}

        <button
          type="submit"
          disabled={!otpComplete || isLoading}
          className={`flex h-[58px] w-full flex-row items-center justify-center gap-2 rounded-[99px] border px-4 text-[16px] font-normal leading-6 transition ${
            otpComplete && !isLoading
              ? "cursor-pointer border-transparent bg-[#201C44] text-white hover:bg-[#151238]"
              : "cursor-not-allowed border-black/10 bg-black/10 text-black opacity-100"
          }`}
        >
          <span>{isLoading ? "Logging in..." : "Logging in to the system"}</span>
          <span
            className={
              otpComplete && !isLoading
                ? "opacity-90 brightness-0 invert"
                : "opacity-70"
            }
            aria-hidden
          >
            <Image
              src="/go-to.svg"
              alt=""
              width={18}
              height={18}
            />
          </span>
        </button>

        <footer className="mt-4 flex w-full flex-row flex-wrap items-center justify-center gap-2 text-center text-[14px] leading-5">
          <span className="text-black">Don&apos;t have an account?</span>
          <Link
            href={nextParam ? `/auth/register?next=${encodeURIComponent(nextParam)}` : "/auth/register"}
            className="font-normal text-[#201C44] hover:underline"
          >
            Register here
          </Link>
        </footer>
      </form>
    </SupplierAuthMarketingLayout>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <SupplierAuthMarketingLayout
          userTabHref="/auth/login"
          userTabLabel="User login"
          providerTabLabel="Provider login"
          activeTab="user"
          heading="User login"
          subheading="Choose your preferred login method to log into our platform."
          contactMode="email"
          onContactModeChange={() => {}}
        >
          <div className="h-64 w-full max-w-[382px] animate-pulse rounded-2xl bg-slate-200/80" />
        </SupplierAuthMarketingLayout>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
