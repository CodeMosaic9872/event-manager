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
import { SupplierRegisterFormWithSuspense } from "./supplier-register-form";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE = /^[\d\s\-+()]{7,15}$/;
const PURPOSE = "register" as const;

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
        <section className="relative mx-auto min-h-[calc(100vh-120px)] w-full max-w-[1440px] overflow-hidden rounded-[24px] border border-[#bfdbfe] px-6 py-10">
          <div className="mx-auto mt-8 h-96 max-w-[480px] animate-pulse rounded-[24px] bg-slate-200/60" />
        </section>
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
  const [otpSent, setOtpSent] = useState(false);
  const [error, setError] = useState("");
  const [step, setStep] = useState<"contact" | "verify">("contact");
  const [role, setRole] = useState<"USER" | "SUPPLIER">(() => {
    if (typeof window === "undefined") return "USER";
    const roleParam = new URLSearchParams(window.location.search).get("role")?.toUpperCase();
    return roleParam === "SUPPLIER" ? "SUPPLIER" : "USER";
  });

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

  useEffect(() => {
    queueMicrotask(() => {
      try {
        const raw = sessionStorage.getItem("supplierJoinStep1");
        if (!raw) return;
        const d = JSON.parse(raw) as {
          fullName?: string; businessName?: string; phone?: string; email?: string;
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
      setOtpSent(true);
      setStep("verify");
    } catch {
      setError("Failed to send verification code. Please try again.");
    }
  };

  const otpComplete = otp.every((d) => d.length === 1);
  const isLoading = isRequestingOtp || isVerifyingOtp || isRegistering;
  const canSubmit = otpComplete && !isLoading;

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");

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

  return (
    <section className="relative mx-auto min-h-[calc(100vh-120px)] w-full max-w-[1440px] overflow-hidden rounded-[24px] border border-[#bfdbfe] px-6 py-10">
      <div className="pointer-events-none absolute -left-16 top-40 size-72 rounded-full bg-[#6ab7ff]/25 blur-2xl" />
      <div className="pointer-events-none absolute -right-24 top-1/2 size-80 -translate-y-1/2 rounded-full bg-[#6ab7ff]/30 blur-2xl" />

      <form
        className="mx-auto mt-8 grid w-full max-w-[480px] gap-3 rounded-[24px] border border-[#9bb9e5] bg-[#d8e5fa]/90 p-8 shadow-[0px_10px_24px_rgba(32,28,68,0.25)]"
        onSubmit={onSubmit}
      >
        <h1 className="text-center text-[42px] leading-10 text-[#101426]">Create a new account</h1>

        <button
          type="button"
          className="mt-1 w-full cursor-pointer rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-[#1e1b4b] hover:bg-slate-50"
        >
          Sign in with Google
        </button>

        <div className="mt-2">
          <label className="mb-1 block text-right text-sm text-slate-700">Full name</label>
          <input
            className="w-full rounded-full border border-[#c8cede] bg-[#f5f6fd] px-4 py-3"
            placeholder="Full name"
            value={fullName}
            onChange={(event) => setFullName(event.target.value)}
          />
        </div>
        <div>
          <input
            required
            type="email"
            className="w-full rounded-full border border-[#c8cede] bg-[#f5f6fd] px-4 py-3"
            placeholder="אימייל"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
          {emailError ? <p className="pe-1 text-right text-xs text-red-600">{emailError}</p> : null}
        </div>
        <div>
          <input
            required
            className="w-full rounded-full border border-[#c8cede] bg-[#f5f6fd] px-4 py-3"
            placeholder="050-0000000"
            value={phone}
            onChange={(event) => setPhone(event.target.value)}
            inputMode="tel"
          />
          {phoneError ? <p className="pe-1 text-right text-xs text-red-600">{phoneError}</p> : null}
        </div>
        <label className="mb-[-6px] mt-1 block text-right text-sm text-slate-700">Choose a role</label>
        <select
          className="rounded-full border border-[#c8cede] bg-[#f5f6fd] px-4 py-3"
          value={role}
          onChange={(event) => setRole(event.target.value as "USER" | "SUPPLIER")}
        >
          <option value="USER">משתמש</option>
          <option value="SUPPLIER">ספק</option>
        </select>
        <input
          className="rounded-full border border-[#c8cede] bg-[#f5f6fd] px-4 py-3"
          placeholder="company"
          value={companyName}
          onChange={(event) => setCompanyName(event.target.value)}
        />

        {step === "contact" && (
          <button
            type="button"
            onClick={handleRequestOtp}
            disabled={!canRequestOtp}
            className={`rounded-full px-4 py-3 text-2xl text-white transition ${
              canRequestOtp ? "cursor-pointer bg-[#232051] hover:bg-[#151238]" : "cursor-not-allowed bg-[#232051] opacity-60"
            }`}
          >
            {isRequestingOtp ? "Sending..." : "Get verification code"}
          </button>
        )}

        {step === "verify" && (
          <>
            <div className="flex w-full flex-col items-center gap-3 border-t border-black/10 pt-4">
              <div className="flex flex-row items-center justify-between gap-4">
                <button
                  type="button"
                  onClick={handleRequestOtp}
                  disabled={isRequestingOtp}
                  className="shrink-0 cursor-pointer text-[12px] leading-4 text-[#201C44] hover:underline disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Send again
                </button>
                <span className="text-right text-[14px] leading-5 text-black">Enter verification code (OTP)</span>
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
              disabled={!canSubmit}
              className={`rounded-full px-4 py-3 text-2xl text-white transition ${
                canSubmit ? "cursor-pointer bg-[#232051] hover:bg-[#151238]" : "cursor-not-allowed bg-[#232051] opacity-60"
              }`}
            >
              {isRegistering ? "Creating..." : "Create a free account"}
            </button>
          </>
        )}

        <p className="text-center text-sm text-slate-600">
          Already have an account?{" "}
          <Link href="/auth/login" className="text-[#201c44] underline">
            Log in here
          </Link>
        </p>
      </form>
    </section>
  );
}
