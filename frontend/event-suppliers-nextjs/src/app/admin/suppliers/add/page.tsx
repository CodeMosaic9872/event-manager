"use client";

import Image from "next/image";
import { ChangeEvent, FormEvent, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { MarketingModal } from "@/shared/components/marketing-modal";
import { ProtectedRoute } from "@/shared/components/protected-route";
import { marketingPloniFont } from "@/shared/lib/marketing-typography";

import {
  useGetCategoriesQuery,
  useGetSubcategoriesQuery,
  useUploadGalleryFilesMutation,
} from "@/shared/api/api";

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
  "אילת והערבה",
  "ירושלים",
  "כל הארץ",
  "השרון",
  "דרום",
  "מרכז",
  "צפון",
] as const;

const LABEL_RULES = [
  "עוטף",
  "פתוח בשבת",
  "מילואימניק",
  "ספק משרד הביטחון",
] as const;

const LABELS_PER_NICHE = [
  "טבעוני",
  "צמחוני",
  "ארוחת שף",
  "קייטרינג בשרי",
  "קייטרינג חלבי",
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
      className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm leading-5 font-medium transition ${
        selected
          ? "border-[#6AB7FF] bg-[#6AB7FF] text-black"
          : "border-black/10 bg-white text-black"
      }`}
    >
      <span className="inline-flex h-[8px] w-[8px] items-center justify-center text-xs" aria-hidden>
        {selected ? "×" : "+"}
      </span>
      {label}
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

  const [selectedAreas, setSelectedAreas] = useState<Set<string>>(() => new Set(["מרכז", "צפון"]));
  const [selectedSubcategoryIds, setSelectedSubcategoryIds] = useState<Set<string>>(() => new Set());
  const [selectedRules, setSelectedRules] = useState<Set<string>>(
    () => new Set(["מילואימניק", "ספק משרד הביטחון"]),
  );
  const [selectedNicheLabels, setSelectedNicheLabels] = useState<Set<string>>(
    () => new Set(["קייטרינג בשרי", "קייטרינג חלבי"]),
  );
  const [systemTime, setSystemTime] = useState("");
  const [language, setLanguage] = useState("");
  const [address, setAddress] = useState("");

  const [digitalLinks, setDigitalLinks] = useState({
    instagram: "",
    tiktok: "",
    whatsapp: "",
    website: "",
    youtube: "",
    facebook: "",
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
    "h-11 w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-right text-sm leading-5 text-black outline-none placeholder:text-black/60";
  const textareaClass =
    "min-h-[140px] w-full resize-y rounded-2xl border border-black/10 bg-white px-4 py-4 text-right text-base leading-6 text-black outline-none placeholder:text-black/60";
  const socialInputClass =
    "h-[50px] w-full rounded-2xl border border-black/10 bg-white py-3 pr-4 pl-10 text-right text-base leading-6 text-black outline-none placeholder:text-black";
  const labelClass = "text-right text-base leading-4 tracking-[0.6px] font-bold uppercase text-black";
  const labelClassNoTrack = "text-right text-base leading-5 font-bold text-black";
  const sectionLabelClass = "text-right text-base leading-5 font-bold text-black";

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

  const breadcrumbClass = "text-xs leading-4 tracking-[1.2px] uppercase";

  return (
    <ProtectedRoute roles={["admin"]}>
      <section
        dir="rtl"
        className="relative mx-auto min-h-screen w-full overflow-x-hidden px-4 pb-14 pt-[103px] sm:px-6"
        style={{ fontFamily: marketingPloniFont }}
      >

        <div className="relative z-10 mx-auto w-full max-w-[988px]">
          {/* Breadcrumb + Title */}
          <div className="mb-6 flex flex-col items-end gap-0">
            <div className={`flex items-center gap-[6px] ${breadcrumbClass}`}>
              <span className="text-[#00113A] font-bold">הוספת ספק</span>
              <span className="text-[#757682]">›</span>
              <span className="text-[#757682]">ספקים</span>
              <span className="text-[#757682]">›</span>
              <span className="text-[#757682]">ניהול מערכת</span>
            </div>
            <h1 className="text-[36px] leading-[40px] tracking-[-1.08px] font-bold text-[#00113A]">
              הוספת ספק למאגר
            </h1>
          </div>

          <form
            id="admin-add-supplier-form"
            onSubmit={onSubmit}
            className="rounded-[24px] border border-[#8655F6]/20 bg-[rgba(71,33,223,0.07)] px-[113px] py-10 shadow-[0px_8px_32px_rgba(0,0,0,0.37)] backdrop-blur-[6px]"
          >
            {/* Row 1: Business Name full width */}
            <div className="flex flex-col gap-2">
              <label className="text-right text-xl leading-4 tracking-[0.6px] font-bold uppercase text-black">
                שם העסק
              </label>
              <input
                value={businessName}
                onChange={(ev) => setBusinessName(ev.target.value)}
                placeholder="לדוגמה: קייטרינג גורמה יוקרתי"
                className="h-11 w-full rounded-2xl bg-white px-3 py-[13px] text-right text-sm leading-[21px] text-black outline-none placeholder:text-black/60"
              />
            </div>

            {/* Row 2: Category + Location side by side */}
            <div className="mt-6 grid gap-6" style={{ gridTemplateColumns: "265px 265px" }}>
              <div className="flex flex-col gap-2">
                <label className={labelClass}>
                  קטגוריה
                </label>
                <div className="relative">
                  <select
                    value={categoryId}
                    onChange={(ev) => setCategoryId(ev.target.value)}
                    className="h-11 w-full appearance-none rounded-2xl border border-black/10 bg-white px-3 py-[13px] text-right text-sm leading-5 text-[#191C1D] outline-none"
                  >
                    <option value="">הזן קטגוריה</option>
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

              <div className="flex flex-col gap-2">
                <label className={labelClass}>
                  מיקום מרכזי
                </label>
                <input
                  value={centralLocation}
                  onChange={(ev) => setCentralLocation(ev.target.value)}
                  placeholder="עיר / אזור"
                  className="h-11 w-full rounded-2xl border border-black/10 bg-white px-3 py-[13px] text-right text-sm leading-[21px] text-black outline-none placeholder:text-black/60"
                />
              </div>
            </div>

            {/* Row 3: Email + Phone side by side */}
            <div className="mt-6 grid gap-6" style={{ gridTemplateColumns: "265px 265px" }}>
              <div className="flex flex-col gap-2">
                <label className={labelClass}>
                  אימייל
                </label>
                <input
                  value={email}
                  onChange={(ev) => setEmail(ev.target.value)}
                  placeholder="name@gmail.com"
                  className="h-11 w-full rounded-2xl border border-black/10 bg-white px-3 py-[13px] text-right text-sm leading-[17px] text-black outline-none placeholder:text-black/60"
                  dir="ltr"
                  inputMode="email"
                  autoComplete="email"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className={labelClass}>
                  טלפון
                </label>
                <input
                  value={phone}
                  onChange={(ev) => setPhone(ev.target.value)}
                  placeholder="050-0000000"
                  className="h-11 w-full rounded-2xl border border-black/10 bg-white px-3 py-[13px] text-right text-sm leading-[17px] text-black outline-none placeholder:text-black/60"
                  dir="ltr"
                  inputMode="tel"
                />
              </div>
            </div>

            {/* Description */}
            <div className="mt-8 flex flex-col gap-2">
              <label className={labelClassNoTrack}>
                פירוט קצר על השירות
              </label>
              <div className="relative">
                <textarea
                  value={description}
                  onChange={(ev) => setDescription(ev.target.value)}
                  placeholder="תאר/י את השירות שלך, מה מייחד אותך ומה הלקוחות יקבלו..."
                  className={textareaClass}
                />
                <span className="absolute bottom-3 left-3 text-[10px] leading-[15px] text-black">
                  {description.length} / 500
                </span>
              </div>
            </div>

            {/* Subcategories */}
            <div className="mt-8 flex flex-col gap-3">
              <p className={sectionLabelClass}>תתי קטגוריה</p>
              <div className="flex flex-wrap gap-[15px]">
                {!categoryId ? (
                  <p className="text-sm text-[#94A3B8]">יש לבחור קטגוריה תחילה</p>
                ) : subcategoriesData.length === 0 ? (
                  <p className="text-sm text-[#94A3B8]">לא נמצאו תתי קטגוריות</p>
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

            {/* Service Area */}
            <div className="mt-8 flex flex-col gap-3">
              <p className={sectionLabelClass}>אזור מתן שירות</p>
              <div className="flex flex-wrap gap-[15px]">
                {SERVICE_AREAS.map((a) => (
                  <ChipToggle
                    key={a}
                    label={a}
                    selected={selectedAreas.has(a)}
                    onToggle={() => toggleInSet(selectedAreas, a, setSelectedAreas)}
                  />
                ))}
              </div>
            </div>

            {/* Digital Presence */}
            <div className="mt-8">
              <p className="border-b border-white pb-2 text-right text-base leading-5 tracking-[0.35px] font-bold uppercase text-black">
                נוכחות בדיגיטל
              </p>
              <div className="mt-4 grid gap-4" style={{ gridTemplateColumns: "351px 351px" }}>
                {(
                  [
                    { key: "instagram" as const, label: "קישור לאינסטגרם" },
                    { key: "tiktok" as const, label: "קישור לטיקטוק" },
                    { key: "whatsapp" as const, label: "קישור לוואטסאפ" },
                    { key: "website" as const, label: "אתר אינטרנט" },
                    { key: "youtube" as const, label: "קישור ליוטיוב" },
                    { key: "facebook" as const, label: "קישור לפייסבוק" },
                  ] as const
                ).map((f) => (
                  <div key={f.key} className="relative">
                    <input
                      value={digitalLinks[f.key]}
                      onChange={(ev) =>
                        setDigitalLinks((prev) => ({ ...prev, [f.key]: ev.target.value }))
                      }
                      placeholder={f.label}
                      className={socialInputClass}
                      dir="ltr"
                    />
                    <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2" aria-hidden>
                      <Image src={`/icons/attach_file.svg`} alt="" width={16} height={16} />
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Labels Rules */}
            <div className="mt-8 flex flex-col gap-3">
              <p className={sectionLabelClass}>לייבלים כללים</p>
              <div className="flex flex-wrap gap-[14px]">
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

            {/* Labels Per Niche */}
            <div className="mt-8 flex flex-col gap-3">
              <p className={sectionLabelClass}>לייבלים פר נישה</p>
              <div className="flex flex-wrap gap-[14px]">
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

            {/* Address */}
            <div className="mt-8 flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <span className="rounded-lg bg-black/10 px-2 py-0.5 text-[10px] leading-5 text-black">אופציונלי</span>
                <p className="text-right text-base leading-5 font-bold text-black">כתובת העסק</p>
              </div>
              <div className="relative">
                <input
                  value={address}
                  onChange={(ev) => setAddress(ev.target.value)}
                  placeholder="רחוב, עיר, מספר בית"
                  className={socialInputClass}
                />
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2" aria-hidden>
                  <svg width="16" height="20" viewBox="0 0 16 20" fill="none">
                    <rect width="16" height="20" rx="2" fill="#000" />
                  </svg>
                </span>
              </div>
              <div className="mt-2 h-32 w-full overflow-hidden rounded-2xl border border-black/10 opacity-60">
                <div className="h-full w-full bg-[linear-gradient(100deg,#76c7ed_0%,#76c7ed_45%,#e5e7eb_45%,#d1d5db_100%)]" />
              </div>
            </div>

            {/* Language + System Time */}
            <div className="mt-8 grid gap-6" style={{ gridTemplateColumns: "367px 367px" }}>
              <div className="flex flex-col gap-2">
                <label className={labelClassNoTrack}>דובר שפות נוספות</label>
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="h-[50px] w-full rounded-xl border border-[#E2E8F0] bg-white px-4 text-right text-base leading-6 text-[#1E293B] outline-none"
                >
                  <option value="">בחר שפה</option>
                  <option>אנגלית</option>
                  <option>עברית</option>
                  <option>ערבית</option>
                </select>
              </div>
              <div className="flex flex-col gap-2">
                <label className={labelClassNoTrack}>כמות זמן במערכת</label>
                <input
                  value={systemTime}
                  onChange={(e) => setSystemTime(e.target.value)}
                  placeholder="כמות זמן"
                  className="h-[50px] w-full rounded-xl border border-[#E2E8F0] bg-white px-4 text-right text-base leading-6 text-[#1E293B] outline-none"
                />
              </div>
            </div>

            {/* Gallery */}
            <section className="mt-10 w-full">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center justify-end gap-2 sm:flex-row">
                  <Image src="/icons/gallery_black.svg" alt="" width={20} height={20} />
                  <h3 className="text-right text-xl leading-7 font-bold text-[#1E1B4B]">ניהול גלריה</h3>
                </div>
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
                  <span className="text-sm leading-5 font-bold">הוסף תמונה</span>
                </button>

                {["/avatars/1.jpg", "/avatars/2.jpg"].map((src, i) => (
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
                    {i === 0 && uploadedGalleryImages.length === 0 ? (
                      <span className="absolute right-3 top-3 rounded-lg bg-[#3B82F6] px-2 py-1 text-[10px] leading-[15px] font-bold text-white font-assistant">
                        תמונת פרופיל ראשית
                      </span>
                    ) : null}
                  </div>
                ))}
                {uploadedGalleryImages.slice(0, 2).map((src) => (
                  <div
                    key={src}
                    className="relative aspect-square min-h-30 overflow-hidden rounded-2xl border-4 border-[#3B82F6] bg-slate-100 shadow-[0px_10px_15px_-3px_rgba(0,0,0,0.1)] sm:min-h-36 lg:min-h-0"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={src} alt="" className="h-full w-full object-cover" />
                    <span className="absolute right-3 top-3 rounded-lg bg-[#3B82F6] px-2 py-1 text-[10px] leading-[15px] font-bold text-white">
                      תמונת פרופיל ראשית
                    </span>
                  </div>
                ))}
              </div>
            </section>

            {/* Bottom Buttons */}
            <div className="mt-10 flex flex-col-reverse items-center justify-center gap-[18px] sm:flex-row sm:gap-[18px]">
              <button
                type="submit"
                className="w-full cursor-pointer rounded-[99px] bg-[linear-gradient(90deg,#00113A_0%,#002366_100%)] px-10 py-[13px] text-base leading-6 font-bold text-white sm:w-auto"
              >
                שמור ספק
              </button>
              <button
                type="button"
                onClick={() => router.push("/admin/suppliers/registration-payment")}
                className="w-full cursor-pointer rounded-[99px] bg-[#201C44] px-10 py-[13px] text-base leading-6 font-bold text-white sm:w-auto"
              >
                הכנסת אמצעי תשלום
              </button>
              <button
                type="button"
                onClick={() => router.push("/admin/suppliers")}
                className="w-full cursor-pointer rounded-[99px] border border-[#C5C6D2] px-8 py-[13px] text-base leading-6 font-normal text-[#00113A] sm:w-auto"
              >
                ביטול
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
