"use client";

import Image from "next/image";
import {
  type Dispatch,
  type SetStateAction,
  ChangeEvent,
  FormEvent,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import { MarketingModal } from "@/shared/components/marketing-modal";
import { ProtectedRoute } from "@/shared/components/protected-route";
import { marketingPloniFont } from "@/shared/lib/marketing-typography";

import {
  useCreateAdminSupplierMutation,
  useCreateAdminSupplierUserMutation,
  useGetCategoriesQuery,
  useGetSubcategoriesQuery,
  useUpdateAdminSupplierProfileMutation,
  useUploadGalleryFilesMutation,
} from "@/shared/api/api";
import type {
  SupplierCategoryAssignment,
  UpsertSupplierProfilePayload,
} from "@/shared/api/types";
import {
  EMAIL_PATTERN,
  inputWithFieldError,
  normalizeIsraeliMobileLocal,
  validateAdminSupplierForm,
} from "@/shared/lib/form-validation";
import { HeAuth } from "@/shared/lib/he-ui";

function extractApiErrorMessage(err: unknown, fallback: string): string {
  if (err && typeof err === "object" && "data" in err) {
    const data = (err as { data?: unknown }).data;
    if (data && typeof data === "object") {
      const message =
        (data as { message?: string }).message ??
        (data as { error?: { message?: string } }).error?.message;
      if (typeof message === "string" && message.trim()) return message;
    }
  }
  return fallback;
}

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

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="text-right text-xs leading-4 text-red-600">{message}</p>;
}

function clearFieldError(setter: Dispatch<SetStateAction<Record<string, string>>>, key: string) {
  setter((prev) => {
    if (!prev[key]) return prev;
    const next = { ...prev };
    delete next[key];
    return next;
  });
}

export default function AdminAddSupplierPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const { data: categoriesData = [] } = useGetCategoriesQuery();
  const [uploadGallery, { isLoading: isUploadingGallery }] = useUploadGalleryFilesMutation();

  const [businessName, setBusinessName] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [centralLocation, setCentralLocation] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [description, setDescription] = useState("");

  const { data: subcategoriesData = [] } = useGetSubcategoriesQuery(categoryId, { skip: !categoryId });

  const [selectedAreas, setSelectedAreas] = useState<Set<string>>(() => new Set());
  const [selectedSubcategoryIds, setSelectedSubcategoryIds] = useState<Set<string>>(() => new Set());
  const [selectedRules, setSelectedRules] = useState<Set<string>>(() => new Set());
  const [selectedNicheLabels, setSelectedNicheLabels] = useState<Set<string>>(() => new Set());
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

  const [pendingGalleryFiles, setPendingGalleryFiles] = useState<File[]>([]);
  const [galleryPreviewUrls, setGalleryPreviewUrls] = useState<string[]>([]);
  const [galleryError, setGalleryError] = useState("");
  const [successOpen, setSuccessOpen] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [submitAttempted, setSubmitAttempted] = useState(false);

  const [createSupplierUser, { isLoading: isCreatingUser }] = useCreateAdminSupplierUserMutation();
  const [createAdminSupplier, { isLoading: isCreatingSupplier }] = useCreateAdminSupplierMutation();
  const [updateAdminProfile, { isLoading: isUpdatingProfile }] = useUpdateAdminSupplierProfileMutation();

  const isSaving = isCreatingUser || isCreatingSupplier || isUpdatingProfile || isUploadingGallery;

  useEffect(() => {
    return () => {
      for (const url of galleryPreviewUrls) {
        if (url.startsWith("blob:")) URL.revokeObjectURL(url);
      }
    };
  }, [galleryPreviewUrls]);

  const inputClass =
    "h-11 w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-right text-sm leading-5 text-black outline-none placeholder:text-black/60";
  const textareaClass =
    "min-h-[140px] w-full resize-y rounded-2xl border border-black/10 bg-white px-4 py-4 text-right text-base leading-6 text-black outline-none placeholder:text-black/60";
  const socialInputClass =
    "h-[50px] w-full rounded-2xl border border-black/10 bg-white py-3 pr-4 pl-10 text-right text-base leading-6 text-black outline-none placeholder:text-black";
  const labelClass = "text-right text-base leading-4 tracking-[0.6px] font-bold uppercase text-black";
  const labelClassNoTrack = "text-right text-base leading-5 font-bold text-black";
  const sectionLabelClass = "text-right text-base leading-5 font-bold text-black";

  const liveEmailError = useMemo(() => {
    const trimmed = email.trim();
    if (!trimmed) return null;
    if (!EMAIL_PATTERN.test(trimmed)) return HeAuth.validEmail;
    return null;
  }, [email]);

  const livePhoneError = useMemo(() => {
    const trimmed = phone.trim();
    if (!trimmed) return null;
    if (!normalizeIsraeliMobileLocal(trimmed)) {
      return "מספר הטלפון חייב להיות 10 ספרות בפורמט ישראלי (05XXXXXXXX).";
    }
    return null;
  }, [phone]);

  const displayError = (key: string, live?: string | null) =>
    fieldErrors[key] ?? (submitAttempted ? live : null) ?? undefined;

  const galleryPick = (e: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;
    setGalleryError("");

    const room = Math.max(0, 12 - pendingGalleryFiles.length);
    const toAdd = files.slice(0, room);
    if (!toAdd.length) {
      setGalleryError("ניתן להעלות עד 12 תמונות לגלריה.");
      e.target.value = "";
      return;
    }

    const previews = toAdd.map((file) => URL.createObjectURL(file));
    setPendingGalleryFiles((prev) => [...prev, ...toAdd]);
    setGalleryPreviewUrls((prev) => [...prev, ...previews]);
    e.target.value = "";
  };

  const removeGalleryAt = (index: number) => {
    setPendingGalleryFiles((prev) => prev.filter((_, i) => i !== index));
    setGalleryPreviewUrls((prev) => {
      const url = prev[index];
      if (url?.startsWith("blob:")) URL.revokeObjectURL(url);
      return prev.filter((_, i) => i !== index);
    });
  };

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitError("");
    setGalleryError("");
    setSubmitAttempted(true);

    const validation = validateAdminSupplierForm({
      businessName,
      categoryId,
      email,
      phone,
      description,
      digitalLinks,
    });

    if (Object.keys(validation.fieldErrors).length > 0) {
      setFieldErrors(validation.fieldErrors);
      setSubmitError("נא לתקן את השדות המסומנים לפני השמירה.");
      return;
    }

    setFieldErrors({});

    const trimmedName = businessName.trim();
    const trimmedEmail = email.trim();
    const trimmedPhone = validation.normalizedPhone!;
    const slug = validation.slug;
    const socialLinks = Object.entries(digitalLinks)
      .filter(([key, url]) => key !== "website" && url.trim())
      .map(([platform, url]) => ({ platform, url: url.trim() }));

    const categories: SupplierCategoryAssignment[] = Array.from(selectedSubcategoryIds).map(
      (subcategoryId) => ({
        categoryId,
        subcategoryId,
      }),
    );
    if (categories.length === 0 && categoryId) {
      categories.push({ categoryId, subcategoryId: null });
    }

    const fullAddress = [address.trim(), centralLocation.trim()].filter(Boolean).join(", ") || undefined;
    const serviceAreas = Array.from(selectedAreas);

    const profilePayload: UpsertSupplierProfilePayload = {
      businessName: trimmedName,
      slug,
      description: description.trim() || undefined,
      email: trimmedEmail,
      phone: trimmedPhone,
      website: digitalLinks.website.trim() || undefined,
      socialLinks: socialLinks.length > 0 ? socialLinks : undefined,
      categories,
      serviceAreas,
      labelsRules: Array.from(selectedRules),
      labelsNiche: Array.from(selectedNicheLabels),
      address: fullAddress,
      extraLanguage: language || undefined,
    };

    try {
      const user = await createSupplierUser({ email: trimmedEmail, phone: trimmedPhone }).unwrap();

      const supplier = await createAdminSupplier({
        ownerUserId: user.id,
        businessName: trimmedName,
        slug,
        description: description.trim() || undefined,
        contactEmail: trimmedEmail,
        publicPhone: trimmedPhone,
        serviceAreas,
        approvalStatus: "DRAFT",
      }).unwrap();

      await updateAdminProfile({ supplierId: supplier.id, body: profilePayload }).unwrap();

      if (pendingGalleryFiles.length > 0) {
        await uploadGallery({
          files: pendingGalleryFiles,
          supplierId: supplier.id,
          mediaType: "gallery",
        }).unwrap();
      }

      setSuccessOpen(true);
    } catch (err) {
      const msg = extractApiErrorMessage(err, "השמירה נכשלה. נסה שוב.");
      if (msg.toLowerCase().includes("already exists") || msg.includes("כבר קיים")) {
        setSubmitError("משתמש עם אימייל או טלפון זה כבר קיים במערכת.");
      } else {
        setSubmitError(msg);
      }
    }
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
          <div className="mb-6 flex flex-col gap-0">
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
                onChange={(ev) => {
                  setBusinessName(ev.target.value);
                  clearFieldError(setFieldErrors, "businessName");
                }}
                placeholder="לדוגמה: קייטרינג גורמה יוקרתי"
                maxLength={120}
                aria-invalid={Boolean(displayError("businessName"))}
                className={inputWithFieldError(
                  "h-11 w-full rounded-2xl border border-black/10 bg-white px-3 py-[13px] text-right text-sm leading-[21px] text-black outline-none placeholder:text-black/60",
                  displayError("businessName"),
                )}
              />
              <FieldError message={displayError("businessName")} />
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
                    onChange={(ev) => {
                      setCategoryId(ev.target.value);
                      clearFieldError(setFieldErrors, "categoryId");
                    }}
                    aria-invalid={Boolean(displayError("categoryId"))}
                    className={inputWithFieldError(
                      "h-11 w-full appearance-none rounded-2xl border border-black/10 bg-white px-3 py-[13px] text-right text-sm leading-5 text-[#191C1D] outline-none",
                      displayError("categoryId"),
                    )}
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
                <FieldError message={displayError("categoryId")} />
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
                  onChange={(ev) => {
                    setEmail(ev.target.value);
                    clearFieldError(setFieldErrors, "email");
                  }}
                  placeholder="name@gmail.com"
                  aria-invalid={Boolean(displayError("email", liveEmailError))}
                  className={inputWithFieldError(
                    "h-11 w-full rounded-2xl border border-black/10 bg-white px-3 py-[13px] text-right text-sm leading-[17px] text-black outline-none placeholder:text-black/60",
                    displayError("email", liveEmailError),
                  )}
                  dir="ltr"
                  inputMode="email"
                  autoComplete="email"
                />
                <FieldError message={displayError("email", liveEmailError)} />
              </div>

              <div className="flex flex-col gap-2">
                <label className={labelClass}>
                  טלפון
                </label>
                <input
                  value={phone}
                  onChange={(ev) => {
                    const digits = ev.target.value.replace(/\D/g, "").slice(0, 10);
                    setPhone(digits);
                    clearFieldError(setFieldErrors, "phone");
                  }}
                  placeholder="0501234567"
                  maxLength={10}
                  aria-invalid={Boolean(displayError("phone", livePhoneError))}
                  className={inputWithFieldError(
                    "h-11 w-full rounded-2xl border border-black/10 bg-white px-3 py-[13px] text-right text-sm leading-[17px] text-black outline-none placeholder:text-black/60",
                    displayError("phone", livePhoneError),
                  )}
                  dir="ltr"
                  inputMode="tel"
                  autoComplete="tel"
                />
                <FieldError message={displayError("phone", livePhoneError)} />
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
                  onChange={(ev) => {
                    setDescription(ev.target.value.slice(0, 500));
                    clearFieldError(setFieldErrors, "description");
                  }}
                  placeholder="תאר/י את השירות שלך, מה מייחד אותך ומה הלקוחות יקבלו..."
                  maxLength={500}
                  aria-invalid={Boolean(displayError("description"))}
                  className={inputWithFieldError(textareaClass, displayError("description"))}
                />
                <span className="absolute bottom-3 left-3 text-[10px] leading-[15px] text-black">
                  {description.length} / 500
                </span>
              </div>
              <FieldError message={displayError("description")} />
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
                  <div key={f.key} className="flex flex-col gap-1">
                    <div className="relative">
                      <input
                        value={digitalLinks[f.key]}
                        onChange={(ev) => {
                          setDigitalLinks((prev) => ({ ...prev, [f.key]: ev.target.value }));
                          clearFieldError(setFieldErrors, `link_${f.key}`);
                        }}
                        placeholder={f.label}
                        aria-invalid={Boolean(displayError(`link_${f.key}`))}
                        className={inputWithFieldError(
                          socialInputClass,
                          displayError(`link_${f.key}`),
                        )}
                        dir="ltr"
                      />
                      <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2" aria-hidden>
                        <Image src={`/icons/attach_file.svg`} alt="" width={16} height={16} />
                      </span>
                    </div>
                    <FieldError message={displayError(`link_${f.key}`)} />
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

                {galleryPreviewUrls.map((src, i) => (
                  <div
                    key={`${src}-${i}`}
                    className="relative aspect-square min-h-30 overflow-hidden rounded-2xl border border-[#F1F5F9] bg-slate-100 sm:min-h-36 lg:min-h-0"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={src} alt="" className="h-full w-full object-cover" />
                    {i === 0 ? (
                      <span className="absolute right-3 top-3 rounded-lg bg-[#3B82F6] px-2 py-1 text-[10px] leading-[15px] font-bold text-white">
                        תמונת פרופיל ראשית
                      </span>
                    ) : null}
                    <button
                      type="button"
                      onClick={() => removeGalleryAt(i)}
                      className="absolute left-2 top-2 flex size-7 items-center justify-center rounded-full bg-black/60 text-sm text-white"
                      aria-label="הסר תמונה"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </section>

            {/* Bottom Buttons */}
            <div className="mt-10 flex flex-col items-center gap-4">
              {galleryError ? <p className="text-sm text-red-600">{galleryError}</p> : null}
              {submitError ? (
                <p className="text-sm text-red-600">{submitError}</p>
              ) : null}
              <div className="flex flex-col-reverse items-center justify-center gap-[18px] sm:flex-row sm:gap-[18px]">
                <button
                  type="submit"
                  disabled={isSaving}
                  className="w-full cursor-pointer rounded-[99px] bg-[linear-gradient(90deg,#00113A_0%,#002366_100%)] px-10 py-[13px] text-base leading-6 font-bold text-white disabled:opacity-60 sm:w-auto"
                >
                  {isSaving ? "שומר..." : "שמור ספק"}
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
            className="relative w-full max-w-2xl rounded-[24px] border border-[rgba(134,85,246,0.2)] bg-[#EBF2FA] p-6 text-center shadow-[0px_8px_32px_rgba(0,0,0,0.1)] backdrop-blur-[6px] sm:p-8"
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
