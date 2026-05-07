"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  FormEvent,
  Suspense,
  useEffect,
  useLayoutEffect,
  useState,
} from "react";
import { setCredentials } from "@/features/auth/auth-slice";
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

  const nextRaw = searchParams.get("next");
  const nextPath = resolveSupplierNextPath(nextRaw);
  const loginUserHref = `/auth/login?next=${encodeURIComponent(nextPath)}`;

  const fromPurchase = isSupplierAuthFromPurchase(searchParams);
  /** After login (or already supplier): show payment success/fail; null = show login form */
  const [postAuthPaymentView, setPostAuthPaymentView] =
    useState<SupplierPaymentOutcome | null>(null);

  const [contact, setContact] = useState("");
  const [contactMode, setContactMode] = useState<"email" | "phone">("email");
  const [otp, setOtp] = useState(["", "", "", ""]);

  useLayoutEffect(() => {
    if (!fromPurchase || !sessionUser) return;
    const isSupplier =
      sessionUser.roles.includes("supplier") ||
      sessionUser.roles.includes("admin");
    if (!isSupplier) return;
    queueMicrotask(() => {
      setPostAuthPaymentView((v) =>
        v !== null ? v : initialPaymentOutcomeFromSearch(searchParams),
      );
    });
  }, [fromPurchase, sessionUser, searchParams]);

  useEffect(() => {
    if (!sessionUser) return;
    const isSupplier = sessionUser.roles.some(
      (role) => role === "supplier" || role === "admin",
    );
    if (!isSupplier) return;
    if (fromPurchase) return;
    const fallback = getPostLoginFallbackPath(sessionUser.roles);
    const safe = getSafeInternalRedirectPath(nextRaw, fallback);
    const roleSafeNext = safe.startsWith("/supplier") ? safe : fallback;
    router.replace(roleSafeNext);
  }, [sessionUser, fromPurchase, nextRaw, router]);

  const otpComplete = otp.every((d) => d.length === 1);

  const handleGetCode = () => {
    /* placeholder — wire to OTP API */
  };

  const handleFinalLogin = (e: FormEvent) => {
    e.preventDefault();
    dispatch(
      setCredentials({
        user: {
          id: "supplier-demo",
          email: contact.trim() || "supplier@demo.local",
          roles: ["supplier"],
        },
      }),
    );
    if (fromPurchase) {
      setPostAuthPaymentView(initialPaymentOutcomeFromSearch(searchParams));
      return;
    }
    router.push(resolveSupplierNextPath(nextRaw));
  };

  const setOtpDigit = (index: number, value: string) => {
    const v = value.replace(/\D/g, "").slice(-1);
    const next = [...otp];
    next[index] = v;
    setOtp(next);
    if (v && index < 3) {
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
      <form
        className="flex w-full max-w-[382px] flex-col gap-6"
        onSubmit={handleFinalLogin}
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
              onChange={(e) => setContact(e.target.value)}
              autoComplete="email"
            />
            <SupplierAuthMailIcon />
          </div>
        </div>

        <button
          type="button"
          onClick={handleGetCode}
          className="flex h-14 w-full flex-col items-center justify-center rounded-[99px] bg-[#201C44] px-4 text-[24px] font-normal leading-6 text-white transition hover:bg-[#151238]"
        >
          Getting a code
        </button>

        <div className="flex w-full flex-col gap-4 border-t border-black/10 pt-4">
          <div className="flex w-full flex-row items-center justify-between gap-4">
            <button
              type="button"
              className="shrink-0 text-left text-[12px] leading-4 text-[#201C44] hover:underline"
            >
              Send again
            </button>
            <span className="text-right text-[14px] leading-5 text-black">
              Enter verification code (OTP)
            </span>
          </div>
          <div className="flex w-full flex-row justify-center gap-[29px]">
            {otp.map((digit, i) => (
              <input
                key={i}
                id={`supplier-otp-${i}`}
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => setOtpDigit(i, e.target.value)}
                className="box-border size-14 rounded-xl border border-black/10 bg-white text-center text-[18px] tabular-nums outline-none backdrop-blur-[8px] focus:ring-2 focus:ring-[#4721DF]/30"
                aria-label={`Digit ${i + 1}`}
              />
            ))}
          </div>
        </div>

        <button
          type="submit"
          disabled={!otpComplete}
          className={`flex h-[58px] w-full flex-row items-center justify-center gap-2 rounded-[99px] border px-4 text-[16px] font-normal leading-6 transition ${
            otpComplete
              ? "border-transparent bg-[#201C44] text-white hover:bg-[#151238]"
              : "cursor-not-allowed border-black/10 bg-black/10 text-black opacity-100"
          }`}
        >
          <span>Logging in to the system</span>
          <span
            className={
              otpComplete
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
              unoptimized
            />
          </span>
        </button>
      </form>

      <footer className="mt-10 flex w-full flex-row flex-wrap items-center justify-center gap-2 text-center text-[14px] leading-5">
        <span className="text-black">Don&apos;t have a vendor account?</span>
        <Link
          href="/join-supplier"
          className="font-normal text-[#201C44] hover:underline"
        >
          Register here
        </Link>
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
