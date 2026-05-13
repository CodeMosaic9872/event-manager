"use client";
import { toSlug } from "@/shared/lib/to-slug";
import { FormEvent, useCallback, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useUpdateSupplierProfileMutation } from "@/shared/api/api";
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
  const [description, setDescription] = useState("");
  const [subcategories, setSubcategories] = useState<string[]>([]);
  const [serviceAreas, setServiceAreas] = useState<string[]>([]);
  const [labelsRules, setLabelsRules] = useState<string[]>([]);
  const [labelsNiche, setLabelsNiche] = useState<string[]>([]);
  const [social, setSocial] = useState<Record<string, string>>(() =>
    Object.fromEntries(JOIN_SUPPLIER_STEP2_SOCIAL_FIELDS.map((f) => [f.key, ""])),
  );
  const [address, setAddress] = useState("");
  const [extraLanguage, setExtraLanguage] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [updateProfile] = useUpdateSupplierProfileMutation();
  const [isSaving, setIsSaving] = useState(false);

  const urlError = useMemo(() => {
    const socialErrors: Record<string, string> = {};
    for (const [key, value] of Object.entries(social)) {
      const trimmed = value.trim();
      if (trimmed && !URL_PATTERN.test(trimmed)) {
        socialErrors[key] = "Enter a valid URL";
      }
    }
    return socialErrors;
  }, [social]);

  const descError = useMemo(() => {
    if (!description.trim()) return "Description is required.";
    if (description.trim().length < MIN_DESC) return `Minimum ${MIN_DESC} characters required.`;
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

    if (!description.trim()) nextErrors.description = "Description is required.";
    else if (description.trim().length < MIN_DESC) {
      nextErrors.description = `Minimum ${MIN_DESC} characters required.`;
    }
    if (subcategories.length === 0) {
      nextErrors.subcategories = "Please select at least one subcategory.";
    }
    if (serviceAreas.length === 0) {
      nextErrors.serviceAreas = "Please select at least one service area.";
    }
    if (labelsRules.length === 0) {
      nextErrors.labelsRules = "Please select at least one label rule.";
    }
    if (labelsNiche.length === 0) {
      nextErrors.labelsNiche = "Please select at least one niche label.";
    }
    if (!extraLanguage.trim()) {
      nextErrors.extraLanguage = "Please select a language.";
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
        businessName: businessName || "New Supplier",
        slug: toSlug(businessName || "New Supplier"),
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
      setErrors({ form: "Failed to save. Please try again." });
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
              <p className="text-[12px] font-bold uppercase tracking-[0.06em] text-[#4721DF]">Step 2 of 4</p>
              <h1 className="mt-1 max-w-[min(100%,420px)] pb-1 text-[22px] font-normal leading-tight text-black sm:text-[28px] lg:text-[30px] lg:leading-9">
                Business details and social links
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
              <label className="text-right text-[20px] leading-5 text-black">Brief details about the service</label>
              <div className="relative">
                <textarea
                  value={description}
                  maxLength={JOIN_SUPPLIER_STEP2_MAX_DESCRIPTION}
                  onChange={(e) => setDescription(e.target.value.slice(0, JOIN_SUPPLIER_STEP2_MAX_DESCRIPTION))}
                  placeholder="Describe your service, what makes you unique and what customers will receive..."
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
              <span className="text-right text-[16px] leading-5 text-black">Subcategory</span>
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
              <span className="text-right text-[16px] leading-5 text-black">Service area</span>
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
              <h2 className="border-b border-black/10 pb-2 text-right text-[16px] font-bold uppercase tracking-[0.35px] text-black">
                Digital presence
              </h2>
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
              <div className="relative flex min-h-[24px] flex-wrap items-center justify-start gap-2">
                <span className="rounded-lg bg-black/10 px-2 py-0.5 text-[10px] leading-5 text-black">Optional</span>
                <span className="text-[16px] leading-5 text-black">Business address</span>
              </div>
              <label className="relative block">
                <span className="sr-only">Street, city, house number</span>
                <input
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Street, city, house number"
                  className="box-border h-[50px] w-full rounded-2xl border border-black/10 bg-white py-3 ps-4 pe-11 text-right text-[16px] text-black outline-none placeholder:text-black/45 focus:border-[#4721DF]/35 focus:ring-2 focus:ring-[#6AB7FF]/40"
                />
                <span className="pointer-events-none absolute top-1/2 inset-s-3 -translate-y-1/2 text-[#0f172a]">
                  <JoinSupplierStep2PinGlyph />
                </span>
              </label>
              {errors.address && <p className="text-xs text-red-600">{errors.address}</p>}
              <div className="flex h-[128px] w-full items-center justify-end rounded-2xl border border-black/10 bg-white/60 px-4 text-sm text-slate-500" aria-hidden>
                Map preview
              </div>
            </div>

            <div className="flex w-full min-w-0 flex-col gap-3">
              <span className="text-right text-[16px] leading-5 text-black">Labels rules</span>
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
              <span className="text-right text-[16px] leading-5 text-black">Labels per niche</span>
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
              <span className="w-full text-right text-[16px] leading-5 text-black">Speaks other languages</span>
              <div className="relative w-full" dir="rtl">
                <select
                  value={extraLanguage}
                  onChange={(e) => setExtraLanguage(e.target.value)}
                  className={`box-border h-[50px] w-full appearance-none rounded-xl border bg-white px-4 py-3 text-right text-[16px] leading-6 text-[#1E293B] outline-none focus:border-[#4721DF]/35 focus:ring-2 focus:ring-[#6AB7FF]/40 ${errors.extraLanguage ? "border-red-400" : "border-[#E2E8F0]"}`}
                >
                  <option value="">Choose a language</option>
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
                Return
              </button>
              <div className="flex flex-col items-end gap-2 sm:items-center sm:flex-row">
                {errors.form && <p className="text-xs text-red-600">{errors.form}</p>}
                <button
                  type="submit"
                  disabled={isSaving}
                  className="inline-flex h-12 items-center justify-center gap-2 rounded-[99px] bg-[#201C44] px-10 text-[16px] font-bold leading-6 text-white shadow-[0_8px_24px_rgba(32,28,68,0.25)] transition hover:bg-[#151238] disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ fontFamily: "var(--font-assistant), sans-serif" }}
                >
                  {isSaving ? "Saving..." : "Continuation"}
                  <span className="block size-4 shrink-0 rotate-180 bg-white mask-[url(/icons/right_arrow.svg)] mask-contain mask-center mask-no-repeat" aria-hidden />
                </button>
              </div>
            </div>
          </form>
        </SupplierJoinGlassCard>

        <p className="mt-8 w-full max-w-2xl text-right text-[14px] leading-5 text-[#64748B]">
          The information is saved automatically. You can edit it even after registration is complete.
        </p>
      </div>
    </MarketingPageShell>
  );
}
