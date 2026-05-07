"use client";

import Image from "next/image";
import { FormEvent, Suspense, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { setCredentials } from "@/features/auth/auth-slice";
import { useLoginMutation, useRequestOtpMutation, useVerifyOtpMutation } from "@/shared/api/api";
import {
  SupplierAuthMailIcon,
  SupplierAuthMarketingLayout,
} from "@/shared/components/supplier-auth/supplier-auth-marketing-layout";
import { supplierAuthContactInputClass } from "@/shared/components/supplier-auth/supplier-auth-glass-card";
import { getSafeInternalRedirectPath } from "@/shared/lib/safe-redirect-path";
import { useAppDispatch, useAppSelector } from "@/store/hooks";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE = /^[\d\s\-+()]{7,15}$/;
const PURPOSE = "login" as const;

function validateContact(value: string, mode: "email" | "phone"): string | null {
  const trimmed = value.trim();
  if (!trimmed) return "Please enter your email or phone number.";
  if (mode === "email" && !EMAIL_RE.test(trimmed)) return "Please enter a valid email address.";
  if (mode === "phone" && !PHONE_RE.test(trimmed)) return "Please enter a valid phone number.";
  return null;
}

function AdminLoginContent() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const searchParams = useSearchParams();
  const sessionUser = useAppSelector((s) => s.auth.user);

  const [login, { isLoading: isLoggingIn }] = useLoginMutation();
  const [requestOtp, { isLoading: isRequestingOtp }] = useRequestOtpMutation();
  const [verifyOtp, { isLoading: isVerifyingOtp }] = useVerifyOtpMutation();

  const [contact, setContact] = useState("");
  const [contactMode, setContactMode] = useState<"email" | "phone">("email");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [otpSent, setOtpSent] = useState(false);
  const [error, setError] = useState("");
  const nextRaw = searchParams.get("next");
  const nextPath = getSafeInternalRedirectPath(nextRaw, "/admin");

  const contactError = useMemo(() => validateContact(contact, contactMode), [contact, contactMode]);
  const canRequestOtp = !isRequestingOtp && contact.trim().length > 0 && !contactError;

  useEffect(() => {
    if (!sessionUser?.roles.includes("admin")) return;
    router.replace(nextPath.startsWith("/admin") ? nextPath : "/admin");
  }, [sessionUser, router, nextPath]);

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

  const otpComplete = otp.every((d) => d.length === 1);
  const isLoading = isRequestingOtp || isVerifyingOtp || isLoggingIn;

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    const otpCode = otp.join("");
    const loginIdentity = contact.trim();

    if (!loginIdentity || otpCode.length !== 6) {
      setError("Please enter your admin details and a 6-digit verification code.");
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
      const roles = payload.user.roles.map((role) => role.toLowerCase() as "user" | "supplier" | "admin");
      dispatch(
        setCredentials({
          user: { id: payload.user.id, email: payload.user.email, roles },
          accessToken: payload.accessToken,
          refreshToken: payload.refreshToken,
        }),
      );
      router.push(nextPath.startsWith("/admin") ? nextPath : "/admin");
    } catch {
      setError("Login failed. Please try again.");
    }
  };

  const setOtpDigit = (index: number, value: string) => {
    const v = value.replace(/\D/g, "").slice(-1);
    const next = [...otp];
    next[index] = v;
    setOtp(next);
    if (v && index < 5) {
      document.getElementById(`admin-otp-${index + 1}`)?.focus();
    }
  };

  return (
    <SupplierAuthMarketingLayout
      userTabHref="/auth/login"
      userTabLabel="User login"
      providerTabLabel="Admin login"
      heading="Admin login"
      subheading="Login with an admin account to manage the platform."
      contactMode={contactMode}
      onContactModeChange={setContactMode}
    >
      <form className="flex w-full max-w-[382px] flex-col gap-6" onSubmit={onSubmit}>
        <div className="flex flex-col gap-2">
          <label className="w-full pe-1 text-right text-[14px] leading-5 text-black">Email / Phone</label>
          <div className="relative">
            <input
              className={supplierAuthContactInputClass}
              placeholder="Enter your admin account"
              value={contact}
              onChange={(event) => setContact(event.target.value)}
              autoComplete={contactMode === "email" ? "email" : "tel"}
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
            canRequestOtp ? "cursor-pointer bg-[#201C44] hover:bg-[#151238]" : "cursor-not-allowed bg-[#201C44] opacity-60"
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
            <span className="text-right text-[14px] leading-5 text-black">Enter verification code (OTP)</span>
          </div>
          <div className="flex w-full flex-row justify-center gap-2">
            {otp.map((digit, index) => (
              <input
                key={index}
                id={`admin-otp-${index}`}
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
          <span>{isLoggingIn ? "Logging in..." : "Login as admin"}</span>
          <span className={otpComplete && !isLoading ? "opacity-90 brightness-0 invert" : "opacity-70"} aria-hidden>
            <Image src="/go-to.svg" alt="" width={18} height={18} />
          </span>
        </button>
      </form>
    </SupplierAuthMarketingLayout>
  );
}

export default function AdminLoginPage() {
  return (
    <Suspense fallback={<div className="min-h-[30vh]" />}>
      <AdminLoginContent />
    </Suspense>
  );
}
