"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams, usePathname, useRouter } from "next/navigation";
import { useGetUserJobQuery, useUpdateUserJobMutation, useGetEventTypesQuery, useGetCategoriesQuery, useGetSubcategoriesQuery } from "@/shared/api/api";
import { useAppSelector } from "@/store/hooks";
import { marketingPloniFont } from "@/shared/lib/marketing-typography";
import { LoadingSkeleton } from "@/shared/components/loading-skeleton";
import { MarketingPageShell } from "@/shared/components/marketing-page-shell";
import type { JobSummaryResponse } from "@/shared/types";

type TenderForm = {
  title: string;
  eventTypeId: string;
  location: string;
  categoryId: string;
  subcategoryId: string;
  budget: string;
  date: string;
  description: string;
};

function formatDateForInput(iso?: string) {
  if (!iso) return "";
  try {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) {
      if (/^\d{4}-\d{2}-\d{2}/.test(iso)) return iso.slice(0, 10);
      return "";
    }
    return d.toISOString().slice(0, 10);
  } catch {
    return "";
  }
}

function mapJobToForm(job: JobSummaryResponse): TenderForm {
  const budget = job.budgetMax > 0 ? String(Math.round(job.budgetMax)) : "";
  return {
    title: job.title ?? "",
    eventTypeId: job.eventTypeId ?? "",
    location: job.locationText ?? "",
    categoryId: "",
    subcategoryId: "",
    budget,
    date: formatDateForInput(job.eventDate),
    description: job.description ?? "",
  };
}

function WalletIcon() {
  return (
    <span className="pointer-events-none absolute right-4 top-1/2 z-1 -translate-y-1/2 text-[#002366]/40" aria-hidden>
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M4 6.5C4 5.12 5.12 4 6.5 4H16.5C17.88 4 19 5.12 19 6.5V8H6.5C5.12 8 4 9.12 4 10.5V17.5C4 18.88 5.12 20 6.5 20H17.5C18.88 20 20 18.88 20 17.5V10.5C20 9.12 18.88 8 17.5 8H19V6.5C19 5.12 17.88 4 16.5 4H6.5C5.12 4 4 5.12 4 6.5Z" fill="currentColor" fillOpacity="0.45" />
        <path d="M16.5 12.5C16.5 13.33 15.83 14 15 14C14.17 14 13.5 13.33 13.5 12.5C13.5 11.67 14.17 11 15 11C15.83 11 16.5 11.67 16.5 12.5Z" fill="currentColor" fillOpacity="0.45" />
      </svg>
    </span>
  );
}

const selectClass = "h-12 w-full rounded bg-white/60 px-4 text-right text-base text-[#191C1D] outline-none appearance-none";

export default function EditTenderPage() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useParams<{ tenderId: string }>();
  const tenderId = params?.tenderId;
  const sessionUser = useAppSelector((state) => state.auth.user);
  const isAuthHydrated = useAppSelector((state) => state.auth.isHydrated);

  const { data: currentTender, isError: isFetchError, isLoading: isFetching } = useGetUserJobQuery(tenderId!, { skip: !tenderId || !isAuthHydrated || !sessionUser });
  const [updateJob, { isLoading: isSaving }] = useUpdateUserJobMutation();

  const [form, setForm] = useState<TenderForm | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (currentTender) setForm(mapJobToForm(currentTender));
  }, [currentTender]);

  useEffect(() => {
    if (!isAuthHydrated) return;
    if (sessionUser) return;
    router.replace(`/auth/login?next=${encodeURIComponent(pathname)}`);
  }, [sessionUser, isAuthHydrated, router, pathname]);

  const { data: eventTypes = [] } = useGetEventTypesQuery();
  const { data: categories = [] } = useGetCategoriesQuery();
  const [selectedCategoryId, setSelectedCategoryId] = useState("");
  const { data: subcategories = [] } = useGetSubcategoriesQuery(selectedCategoryId, { skip: !selectedCategoryId });

  const setField = (field: string, value: string) => setForm((f) => f ? { ...f, [field]: value } : null);

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!sessionUser || !tenderId || !form) return;
    try {
      await updateJob({
        id: tenderId,
        data: {
          title: form.title,
          description: form.description,
          eventDate: form.date ? `${form.date}T00:00:00.000Z` : undefined,
          eventTypeId: form.eventTypeId || undefined,
          locationText: form.location || undefined,
          budgetMax: form.budget ? Number(form.budget) : undefined,
          budgetMin: form.budget ? Number(form.budget) : undefined,
        },
      }).unwrap();
      router.push(`/user/tenders/${tenderId}/changes-saved`);
    } catch {
      setError("Failed to save tender. Please try again.");
    }
  };

  if (!isAuthHydrated) return null;
  if (!sessionUser) return null;
  if (isFetchError) {
    return (
      <MarketingPageShell showBackgroundImage className="min-h-screen bg-white" contentClassName="!max-w-[1440px] !px-4 !pb-24 !pt-20 sm:!px-6 sm:!pt-24 lg:!pt-[123px]">
        <div className="mx-auto max-w-[576px] rounded-[24px] border border-red-300 bg-red-50 p-10 text-center shadow-lg">
          <svg className="mx-auto mb-4 size-12 text-red-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
            <circle cx="12" cy="12" r="10" />
            <path d="M12 8v4M12 16h.01" />
          </svg>
          <h2 className="text-xl text-red-800" style={{ fontFamily: marketingPloniFont }}>Could not load tender</h2>
          <p className="mt-2 text-sm text-red-600">The API returned an error. Check your connection or the tender ID.</p>
          <div className="mt-6 flex justify-center gap-4">
            <Link href="/user/dashboard" className="rounded-[99px] border border-red-300 px-6 py-2 text-sm text-red-700 hover:bg-red-100">Back to dashboard</Link>
            <button onClick={() => window.location.reload()} className="rounded-[99px] bg-red-600 px-6 py-2 text-sm text-white hover:bg-red-700">Retry</button>
          </div>
        </div>
      </MarketingPageShell>
    );
  }
  if (!tenderId || (!currentTender && isFetching) || !form) {
    return (
      <MarketingPageShell showBackgroundImage className="min-h-screen bg-white" contentClassName="!max-w-[1440px] !px-4 !pb-24 !pt-20 sm:!px-6 sm:!pt-24 lg:!pt-[123px]">
        <LoadingSkeleton />
      </MarketingPageShell>
    );
  }
  if (!currentTender) {
    return (
      <MarketingPageShell showBackgroundImage className="min-h-screen bg-white" contentClassName="!max-w-[1440px] !px-4 !pb-24 !pt-20 sm:!px-6 sm:!pt-24 lg:!pt-[123px]">
        <p className="text-center text-[#00113A]" style={{ fontFamily: marketingPloniFont }}>Tender not found.</p>
        <div className="mt-4 flex justify-center">
          <Link href="/user/dashboard" className="text-[#0061A7] underline">Back to dashboard</Link>
        </div>
      </MarketingPageShell>
    );
  }

  const titleLine = `Tender preparation - ${currentTender.title}`;

  return (
    <MarketingPageShell showBackgroundImage className="min-h-screen bg-white" contentClassName="!max-w-[1440px] !px-4 !pb-24 !pt-20 sm:!px-6 sm:!pt-24 lg:!pt-[123px]">
      <section className="mx-auto w-full max-w-[896px]">
        <form onSubmit={onSubmit} className="relative rounded-[14px] border border-[#4721DF] bg-[rgba(230,241,255,0.64)] px-5 pb-8 pt-8 text-right shadow-[1px_1px_2px_#4721DF] sm:px-8" style={{ fontFamily: marketingPloniFont }} dir="rtl" lang="he">
          <Link href={`/user/tenders/${tenderId}/suppliers`} className="absolute inset-s-5 top-5 text-xl leading-none text-[#757682] hover:text-[#201C44]" aria-label="Close">×</Link>

          <header className="mb-8 pe-2 text-right sm:pe-0">
            <h1 className="text-[30px] font-normal leading-9 tracking-[-0.75px] text-[#00113A]">{titleLine}</h1>
            <p className="mt-2 text-base leading-6 text-[#444650]">Fill in the event details to receive inquiries from accurate suppliers.</p>
          </header>

          <section>
            <div className="mb-5 flex w-full flex-row-reverse items-center justify-start gap-3">
              <h2 className="w-full text-right text-xl font-normal leading-7 text-[#00113A]">Event details</h2>
              <span className="h-6 w-1.5 rounded-xl bg-[#0897FF]" />
            </div>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <label className="flex w-full flex-col items-end gap-2 text-right text-sm text-[#444650]">
                <span className="block w-full text-right">Event name</span>
                <input required dir="rtl" className="h-12 w-full rounded bg-white/60 px-4 text-right text-base text-[#191C1D] outline-none placeholder:text-[#6B7280]" placeholder="Event name" value={form.title} onChange={(e) => setField("title", e.target.value)} />
              </label>
              <label className="flex w-full flex-col items-end gap-2 text-right text-sm text-[#444650]">
                <span className="block w-full text-right">Event type</span>
                <select value={form.eventTypeId} onChange={(e) => setField("eventTypeId", e.target.value)} className={selectClass}>
                  <option value="">Select event type</option>
                  {eventTypes.map((et) => <option key={et.id} value={et.id}>{et.name}</option>)}
                </select>
              </label>
              <label className="flex w-full flex-col items-end gap-2 text-right text-sm text-[#444650]">
                <span className="block w-full text-right">Event date</span>
                <input required type="date" dir="rtl" className="h-12 w-full rounded bg-white/60 px-4 text-right text-base text-[#191C1D] outline-none" value={form.date} onChange={(e) => setField("date", e.target.value)} />
              </label>
              <label className="flex w-full flex-col items-end gap-2 text-right text-sm text-[#444650]">
                <span className="block w-full text-right">Location</span>
                <input required dir="rtl" className="h-12 w-full rounded bg-white/60 px-4 text-right text-base text-[#191C1D] outline-none placeholder:text-[#6B7280]" placeholder="City or region" value={form.location} onChange={(e) => setField("location", e.target.value)} />
              </label>
              <label className="flex w-full flex-col items-end gap-2 text-right text-sm text-[#444650]">
                <span className="block w-full text-right">Category</span>
                <select value={form.categoryId} onChange={(e) => { setField("categoryId", e.target.value); setSelectedCategoryId(e.target.value); setField("subcategoryId", ""); }} className={selectClass}>
                  <option value="">Select category</option>
                  {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </label>
              <label className="flex w-full flex-col items-end gap-2 text-right text-sm text-[#444650]">
                <span className="block w-full text-right">Subcategory</span>
                <select value={form.subcategoryId} onChange={(e) => setField("subcategoryId", e.target.value)} className={selectClass} disabled={!selectedCategoryId}>
                  <option value="">Select subcategory</option>
                  {subcategories.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </label>
            </div>
          </section>

          <section className="mt-10">
            <div className="mb-5 flex w-full flex-row-reverse items-center justify-start gap-3">
              <h2 className="w-full text-right text-xl font-normal leading-7 text-[#00113A]">Budget (₪)</h2>
              <span className="h-6 w-1.5 rounded-xl bg-[#0897FF]" />
            </div>
            <label className="relative block text-right text-sm text-[#444650]">
              <input required inputMode="numeric" className="h-[81px] w-full max-w-full rounded-lg bg-white/60 py-3 pe-14 ps-4 text-right text-lg text-[#191C1D] outline-none placeholder:text-[#6B7280] sm:max-w-[448px]" placeholder="For example: 12,000" value={form.budget} onChange={(e) => setField("budget", e.target.value.replace(/[^\d]/g, ""))} />
              <WalletIcon />
            </label>
          </section>

          <section className="mt-10">
            <div className="mb-5 flex w-full flex-row-reverse items-center justify-start gap-3">
              <h2 className="w-full text-right text-xl font-normal leading-7 text-[#00113A]">Event description</h2>
              <span className="h-6 w-1.5 rounded-xl bg-[#0897FF]" />
            </div>
            <textarea required className="h-[170px] w-full rounded-lg bg-white/60 px-4 py-5 text-right text-lg text-[#191C1D] outline-none placeholder:text-[#6B7280]" placeholder="Detail the event..." value={form.description} onChange={(e) => setField("description", e.target.value)} />
          </section>

          {error && (
            <div className="mt-4 flex items-center gap-3 rounded-lg border border-red-300 bg-red-50 p-4 text-right text-sm text-red-800">
              <svg className="size-5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <circle cx="12" cy="12" r="10" />
                <path d="M12 8v4M12 16h.01" />
              </svg>
              <span className="flex-1">{error}</span>
            </div>
          )}

          <div className="mt-10 flex w-full flex-row-reverse flex-wrap items-center justify-end gap-3">
            <Link href={`/user/tenders/${tenderId}/suppliers`} className="inline-flex h-[53px] min-w-[160px] items-center justify-center rounded-[99px] border-2 border-[rgba(32,28,68,0.2)] px-6 text-center text-lg leading-tight text-[#201C44] sm:min-w-[174px] sm:text-[22px] sm:leading-[14px]">
              Tender closing
            </Link>
            <button type="submit" disabled={isSaving} className="inline-flex h-[53px] min-w-[180px] items-center justify-center rounded-[99px] bg-[#201C44] px-8 text-center text-lg leading-tight text-white disabled:opacity-60 sm:min-w-[224px] sm:text-[22px] sm:leading-[14px]">
              {isSaving ? "Saving..." : "Save changes"}
            </button>
          </div>
        </form>
      </section>
    </MarketingPageShell>
  );
}
