"use client";

import Image from "next/image";
import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { marketingPloniFont } from "@/shared/lib/marketing-typography";
import { useAppSelector } from "@/store/hooks";

const inputClass =
  "box-border h-[50px] w-full min-w-0 rounded-2xl border border-black bg-black/5 px-4 text-right text-[14px] text-black outline-none placeholder:text-right placeholder:text-black/40 focus:ring-2 focus:ring-[#4721DF]/30";

function LockIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="16"
      height="21"
      viewBox="0 0 16 21"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <path
        d="M14 7h-1V5c0-2.76-2.24-5-5-5S3 2.24 3 5v2H2C.9 7 0 7.9 0 9v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V9c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H4.9V5c0-1.16.94-2.1 2.1-2.1 1.16 0 2.1.94 2.1 2.1v2z"
        fill="rgba(0,0,0,0.45)"
      />
    </svg>
  );
}

function CardGlyphIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="20"
      height="16"
      viewBox="0 0 20 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <rect x="0.5" y="2.5" width="19" height="11" rx="2" stroke="#4721DF" />
      <path d="M0 6h20" stroke="#4721DF" strokeWidth="1.2" />
    </svg>
  );
}

function WalletIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="22"
      height="16"
      viewBox="0 0 22 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <path
        d="M18 2H4C2.34 2 1 3.34 1 5v10c0 1.66 1.34 3 3 3h14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3zm0 12H4c-.55 0-1-.45-1-1V9h16v4c0 .55-.45 1-1 1zm1-7h-7V5h7v2z"
        fill="currentColor"
      />
    </svg>
  );
}

type Props = {
  styleFont?: string;
  successRedirectPath?: string;
  loginRedirectPath?: string;
  submitLabel?: string;
};

export function SupplierJoinPaymentPanel({
  styleFont,
  successRedirectPath = "/supplier/dashboard",
  loginRedirectPath,
  submitLabel = "Make a payment now",
}: Props) {
  const router = useRouter();
  const user = useAppSelector((s) => s.auth.user);
  const font = styleFont ?? marketingPloniFont;
  const [cardNumber, setCardNumber] = useState("");
  const [cvv, setCvv] = useState("");
  const [expiry, setExpiry] = useState("");
  const [holder, setHolder] = useState("");
  const [discount, setDiscount] = useState("");

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const canSupplier =
      user?.roles.includes("supplier") || user?.roles.includes("admin");
    if (canSupplier) {
      router.replace(successRedirectPath);
      return;
    }
    router.replace(
      loginRedirectPath ??
        `/auth/login/supplier?from=purchase&next=${encodeURIComponent(successRedirectPath)}`,
    );
  };

  return (
    <div
      className="flex w-full min-w-0 flex-col gap-6"
      style={{ fontFamily: font }}
    >
      <div
        className="flex w-full min-w-0 flex-col gap-8 rounded-[24px] border border-black bg-[rgba(134,85,246,0.06)] p-8 shadow-[0_0_20px_rgba(134,85,246,0.2)] backdrop-blur-[6px]"
        dir="ltr"
        lang="en"
      >
        <div className="flex w-full flex-row items-center justify-end gap-2">
          <h2 className="text-right text-[20px] font-normal leading-7 text-black">
            Payment details
          </h2>
          <CardGlyphIcon className="shrink-0" />
        </div>

        <div className="flex min-h-[86px] w-full flex-col justify-between gap-3 rounded-2xl border border-black/5 bg-black/5 p-3 sm:p-4">
          <p className="text-right text-[12px] leading-4 text-black/50">
            Supported cards:
          </p>
          <div className="flex flex-row flex-wrap items-center justify-end gap-4">
            <Image
              src="/visa-mc.svg"
              alt=""
              width={46}
              height={46}
              className="h-8 w-auto object-contain opacity-90"
              unoptimized
            />
            <Image
              src="/paypal.svg"
              alt=""
              width={35}
              height={46}
              className="h-8 w-auto object-contain opacity-90"
              unoptimized
            />
          </div>
        </div>

        <form className="flex w-full min-w-0 flex-col gap-6" onSubmit={handleSubmit}>
          <div className="flex flex-col gap-2">
            <label className="block text-right text-[14px] leading-5 text-black/70">
              Card number
            </label>
            <div className="relative">
              <span className="pointer-events-none absolute top-1/2 -translate-y-1/2 inset-s-4">
                <LockIcon />
              </span>
              <input
                className={`${inputClass} ps-12`}
                placeholder="0000 0000 0000 0000"
                inputMode="numeric"
                autoComplete="cc-number"
                value={cardNumber}
                onChange={(ev) => setCardNumber(ev.target.value)}
              />
            </div>
          </div>

          <div className="grid w-full min-w-0 grid-cols-1 gap-6 sm:grid-cols-2 sm:gap-6">
            <div className="flex min-w-0 flex-col gap-2">
              <label className="block text-right text-[14px] leading-5 text-black/70">
                CVV
              </label>
              <input
                className={inputClass}
                placeholder="123"
                inputMode="numeric"
                autoComplete="cc-csc"
                value={cvv}
                onChange={(ev) => setCvv(ev.target.value)}
              />
            </div>
            <div className="flex min-w-0 flex-col gap-2">
              <label className="block text-right text-[14px] leading-5 text-black/70">
                Validity (MM/YY)
              </label>
              <input
                className={inputClass}
                placeholder="MM/YY"
                autoComplete="cc-exp"
                value={expiry}
                onChange={(ev) => setExpiry(ev.target.value)}
              />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label className="block text-right text-[14px] leading-5 text-black/70">
              Cardholder name
            </label>
            <input
              className={inputClass}
              placeholder="Full name"
              autoComplete="cc-name"
              value={holder}
              onChange={(ev) => setHolder(ev.target.value)}
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="block text-right text-[14px] leading-5 text-black/70">
              Discount code
            </label>
            <div className="relative">
              <span className="pointer-events-none absolute top-1/2 -translate-y-1/2 inset-s-4">
                <LockIcon />
              </span>
              <input
                className={`${inputClass} ps-12`}
                placeholder=""
                value={discount}
                onChange={(ev) => setDiscount(ev.target.value)}
              />
            </div>
          </div>

          <div className="flex flex-col gap-4 pt-2">
            <button
              type="submit"
              className="flex h-[60px] w-full flex-row items-center justify-center gap-3 rounded-[24px] bg-[#201C44] px-6 text-[18px] font-normal leading-7 text-white transition hover:bg-[#151238]"
            >
              <span>{submitLabel}</span>
              <WalletIcon className="text-white" />
            </button>
            <p className="text-center text-[12px] leading-4 text-black">
              By clicking &apos;Make Payment&apos; you agree to the{" "}
              <Link
                href="/contact-us"
                className="underline decoration-[#201C44] underline-offset-2"
              >
                Terms of Use
              </Link>{" "}
              and{" "}
              <Link
                href="/contact-us"
                className="underline decoration-[#201C44] underline-offset-2"
              >
                Privacy Policy
              </Link>
              .
            </p>
          </div>
        </form>
      </div>

      <div className="flex w-full min-w-0 flex-row flex-wrap items-center justify-center gap-6 rounded-[24px] border border-black bg-[rgba(134,85,246,0.06)] px-6 py-4 text-[10px] font-bold uppercase leading-[15px] tracking-wide text-black/50 backdrop-blur-[6px] sm:gap-8">
        <span className="flex flex-row items-center gap-2">
          <Image
            src="/ssl-secure.svg"
            alt=""
            width={24}
            height={20}
            className="size-4 object-contain opacity-70"
            unoptimized
            aria-hidden
          />
          256-bit SSL Secure
        </span>
        <span className="hidden h-4 w-px bg-black sm:inline" aria-hidden />
        <span className="flex flex-row items-center gap-2">
          <Image
            src="/verified.svg"
            alt=""
            width={24}
            height={23}
            className="size-4 object-contain opacity-70"
            unoptimized
            aria-hidden
          />
          PCI-DSS Compliant
        </span>
      </div>
    </div>
  );
}
