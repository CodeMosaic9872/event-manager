"use client";
import { toSlug } from "@/shared/lib/to-slug";
import { FormEvent, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useUpdateSupplierProfileMutation, useMeQuery } from "@/shared/api/api";
import { useAppSelector } from "@/store/hooks";
import { SelectableChip } from "@/shared/components/supplier-join/selectable-chip";
import { SupplierJoinGlassCard } from "@/shared/components/supplier-join/supplier-join-glass-card";
import { MarketingPageShell } from "@/shared/components/marketing-page-shell";
import {
  JOIN_SUPPLIER_STEP2_LABELS_NICHE,
  JOIN_SUPPLIER_STEP2_LABELS_RULES,
  JOIN_SUPPLIER_STEP2_LANGUAGES,
  JOIN_SUPPLIER_STEP2_MAX_DESCRIPTION,
  JOIN_SUPPLIER_STEP2_SERVICE_AREAS,
  JOIN_SUPPLIER_STEP2_SOCIAL_FIELDS,
  JOIN_SUPPLIER_STEP2_SUBCATEGORIES,
} from "@/shared/components/supplier-join/join-supplier-step-2-constants";
import {
  JoinSupplierStep2LinkGlyph,
  JoinSupplierStep2PinGlyph,
} from "@/shared/components/supplier-join/join-supplier-step-2-glyphs";
import { marketingPloniFont } from "@/shared/lib/marketing-typography";

const URL_PATTERN = /^(https?:\/\/)?[\w.-]+\.[a-z]{2,}(\/\S*)?$/i;
const MIN_DESC = 10;

export default function JoinSupplierStep2Page() {
  const router = useRouter();
  const isAuthHydrated = useAppSelector((state) => state.auth.isHydrated);
  const sessionUser = useAppSelector((state) => state.auth.user);
  const mp = useAppSelector((state) => state.auth.user?.marketplaceProfile);
  const { data: me } = useMeQuery(undefined, { skip: !isAuthHydrated || !sessionUser });

  const mpData = mp ?? me?.marketplaceProfile;

  const [description, setDescription] = useState(mpData?.description ?? "");
  const [subcategories, setSubcategories] = useState<string[]>(mpData?.subcategories ?? []);
  const [serviceAreas, setServiceAreas] = useState<string[]>(mpData?.serviceAreas ?? []);
  const [labelsRules, setLabelsRules] = useState<string[]>(mpData?.labelsRules ?? []);
  const [labelsNiche, setLabelsNiche] = useState<string[]>(mpData?.labelsNiche ?? []);
  const [social, setSocial] = useState<Record<string, string>>(() =>
    (() => {
      const fromLinks: Record<string, string> = {};
      for (const link of mpData?.socialLinks ?? []) {
        fromLinks[link.platform] = link.url;
      }
      return Object.fromEntries(
        JOIN_SUPPLIER_STEP2_SOCIAL_FIELDS.map((f) => [
          f.key,
          fromLinks[f.key]
            ?? (f.key === "website" ? mpData?.website
              : f.key === "instagram" ? mpData?.instagram
              : f.key === "facebook" ? mpData?.facebook
              : "")
            ?? "",
        ]),
      );
    })(),
  );
  const [address, setAddress] = useState(mpData?.address ?? "");
  const [extraLanguage, setExtraLanguage] = useState(mpData?.extraLanguage ?? "");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const prefilledRef = useRef(false);

  useEffect(() => {
    if (!mpData || prefilledRef.current) return;
    prefilledRef.current = true;
    setDescription(mpData.description ?? "");
    setSubcategories(mpData.subcategories ?? []);
    setServiceAreas(mpData.serviceAreas ?? []);
    setLabelsRules(mpData.labelsRules ?? []);
    setLabelsNiche(mpData.labelsNiche ?? []);
    setAddress(mpData.address ?? "");
    setExtraLanguage(mpData.extraLanguage ?? "");
    const fromLinks: Record<string, string> = {};
    for (const link of mpData.socialLinks ?? []) {
      fromLinks[link.platform] = link.url;
    }
    setSocial(Object.fromEntries(
      JOIN_SUPPLIER_STEP2_SOCIAL_FIELDS.map((f) => [
        f.key,
        fromLinks[f.key]
          ?? (f.key === "website" ? mpData.website
            : f.key === "instagram" ? mpData.instagram
            : f.key === "facebook" ? mpData.facebook
            : "")
          ?? "",
      ])
    ));
  }, [mpData]);
  const [updateProfile] = useUpdateSupplierProfileMutation();
  const [isSaving, setIsSaving] = useState(false);

  const urlError = useMemo(() => {
    const socialErrors: Record<string, string> = {};
    for (const [key, value] of Object.entries(social)) {
      const trimmed = value.trim();
      if (trimmed && !URL_PATTERN.test(trimmed)) {
        socialErrors[key] = "נא להזין כתובת URL תקינה";
      }
    }
    return socialErrors;
  }, [social]);

  const descError = useMemo(() => {
    if (!description.trim()) return "תיאור נדרש.";
    if (description.trim().length < MIN_DESC) return `נא לכתוב לפחות ${MIN_DESC} תווים.`;
    return null;
  }, [description]);

  const toggle = useCallback(
    (list: string[], setList: (v: string[]) => void, id: string) => {
      setList(list.includes(id) ? list.filter((x) => x !== id) : [...list, id]);
    },
    [],
  );

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const nextErrors: Record<string, string> = { ...urlError };

    if (!description.trim()) nextErrors.description = "תיאור נדרש.";
    else if (description.trim().length < MIN_DESC) {
      nextErrors.description = `נא לכתוב לפחות ${MIN_DESC} תווים.`;
    }
    if (subcategories.length === 0) {
      nextErrors.subcategories = "נא לבחור לפחות תתי קטגוריה אחת.";
    }
    // if (serviceAreas.length === 0) {
    //   nextErrors.serviceAreas = "Please select at least one service area.";
    // }
    if (labelsRules.length === 0) {
      nextErrors.labelsRules = "נא לבחור לפחות כלל תווית אחד.";
    }
    if (labelsNiche.length === 0) {
      nextErrors.labelsNiche = "נא לבחור לפחות תווית נישה אחת.";
    }
    if (!extraLanguage.trim()) {
      nextErrors.extraLanguage = "נא לבחור שפה.";
    }

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }
    setErrors({});
    setIsSaving(true);

    const socialLinks = Object.entries(social)
      .filter(([_, url]) => url.trim())
      .map(([platform, url]) => ({ platform, url: url.trim() }));

    let businessName = "";
    try {
      const step1Data = JSON.parse(sessionStorage.getItem("supplierJoinStep1") ?? "{}");
      businessName = step1Data.businessName ?? "";
    } catch { /* ignore */ }

    try {
            await updateProfile({
        businessName: businessName.trim() || "ספק חדש",
        slug: toSlug(businessName.trim()) || `n-${Date.now()}`,
        description: description.trim(),
        website: social.website?.trim() || undefined,
        socialLinks: socialLinks.length > 0 ? socialLinks : undefined,
        subcategories: subcategories.length > 0 ? subcategories : undefined,
        serviceAreas: serviceAreas.length > 0 ? serviceAreas : undefined,
        labelsRules: labelsRules.length > 0 ? labelsRules : undefined,
        labelsNiche: labelsNiche.length > 0 ? labelsNiche : undefined,
        address: address.trim() || undefined,
        extraLanguage: extraLanguage || undefined,
      }).unwrap()
      router.push("/join-supplier/step-3");
    } catch {
      setErrors({ form: "השמירה נכשלה. נסה שוב." });
    } finally {
      setIsSaving(false);
    }
  };

  const descLen = description.length;

  return (
    <MarketingPageShell showBackgroundImage dir="rtl" lang="he">
      <div className="mx-auto flex w-full max-w-[863px] flex-col items-stretch">
        <div className="mb-8 w-full px-1" style={{ fontFamily: marketingPloniFont }}>
          <div className="mb-3 flex items-end justify-between gap-4">
            <div className="min-w-0 text-right">
              <p className="text-[12px] font-bold uppercase tracking-[0.06em] text-[#4721DF]">שלב 2 מתוך 4</p>
              <h1 className="mt-1 max-w-[min(100%,420px)] pb-1 text-[22px] font-bold leading-tight text-black sm:text-[28px] lg:text-[30px] lg:leading-9">
                פרטי העסק וקישורים חברתיים
              </h1>
            </div>
            <span
              className="shrink-0 text-[20px] font-bold tabular-nums leading-7 text-[#4721DF]"
              style={{ fontFamily: "var(--font-assistant), ui-sans-serif, system-ui, sans-serif" }}
            >
              50%
            </span>
          </div>
          <div className="flex h-2 w-full overflow-hidden rounded-full bg-black/5" dir="rtl">
            <div className="h-full w-1/2 rounded-full bg-[#4721DF]" />
          </div>
        </div>

        <SupplierJoinGlassCard
          className="w-full max-w-[863px] px-5 py-8 sm:px-8 sm:py-10"
          style={{ fontFamily: marketingPloniFont }}
        >
          <form
            className="flex w-full min-w-0 max-w-full flex-col gap-8 lg:gap-10"
            dir="rtl"
            onSubmit={handleSubmit}
          >
            <div className="flex flex-col gap-2">
              <label className="text-right text-[20px] font-bold leading-5 text-black">פירוט קצר על השירות</label>
              <div className="relative">
                <textarea
                  value={description}
                  maxLength={JOIN_SUPPLIER_STEP2_MAX_DESCRIPTION}
                  onChange={(e) => setDescription(e.target.value.slice(0, JOIN_SUPPLIER_STEP2_MAX_DESCRIPTION))}
                  placeholder="תאר/י את השירות שלך, מה מייחד אותך ומה הלקוחות יקבלו..."
                  rows={5}
                  className={`box-border min-h-[140px] w-full resize-y rounded-2xl border bg-white px-4 pb-8 pt-4 text-right text-[16px] leading-6 text-black outline-none placeholder:text-black/50 focus:border-[#4721DF]/35 focus:ring-2 focus:ring-[#6AB7FF]/40 ${descError ? "border-red-400" : "border-black/10"}`}
                />
                <span className="pointer-events-none absolute bottom-3 end-3 text-[10px] leading-[15px] text-black" dir="ltr">
                  {descLen} / {JOIN_SUPPLIER_STEP2_MAX_DESCRIPTION}
                </span>
              </div>
              {descError && <p className="text-xs text-red-600">{descError}</p>}
            </div>

            <div className="flex w-full min-w-0 flex-col gap-3">
              <span className="text-right text-[16px] font-bold leading-5 text-black">תתי קטגוריה</span>
              <div dir="rtl" className="flex w-full min-w-0 flex-wrap content-start items-center justify-start gap-3 sm:gap-[15px]">
                {JOIN_SUPPLIER_STEP2_SUBCATEGORIES.map((item) => (
                  <SelectableChip
                    key={item}
                    selected={subcategories.includes(item)}
                    onToggle={() => toggle(subcategories, setSubcategories, item)}
                  >
                    {item}
                  </SelectableChip>
                ))}
              </div>
              {errors.subcategories && <p className="text-xs text-red-600">{errors.subcategories}</p>}
            </div>

            <div className="flex w-full min-w-0 flex-col gap-3">
              <span className="text-right text-[16px] font-bold leading-5 text-black">אזור מתן שירות</span>
              <div dir="rtl" className="flex w-full min-w-0 flex-wrap content-start items-center justify-start gap-3 sm:gap-[15px]">
                {JOIN_SUPPLIER_STEP2_SERVICE_AREAS.map((item) => (
                  <SelectableChip
                    key={item}
                    selected={serviceAreas.includes(item)}
                    onToggle={() => toggle(serviceAreas, setServiceAreas, item)}
                  >
                    {item}
                  </SelectableChip>
                ))}
              </div>
              {errors.serviceAreas && <p className="text-xs text-red-600">{errors.serviceAreas}</p>}
            </div>

            <div className="flex flex-col gap-4">
              <span className="text-right text-[16px] font-bold leading-5 text-black">נוכחות בדיגיטל</span>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2" dir="rtl">
                {JOIN_SUPPLIER_STEP2_SOCIAL_FIELDS.map((field) => (
                  <div key={field.key} className="flex flex-col gap-1">
                    <label className="relative block">
                      <span className="sr-only">{field.label}</span>
                      <input
                        type="url"
                        dir="ltr"
                        inputMode="url"
                        placeholder={field.placeholder}
                        value={social[field.key] ?? ""}
                        onChange={(e) =>
                          setSocial((prev) => ({ ...prev, [field.key]: e.target.value }))
                        }
                        className={`box-border h-[50px] w-full rounded-2xl border bg-white py-3 ps-4 pe-11 text-right text-[16px] leading-[19px] text-black outline-none placeholder:text-black/45 focus:border-[#4721DF]/35 focus:ring-2 focus:ring-[#6AB7FF]/40 ${urlError[field.key] ? "border-red-400" : "border-black/10"}`}
                      />
                      <span className="pointer-events-none absolute top-1/2 inset-s-3 -translate-y-1/2 text-[#0f172a]">
                        <JoinSupplierStep2LinkGlyph className="size-5" />
                      </span>
                    </label>
                    {urlError[field.key] && <p className="px-1 text-xs text-red-600">{urlError[field.key]}</p>}
                  </div>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <div className="relative flex min-h-[24px] flex-wrap items-center justify-end gap-2">
                <span className="text-[16px] font-bold leading-5 text-black">כתובת העסק</span>
                <span className="rounded-lg bg-black/10 px-2 py-0.5 text-[10px] font-normal leading-5 text-black">
                  אופציונלי
                </span>
              </div>
              <label className="relative block">
                <span className="sr-only">רחוב, עיר, מספר בית</span>
                <input
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="רחוב, עיר, מספר בית"
                  className="box-border h-[50px] w-full rounded-2xl border border-black/10 bg-white py-3 ps-4 pe-11 text-right text-[16px] text-black outline-none placeholder:text-black/45 focus:border-[#4721DF]/35 focus:ring-2 focus:ring-[#6AB7FF]/40"
                />
                <span className="pointer-events-none absolute top-1/2 inset-s-3 -translate-y-1/2 text-[#0f172a]">
                  <JoinSupplierStep2PinGlyph />
                </span>
              </label>
              {errors.address && <p className="text-xs text-red-600">{errors.address}</p>}
              <div className="flex h-[128px] w-full items-center justify-end rounded-2xl border border-black/10 bg-white/60 px-4 text-sm text-slate-500" aria-hidden>
                תצוגת מפה
              </div>
            </div>

            <div className="flex w-full min-w-0 flex-col gap-3">
              <span className="text-right text-[16px] font-bold leading-5 text-black">לייבלים כלליים</span>
              <div dir="rtl" className="flex w-full min-w-0 flex-wrap content-start items-center justify-start gap-3 sm:gap-[14px]">
                {JOIN_SUPPLIER_STEP2_LABELS_RULES.map((item) => (
                  <SelectableChip
                    key={item}
                    selected={labelsRules.includes(item)}
                    onToggle={() => toggle(labelsRules, setLabelsRules, item)}
                  >
                    {item}
                  </SelectableChip>
                ))}
              </div>
              {errors.labelsRules && <p className="text-xs text-red-600">{errors.labelsRules}</p>}
            </div>

            <div className="flex w-full min-w-0 flex-col gap-3">
              <span className="text-right text-[16px] font-bold leading-5 text-black">לייבלים פר נישה</span>
              <div dir="rtl" className="flex w-full min-w-0 flex-wrap content-start items-center justify-start gap-3 sm:gap-[14px]">
                {JOIN_SUPPLIER_STEP2_LABELS_NICHE.map((item) => (
                  <SelectableChip
                    key={item}
                    selected={labelsNiche.includes(item)}
                    onToggle={() => toggle(labelsNiche, setLabelsNiche, item)}
                  >
                    {item}
                  </SelectableChip>
                ))}
              </div>
              {errors.labelsNiche && <p className="text-xs text-red-600">{errors.labelsNiche}</p>}
            </div>

            <div className="flex w-full max-w-[367px] flex-col gap-2 self-start">
              <span className="w-full text-right text-[16px] font-bold leading-5 text-black">דובר שפות נוספות</span>
              <div className="relative w-full" dir="rtl">
                <select
                  value={extraLanguage}
                  onChange={(e) => setExtraLanguage(e.target.value)}
                  className={`box-border h-[50px] w-full appearance-none rounded-xl border bg-white px-4 py-3 text-right text-[16px] leading-6 text-[#1E293B] outline-none focus:border-[#4721DF]/35 focus:ring-2 focus:ring-[#6AB7FF]/40 ${errors.extraLanguage ? "border-red-400" : "border-[#E2E8F0]"}`}
                >
                  <option value="">בחר שפה</option>
                  {JOIN_SUPPLIER_STEP2_LANGUAGES.map((lang) => (
                    <option key={lang} value={lang}>{lang}</option>
                  ))}
                </select>
                <span className="pointer-events-none absolute top-1/2 inset-e-3 -translate-y-1/2 text-[#6B7280]" aria-hidden>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                    <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
              </div>
              {errors.extraLanguage && <p className="text-xs text-red-600">{errors.extraLanguage}</p>}
            </div>

            <div className="flex flex-col-reverse gap-4 border-t border-black/5 pt-6 sm:flex-row sm:items-center sm:justify-between">
              <button
                type="button"
                onClick={() => router.push("/join-supplier")}
                className="inline-flex items-center justify-center gap-2 text-[16px] leading-6 text-black"
              >
                <span className="block size-4 shrink-0 bg-black mask-[url(/icons/right_arrow.svg)] mask-contain mask-center mask-no-repeat" aria-hidden />
                חזרה
              </button>
              <div className="flex flex-col items-end gap-2 sm:items-center sm:flex-row">
                {errors.form && <p className="text-xs text-red-600">{errors.form}</p>}
                <button
                  type="submit"
                  disabled={isSaving}
                  className="inline-flex h-12 items-center justify-center gap-2 rounded-[99px] bg-[#201C44] px-10 text-[16px] font-bold leading-6 text-white shadow-[0_8px_24px_rgba(32,28,68,0.25)] transition hover:bg-[#151238] disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ fontFamily: "var(--font-assistant), sans-serif" }}
                >
                  {isSaving ? "שומר…" : "המשך"}
                  <span className="block size-4 shrink-0 rotate-180 bg-white mask-[url(/icons/right_arrow.svg)] mask-contain mask-center mask-no-repeat" aria-hidden />
                </button>
              </div>
            </div>
          </form>
        </SupplierJoinGlassCard>

        <p className="mt-8 w-full max-w-2xl text-right text-[14px] leading-5 text-[#64748B]">
          המידע נשמר באופן אוטומטי, תוכל לערוך אותו גם לאחר סיום ההרשמה.
        </p>
      </div>
    </MarketingPageShell>
  );
}
