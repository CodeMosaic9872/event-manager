"use client";

import Image from "next/image";
import { FormEvent, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { setCredentials } from "@/features/auth/auth-slice";
import {
  SupplierAuthMailIcon,
  SupplierAuthMarketingLayout,
} from "@/shared/components/supplier-auth/supplier-auth-marketing-layout";
import { supplierAuthContactInputClass } from "@/shared/components/supplier-auth/supplier-auth-glass-card";
import { getSafeInternalRedirectPath } from "@/shared/lib/safe-redirect-path";
import { useAppDispatch, useAppSelector } from "@/store/hooks";

export default function AdminLoginPage() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const searchParams = useSearchParams();
  const sessionUser = useAppSelector((s) => s.auth.user);
  const [contact, setContact] = useState("");
  const [contactMode, setContactMode] = useState<"email" | "phone">("email");
  const [otp, setOtp] = useState(["", "", "", ""]);
  const nextRaw = searchParams.get("next");
  const nextPath = getSafeInternalRedirectPath(nextRaw, "/admin");

  useEffect(() => {
    if (!sessionUser?.roles.includes("admin")) return;
    router.replace(nextPath.startsWith("/admin") ? nextPath : "/admin");
  }, [sessionUser, router, nextPath]);

  const otpComplete = otp.every((d) => d.length === 1);

  const setOtpDigit = (index: number, value: string) => {
    const v = value.replace(/\D/g, "").slice(-1);
    const next = [...otp];
    next[index] = v;
    setOtp(next);
    if (v && index < 3) {
      document.getElementById(`admin-otp-${index + 1}`)?.focus();
    }
  };

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    dispatch(
      setCredentials({
        user: {
          id: "admin-demo",
          email: contact.trim() || "admin@demo.local",
          roles: ["admin"],
        },
      }),
    );
    router.push(nextPath.startsWith("/admin") ? nextPath : "/admin");
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
          <label className="w-full pe-1 text-right text-[14px] leading-5 text-black">
            Email / Phone
          </label>
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
        </div>

        <button
          type="button"
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

        <button
          type="submit"
          disabled={!otpComplete}
          className={`flex h-[58px] w-full flex-row items-center justify-center gap-2 rounded-[99px] border px-4 text-[16px] font-normal leading-6 transition ${
            otpComplete
              ? "border-transparent bg-[#201C44] text-white hover:bg-[#151238]"
              : "cursor-not-allowed border-black/10 bg-black/10 text-black opacity-100"
          }`}
        >
          <span>Login as admin</span>
          <span className={otpComplete ? "opacity-90 brightness-0 invert" : "opacity-70"} aria-hidden>
            <Image src="/go-to.svg" alt="" width={18} height={18} unoptimized />
          </span>
        </button>
      </form>
    </SupplierAuthMarketingLayout>
  );
}
