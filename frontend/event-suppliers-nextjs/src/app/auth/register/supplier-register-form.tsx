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
const PHONE_RE = /^[\d\s\-+()]{7,15}$/;
const PURPOSE = "register" as const;

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

  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [otpSent, setOtpSent] = useState(false);
  const [error, setError] = useState("");
  const [step, setStep] = useState<"contact" | "verify">("contact");

  useEffect(() => {
    queueMicrotask(() => {
      try {
        const raw = sessionStorage.getItem("supplierJoinStep1");
        if (!raw) return;
        const d = JSON.parse(raw) as { email?: string; phone?: string };
        if (d.email) setEmail(d.email);
        if (d.phone) setPhone(d.phone);
      } catch {
        /* ignore */
      }
    });
  }, []);

  const emailError = useMemo(() => {
    if (!email.trim()) return null;
    if (!EMAIL_RE.test(email.trim())) return "Please enter a valid email address.";
    return null;
  }, [email]);

  const phoneError = useMemo(() => {
    if (!phone.trim()) return "Please enter a valid phone number.";
    if (!PHONE_RE.test(phone.trim())) return "Please enter a valid phone number.";
    return null;
  }, [phone]);

  const canRequestOtp = !isRequestingOtp && email.trim().length > 0 && !emailError && phone.trim().length > 0 && !phoneError;

  const handleRequestOtp = async () => {
    if (!canRequestOtp) return;
    setError("");
    try {
      await requestOtp({ phone: phone.trim(), purpose: PURPOSE }).unwrap();
      setOtpSent(true);
      setStep("verify");
    } catch {
      setError("Failed to send verification code. Please try again.");
    }
  };

  const otpComplete = otp.every((d) => d.length === 1);
  const isLoading = isRequestingOtp || isVerifyingOtp || isRegistering;
  const canSubmit = otpComplete && !isLoading;

  const handleVerifyAndRegister = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    const otpCode = otp.join("");

    if (!canSubmit) return;
    if (otpCode.length !== 6) {
      setError("Please enter a 6-digit verification code.");
      return;
    }

    try {
      await verifyOtp({ phone: phone.trim(), code: otpCode, purpose: PURPOSE }).unwrap();
    } catch {
      setError("Invalid verification code. Please try again.");
      return;
    }

    try {
      const payload = await register({
        email: email.trim(),
        phone: phone.trim(),
        role: "SUPPLIER",
      }).unwrap();
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
      subheading="Enter your email and phone to receive a verification code."
      contactMode="email"
      onContactModeChange={() => {}}
    >
      <form className="flex w-full max-w-[382px] flex-col gap-6" onSubmit={handleVerifyAndRegister}>
        <div className="flex flex-col gap-2">
          <label className="w-full pe-1 text-right text-[14px] leading-5 text-black">Email</label>
          <div className="relative">
            <input
              className={supplierAuthContactInputClass}
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              required
            />
            <SupplierAuthMailIcon />
          </div>
          {emailError && email.trim() ? (
            <p className="pe-1 text-right text-xs text-red-600">{emailError}</p>
          ) : null}
        </div>

        <div className="flex flex-col gap-2">
          <label className="w-full pe-1 text-right text-[14px] leading-5 text-black">Phone</label>
          <input
            className={supplierAuthContactInputClass}
            placeholder="0501234567"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            autoComplete="tel"
            inputMode="tel"
            required
          />
          {phoneError && phone.trim() ? (
            <p className="pe-1 text-right text-xs text-red-600">{phoneError}</p>
          ) : null}
        </div>

        {step === "contact" && (
          <button
            type="button"
            onClick={handleRequestOtp}
            disabled={!canRequestOtp}
            className={`flex h-14 w-full flex-col items-center justify-center rounded-[99px] px-4 text-[24px] font-normal leading-6 text-white transition ${
              canRequestOtp ? "cursor-pointer bg-[#201C44] hover:bg-[#151238]" : "cursor-not-allowed bg-[#201C44] opacity-60"
            }`}
          >
            {isRequestingOtp ? "Sending..." : "Get verification code"}
          </button>
        )}

        {step === "verify" && (
          <>
            <div className="flex w-full flex-col gap-4 border-t border-black/10 pt-4">
              <div className="flex w-full flex-row items-center justify-between gap-4">
                <button
                  type="button"
                  onClick={handleRequestOtp}
                  disabled={isRequestingOtp}
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
          </>
        )}

        <footer className="mt-10 flex w-full flex-row flex-wrap items-center justify-center gap-2 text-center text-[14px] leading-5">
          <span className="text-black">Already have an account?</span>
          <Link
            href={`/auth/login/supplier?next=${encodeURIComponent(nextPath)}`}
            className="font-normal text-[#201C44] hover:underline"
          >
            Log in here
          </Link>
        </footer>
      </form>
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
          subheading="Enter your email and phone to receive a verification code."
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
