"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, Suspense, useEffect, useLayoutEffect, useMemo, useState } from "react";
import { setCredentials } from "@/features/auth/auth-slice";
import { useLoginMutation, useRequestOtpMutation } from "@/shared/api/api";
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
import {
  getPostLoginFallbackPath,
  getSafeInternalRedirectPath,
} from "@/shared/lib/safe-redirect-path";
import { useAppDispatch, useAppSelector } from "@/store/hooks";

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

function resolveSupplierNextPath(nextRaw: string | null) {
  const fallback = getPostLoginFallbackPath(["supplier"]);
  const safe = getSafeInternalRedirectPath(nextRaw, fallback);
  return safe.startsWith("/supplier") ? safe : fallback;
}

function SupplierLoginInner() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const searchParams = useSearchParams();
  const sessionUser = useAppSelector((s) => s.auth.user);

  const [login, { isLoading: isLoggingIn }] = useLoginMutation();
  const [requestOtp, { isLoading: isRequestingOtp }] = useRequestOtpMutation();

  const nextRaw = searchParams.get("next");
  const nextPath = resolveSupplierNextPath(nextRaw);
  const loginUserHref = `/auth/login?next=${encodeURIComponent(nextPath)}`;

  const fromPurchase = isSupplierAuthFromPurchase(searchParams);
  const [postAuthPaymentView, setPostAuthPaymentView] = useState<SupplierPaymentOutcome | null>(null);

  const [contact, setContact] = useState("");
  const [contactMode, setContactMode] = useState<"email" | "phone">("email");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [otpSent, setOtpSent] = useState(false);
  const [error, setError] = useState("");

  const contactError = useMemo(() => validateContact(contact, contactMode), [contact, contactMode]);
  const canRequestOtp = !isRequestingOtp && contact.trim().length > 0 && !contactError;

  useLayoutEffect(() => {
    if (!fromPurchase || !sessionUser) return;
    const isSupplier = sessionUser.roles.includes("supplier") || sessionUser.roles.includes("admin");
    if (!isSupplier) return;
    queueMicrotask(() => {
      setPostAuthPaymentView((v) => (v !== null ? v : initialPaymentOutcomeFromSearch(searchParams)));
    });
  }, [fromPurchase, sessionUser, searchParams]);

  useEffect(() => {
    if (!sessionUser) return;
    const isSupplier = sessionUser.roles.some((role) => role === "supplier" || role === "admin");
    if (!isSupplier) return;
    if (fromPurchase) return;
    const fallback = getPostLoginFallbackPath(sessionUser.roles);
    const safe = getSafeInternalRedirectPath(nextRaw, fallback);
    router.replace(safe.startsWith("/supplier") ? safe : fallback);
  }, [sessionUser, fromPurchase, nextRaw, router]);

  const sessionHydrated = useAppSelector((s) => s.auth.isHydrated);
  useEffect(() => {
    if (!sessionHydrated || !sessionUser) return;
    const isSupplier = sessionUser.roles.some((role) => role === "supplier" || role === "admin");
    if (isSupplier) return;
    router.replace(getSafeInternalRedirectPath(nextRaw, getPostLoginFallbackPath(sessionUser.roles)));
  }, [sessionHydrated, sessionUser, router, nextRaw]);

  const handleRequestOtp = async () => {
    if (!canRequestOtp) return;
    setError("");
    try {
      await requestOtp({
        purpose: PURPOSE,
        ...(contactMode === "email" ? { email: contact.trim() } : { phone: contact.trim() }),
      }).unwrap();
      setOtpSent(true);
    } catch {
      setError("Failed to send verification code. Please try again.");
    }
  };

  const otpComplete = otp.every((d) => d.length === 1);
  const isLoading = isRequestingOtp || isLoggingIn;

  const handleFinalLogin = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    const otpCode = otp.join("");
    const loginIdentity = contact.trim();

    if (!loginIdentity || otpCode.length !== 6) {
      setError("Please enter your details and a 6-digit verification code.");
      return;
    }

    try {
      const payload = await login({
        code: otpCode,
        ...(contactMode === "email" ? { email: loginIdentity } : { phone: loginIdentity }),
      }).unwrap();
      const roles = payload.user.roles.map((role) => role.toLowerCase() as "user" | "supplier" | "admin");
      dispatch(
        setCredentials({
          user: { id: payload.user.id, email: payload.user.email, roles },
          accessToken: payload.accessToken,
          refreshToken: payload.refreshToken,
        }),
      );

      if (fromPurchase) {
        setPostAuthPaymentView(initialPaymentOutcomeFromSearch(searchParams));
        return;
      }
      router.push(resolveSupplierNextPath(nextRaw));
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
      document.getElementById(`supplier-otp-${index + 1}`)?.focus();
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
      userTabHref={loginUserHref}
      userTabLabel="User login"
      providerTabLabel="Provider login"
      heading="Supplier entry"
      subheading="Choose your preferred login method to log into our platform."
      contactMode={contactMode}
      onContactModeChange={setContactMode}
    >
      <form className="flex w-full max-w-[382px] flex-col gap-6" onSubmit={handleFinalLogin}>
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
          <div className="flex w-full flex-row justify-center gap-4">
            {otp.map((digit, i) => (
              <input
                key={i}
                id={`supplier-otp-${i}`}
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => setOtpDigit(i, e.target.value)}
                className="box-border size-12 rounded-xl border border-black/10 bg-white text-center text-[18px] tabular-nums outline-none backdrop-blur-[8px] focus:ring-2 focus:ring-[#4721DF]/30"
                aria-label={`Digit ${i + 1}`}
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
              : "cursor-not-allowed border-transparent bg-[#201C44] text-white opacity-60"
          }`}
        >
          <span>{isLoggingIn ? "Logging in..." : "Logging in to the system"}</span>
          <span className={otpComplete && !isLoading ? "opacity-90 brightness-0 invert" : "opacity-70"} aria-hidden>
            <Image src="/icons/go-to.svg" alt="" width={18} height={18} unoptimized />
          </span>
        </button>
      </form>

      <footer className="mt-10 flex w-full flex-row flex-wrap items-center justify-center gap-2 text-center text-[14px] leading-5">
        <span className="text-black">Don&apos;t have a vendor account?</span>
        <Link href="/join-supplier" className="font-normal text-[#201C44] hover:underline">Register here</Link>
      </footer>
    </SupplierAuthMarketingLayout>
  );
}

export function SupplierLoginFormWithSuspense() {
  return (
    <Suspense
      fallback={
        <SupplierAuthMarketingLayout
          userTabHref="/auth/login"
          userTabLabel="User login"
          providerTabLabel="Provider login"
          heading="Supplier entry"
          subheading="Choose your preferred login method to log into our platform."
          contactMode="email"
          onContactModeChange={() => {}}
        >
          <div className="h-64 w-full max-w-[382px] animate-pulse rounded-2xl bg-slate-200/80" />
        </SupplierAuthMarketingLayout>
      }
    >
      <SupplierLoginInner />
    </Suspense>
  );
}
