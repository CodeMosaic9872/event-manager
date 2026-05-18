"use client";

import Image from "next/image";
import { ChangeEvent, FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { MarketingModal } from "@/shared/components/marketing-modal";
import { ProtectedRoute } from "@/shared/components/protected-route";
import { marketingPloniFont } from "@/shared/lib/marketing-typography";

import {
  useGetCategoriesQuery,
  useGetSubcategoriesQuery,
  useUploadGalleryFilesMutation,
} from "@/shared/api/api";
import { useAppSelector } from "@/store/hooks";

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

const SERVICE_AREAS = [
  "Eilat and the Arava",
  "Jerusalem",
  "The whole country",
  "Sharon",
  "south",
  "coordinator",
  "north",
] as const;

const SPECIALTIES = [
  "vegan",
  "Envelope",
  "kashrut",
  "Reservist",
  "Ministry of Defense Supplier",
] as const;

const LABEL_RULES = [
  "Email notice",
  "Open on Saturday",
  "Reservist",
  "Ministry of Defense supplier",
] as const;

const LABELS_PER_NICHE = [
  "vegan",
  "vegetarian",
  "Chef's dinner",
  "Meat catering",
  "Dairy catering",
] as const;

type ChipToggleProps = {
  label: string;
  selected: boolean;
  onToggle: () => void;
};

function ChipToggle({ label, selected, onToggle }: ChipToggleProps) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm leading-5 transition ${
        selected
          ? "border-[#6AB7FF] bg-[#6AB7FF] text-black"
          : "border-[#CBD5E1] bg-white text-black"
      }`}
    >
      {label}
      <span className="inline-flex h-4 w-4 items-center justify-center text-base" aria-hidden>
        {selected ? "×" : "+"}
      </span>
    </button>
  );
}

function toggleInSet(set: Set<string>, key: string, setter: (next: Set<string>) => void) {
  const next = new Set(set);
  if (next.has(key)) next.delete(key);
  else next.add(key);
  setter(next);
}

export default function AdminAddSupplierPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const { data: categoriesData = [] } = useGetCategoriesQuery();
  const [uploadGallery] = useUploadGalleryFilesMutation();

  const [businessName, setBusinessName] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [centralLocation, setCentralLocation] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [description, setDescription] = useState("");

  const { data: subcategoriesData = [] } = useGetSubcategoriesQuery(categoryId, { skip: !categoryId });

  const [selectedAreas, setSelectedAreas] = useState<Set<string>>(() => new Set());
  const [selectedSubcategoryIds, setSelectedSubcategoryIds] = useState<Set<string>>(() => new Set());
  const [selectedRules, setSelectedRules] = useState<Set<string>>(
    () => new Set(["Reservist", "Ministry of Defense supplier"]),
  );
  const [selectedNicheLabels, setSelectedNicheLabels] = useState<Set<string>>(
    () => new Set(["Meat catering", "Dairy catering"]),
  );
  const [systemTime, setSystemTime] = useState("");
  const [language, setLanguage] = useState("");

  const [digitalLinks, setDigitalLinks] = useState({
    whatsapp: "",
    facebook: "",
    instagram: "",
    tiktok: "",
    youtube: "",
    website: "",
  });

  const [uploadedGalleryImages, setUploadedGalleryImages] = useState<string[]>([]);
  const [successOpen, setSuccessOpen] = useState(false);

  useEffect(() => {
    return () => {
      for (const url of uploadedGalleryImages) URL.revokeObjectURL(url);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const inputClass =
    "h-[50px] w-full rounded-2xl border border-[#E2E8F0] bg-white px-4 py-3 text-right text-sm leading-6 text-[#1E293B] outline-none focus:ring-2 focus:ring-[#3B82F6]/30";
  const textareaClass =
    "min-h-[140px] w-full resize-y rounded-2xl border border-[#E2E8F0] bg-white px-4 py-3 text-right text-base leading-6 text-[#1E293B] outline-none focus:ring-2 focus:ring-[#3B82F6]/30";

  const galleryPick = async (e: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;
    
    try {
      const response = await uploadGallery({ files }).unwrap();
      const nextUrls = response.items.map((item) => item.url);
      setUploadedGalleryImages((prev) => [...prev, ...nextUrls].slice(0, 12));
    } catch (err) {
      console.error("Gallery upload failed:", err);
    }
    
    e.target.value = "";
  };

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    setSuccessOpen(true);
  };

  const selectedAreasSummary = useMemo(
    () => [...selectedAreas].join(", "),
    [selectedAreas],
  );

  return (
    <ProtectedRoute roles={["admin"]}>
      <section
        dir="rtl"
        className="relative mx-auto min-h-screen w-full overflow-x-hidden px-4 pb-14 pt-24 sm:px-6"
        style={{ fontFamily: marketingPloniFont }}
      >

        <div className="relative z-10 mx-auto w-full max-w-6xl">
          <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between sm:gap-3">
            <div className="flex flex-wrap items-center gap-3">
              <button
                type="submit"
                form="admin-add-supplier-form"
                className="cursor-pointer rounded-[99px] bg-[linear-gradient(90deg,#00113A_0%,#002366_100%)] px-6 py-2.5 text-sm text-white"
              >
                Save the doubt
              </button>
              <button
                type="button"
                onClick={() => router.push("/admin/suppliers")}
                className="cursor-pointer rounded-[99px] border border-[#C5C6D2] px-6 py-2.5 text-sm text-[#00113A]"
              >
                Cancellation
              </button>
            </div>
            <div className="w-full text-right sm:w-auto sm:min-w-0">
              <p className="text-xs uppercase tracking-[1.2px] text-[#757682]">
                System management &gt; Suppliers &gt; Add a provider
              </p>
              <h2 className="mt-1 text-3xl font-normal leading-tight tracking-[-0.03em] text-[#00113A] sm:text-4xl sm:leading-10">
                Adding a supplier to the database
              </h2>
            </div>
          </div>

          <form
            id="admin-add-supplier-form"
            onSubmit={onSubmit}
            className="mt-3 rounded-[24px] border border-[#8655F6]/20 bg-[rgba(71,33,223,0.07)] p-6 shadow-[0px_8px_32px_rgba(0,0,0,0.37)] backdrop-blur-[6px] sm:p-10"
          >
            <div className="mx-auto grid w-full gap-6 lg:grid-cols-2">
              <div className="flex flex-col gap-3">
                <label className="text-right text-xs font-normal leading-4 text-black">BUSINESS NAME</label>
                <input
                  value={businessName}
                  onChange={(ev) => setBusinessName(ev.target.value)}
                  placeholder="Business name"
                  className={inputClass}
                />
              </div>

              <div className="flex flex-col gap-3">
                <label className="text-right text-xs font-normal leading-4 text-black">CATEGORY</label>
                <div className="relative w-full">
                  <select
                    value={categoryId}
                    onChange={(ev) => setCategoryId(ev.target.value)}
                    className="h-[50px] w-full appearance-none rounded-2xl border border-[#E2E8F0] bg-white px-4 py-3 text-right text-base leading-6 text-[#1E293B] outline-none focus:ring-2 focus:ring-[#3B82F6]/30"
                  >
                    <option value="">Select Category</option>
                    {categoriesData.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#6B7280]" aria-hidden>
                    ▾
                  </span>
                </div>
              </div>

              <div className="flex flex-col gap-3">
                <label className="text-right text-xs font-normal leading-4 text-black">CENTRAL LOCATION</label>
                <input
                  value={centralLocation}
                  onChange={(ev) => setCentralLocation(ev.target.value)}
                  placeholder="City / region"
                  className={inputClass}
                  dir="rtl"
                />
              </div>

              <div className="flex flex-col gap-3">
                <label className="text-right text-xs font-normal leading-4 text-black">PHONE</label>
                <input
                  value={phone}
                  onChange={(ev) => setPhone(ev.target.value)}
                  placeholder="050-0000000"
                  className={inputClass}
                  dir="ltr"
                  inputMode="tel"
                />
              </div>

              <div className="flex flex-col gap-3 lg:col-span-2">
                <label className="text-right text-xs font-normal leading-4 text-black">EMAIL</label>
                <input
                  value={email}
                  onChange={(ev) => setEmail(ev.target.value)}
                  placeholder="name@gmail.com"
                  className={inputClass}
                  dir="ltr"
                  inputMode="email"
                  autoComplete="email"
                />
              </div>

              <div className="flex flex-col gap-3 lg:col-span-2">
                <label className="text-right text-xs font-normal leading-4 text-black">
                  Brief details about the service
                </label>
                <textarea
                  value={description}
                  onChange={(ev) => setDescription(ev.target.value)}
                  placeholder="Describe your service, what makes you unique and what customers will receive..."
                  className={textareaClass}
                />
              </div>
            </div>

            <div className="mx-auto mt-8 grid w-full gap-6 lg:grid-cols-2">
              <div className="flex flex-col gap-3">
                <p className="text-right text-base leading-5 text-black">Subcategory</p>
                <div className="flex flex-wrap justify-end gap-3">
                  {!categoryId ? (
                    <p className="text-sm text-[#94A3B8]">Select a category first</p>
                  ) : subcategoriesData.length === 0 ? (
                    <p className="text-sm text-[#94A3B8]">No subcategories found</p>
                  ) : (
                    subcategoriesData.map((s) => (
                      <ChipToggle
                        key={s.id}
                        label={s.name}
                        selected={selectedSubcategoryIds.has(s.id)}
                        onToggle={() => toggleInSet(selectedSubcategoryIds, s.id, setSelectedSubcategoryIds)}
                      />
                    ))
                  )}
                </div>
              </div>

              <div className="flex flex-col gap-3">
                <p className="text-right text-base leading-5 text-black">Service area</p>
                <div className="flex flex-wrap justify-end gap-3">
                  {SERVICE_AREAS.map((a) => (
                    <ChipToggle
                      key={a}
                      label={a}
                      selected={selectedAreas.has(a)}
                      onToggle={() => toggleInSet(selectedAreas, a, setSelectedAreas)}
                    />
                  ))}
                </div>
                {selectedAreasSummary ? (
                  <p className="mt-2 text-right text-xs leading-5 text-[#64748B]">
                    Selected: {selectedAreasSummary}
                  </p>
                ) : null}
              </div>

              <div className="flex flex-col gap-3">
                <p className="text-right text-base leading-5 text-black">Labels rules</p>
                <div className="flex flex-wrap justify-end gap-3">
                  {LABEL_RULES.map((s) => (
                    <ChipToggle
                      key={s}
                      label={s}
                      selected={selectedRules.has(s)}
                      onToggle={() => toggleInSet(selectedRules, s, setSelectedRules)}
                    />
                  ))}
                </div>
              </div>
            </div>

            <div className="mx-auto mt-8 w-full">
              <p className="border-b border-white pb-2 text-right text-base font-semibold uppercase leading-5 text-black">
                Digital presence
              </p>
              <div className="mt-4 grid gap-4 md:grid-cols-2">
                {(
                  [
                    { key: "whatsapp", label: "Whatsapp" },
                    { key: "facebook", label: "Facebook" },
                    { key: "instagram", label: "Instagram" },
                    { key: "tiktok", label: "TikTok" },
                    { key: "youtube", label: "YouTube" },
                    { key: "website", label: "Website" },
                  ] as const
                ).map((f) => (
                  <div key={f.key} className="flex flex-col gap-2">
                    <label className="text-right text-xs leading-4 text-[#64748B]">{f.label}</label>
                    <input
                      value={digitalLinks[f.key]}
                      onChange={(ev) =>
                        setDigitalLinks((prev) => ({ ...prev, [f.key]: ev.target.value }))
                      }
                      placeholder={`Enter ${f.label} link`}
                      className={inputClass}
                      dir="ltr"
                    />
                  </div>
                ))}
              </div>
            </div>

            <div className="mx-auto mt-8 w-full">
              <div className="mb-2 flex items-center justify-end gap-2">
                <span className="rounded bg-black/10 px-2 py-0.5 text-[10px]">Optional</span>
                <p className="text-right text-base leading-5 text-black">Business address</p>
              </div>
              <input
                className={inputClass}
                placeholder="Street, city, house number"
                dir="rtl"
              />
              <div className="mt-3 min-h-32 w-full overflow-hidden rounded-2xl border border-[#E2E8F0] sm:min-h-36">
                <div className="min-h-32 w-full bg-[linear-gradient(100deg,#76c7ed_0%,#76c7ed_45%,#e5e7eb_45%,#d1d5db_100%)] sm:min-h-36" />
              </div>
            </div>

            <div className="mx-auto mt-8 grid w-full gap-6 sm:grid-cols-2">
              <div className="flex flex-col gap-2">
                <label className="text-right text-sm text-black">Speaks other languages</label>
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="h-[50px] w-full rounded-xl border border-[#E2E8F0] bg-white px-4 text-right outline-none focus:ring-2 focus:ring-[#3B82F6]/30"
                >
                  <option value="">Choose a language</option>
                  <option>English</option>
                  <option>Hebrew</option>
                  <option>Arabic</option>
                </select>
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-right text-sm text-black">Amount of time in the system</label>
                <input
                  value={systemTime}
                  onChange={(e) => setSystemTime(e.target.value)}
                  placeholder="Amount of time"
                  className={inputClass}
                />
              </div>
            </div>

            <div className="mx-auto mt-8 w-full">
              <p className="text-right text-base leading-5 text-black">Labels per niche</p>
              <div className="mt-3 flex flex-wrap justify-end gap-3">
                {LABELS_PER_NICHE.map((s) => (
                  <ChipToggle
                    key={s}
                    label={s}
                    selected={selectedNicheLabels.has(s)}
                    onToggle={() => toggleInSet(selectedNicheLabels, s, setSelectedNicheLabels)}
                  />
                ))}
              </div>
            </div>

            <section className="mx-auto mt-8 w-full">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <h3 className="text-right text-base font-normal leading-5 text-black">Gallery management</h3>
                <Image src="/icons/gallery.svg" alt="" width={22} height={22} unoptimized />
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={galleryPick}
              />

              <div
                className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4"
                dir="ltr"
              >
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex aspect-square min-h-30 flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-[#CBD5E1] bg-[rgba(255,255,255,0.5)] text-[#94A3B8] transition hover:bg-white/80 sm:min-h-36 lg:min-h-0"
                >
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" aria-hidden>
                    <path
                      d="M12 5v14M5 12h14"
                      stroke="#94A3B8"
                      strokeWidth="2.67"
                      strokeLinecap="round"
                    />
                  </svg>
                  <span className="text-sm leading-5">Add a photo</span>
                </button>

                {["/avatars/1.jpg", "/avatars/2.jpg"].map((src) => (
                  <div
                    key={src}
                    className="relative aspect-square min-h-30 overflow-hidden rounded-2xl border border-[#F1F5F9] bg-slate-100 sm:min-h-36 lg:min-h-0"
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
                {uploadedGalleryImages.slice(0, 1).map((src) => (
                  <div
                    key={src}
                    className="relative aspect-square min-h-30 overflow-hidden rounded-2xl border-4 border-[#3B82F6] bg-slate-100 shadow-[0px_10px_15px_-3px_rgba(0,0,0,0.1)] sm:min-h-36 lg:min-h-0"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={src} alt="" className="h-full w-full object-cover" />
                    <span className="absolute right-3 top-3 rounded-lg bg-[#3B82F6] px-2 py-1 text-[10px] text-white">
                      Set as profile picture
                    </span>
                  </div>
                ))}
              </div>
            </section>

            <div className="mt-10 flex flex-col-reverse items-center justify-center gap-4 sm:flex-row sm:gap-5">
              <button
                type="button"
                onClick={() => router.push("/admin/suppliers")}
                className="w-full cursor-pointer rounded-[99px] border border-[#C5C6D2] px-8 py-3 text-base font-normal leading-6 text-[#00113A] sm:w-auto"
              >
                Cancellation
              </button>
              <button
                type="button"
                onClick={() => router.push("/admin/suppliers/registration-payment")}
                className="w-full cursor-pointer rounded-[99px] bg-[#201C44] px-8 py-3 text-base leading-6 text-white sm:w-auto"
              >
                Inserting a payment method
              </button>
              <button
                type="submit"
                className="w-full cursor-pointer rounded-[99px] bg-[linear-gradient(90deg,#00113A_0%,#002366_100%)] px-10 py-3 text-base font-normal leading-6 text-white sm:w-auto"
              >
                Save the doubt
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
            aria-labelledby="admin-add-supplier-success-title"
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
                id="admin-add-supplier-success-title"
                className="max-w-full text-balance text-center text-base font-normal leading-tight tracking-[0.3px] text-[#1E1E3F] sm:text-lg sm:leading-snug"
              >
                Supplier added successfully!
              </p>
              <SuccessBadgeCheckIcon />
            </div>
            <p className="mt-8 text-base font-normal leading-6 text-[#1E1E3F] sm:text-lg">
              The supplier can be seen in the supplier table.
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
                    src="/icons/left-arrow.svg"
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

