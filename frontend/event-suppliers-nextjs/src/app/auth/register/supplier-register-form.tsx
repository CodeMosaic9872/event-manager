"use client";

import Image from "next/image";
import Link from "next/link";
import { FormEvent, Suspense, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { setCredentials } from "@/features/auth/auth-slice";
import { useRegisterMutation, useRequestOtpMutation, useVerifyOtpMutation } from "@/shared/api/api";
import { supplierAuthContactInputClass } from "@/shared/components/supplier-auth/supplier-auth-glass-card";
import {
  SupplierAuthPaymentResultView,
  initialPaymentOutcomeFromSearch,
  isSupplierAuthFromPurchase,
  type SupplierPaymentOutcome,
} from "@/shared/components/supplier-auth/supplier-auth-payment-result";
import {
  SupplierAuthMailIcon,
  SupplierAuthMarketingLayout,
} from "@/shared/components/supplier-auth/supplier-auth-marketing-layout";
import { getSafeInternalRedirectPath } from "@/shared/lib/safe-redirect-path";
import { useAppDispatch } from "@/store/hooks";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE = /^(0\d{9}|\+972\d{9})$/;
const PURPOSE = "register" as const;

function validateContact(value: string, mode: "email" | "phone"): string | null {
  const trimmed = value.trim();
  if (!trimmed) return "Please enter your email or phone number.";
  if (mode === "email" && !EMAIL_RE.test(trimmed)) return "Please enter a valid email address.";
  if (mode === "phone" && !PHONE_RE.test(trimmed)) return "Please enter a valid Israeli phone number (05XXXXXXXX or +972XXXXXXXXX).";
  return null;
}

function SupplierRegisterInner() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [register, { isLoading: isRegistering }] = useRegisterMutation();
  const [requestOtp, { isLoading: isRequestingOtp }] = useRequestOtpMutation();
  const [verifyOtp, { isLoading: isVerifyingOtp }] = useVerifyOtpMutation();

  const nextRaw = searchParams.get("next");
  const nextPath = nextRaw ?? "/supplier/dashboard";
  const userRegisterHref = nextRaw ? `/auth/register?next=${encodeURIComponent(nextRaw)}` : "/auth/register";

  const fromPurchase = isSupplierAuthFromPurchase(searchParams);
  const [postAuthPaymentView, setPostAuthPaymentView] = useState<SupplierPaymentOutcome | null>(null);

  const [contact, setContact] = useState("");
  const [contactMode, setContactMode] = useState<"email" | "phone">("email");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [otpSent, setOtpSent] = useState(false);
  const [error, setError] = useState("");

  const contactError = useMemo(() => validateContact(contact, contactMode), [contact, contactMode]);
  const canRequestOtp = !isRequestingOtp && contact.trim().length > 0 && !contactError;

  useEffect(() => {
    queueMicrotask(() => {
      try {
        const raw = sessionStorage.getItem("supplierJoinStep1");
        if (!raw) return;
        const d = JSON.parse(raw) as { email?: string; phone?: string };
        if (d.email) { setContact(d.email); setContactMode("email"); }
        else if (d.phone) { setContact(d.phone); setContactMode("phone"); }
      } catch {
        /* ignore */
      }
    });
  }, []);

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
  const isLoading = isRequestingOtp || isVerifyingOtp || isRegistering;
  const canSubmit = otpComplete && !isLoading && contact.trim().length > 0 && !contactError;

  const handleVerifyAndRegister = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    const otpCode = otp.join("");
    const identity = contact.trim();

    if (!canSubmit) return;
    if (otpCode.length !== 6) {
      setError("Please enter a 6-digit verification code.");
      return;
    }

    try {
      await verifyOtp({ phone: identity, code: otpCode, purpose: PURPOSE }).unwrap();
    } catch {
      setError("Invalid verification code. Please try again.");
      return;
    }

    try {
      const payload = await register({ email: identity, phone: identity, role: "SUPPLIER" }).unwrap();
      dispatch(
        setCredentials({
          user: {
            id: payload.user.id,
            email: payload.user.email,
            roles: payload.user.roles.map((item) => item.toLowerCase() as "user" | "supplier" | "admin"),
          },
          accessToken: payload.accessToken,
          refreshToken: payload.refreshToken,
        }),
      );
    } catch {
      setError("Registration failed. Please try again.");
      return;
    }

    if (fromPurchase) {
      setPostAuthPaymentView(initialPaymentOutcomeFromSearch(searchParams));
      return;
    }
    router.push(getSafeInternalRedirectPath(nextRaw, "/supplier/dashboard"));
  };

  const setOtpDigit = (index: number, value: string) => {
    const v = value.replace(/\D/g, "").slice(-1);
    const next = [...otp];
    next[index] = v;
    setOtp(next);
    if (v && index < 5) {
      document.getElementById(`reg-otp-${index + 1}`)?.focus();
    }
  };

  if (fromPurchase && postAuthPaymentView !== null) {
    return (
      <SupplierAuthPaymentResultView
        outcome={postAuthPaymentView}
        onOutcomeChange={setPostAuthPaymentView}
        showPreviewToggle
        nextPath={nextPath}
        backToCheckoutHref="/join-supplier/step-5"
      />
    );
  }

  return (
    <SupplierAuthMarketingLayout
      userTabHref={userRegisterHref}
      userTabLabel="User registration"
      providerTabLabel="Provider registration"
      heading="Supplier entry"
      subheading="Choose your preferred login method to log into our platform."
      contactMode={contactMode}
      onContactModeChange={setContactMode}
    >
      <form className="flex w-full max-w-[382px] flex-col gap-6" onSubmit={handleVerifyAndRegister}>
        <div className="flex flex-col gap-2">
          <label className="w-full pe-1 text-right text-[14px] leading-5 text-black">Email / Phone</label>
          <div className="relative">
            <input
              className={supplierAuthContactInputClass}
              placeholder="Enter your details"
              value={contact}
              onChange={(e) => setContact(e.target.value)}
              autoComplete="email"
              maxLength={contactMode === "phone" ? 13 : undefined}
              required
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
            {otp.map((digit, i) => (
              <input
                key={i}
                id={`reg-otp-${i}`}
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => setOtpDigit(i, e.target.value)}
                className="box-border size-14 rounded-xl border border-black/10 bg-white text-center text-[18px] tabular-nums outline-none backdrop-blur-sm focus:ring-2 focus:ring-[#4721DF]/30"
                aria-label={`Digit ${i + 1}`}
              />
            ))}
          </div>
        </div>

        {error ? <p className="text-right text-sm text-red-700">{error}</p> : null}

        <button
          type="submit"
          disabled={!canSubmit}
          className={`flex h-[58px] w-full flex-row items-center justify-center gap-2 rounded-[99px] border px-4 text-[16px] font-normal leading-6 transition disabled:cursor-not-allowed ${
            canSubmit
              ? "cursor-pointer border-transparent bg-[#201C44] text-white hover:bg-[#151238]"
              : "cursor-not-allowed border-black/10 bg-black/10 text-black opacity-100"
          }`}
        >
          <span>{isRegistering ? "Creating…" : "Create supplier account"}</span>
          <span className={canSubmit ? "opacity-90 brightness-0 invert" : "opacity-70"} aria-hidden>
            <Image src="/go-to.svg" alt="" width={18} height={18} />
          </span>
        </button>
      </form>

      <footer className="mt-10 flex w-full flex-row flex-wrap items-center justify-center gap-2 text-center text-[14px] leading-5">
        <span className="text-black">Already have an account?</span>
        <Link
          href={`/auth/login/supplier?next=${encodeURIComponent(nextPath)}`}
          className="font-normal text-[#201C44] hover:underline"
        >
          Log in here
        </Link>
      </footer>
    </SupplierAuthMarketingLayout>
  );
}

export function SupplierRegisterFormWithSuspense() {
  return (
    <Suspense
      fallback={
        <SupplierAuthMarketingLayout
          userTabHref="/auth/register"
          userTabLabel="User registration"
          providerTabLabel="Provider registration"
          heading="Supplier entry"
          subheading="Choose your preferred login method to log into our platform."
          contactMode="email"
          onContactModeChange={() => {}}
        >
          <div className="h-64 w-full max-w-[382px] animate-pulse rounded-2xl bg-slate-200/80" />
        </SupplierAuthMarketingLayout>
      }
    >
      <SupplierRegisterInner />
    </Suspense>
  );
}
