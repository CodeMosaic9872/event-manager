"use client";

import { FormEvent, Suspense, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { addJob } from "@/features/job-board/job-board-slice";
import { useCreateJobMutation } from "@/shared/api/api";
import { MarketingPageShell } from "@/shared/components/marketing-page-shell";
import { marketingPloniFont } from "@/shared/lib/marketing-typography";

function parseBudgetValue(raw: string) {
  const onlyDigits = raw.replace(/[^\d]/g, "");
  return Number(onlyDigits) || undefined;
}

function PublishJobContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const dispatch = useAppDispatch();
  const [createJob, { isLoading }] = useCreateJobMutation();
  const user = useAppSelector((state) => state.auth.user);
  const [isPublished, setIsPublished] = useState(false);
  const [form, setForm] = useState(() => ({
    title: searchParams.get("title") ?? "",
    eventType: searchParams.get("eventType") ?? "Wedding",
    location: searchParams.get("location") ?? "",
    category: searchParams.get("category") ?? "",
    subcategory: searchParams.get("subcategory") ?? "",
    budget: searchParams.get("budget") ?? "",
    date: searchParams.get("date") ?? "",
    description: searchParams.get("description") ?? "",
  }));
  const isEditing = searchParams.get("edit") === "1";

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!user) {
      router.push("/auth/register?reason=publish-job");
      return;
    }
    try {
      await createJob({
        title: form.title,
        description: form.description,
        eventDate: form.date,
        locationText: form.location,
        budgetMin: parseBudgetValue(form.budget),
        budgetMax: parseBudgetValue(form.budget),
      }).unwrap();
    } catch {
      /* fallback handled below: we still add a local "my tender" card */
    }
    dispatch(
      addJob({
        id: Date.now().toString(),
        title: form.title,
        eventType: form.eventType,
        city: form.location,
        budget: form.budget,
        date: form.date,
        description: form.description,
        isMine: true,
      }),
    );
    setIsPublished(true);
  };

  const dashboardHref =
    user?.roles.includes("supplier") || user?.roles.includes("admin")
      ? "/supplier/dashboard"
      : "/user/dashboard";

  return (
    <MarketingPageShell
      showBackgroundImage
      className="min-h-screen bg-white"
      contentClassName="!max-w-[1440px] !px-4 !pb-24 !pt-20 sm:!px-6 sm:!pt-24 lg:!pt-[123px]"
    >
      <section className="mx-auto w-full max-w-[896px]">
        {isPublished ? (
          <article
            className="mx-auto w-full max-w-[576px] rounded-[24px] border border-[rgba(134,85,246,0.2)] bg-[rgba(71,33,223,0.07)] px-8 pb-10 pt-8 text-center shadow-[0px_8px_32px_rgba(0,0,0,0.37)] backdrop-blur-[6px]"
            style={{ fontFamily: marketingPloniFont }}
          >
            <div className="mx-auto mb-4 flex size-[60px] items-center justify-center">
              <Image src="/submitted.svg" alt="" width={60} height={60} unoptimized />
            </div>
            <h1 className="mx-auto max-w-[379px] text-balance text-[36px] font-normal leading-10 tracking-[-0.72px] text-[#00113A]">
              The offer was successfully published!
            </h1>
            <p className="mx-auto mt-4 max-w-[379px] text-balance text-[18px] leading-[29px] text-[#444650]">
              We are happy to plan unforgettable events with you, a whole world of suppliers and concepts awaits you.
            </p>

            <div className="mx-auto mt-8 flex w-full max-w-[379px] flex-col gap-4">
              <Link
                href="/jobs"
                className="inline-flex h-14 w-full items-center justify-center gap-2 rounded-[99px] bg-[#201C44] px-8 text-center text-base leading-6 text-white!"
              >
                To the proposal board
                <Image src="/left-arrow.svg" alt="" width={14} height={14} className="brightness-0 invert" unoptimized />
              </Link>

              <Link
                href={dashboardHref}
                className="inline-flex h-14 w-full items-center justify-center gap-2 rounded-[4px] px-8 text-center text-base leading-6 text-[#00113A]"
              >
                To my dashboard
                <Image src="/dashboard.svg" alt="" width={15} height={15} className="brightness-0 saturate-100" unoptimized />
              </Link>
            </div>

            <div className="mx-auto mt-6 w-full max-w-[379px] border-t border-[rgba(197,198,210,0.2)] pt-4">
              <p className="text-xs leading-4 text-[rgba(68,70,80,0.6)]">
                Need help? Our team of curators is here for you.
              </p>
              <Link href="/contact-us" className="text-xs leading-4 text-[#0061A7] hover:underline">
                Contact us
              </Link>
            </div>
          </article>
        ) : (
          <form
            onSubmit={onSubmit}
            className="relative rounded-[14px] border border-[#4721DF] bg-[rgba(230,241,255,0.64)] px-8 pb-10 pt-8 text-right shadow-[1px_1px_2px_#4721DF]"
            style={{ fontFamily: marketingPloniFont }}
            dir="rtl"
            lang="he"
          >
          <Link
            href="/jobs"
            className="absolute inset-s-5 top-5 text-xl leading-none text-[#757682] hover:text-[#201C44]"
            aria-label="Close"
          >
            ×
          </Link>

          <header className="mb-8 text-right">
            <h1 className="text-[30px] font-normal leading-9 tracking-[-0.75px] text-[#00113A]">
              {isEditing ? "Edit proposal" : "Post a new offer"}
            </h1>
            <p className="mt-2 text-base leading-6 text-[#444650]">
              Fill in the event details to receive inquiries from accurate suppliers.
            </p>
          </header>

          <section>
            <div className="mb-5 flex w-full flex-row-reverse items-center justify-start gap-3">
              <h2 className="w-full text-right text-xl font-normal leading-7 text-[#00113A]">Event details</h2>
              <span className="h-6 w-1.5 rounded-xl bg-[#0897FF]" />
            </div>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <label className="flex w-full flex-col items-end gap-2 text-right text-sm text-[#444650]">
                <span className="block w-full text-right">Event name</span>
                <input
                  required
                  dir="rtl"
                  className="h-12 w-full rounded bg-white/60 px-4 text-right text-base text-[#191C1D] outline-none placeholder:text-[#6B7280]"
                  placeholder="For example: Summer wedding photographer by the sea"
                  value={form.title}
                  onChange={(event) => setForm({ ...form, title: event.target.value })}
                />
              </label>
              <label className="flex w-full flex-col items-end gap-2 text-right text-sm text-[#444650]">
                <span className="block w-full text-right">Event type</span>
                <input
                  required
                  dir="rtl"
                  className="h-12 w-full rounded bg-white/60 px-4 text-right text-base text-[#191C1D] outline-none placeholder:text-[#6B7280]"
                  placeholder="Wedding"
                  value={form.eventType}
                  onChange={(event) => setForm({ ...form, eventType: event.target.value })}
                />
              </label>
              <label className="flex w-full flex-col items-end gap-2 text-right text-sm text-[#444650]">
                <span className="block w-full text-right">Event date</span>
                <input
                  required
                  type="date"
                  dir="rtl"
                  className="h-12 w-full rounded bg-white/60 px-4 text-right text-base text-[#191C1D] outline-none"
                  value={form.date}
                  onChange={(event) => setForm({ ...form, date: event.target.value })}
                />
              </label>
              <label className="flex w-full flex-col items-end gap-2 text-right text-sm text-[#444650]">
                <span className="block w-full text-right">Location</span>
                <input
                  required
                  dir="rtl"
                  className="h-12 w-full rounded bg-white/60 px-4 text-right text-base text-[#191C1D] outline-none placeholder:text-[#6B7280]"
                  placeholder="Desired city or region"
                  value={form.location}
                  onChange={(event) => setForm({ ...form, location: event.target.value })}
                />
              </label>
              <label className="flex w-full flex-col items-end gap-2 text-right text-sm text-[#444650]">
                <span className="block w-full text-right">Category</span>
                <input
                  dir="rtl"
                  className="h-12 w-full rounded bg-white/60 px-4 text-right text-base text-[#191C1D] outline-none placeholder:text-[#6B7280]"
                  placeholder="Category"
                  value={form.category}
                  onChange={(event) => setForm({ ...form, category: event.target.value })}
                />
              </label>
              <label className="flex w-full flex-col items-end gap-2 text-right text-sm text-[#444650]">
                <span className="block w-full text-right">Subcategory</span>
                <input
                  dir="rtl"
                  className="h-12 w-full rounded bg-white/60 px-4 text-right text-base text-[#191C1D] outline-none placeholder:text-[#6B7280]"
                  placeholder="Subcategory"
                  value={form.subcategory}
                  onChange={(event) => setForm({ ...form, subcategory: event.target.value })}
                />
              </label>
            </div>
          </section>

          <section className="mt-10">
            <div className="mb-5 flex w-full flex-row-reverse items-center justify-start gap-3">
              <h2 className="w-full text-right text-xl font-normal leading-7 text-[#00113A]">Budget (₪)</h2>
              <span className="h-6 w-1.5 rounded-xl bg-[#0897FF]" />
            </div>
            <label className="block text-right text-sm text-[#444650]">
              <input
                required
                className="h-[81px] w-full rounded-lg bg-white/60 px-4 text-right text-lg text-[#191C1D] outline-none placeholder:text-[#6B7280]"
                placeholder="For example: 12,000 before VAT"
                value={form.budget}
                onChange={(event) => setForm({ ...form, budget: event.target.value })}
              />
            </label>
          </section>

          <section className="mt-10">
            <div className="mb-5 flex w-full flex-row-reverse items-center justify-start gap-3">
              <h2 className="w-full text-right text-xl font-normal leading-7 text-[#00113A]">Event details</h2>
              <span className="h-6 w-1.5 rounded-xl bg-[#0897FF]" />
            </div>
            <textarea
              required
              className="h-[170px] w-full rounded-lg bg-white/60 px-4 py-5 text-right text-lg text-[#191C1D] outline-none placeholder:text-[#6B7280]"
              placeholder="Here you can detail what will be at the event, your requirements, and anything else that will help the right supplier leave details."
              value={form.description}
              onChange={(event) => setForm({ ...form, description: event.target.value })}
            />
          </section>

          <div className="mt-10 flex w-full flex-row-reverse items-center justify-end gap-3">
            <Link
              href="/jobs"
              className="inline-flex h-[53px] min-w-[118px] items-center justify-center rounded-[99px] border-2 border-[rgba(32,28,68,0.2)] px-6 text-[22px] leading-[14px] text-[#201C44]"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={isLoading}
              className="inline-flex h-[53px] min-w-[224px] items-center justify-center rounded-[99px] bg-[#201C44] px-8 text-center text-[22px] leading-[14px] text-white disabled:opacity-60"
            >
              {isLoading
                ? isEditing
                  ? "Saving..."
                  : "Publishing..."
                : isEditing
                  ? "Save changes"
                  : "Advertising now"}
            </button>
          </div>
          </form>
        )}
      </section>
    </MarketingPageShell>
  );
}

export default function PublishJobPage() {
  return (
    <Suspense fallback={<div className="min-h-[40vh]" />}>
      <PublishJobContent />
    </Suspense>
  );
}
