"use client";

import Link from "next/link";
import { FormEvent, Suspense, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { setCredentials } from "@/features/auth/auth-slice";
import { useRegisterMutation, useRequestOtpMutation, useVerifyOtpMutation } from "@/shared/api/api";
import {
  getPostLoginFallbackPath,
  getSafeInternalRedirectPath,
} from "@/shared/lib/safe-redirect-path";
import type { UserRole } from "@/shared/types";
import { useAppDispatch } from "@/store/hooks";
import { MarketingPageShell } from "@/shared/components/marketing-page-shell";
import { marketingPloniFont } from "@/shared/lib/marketing-typography";
import { SupplierRegisterFormWithSuspense } from "./supplier-register-form";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE = /^(0\d{9}|\+972\d{9})$/;
const PURPOSE = "register" as const;

function GoogleGlyph() {
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

function RegisterPageContent() {
  const searchParams = useSearchParams();
  const isSupplier = searchParams.get("role")?.toUpperCase() === "SUPPLIER";
  if (isSupplier) {
    return <SupplierRegisterFormWithSuspense />;
  }
  return <GenericRegisterForm />;
}

export default function RegisterPage() {
  return (
    <Suspense
      fallback={
        <MarketingPageShell
          showBackgroundImage
          className="bg-linear-to-b from-[#cfe8ff] via-[#e8f4ff] to-[#f6fbff]"
          dir="rtl"
          lang="he"
        >
          <div
            className="mx-auto h-96 w-full max-w-[540px] animate-pulse rounded-[28px] bg-white/40"
            style={{ fontFamily: marketingPloniFont }}
          />
        </MarketingPageShell>
      }
    >
      <RegisterPageContent />
    </Suspense>
  );
}

function GenericRegisterForm() {
  const dispatch = useAppDispatch();
  const [register, { isLoading: isRegistering }] = useRegisterMutation();
  const [requestOtp, { isLoading: isRequestingOtp }] = useRequestOtpMutation();
  const [verifyOtp, { isLoading: isVerifyingOtp }] = useVerifyOtpMutation();
  const router = useRouter();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [error, setError] = useState("");
  const [step, setStep] = useState<"contact" | "verify">("contact");
  const [role, setRole] = useState<"" | "USER" | "SUPPLIER">(() => {
    if (typeof window === "undefined") return "";
    const roleParam = new URLSearchParams(window.location.search).get("role")?.toUpperCase();
    if (roleParam === "SUPPLIER") return "SUPPLIER";
    if (roleParam === "USER") return "USER";
    return "";
  });

  const emailError = useMemo(() => {
    if (!email.trim()) return null;
    if (!EMAIL_RE.test(email.trim())) return "Please enter a valid email address.";
    return null;
  }, [email]);

  const phoneError = useMemo(() => {
    if (!phone.trim()) return null;
    if (!PHONE_RE.test(phone.trim()))
      return "Please enter a valid Israeli phone number (05XXXXXXXX or +972XXXXXXXXX).";
    return null;
  }, [phone]);

  const canRequestOtp =
    !isRequestingOtp &&
    email.trim().length > 0 &&
    !emailError &&
    phone.trim().length > 0 &&
    !phoneError &&
    role !== "";

  useEffect(() => {
    queueMicrotask(() => {
      try {
        const raw = sessionStorage.getItem("supplierJoinStep1");
        if (!raw) return;
        const d = JSON.parse(raw) as {
          fullName?: string;
          businessName?: string;
          phone?: string;
          email?: string;
        };
        if (d.fullName) setFullName(d.fullName);
        if (d.businessName) setCompanyName(d.businessName);
        if (d.phone) setPhone(d.phone);
        if (d.email) setEmail(d.email);
      } catch {
        /* ignore */
      }
    });
  }, []);

  const handleRequestOtp = async () => {
    if (!canRequestOtp) return;
    setError("");
    try {
      await requestOtp({ phone: phone.trim(), purpose: PURPOSE }).unwrap();
      setStep("verify");
    } catch {
      setError("Failed to send verification code. Please try again.");
    }
  };

  const otpComplete = otp.every((d) => d.length === 1);
  const isLoading = isRequestingOtp || isVerifyingOtp || isRegistering;

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");

    if (step !== "verify") {
      if (role !== "USER" && role !== "SUPPLIER") {
        setError("Please choose a role.");
        return;
      }
      handleRequestOtp();
      return;
    }

    const otpCode = otp.join("");
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

    if (role !== "USER" && role !== "SUPPLIER") {
      setError("Please choose a role.");
      return;
    }

    let resolvedRoles: UserRole[] = [role === "SUPPLIER" ? "supplier" : "user"];

    try {
      const payload = await register({
        email: email.trim(),
        phone: phone.trim(),
        role,
        fullName: fullName || undefined,
        companyName: companyName || undefined,
      }).unwrap();
      resolvedRoles = payload.user.roles.map((item) => item.toLowerCase() as UserRole);
      dispatch(
        setCredentials({
          user: { id: payload.user.id, email: payload.user.email, roles: resolvedRoles },
          accessToken: payload.accessToken,
          refreshToken: payload.refreshToken,
        }),
      );
    } catch {
      setError("Registration failed. Please try again.");
      return;
    }

    const params = new URLSearchParams(window.location.search);
    const nextRaw = params.get("next");
    router.push(getSafeInternalRedirectPath(nextRaw, getPostLoginFallbackPath(resolvedRoles)));
  };

  const setOtpDigit = (index: number, value: string) => {
    const v = value.replace(/\D/g, "").slice(-1);
    const next = [...otp];
    next[index] = v;
    setOtp(next);
    if (v && index < 5) {
      document.getElementById(`reg-generic-otp-${index + 1}`)?.focus();
    }
  };

  const fieldClass =
    "w-full rounded-full border border-[#d0d8ea] bg-white px-4 py-3 text-right text-base text-[#101426] shadow-[inset_0_1px_2px_rgba(15,23,42,0.04)] outline-none placeholder:text-[#94a3b8] focus:border-[#201C44]/35 focus:ring-2 focus:ring-[#6AB7FF]/35";

  return (
    <MarketingPageShell
      showBackgroundImage
      className="bg-linear-to-b from-[#cfe8ff] via-[#e8f4ff] to-[#f6fbff]"
      dir="rtl"
      lang="he"
    >
      <div
        className="relative w-full max-w-[560px] px-1"
        style={{ fontFamily: marketingPloniFont }}
      >
        <div className="pointer-events-none absolute -left-24 top-8 size-72 rounded-full bg-[#6ab7ff]/22 blur-3xl" />
        <div className="pointer-events-none absolute -right-20 top-32 size-80 rounded-full bg-[#6ab7ff]/28 blur-3xl" />

        <h1 className="relative z-10 mb-5 text-center text-3xl font-normal leading-tight tracking-tight text-[#101426] sm:text-4xl md:text-[42px] md:leading-tight">
          Create a new
          <br />
          account
        </h1>

        <form
          className="relative z-10 grid w-full gap-3.5 rounded-[28px] border border-[#9bb9e5]/90 bg-[#dbe8fd]/92 px-7 py-8 shadow-[0_18px_44px_rgba(28,48,88,0.18)] backdrop-blur-[2px]"
          onSubmit={onSubmit}
        >
          <button
            type="button"
            dir="ltr"
            lang="en"
            className="flex h-12 w-full cursor-pointer items-center justify-center gap-3 rounded-xl border border-slate-200/90 bg-white px-4 text-sm font-normal text-[#1e1b4b] shadow-sm transition hover:bg-slate-50"
          >
            <span>Sign in with Google</span>
            <GoogleGlyph />
          </button>

          <div className="mt-1">
            <label className="mb-1.5 block text-right text-sm font-medium text-[#101426]">Full name</label>
            <input
              className={fieldClass}
              placeholder="Full name"
              value={fullName}
              onChange={(event) => setFullName(event.target.value)}
            />
          </div>

          <div>
            <label className="mb-1.5 block text-right text-sm font-medium text-[#101426]">Email</label>
            <input
              required
              type="email"
              className={fieldClass}
              placeholder="name@example.com"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
            {emailError ? <p className="mt-1 pe-1 text-right text-xs text-red-600">{emailError}</p> : null}
          </div>

          <div>
            <label className="mb-1.5 block text-right text-sm font-medium text-[#101426]">Phone number</label>
            <input
              required
              className={fieldClass}
              placeholder="050-0000000"
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
              inputMode="tel"
              maxLength={13}
            />
            {phoneError ? <p className="mt-1 pe-1 text-right text-xs text-red-600">{phoneError}</p> : null}
          </div>

          <div>
            <label className="mb-1.5 block text-right text-sm font-medium text-[#101426]">Choose a role</label>
            <div className="relative">
              <select
                required
                className={`${fieldClass} cursor-pointer appearance-none pe-12`}
                value={role}
                onChange={(event) => setRole(event.target.value as "" | "USER" | "SUPPLIER")}
                aria-label="Choose a role"
              >
                <option value="" disabled>
                  role
                </option>
                <option value="USER">User</option>
                <option value="SUPPLIER">Supplier</option>
              </select>
              <span
                className="pointer-events-none absolute top-1/2 inset-e-4 -translate-y-1/2 text-[#64748B]"
                aria-hidden
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-right text-sm font-medium text-[#101426]">Company name</label>
            <input
              className={fieldClass}
              placeholder="company"
              value={companyName}
              onChange={(event) => setCompanyName(event.target.value)}
            />
          </div>

          {step === "contact" && (
            <button
              type="button"
              onClick={handleRequestOtp}
              disabled={!canRequestOtp}
              className={`mt-1 flex h-14 w-full items-center justify-center rounded-full px-4 text-xl font-normal text-white transition sm:text-2xl ${
                canRequestOtp
                  ? "cursor-pointer bg-[#1a1f4a] hover:bg-[#151238]"
                  : "cursor-not-allowed bg-[#1a1f4a] opacity-55"
              }`}
            >
              {isRequestingOtp ? "Sending..." : "Create a free account"}
            </button>
          )}

          {step === "verify" && (
            <>
              <div className="flex w-full flex-col items-center gap-3 border-t border-black/10 pt-4">
                <div className="flex w-full flex-row items-center justify-between gap-4">
                  <button
                    type="button"
                    onClick={handleRequestOtp}
                    disabled={isRequestingOtp}
                    className="shrink-0 cursor-pointer text-[12px] leading-4 text-[#201C44] hover:underline disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Send again
                  </button>
                  <span className="text-right text-[14px] leading-5 text-black">
                    Enter verification code (OTP)
                  </span>
                </div>
                <div className="flex flex-row justify-center gap-2">
                  {otp.map((digit, i) => (
                    <input
                      key={i}
                      id={`reg-generic-otp-${i}`}
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => setOtpDigit(i, e.target.value)}
                      className="box-border size-12 rounded-xl border border-black/10 bg-white text-center text-[18px] tabular-nums outline-none focus:ring-2 focus:ring-[#4721DF]/30"
                      aria-label={`Digit ${i + 1}`}
                    />
                  ))}
                </div>
              </div>

              {error ? <p className="text-right text-sm text-red-700">{error}</p> : null}

              <button
                type="submit"
                disabled={!otpComplete || isLoading}
                className={`mt-1 flex h-14 w-full items-center justify-center rounded-full px-4 text-xl font-normal text-white transition sm:text-2xl ${
                  otpComplete && !isLoading
                    ? "cursor-pointer bg-[#1a1f4a] hover:bg-[#151238]"
                    : "cursor-not-allowed bg-[#1a1f4a] opacity-55"
                }`}
              >
                {isRegistering ? "Creating..." : "Create a free account"}
              </button>
            </>
          )}

          {step === "contact" && error ? (
            <p className="text-center text-sm text-red-700">{error}</p>
          ) : null}

          <p className="text-center text-sm text-slate-600">
            Already have an account?{" "}
            <Link href="/auth/login" className="text-[#0b86d4] hover:underline">
              Log in here
            </Link>
          </p>
        </form>
      </div>
    </MarketingPageShell>
  );
}
