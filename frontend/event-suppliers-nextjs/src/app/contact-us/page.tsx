"use client";

import Image from "next/image";
import Link from "next/link";
import { FormEvent, useMemo, useState } from "react";
import { MarketingModal, MARKETING_SOFT_SURFACE_CLASS } from "@/shared/components/marketing-modal";
import { MarketingPageShell } from "@/shared/components/marketing-page-shell";
import { marketingPloniFont } from "@/shared/lib/marketing-typography";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const SOCIAL = [
  { label: "Facebook", href: "https://www.facebook.com", icon: "/facebook.svg" },
  { label: "Instagram", href: "https://www.instagram.com", icon: "/instagram.svg" },
  { label: "Email", href: "mailto:support@example.com", icon: "/mail.svg" },
  { label: "WhatsApp", href: "https://wa.me/", icon: "/whatsapp.svg" },
] as const;

function SuccessBadgeCheckIcon() {
  return (
    <span className="flex size-[29px] shrink-0 items-center justify-center rounded-full bg-[#201C44]" aria-hidden>
      <svg width="14" height="11" viewBox="0 0 14 11" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M1 5.5L4.5 9L13 1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </span>
  );
}

export default function ContactUsPage() {
  const [submitted, setSubmitted] = useState(false);
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const emailError = useMemo(() => {
    if (!email.trim()) return null;
    if (!EMAIL_RE.test(email.trim())) return "Please enter a valid email address.";
    return null;
  }, [email]);

  const canSubmit = email.trim().length > 0 && !emailError
    && fullName.trim().length > 0
    && subject.trim().length > 0
    && message.trim().length > 0;

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");

    if (!canSubmit) {
      setError("Please fill in all fields correctly.");
      return;
    }

    setSubmitted(true);
  };

  return (
    <MarketingPageShell
      showBackgroundImage={false}
      className="min-h-screen"
      contentClassName="!max-w-[1440px] !items-stretch !px-4 !pb-20 !pt-20 sm:!px-6 sm:!pt-24 lg:!pt-[123px]"
      dir="ltr"
      lang="en"
    >
      <div className="mx-auto w-full max-w-[800px]" style={{ fontFamily: marketingPloniFont }}>
        <header className="mb-10 text-center">
          <h1 className="text-[clamp(2.5rem,6vw,3.75rem)] font-normal leading-[0.95] tracking-tight text-[#00113A]">
            <span className="block">Contact Us</span>
          </h1>
          <p className="mx-auto mt-5 max-w-[540px] text-base leading-6 text-[#444650] sm:text-lg sm:leading-7">
            We are here for any questions or consultations, our team is always available to you.
          </p>
        </header>

        <form
          onSubmit={onSubmit}
          className="rounded-[24px] border border-[rgba(134,85,246,0.12)] bg-white px-6 py-8 shadow-[0px_8px_32px_rgba(0,0,0,0.08)] sm:px-10 sm:py-10"
        >
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 md:gap-6">
            <label className="flex flex-col items-end gap-2 text-right">
              <span className="text-xs font-normal uppercase tracking-[0.12em] text-[#444650]">Email</span>
              <input
                name="email"
                type="email"
                autoComplete="email"
                required
                placeholder="name@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-12 w-full rounded-lg border border-transparent bg-[#F8FAFC] px-4 text-right text-base text-[#191C1D] outline-none ring-1 ring-[rgba(32,28,68,0.08)] placeholder:text-[#6B7280] focus:ring-[#4721DF]/40"
              />
              {emailError ? <p className="w-full text-right text-xs text-red-600">{emailError}</p> : null}
            </label>
            <label className="flex flex-col items-end gap-2 text-right">
              <span className="text-xs font-normal uppercase tracking-[0.12em] text-[#444650]">Full name</span>
              <input
                name="fullName"
                type="text"
                autoComplete="name"
                required
                placeholder="Full name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="h-12 w-full rounded-lg border border-transparent bg-[#F8FAFC] px-4 text-right text-base text-[#191C1D] outline-none ring-1 ring-[rgba(32,28,68,0.08)] placeholder:text-[#6B7280] focus:ring-[#4721DF]/40"
              />
            </label>
          </div>

          <label className="mt-6 flex flex-col items-end gap-2 text-right">
            <span className="text-xs font-normal uppercase tracking-[0.12em] text-[#444650]">Subject of the inquiry</span>
            <input
              name="subject"
              type="text"
              required
              placeholder="What can we help with?"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="h-12 w-full rounded-lg border border-transparent bg-[#F8FAFC] px-4 text-right text-base text-[#191C1D] outline-none ring-1 ring-[rgba(32,28,68,0.08)] placeholder:text-[#6B7280] focus:ring-[#4721DF]/40"
            />
          </label>

          <label className="mt-6 flex flex-col items-end gap-2 text-right">
            <span className="text-xs font-normal uppercase tracking-[0.12em] text-[#444650]">Message content</span>
            <textarea
              name="message"
              required
              rows={5}
              placeholder="Write to us here."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="min-h-[140px] w-full resize-y rounded-lg border border-transparent bg-[#F8FAFC] px-4 py-3 text-right text-base text-[#191C1D] outline-none ring-1 ring-[rgba(32,28,68,0.08)] placeholder:text-[#6B7280] focus:ring-[#4721DF]/40"
            />
          </label>

          {error ? <p className="mt-4 text-right text-sm text-red-700">{error}</p> : null}

          <div className="mt-8 flex justify-end">
            <button
              type="submit"
              disabled={!canSubmit}
              className={`inline-flex h-12 min-w-[200px] items-center justify-center rounded-[99px] px-8 text-center text-base font-normal text-white transition ${
                canSubmit ? "cursor-pointer bg-[#201C44] hover:opacity-95" : "cursor-not-allowed bg-[#201C44] opacity-60"
              }`}
            >
              Sending a message
            </button>
          </div>
        </form>

        <div className="mx-auto mt-12 flex w-full max-w-[520px] items-center gap-4 sm:max-w-none sm:gap-8">
          <div className="h-px min-w-0 flex-1 bg-[rgba(32,28,68,0.15)]" aria-hidden />
          <ul className="flex shrink-0 flex-wrap items-start justify-center gap-6 sm:gap-10">
            {SOCIAL.map(({ label, href, icon }) => (
              <li key={label}>
                <a
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex flex-col items-center gap-2 text-center text-xs text-[#00113A] transition hover:opacity-80"
                >
                  <span className="flex size-12 items-center justify-center rounded-full bg-[#201C44]">
                    <Image src={icon} alt="" width={20} height={20} className="brightness-0 invert" unoptimized />
                  </span>
                  {label}
                </a>
              </li>
            ))}
          </ul>
          <div className="h-px min-w-0 flex-1 bg-[rgba(32,28,68,0.15)]" aria-hidden />
        </div>
      </div>

      <MarketingModal
        open={submitted}
        onClose={() => setSubmitted(false)}
        backdrop="slate"
        zClass="z-[100]"
        closeOnBackdropClick
        closeOnEscape
      >
        <div
          role="dialog"
          aria-modal
          className={`${MARKETING_SOFT_SURFACE_CLASS} relative w-full max-w-[620px] p-8 text-center`}
          style={{ fontFamily: marketingPloniFont }}
        >
          <button
            type="button"
            className="absolute right-5 top-4 text-[28px] leading-6 text-[#A1A1A1] transition hover:opacity-70"
            onClick={() => setSubmitted(false)}
            aria-label="Close"
          >
            ×
          </button>
          <div className="mx-auto flex w-full max-w-[min(100%,420px)] flex-row flex-wrap items-center justify-center gap-2 rounded-[99px] bg-[#6AB7FF] px-3 py-2 sm:gap-3.5 sm:px-4 sm:py-2.5">
            <p className="max-w-[min(100%,280px)] text-balance text-center text-base font-normal leading-tight tracking-[0.3px] text-[#201C44] sm:max-w-[320px] sm:text-xl sm:leading-snug">
              Your request has been successfully received!
            </p>
            <SuccessBadgeCheckIcon />
          </div>
          <p className="mt-8 text-xl text-[#00113A] sm:text-2xl">
            Thank you for your inquiry! We will respond as soon as possible.
          </p>
          <div className="mx-auto mt-10 w-full max-w-md">
            <Link
              href="/"
              className="relative isolate flex h-14 w-full flex-row items-center justify-center gap-2 rounded-[99px] bg-[#201C44] px-8 py-4 text-base font-normal leading-6 text-white! transition hover:opacity-95"
            >
              <Image src="/left-arrow.svg" alt="" width={13} height={13} className="size-[13px] shrink-0 brightness-0 invert" unoptimized aria-hidden />
              Back to main page
            </Link>
          </div>
        </div>
      </MarketingModal>
    </MarketingPageShell>
  );
}
