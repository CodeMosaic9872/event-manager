"use client";

import { FormEvent, useState } from "react";

export default function ContactUsPage() {
  const [submitted, setSubmitted] = useState(false);

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitted(true);
  };

  return (
    <section className="relative mx-auto min-h-[calc(100vh-120px)] w-full max-w-[1440px] overflow-hidden rounded-[24px] border border-[#bfdbfe] bg-[linear-gradient(180deg,#9BD3EF_0%,#FFFFFF_58%)] px-6 py-8">
      <div className="pointer-events-none absolute -left-24 top-40 size-80 rounded-full bg-[#6ab7ff]/30 blur-2xl" />
      <div className="pointer-events-none absolute -right-24 top-1/2 size-80 -translate-y-1/2 rounded-full bg-[#6ab7ff]/30 blur-2xl" />

      <div className="mx-auto max-w-[760px] text-center">
        <h1 className="text-6xl leading-[0.9] text-[#0b1238]">Contact</h1>
        <h2 className="text-6xl leading-[0.9] text-[#0b1238]">us</h2>
        <p className="mt-4 text-2xl text-[#2b3656]">
          We are here for any questions or consultations, our team is always available to you.
        </p>
      </div>

      <form onSubmit={onSubmit} className="mx-auto mt-6 max-w-[760px] rounded-[20px] bg-[#d8e6f7] p-7 shadow-[0px_10px_24px_rgba(15,23,42,0.12)]">
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="mb-1 block text-right text-xs tracking-[0.16em] text-[#3b4360]">EMAIL</label>
            <input className="w-full rounded-md bg-white px-3 py-3" defaultValue="name@company.com" />
          </div>
          <div>
            <label className="mb-1 block text-right text-xs tracking-[0.16em] text-[#3b4360]">FULL NAME</label>
            <input className="w-full rounded-md bg-white px-3 py-3 text-right" defaultValue="Full name" />
          </div>
        </div>
        <div className="mt-4">
          <label className="mb-1 block text-right text-xs tracking-[0.16em] text-[#3b4360]">SUBJECT OF THE INQUIRY</label>
          <input className="w-full rounded-md bg-white px-3 py-3 text-right" defaultValue="What can we help with?" />
        </div>
        <div className="mt-4">
          <label className="mb-1 block text-right text-xs tracking-[0.16em] text-[#3b4360]">MESSAGE CONTENT</label>
          <textarea className="h-32 w-full rounded-md bg-white px-3 py-3 text-right" defaultValue="Write to us here." />
        </div>
        <div className="mt-6 flex justify-end">
          <button className="rounded-full bg-[#08286a] px-8 py-3 text-white">Sending a message</button>
        </div>
      </form>

      <div className="mx-auto mt-6 flex max-w-[420px] justify-center gap-4 text-xs text-[#2d3255]">
        {["Facebook", "Instagram", "Email", "WhatsApp"].map((label) => (
          <div key={label} className="text-center">
            <div className="mx-auto mb-1 flex size-10 items-center justify-center rounded-full bg-[#201c44] text-white">•</div>
            {label}
          </div>
        ))}
      </div>

      {submitted && (
        <>
          <div className="absolute inset-0 bg-[rgba(15,23,42,0.45)]" />
          <div className="absolute left-1/2 top-1/2 w-[620px] -translate-x-1/2 -translate-y-1/2 rounded-[24px] bg-[#deecfd] p-8 text-center shadow-2xl">
            <button className="absolute left-5 top-4 text-slate-500" onClick={() => setSubmitted(false)}>
              X
            </button>
            <div className="mx-auto w-[360px] rounded-full bg-[#6ab7ff] px-5 py-1 text-3xl text-[#1e1b4b]">
              Your request has been successfully received!
            </div>
            <p className="mt-8 text-3xl text-[#1f2948]">
              Thank you for your inquiry! We will respond as soon as possible.
            </p>
            <button className="mx-auto mt-10 block rounded-full bg-[#201c44] px-12 py-3 text-xl text-white">
              ← Back to main page
            </button>
          </div>
        </>
      )}
    </section>
  );
}
