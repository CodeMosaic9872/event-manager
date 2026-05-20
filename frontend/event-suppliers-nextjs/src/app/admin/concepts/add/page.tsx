"use client";

import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { ChangeEvent, FormEvent, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ArticleSpecIcon } from "@/shared/components/event-concept-article/article-spec-icon";
import { MarketingPageShell } from "@/shared/components/marketing-page-shell";
import { ProtectedRoute } from "@/shared/components/protected-route";
import { marketingPloniFont } from "@/shared/lib/marketing-typography";

const EVENT_TYPES = ["חתונה", "אירוע עסקי", "כנס", "מסיבה פרטית"] as const;

const SUPPLIERS = [
  {
    id: "taimim",
    name: "קייטרינג 'טעמים'",
    category: "קולינריה עילית",
    image: "/avatars/2.jpg",
    rating: true,
  },
  {
    id: "dj-alon",
    name: "דיג'יי אלון כהן",
    category: "מוזיקה ואווירה",
    image: "/avatars/3.jpg",
    rating: true,
  },
  {
    id: "sharon",
    name: "שרון פוטוגרפי",
    category: "תיעוד ויזואלי",
    image: "/avatars/1.jpg",
    rating: true,
  },
] as const;

const GALLERY_SEED = ["/avatars/4.jpg", "/avatars/5.jpg"] as const;

function SectionTitle({ children }: { children: ReactNode }) {
  return (
    <h2 className="border-r-4 border-[#4721DF] pr-6 text-right text-xl font-bold leading-8 text-[#00113A] sm:text-2xl">
      {children}
    </h2>
  );
}

function FieldLabel({ children }: { children: ReactNode }) {
  return (
    <label className="mb-2 block text-right text-[12px] font-bold uppercase leading-4 tracking-[1.2px] text-[#444650]">
      {children}
    </label>
  );
}

function StarIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="#FBBF24" aria-hidden className="shrink-0">
      <path d="M6 1.2l1.4 2.9 3.1.5-2.25 2.2.53 3.1L6 8.4 3.22 9.9l.53-3.1L1.5 4.6l3.1-.5L6 1.2z" />
    </svg>
  );
}

function RichTextToolbar() {
  const btn =
    "flex size-9 items-center justify-center rounded-sm text-sm font-semibold text-[#191C1D] transition hover:bg-black/5";
  return (
    <div className="flex flex-wrap gap-2 border-b border-[#C5C6D2]/20 px-2 py-2" dir="rtl">
      <button type="button" className={btn} aria-label="Bold">
        B
      </button>
      <button type="button" className={`${btn} italic`} aria-label="Italic">
        I
      </button>
      <button type="button" className={btn} aria-label="Bullet list">
        •
      </button>
      <button type="button" className={btn} aria-label="Numbered list">
        1.
      </button>
      <button type="button" className={btn} aria-label="Link">
        ↗
      </button>
    </div>
  );
}

function SupplierCheck({ selected }: { selected: boolean }) {
  return (
    <span
      className={`flex size-8 shrink-0 items-center justify-center rounded-xl border-2 transition ${
        selected
          ? "border-[#4721DF] bg-[#4721DF] text-white shadow-md"
          : "border-[#C5C6D2] bg-white"
      }`}
      aria-hidden
    >
      {selected ? (
        <svg width="13" height="10" viewBox="0 0 13 10" fill="none">
          <path
            d="M1 5L4.5 8.5L12 1"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      ) : null}
    </span>
  );
}

export default function AdminAddConceptPage() {
  const router = useRouter();
  const galleryInputRef = useRef<HTMLInputElement | null>(null);

  const [productName, setProductName] = useState("");
  const [marketingHeadline, setMarketingHeadline] = useState("");
  const [eventType, setEventType] = useState("");
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");
  const [supplierQuery, setSupplierQuery] = useState("");
  const [selectedSupplierIds, setSelectedSupplierIds] = useState<Set<string>>(
    () => new Set(["taimim"]),
  );
  const [galleryUrls, setGalleryUrls] = useState<string[]>([]);

  useEffect(() => {
    return () => {
      for (const url of galleryUrls) {
        if (url.startsWith("blob:")) URL.revokeObjectURL(url);
      }
    };
  }, [galleryUrls]);

  const cardSurface =
    "flex w-full min-w-0 flex-col gap-6 rounded-[20px] border border-[#4721DF] bg-[#D3E2F5] p-6 shadow-[0px_20px_40px_rgba(0,17,58,0.04)] sm:gap-8 sm:p-8 lg:p-10";
  const inputClass =
    "h-14 w-full min-w-0 rounded bg-[#F3F4F5] px-4 text-right text-base leading-6 text-[#1E293B] outline-none placeholder:text-[#6B7280] focus:ring-2 focus:ring-[#4721DF]/25";
  const bentoClass =
    "flex min-w-0 flex-col gap-4 rounded-lg border border-[rgba(0,17,58,0.1)] bg-[rgba(0,17,58,0.05)] p-6 sm:p-8";

  const toggleSupplier = (id: string) => {
    setSelectedSupplierIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const onGalleryPick = (e: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;
    const urls = files.map((f) => URL.createObjectURL(f));
    setGalleryUrls((prev) => [...prev, ...urls].slice(0, 8));
    e.target.value = "";
  };

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    router.push("/admin");
  };

  const filteredSuppliers = SUPPLIERS.filter(
    (s) =>
      !supplierQuery.trim() ||
      s.name.includes(supplierQuery) ||
      s.category.includes(supplierQuery),
  );

  return (
    <ProtectedRoute roles={["admin"]}>
      <MarketingPageShell
        showBackgroundImage
        dir="rtl"
        lang="he"
        className="min-h-screen"
        contentClassName="!max-w-[1184px] !items-stretch !px-4 !pb-16 !pt-24 sm:!px-6 sm:!pt-28 lg:!px-0 lg:!pt-32"
      >
        <div
          className="flex w-full min-w-0 flex-col gap-8 sm:gap-12"
          style={{ fontFamily: marketingPloniFont }}
        >
          <header className="flex w-full min-w-0 flex-col items-start gap-2">
            <nav
              className="flex w-full min-w-0 flex-wrap items-center justify-start gap-x-2 gap-y-1 text-[12px] leading-4 tracking-[1.2px]"
              aria-label="breadcrumb"
            >
              <Link href="/admin" className="uppercase text-[#757682] hover:underline">
                ניהול מערכת
              </Link>
              <span className="text-[#757682]" aria-hidden>
                ›
              </span>
              <span className="uppercase text-[#757682]">פעולות מהירות</span>
              <span className="text-[#757682]" aria-hidden>
                ›
              </span>
              <span className="font-bold uppercase text-[#00113A]">הוספת מוצר לחנות</span>
            </nav>
            <h1 className="w-full min-w-0 text-pretty text-right text-2xl font-bold leading-tight tracking-[-0.03em] text-[#00113A] sm:text-3xl sm:leading-10 lg:text-[36px]">
              הוספת מוצר לחנות
            </h1>
          </header>

          <form onSubmit={onSubmit} className="flex w-full min-w-0 flex-col gap-8 sm:gap-12">
            {/* מידע בסיסי */}
            <section className={cardSurface}>
              <SectionTitle>מידע בסיסי</SectionTitle>

              <div className="flex w-full min-w-0 flex-col gap-6">
                <div className="grid w-full min-w-0 grid-cols-1 gap-6 md:grid-cols-2">
                  <div className="min-w-0">
                    <FieldLabel>שם המוצר</FieldLabel>
                    <input
                      value={productName}
                      onChange={(ev) => setProductName(ev.target.value.slice(0, 120))}
                      placeholder="שם המוצר"
                      className={inputClass}
                    />
                  </div>
                  <div className="min-w-0">
                    <FieldLabel>כותרת שיווקית</FieldLabel>
                    <input
                      value={marketingHeadline}
                      onChange={(ev) => setMarketingHeadline(ev.target.value.slice(0, 80))}
                      placeholder="כותרת משנית"
                      maxLength={80}
                      className={inputClass}
                    />
                  </div>
                </div>

                <div className="w-full min-w-0 md:max-w-[calc(50%-0.75rem)]">
                  <FieldLabel>סוג אירוע</FieldLabel>
                  <div className="relative">
                    <select
                      value={eventType}
                      onChange={(ev) => setEventType(ev.target.value)}
                      className={`${inputClass} appearance-none pe-10`}
                    >
                      <option value="">בחר סוג אירוע</option>
                      {EVENT_TYPES.map((t) => (
                        <option key={t} value={t}>
                          {t}
                        </option>
                      ))}
                    </select>
                    <span
                      className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#6B7280]"
                      aria-hidden
                    >
                      ▾
                    </span>
                  </div>
                </div>

                <div className="grid w-full min-w-0 grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className={bentoClass}>
                    <div className="flex flex-row items-center gap-3">
                      <span className="text-[12px] font-bold uppercase leading-4 tracking-[1.2px] text-[#4721DF]">
                        כמות קהל
                      </span>
                      <span className="text-[#4721DF]">
                        <ArticleSpecIcon icon="users" />
                      </span>
                    </div>
                    <p className="text-right text-[30px] font-bold leading-[44px] text-black">
                      250 איש
                    </p>
                  </div>
                  <div className={bentoClass}>
                    <div className="flex flex-row items-center gap-3">
                      <span className="text-[12px] font-bold uppercase leading-4 tracking-[1.2px] text-[#4721DF]">
                        תקציב משוער
                      </span>
                      <span className="text-[#4721DF]">
                        <ArticleSpecIcon icon="wallet" />
                      </span>
                    </div>
                    <p className="text-right text-[30px] font-bold leading-[44px] text-black" dir="ltr">
                      <span className="text-xl font-bold text-[#757682]">₪</span>{" "}
                      150,000
                    </p>
                  </div>
                </div>

                <div className="min-w-0">
                  <FieldLabel>מקום / לוקיישן</FieldLabel>
                  <div className="relative">
                    <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[#757682]">
                      <ArticleSpecIcon icon="map-pin" />
                    </span>
                    <input
                      value={location}
                      onChange={(ev) => setLocation(ev.target.value)}
                      placeholder="חפש מיקום או הזן כתובת"
                      className={`${inputClass} pe-12`}
                    />
                  </div>
                </div>

                <div className="min-w-0">
                  <FieldLabel>תיאור מפורט</FieldLabel>
                  <div className="overflow-hidden rounded bg-[#F3F4F5] p-1">
                    <RichTextToolbar />
                    <textarea
                      value={description}
                      onChange={(ev) => setDescription(ev.target.value)}
                      placeholder="תאר את האווירה, העיצוב והחוויה הכוללת..."
                      rows={6}
                      className="min-h-[176px] w-full resize-y border-0 bg-transparent px-4 py-4 text-right text-base leading-6 text-[#1E293B] outline-none placeholder:text-[#6B7280] focus:ring-0"
                    />
                  </div>
                </div>
              </div>
            </section>

            {/* ניהול גלריית תמונות */}
            <section className={cardSurface}>
              <div className="flex w-full min-w-0 flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <SectionTitle>ניהול גלריית תמונות</SectionTitle>
                <button
                  type="button"
                  onClick={() => galleryInputRef.current?.click()}
                  className="inline-flex shrink-0 flex-row items-center justify-center gap-2 self-start rounded bg-[#D2E4FF] px-6 py-3 text-[14px] font-bold leading-5 text-[#4721DF] transition hover:opacity-90 sm:self-center"
                >
                  <span>העלה קבצים</span>
                  <Image src="/icons/upload.svg" alt="" width={14} height={14} unoptimized aria-hidden />
                </button>
              </div>
              <input
                ref={galleryInputRef}
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={onGalleryPick}
              />
              <div
                className="grid w-full min-w-0 grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-[repeat(auto-fill,minmax(140px,1fr))]"
                dir="rtl"
              >
                <button
                  type="button"
                  onClick={() => galleryInputRef.current?.click()}
                  className="flex aspect-square w-full min-w-0 flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-black bg-transparent text-black transition hover:bg-black/5"
                >
                  <Image
                    src="/icons/upload.svg"
                    alt=""
                    width={33}
                    height={24}
                    className="opacity-80"
                    unoptimized
                    aria-hidden
                  />
                  <span className="text-[12px] font-bold uppercase leading-4 tracking-[1.2px]">
                    הוסף חדש
                  </span>
                </button>
                {galleryUrls.map((src) => (
                  <div
                    key={src}
                    className="relative aspect-square w-full min-w-0 overflow-hidden rounded-lg border border-[#4721DF]/40 bg-slate-200"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={src} alt="" className="size-full object-cover" />
                  </div>
                ))}
                {GALLERY_SEED.map((src) => (
                  <div
                    key={src}
                    className="relative aspect-square w-full min-w-0 overflow-hidden rounded-lg bg-slate-200"
                  >
                    <Image src={src} alt="" fill sizes="170px" className="object-cover" unoptimized />
                  </div>
                ))}
              </div>
            </section>

            {/* נבחרת ספקים */}
            <section className={`${cardSurface} gap-8 sm:gap-10`}>
              <div className="flex w-full min-w-0 flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                <SectionTitle>נבחרת ספקים</SectionTitle>
                <div className="relative w-full min-w-0 lg:max-w-sm">
                  <span
                    className="pointer-events-none absolute top-1/2 -translate-y-1/2 inset-s-4 text-[#757682]"
                    aria-hidden
                  >
                    <Image src="/icons/search.svg" alt="" width={18} height={18} unoptimized />
                  </span>
                  <input
                    value={supplierQuery}
                    onChange={(ev) => setSupplierQuery(ev.target.value)}
                    placeholder="חפש ספק לפי שם, קטגוריה או דירוג..."
                    className="h-11 w-full rounded-lg border-0 bg-white ps-12 pe-4 text-right text-sm leading-5 text-[#1E293B] shadow-sm outline-none placeholder:text-[#6B7280] focus:ring-2 focus:ring-[#4721DF]/25"
                  />
                </div>
              </div>

              <div className="grid w-full min-w-0 grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                {filteredSuppliers.map((s) => {
                  const selected = selectedSupplierIds.has(s.id);
                  return (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => toggleSupplier(s.id)}
                      className={`flex w-full min-w-0 flex-row items-center justify-between gap-4 rounded-2xl bg-white p-6 text-right transition ${
                        selected
                          ? "border-2 border-[#4721DF] shadow-[0px_10px_15px_-3px_rgba(0,0,0,0.1)]"
                          : "border border-transparent shadow-sm"
                      }`}
                    >
                      <div className="flex min-w-0 flex-1 flex-row items-center gap-5">
                        <div className="relative size-16 shrink-0 overflow-hidden rounded-lg bg-[#F3F4F5] shadow-inner">
                          <Image
                            src={s.image}
                            alt=""
                            fill
                            sizes="64px"
                            className="object-cover"
                            unoptimized
                          />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-base font-bold leading-6 text-[#172554]">
                            {s.name}
                          </p>
                          <div className="mt-1 flex flex-row items-center gap-1">
                            {s.rating ? <StarIcon /> : null}
                            <span className="text-[12px] font-bold uppercase leading-4 tracking-[-0.3px] text-[#444650]">
                              {s.category}
                            </span>
                          </div>
                        </div>
                      </div>
                      <SupplierCheck selected={selected} />
                    </button>
                  );
                })}
              </div>
            </section>

            <div className="flex w-full min-w-0 flex-wrap items-center justify-end gap-4 pt-2">
              <button
                type="submit"
                className="rounded-[99px] bg-[#201C44] px-10 py-5 text-[14px] font-bold uppercase leading-5 tracking-[1.4px] text-white transition hover:opacity-95 sm:px-12"
              >
                הוסף מוצר לחנות
              </button>
              <button
                type="button"
                onClick={() => router.push("/admin")}
                className="rounded-[99px] border border-black bg-transparent px-10 py-5 text-[14px] font-bold uppercase leading-5 tracking-[1.4px] text-black transition hover:bg-black/5 sm:px-12"
              >
                ביטול
              </button>
            </div>
          </form>
        </div>
      </MarketingPageShell>
    </ProtectedRoute>
  );
}
