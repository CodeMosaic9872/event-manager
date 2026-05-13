"use client";

import Image from "next/image";
import type { ReactNode } from "react";
import { ChangeEvent, FormEvent, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ArticleSpecIcon } from "@/shared/components/event-concept-article/article-spec-icon";
import { ProtectedRoute } from "@/shared/components/protected-route";
import { marketingPloniFont } from "@/shared/lib/marketing-typography";

const EVENT_TYPES = ["Corporate gala", "Wedding", "Conference", "Private party"] as const;

const SUPPLIERS = [
  {
    id: "sharon",
    name: "Sharon Photography",
    category: "DOCUMENTATION",
    image: "/icons/camera-blue.svg",
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

export default function AdminAddConceptPage() {
  const router = useRouter();
  const galleryInputRef = useRef<HTMLInputElement | null>(null);

  const [marketingHeadline, setMarketingHeadline] = useState("");
  const [conceptName, setConceptName] = useState("");
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

  const onPublish = (e: FormEvent) => {
    e.preventDefault();
    router.push("/admin");
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
        className="relative mx-auto min-h-screen w-full max-w-[1440px] overflow-x-hidden px-4 pb-16 pt-24 sm:px-6"
        style={{ fontFamily: marketingPloniFont }}
      >

        <div className="relative z-10 mx-auto w-full max-w-[1100px]">
          <header className="mb-8 text-right">
            <p className="text-xs uppercase tracking-[1.2px] text-[#757682]">
              System management · Quick actions · Adding a concept page
            </p>
            <h1 className="mt-2 text-3xl font-normal leading-10 tracking-[-0.02em] text-[#00113A] sm:text-[36px]">
              Adding a concept page
            </h1>
          </header>

          <form onSubmit={onPublish} className="flex flex-col gap-8">
            <div className={cardSurface}>
              <SectionTitle>Basic information</SectionTitle>

              <div className="mt-6 flex flex-col gap-6">
                <div>
                  <label className="mb-2 block text-right text-xs font-normal uppercase tracking-wide text-[#64748B]">
                    Marketing headline (character limit 80 total)
                  </label>
                  <input
                    value={marketingHeadline}
                    onChange={(ev) => setMarketingHeadline(ev.target.value.slice(0, 80))}
                    placeholder="Secondary title"
                    maxLength={80}
                    className={inputClass}
                  />
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-right text-xs font-normal uppercase tracking-wide text-[#64748B]">
                      Concept name (character limit 28 total)
                    </label>
                    <input
                      value={conceptName}
                      onChange={(ev) => setConceptName(ev.target.value.slice(0, 28))}
                      placeholder="Concept name"
                      maxLength={28}
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-right text-xs font-normal uppercase tracking-wide text-[#64748B]">
                      Event type
                    </label>
                    <div className="relative">
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
              <div className="flex flex-row-reverse items-center justify-between gap-4">
                <SectionTitle>Photo gallery management</SectionTitle>
                <button
                  type="button"
                  onClick={() => galleryInputRef.current?.click()}
                  className="inline-flex shrink-0 flex-row-reverse items-center gap-2 rounded-[99px] border border-[#C5C6D2] bg-white px-4 py-2 text-sm text-[#00113A]"
                >
                  <Image src="/icons/upload.svg" alt="" width={18} height={18} unoptimized />
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
              <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3" dir="ltr">
                <button
                  type="button"
                  onClick={() => galleryInputRef.current?.click()}
                  className="flex min-h-[140px] flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-[#CBD5E1] bg-[rgba(255,255,255,0.6)] text-[#94A3B8] transition hover:bg-white/90"
                >
                  <Image src="/icons/upload.svg" alt="" width={28} height={28} className="opacity-70" unoptimized />
                  <span className="text-sm font-medium">ADD NEW</span>
                </button>
                {["/avatars/1.jpg", "/avatars/4.jpg"].map((src) => (
                  <div
                    key={src}
                    className="relative min-h-[140px] overflow-hidden rounded-2xl border border-[#E2E8F0] bg-slate-100"
                  >
                    <Image src={src} alt="" fill sizes="200px" className="object-cover" unoptimized />
                  </div>
                ))}
                {galleryUrls.map((src) => (
                  <div
                    key={src}
                    className="relative min-h-[140px] overflow-hidden rounded-2xl border border-[#8655F6]/40 bg-slate-100"
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
                <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-lg text-[#64748B]" aria-hidden>
                  ⌕
                </span>
                <input
                  value={supplierQuery}
                  onChange={(ev) => setSupplierQuery(ev.target.value)}
                  placeholder="Search for a product by name..."
                  className={`${inputClass} pr-10`}
                />
              </div>
              <div className="mt-4 flex gap-4 overflow-x-auto pb-2 pt-1" dir="ltr">
                {filteredSuppliers.map((s) => {
                  const selected = selectedSupplierIds.has(s.id);
                  return (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => toggleSupplier(s.id)}
                      className={`flex w-[220px] shrink-0 flex-col rounded-2xl border-2 bg-white p-4 text-left shadow-sm transition ${
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

            <div className="flex flex-row-reverse flex-wrap items-center justify-end gap-4 pt-2">
              <button
                type="button"
                onClick={() => router.push("/admin")}
                className="rounded-[99px] border border-[#201C44] bg-white px-8 py-3 text-base text-[#201C44]"
              >
                CANCELLATION
              </button>
              <button
                type="submit"
                className="rounded-[99px] bg-[linear-gradient(90deg,#00113A_0%,#4721DF_100%)] px-10 py-3 text-base text-white shadow-md"
              >
                PUBLISH A CONCEPT NOW
              </button>
            </div>
          </form>
        </div>
      </section>
    </ProtectedRoute>
  );
}
