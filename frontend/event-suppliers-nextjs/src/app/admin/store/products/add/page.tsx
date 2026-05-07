"use client";

import Image from "next/image";
import type { ReactNode } from "react";
import { ChangeEvent, FormEvent, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ArticleSpecIcon } from "@/shared/components/event-concept-article/article-spec-icon";
import { MarketingModal } from "@/shared/components/marketing-modal";
import { ProtectedRoute } from "@/shared/components/protected-route";
import { marketingPloniFont } from "@/shared/lib/marketing-typography";

function SuccessBadgeCheckIcon() {
  return (
    <span className="flex size-[29px] shrink-0 items-center justify-center rounded-full bg-[#1E1E3F]" aria-hidden>
      <svg width="14" height="11" viewBox="0 0 14 11" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
          d="M1 5.5L4.5 9L13 1"
          stroke="white"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </span>
  );
}

const EVENT_TYPES = ["Corporate gala", "Wedding", "Conference", "Private party"] as const;

const SUPPLIERS = [
  {
    id: "sharon",
    name: "Sharon Photography",
    category: "DOCUMENTATION",
    image: "/camera-blue.svg",
  },
  {
    id: "taimim",
    name: "Taimim Catering",
    category: "HIGH-END CULINARY",
    image: "/avatars/2.jpg",
  },
  {
    id: "dj-alon",
    name: "DJ Alon Cohen",
    category: "MUSIC & ATMOSPHERE",
    image: "/avatars/3.jpg",
  },
] as const;

function SectionTitle({ children }: { children: ReactNode }) {
  return (
    <h2 className="border-r-4 border-[#8655F6] pr-3 text-right text-xl font-normal leading-7 text-[#201C44]">
      {children}
    </h2>
  );
}

function RichTextToolbar() {
  const btn =
    "flex size-9 items-center justify-center rounded-lg border border-[#E2E8F0] bg-white text-sm font-semibold text-[#475569] transition hover:bg-slate-50";
  return (
    <div className="flex flex-wrap justify-end gap-2 border-b border-[#E2E8F0] pb-2" dir="ltr">
      <button type="button" className={btn} aria-label="Bold">
        B
      </button>
      <button type="button" className={`${btn} italic`} aria-label="Italic">
        I
      </button>
      <button type="button" className={btn} aria-label="Bullet list">
        •≡
      </button>
      <button type="button" className={btn} aria-label="Numbered list">
        1.
      </button>
      <button type="button" className={btn} aria-label="Link">
        Link
      </button>
    </div>
  );
}

export default function AdminAddStoreProductPage() {
  const router = useRouter();
  const galleryInputRef = useRef<HTMLInputElement | null>(null);

  const [marketingHeadline, setMarketingHeadline] = useState("");
  const [productName, setProductName] = useState("");
  const [eventType, setEventType] = useState("");
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");
  const [supplierQuery, setSupplierQuery] = useState("");
  const [selectedSupplierIds, setSelectedSupplierIds] = useState<Set<string>>(
    () => new Set(["taimim"]),
  );
  const [galleryUrls, setGalleryUrls] = useState<string[]>([]);
  const [successOpen, setSuccessOpen] = useState(false);

  useEffect(() => {
    return () => {
      for (const url of galleryUrls) {
        if (url.startsWith("blob:")) URL.revokeObjectURL(url);
      }
    };
  }, [galleryUrls]);

  const inputClass =
    "h-[50px] w-full rounded-2xl border border-[#E2E8F0] bg-white px-4 py-3 text-right text-sm leading-6 text-[#1E293B] outline-none focus:ring-2 focus:ring-[#8655F6]/25";
  const cardSurface =
    "rounded-[24px] border border-[#8655F6]/20 bg-[rgba(255,255,255,0.85)] p-6 shadow-[0px_8px_32px_rgba(0,0,0,0.12)] backdrop-blur-[6px] sm:p-8";

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
    setSuccessOpen(true);
  };

  const filteredSuppliers = SUPPLIERS.filter(
    (s) =>
      !supplierQuery.trim() ||
      s.name.toLowerCase().includes(supplierQuery.toLowerCase()) ||
      s.category.toLowerCase().includes(supplierQuery.toLowerCase()),
  );

  return (
    <ProtectedRoute roles={["admin"]}>
      <section
        dir="rtl"
        className="relative mx-auto min-h-screen w-full overflow-x-hidden px-4 pb-16 pt-24 sm:px-6"
        style={{ fontFamily: marketingPloniFont }}
      >

        <div className="relative z-10 mx-auto w-full max-w-6xl">
          <header className="mb-8 text-right">
            <p className="text-xs uppercase tracking-[1.2px] text-[#757682]">
              System management · Quick actions · Adding a product
            </p>
            <h1 className="mt-2 text-3xl font-normal leading-tight tracking-[-0.02em] text-[#00113A] sm:text-4xl sm:leading-10">
              Adding a product to the store
            </h1>
          </header>

          <form onSubmit={onSubmit} className="flex flex-col gap-8">
            <div className={cardSurface}>
              <SectionTitle>Basic information</SectionTitle>

              <div className="mt-6 flex flex-col gap-6">
                <div className="grid gap-6 md:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-right text-xs font-normal uppercase tracking-wide text-[#64748B]">
                      Marketing headline
                    </label>
                    <input
                      value={marketingHeadline}
                      onChange={(ev) => setMarketingHeadline(ev.target.value.slice(0, 80))}
                      placeholder="Secondary title"
                      maxLength={80}
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-right text-xs font-normal uppercase tracking-wide text-[#64748B]">
                      Product name
                    </label>
                    <input
                      value={productName}
                      onChange={(ev) => setProductName(ev.target.value.slice(0, 80))}
                      placeholder="Product name"
                      maxLength={80}
                      className={inputClass}
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-right text-xs font-normal uppercase tracking-wide text-[#64748B]">
                    Event type
                  </label>
                  <div className="relative w-full">
                    <select
                      value={eventType}
                      onChange={(ev) => setEventType(ev.target.value)}
                      className={`${inputClass} appearance-none`}
                    >
                      <option value="">Select event type</option>
                      {EVENT_TYPES.map((t) => (
                        <option key={t} value={t}>
                          {t}
                        </option>
                      ))}
                    </select>
                    <span
                      className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#6B7280]"
                      aria-hidden
                    >
                      ▾
                    </span>
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="rounded-2xl border border-[#E2E8F0] bg-white/90 p-4 shadow-sm">
                    <div className="flex flex-row-reverse items-start gap-3">
                      <div className="flex flex-1 flex-col gap-1 text-right">
                        <span className="text-xs font-normal uppercase tracking-wide text-[#64748B]">
                          Estimated budget
                        </span>
                        <span className="text-lg font-normal text-[#0F172A]" dir="ltr">
                          ₪150,000
                        </span>
                      </div>
                      <span className="inline-flex size-10 items-center justify-center rounded-xl bg-[#E8F1FE] text-[#2B3A67]">
                        <ArticleSpecIcon icon="wallet" />
                      </span>
                    </div>
                  </div>
                  <div className="rounded-2xl border border-[#E2E8F0] bg-white/90 p-4 shadow-sm">
                    <div className="flex flex-row-reverse items-start gap-3">
                      <div className="flex flex-1 flex-col gap-1 text-right">
                        <span className="text-xs font-normal uppercase tracking-wide text-[#64748B]">
                          Audience size
                        </span>
                        <span className="text-lg font-normal text-[#0F172A]">250 people</span>
                      </div>
                      <span className="inline-flex size-10 items-center justify-center rounded-xl bg-[#E8F1FE] text-[#2B3A67]">
                        <ArticleSpecIcon icon="users" />
                      </span>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-right text-xs font-normal uppercase tracking-wide text-[#64748B]">
                    Place / location
                  </label>
                  <div className="relative">
                    <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#64748B]">
                      <ArticleSpecIcon icon="map-pin" />
                    </span>
                    <input
                      value={location}
                      onChange={(ev) => setLocation(ev.target.value)}
                      placeholder="Search for a location or enter an address"
                      className={`${inputClass} pr-11`}
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-right text-xs font-normal uppercase tracking-wide text-[#64748B]">
                    Detailed description
                  </label>
                  <div className="overflow-hidden rounded-2xl border border-[#E2E8F0] bg-white">
                    <div className="px-3 pt-3">
                      <RichTextToolbar />
                    </div>
                    <textarea
                      value={description}
                      onChange={(ev) => setDescription(ev.target.value)}
                      placeholder="Describe the atmosphere, design, and overall experience."
                      rows={6}
                      className="min-h-[160px] w-full resize-y border-0 bg-transparent px-4 py-3 text-right text-sm leading-6 text-[#1E293B] outline-none focus:ring-0"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className={cardSurface}>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <SectionTitle>Photo gallery management</SectionTitle>
                <button
                  type="button"
                  onClick={() => galleryInputRef.current?.click()}
                  className="inline-flex shrink-0 flex-row-reverse items-center gap-2 self-start rounded-[99px] border border-[#C5C6D2] bg-white px-4 py-2 text-sm text-[#00113A] sm:self-auto"
                >
                  <Image src="/upload.svg" alt="" width={18} height={18} unoptimized />
                  Upload files
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
                className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4"
                dir="ltr"
              >
                <button
                  type="button"
                  onClick={() => galleryInputRef.current?.click()}
                  className="flex aspect-square min-h-30 flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-[#CBD5E1] bg-[rgba(255,255,255,0.6)] text-[#94A3B8] transition hover:bg-white/90 sm:min-h-36 lg:min-h-0"
                >
                  <Image src="/upload.svg" alt="" width={28} height={28} className="opacity-70" unoptimized />
                  <span className="text-sm font-medium">ADD NEW</span>
                </button>
                {["/avatars/1.jpg", "/avatars/4.jpg"].map((src) => (
                  <div
                    key={src}
                    className="relative aspect-square min-h-30 overflow-hidden rounded-2xl border border-[#E2E8F0] bg-slate-100 sm:min-h-36 lg:min-h-0"
                  >
                    <Image
                      src={src}
                      alt=""
                      fill
                      sizes="(max-width:640px) 45vw, (max-width:1024px) 30vw, 200px"
                      className="object-cover"
                      unoptimized
                    />
                  </div>
                ))}
                {galleryUrls.map((src) => (
                  <div
                    key={src}
                    className="relative aspect-square min-h-30 overflow-hidden rounded-2xl border border-[#8655F6]/40 bg-slate-100 sm:min-h-36 lg:min-h-0"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={src} alt="" className="h-full w-full object-cover" />
                  </div>
                ))}
              </div>
            </div>

            <div className={cardSurface}>
              <SectionTitle>Supplier selection</SectionTitle>
              <div className="relative mt-6">
                <span
                  className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-lg text-[#64748B]"
                  aria-hidden
                >
                  ⌕
                </span>
                <input
                  value={supplierQuery}
                  onChange={(ev) => setSupplierQuery(ev.target.value)}
                  placeholder="Search for a product by name..."
                  className={`${inputClass} pr-10`}
                />
              </div>
              <div className="mt-4 flex gap-4 overflow-x-auto pb-2 pt-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:flex-wrap sm:overflow-visible" dir="ltr">
                {filteredSuppliers.map((s) => {
                  const selected = selectedSupplierIds.has(s.id);
                  return (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => toggleSupplier(s.id)}
                      className={`flex w-full max-w-[220px] shrink-0 flex-col rounded-2xl border-2 bg-white p-4 text-left shadow-sm transition sm:w-[220px] ${
                        selected ? "border-[#8655F6] shadow-[0_0_0_1px_rgba(134,85,246,0.2)]" : "border-[#E2E8F0]"
                      }`}
                    >
                      <div className="flex flex-row items-start gap-3">
                        <span
                          className={`mt-0.5 flex size-5 shrink-0 items-center justify-center rounded border-2 ${
                            selected
                              ? "border-[#8655F6] bg-[#8655F6] text-white"
                              : "border-[#CBD5E1] bg-white"
                          }`}
                          aria-hidden
                        >
                          {selected ? "✓" : ""}
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-[#0F172A]">{s.name}</p>
                          <p className="mt-1 text-[10px] font-semibold uppercase tracking-wide text-[#64748B]">
                            {s.category}
                          </p>
                        </div>
                      </div>
                      <div className="relative mt-3 h-20 w-full overflow-hidden rounded-xl bg-slate-100">
                        {s.image.endsWith(".svg") ? (
                          <Image src={s.image} alt="" fill className="object-contain p-4" unoptimized />
                        ) : (
                          <Image src={s.image} alt="" fill sizes="220px" className="object-cover" unoptimized />
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex flex-col-reverse flex-wrap items-stretch gap-4 pt-2 sm:flex-row-reverse sm:items-center sm:justify-end">
              <button
                type="button"
                onClick={() => router.push("/admin")}
                className="w-full rounded-[99px] border border-[#201C44] bg-white px-8 py-3 text-base text-[#201C44] sm:w-auto"
              >
                CANCELLATION
              </button>
              <button
                type="submit"
                className="w-full rounded-[99px] bg-[linear-gradient(90deg,#00113A_0%,#4721DF_100%)] px-10 py-3 text-base text-white shadow-md sm:w-auto"
              >
                Add a Product to the Store
              </button>
            </div>
          </form>
        </div>

        <MarketingModal
          open={successOpen}
          onClose={() => setSuccessOpen(false)}
          backdrop="slate"
          zClass="z-[100]"
          closeOnBackdropClick
          closeOnEscape
          dir="ltr"
        >
          <div
            role="dialog"
            aria-modal
            aria-labelledby="admin-add-product-success-title"
            className="relative w-full max-w-2xl rounded-[24px] border border-[rgba(134,85,246,0.2)] bg-[#EBF2FA] p-6 text-center shadow-[0px_8px_32px_rgba(0,0,0,0.37)] backdrop-blur-[6px] sm:p-8"
            style={{ fontFamily: marketingPloniFont }}
          >
            <button
              type="button"
              className="absolute right-5 top-4 text-[28px] leading-6 text-[#A1A1A1] transition hover:opacity-70"
              onClick={() => setSuccessOpen(false)}
              aria-label="Close"
            >
              ×
            </button>
            <div className="mx-auto flex w-full max-w-full flex-row flex-wrap items-center justify-center gap-2 rounded-[99px] bg-[#80BFFF] px-3 py-2 sm:max-w-md sm:gap-3.5 sm:px-4 sm:py-2.5">
              <p
                id="admin-add-product-success-title"
                className="max-w-full text-balance text-center text-base font-normal leading-tight tracking-[0.3px] text-[#1E1E3F] sm:text-lg sm:leading-snug"
              >
                The product was successfully published!
              </p>
              <SuccessBadgeCheckIcon />
            </div>
            <p className="mt-8 text-base font-normal leading-6 text-[#1E1E3F] sm:text-lg">
              The product was published on the store page.
            </p>
            <div className="mx-auto mt-10 w-full max-w-md">
              <button
                type="button"
                onClick={() => {
                  setSuccessOpen(false);
                  router.push("/admin");
                }}
                className="flex min-h-14 w-full items-center rounded-[99px] bg-[#1E1E3F] py-4 pl-5 pr-5 text-base font-normal leading-tight text-white transition hover:opacity-95 sm:pl-7 sm:pr-7"
              >
                <span className="flex w-10 shrink-0 justify-start sm:w-12">
                  <Image
                    src="/left-arrow.svg"
                    alt=""
                    width={13}
                    height={13}
                    className="size-[13px] brightness-0 invert"
                    unoptimized
                    aria-hidden
                  />
                </span>
                <span className="min-w-0 flex-1 text-center">
                  <span className="block">Back to admin</span>
                  <span className="block">dashboard</span>
                </span>
                <span className="w-10 shrink-0 sm:w-12" aria-hidden />
              </button>
            </div>
          </div>
        </MarketingModal>
      </section>
    </ProtectedRoute>
  );
}
