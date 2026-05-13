"use client";

import { type DragEvent, type FormEvent, useCallback, useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useUploadUserProfileFileMutation, useMeQuery } from "@/shared/api/api";
import { useAppSelector } from "@/store/hooks";
import { SupplierJoinGlassCard } from "@/shared/components/supplier-join/supplier-join-glass-card";
import { SupplierJoinProgress } from "@/shared/components/supplier-join/supplier-join-progress";
import { MarketingPageShell } from "@/shared/components/marketing-page-shell";
import { JoinSupplierStep3DocumentRow } from "@/shared/components/supplier-join/join-supplier-step-3-document-row";
import { JoinSupplierStep3GallerySection } from "@/shared/components/supplier-join/join-supplier-step-3-gallery-section";
import {
  JOIN_SUPPLIER_STEP3_MAX_GALLERY,
  JOIN_SUPPLIER_STEP3_MIN_GALLERY,
  JOIN_SUPPLIER_STEP3_PROFILE_MAX_MB,
} from "@/shared/components/supplier-join/join-supplier-step-3-constants";
import { JoinSupplierStep3ProfileSection } from "@/shared/components/supplier-join/join-supplier-step-3-profile-section";
import { marketingPloniFont } from "@/shared/lib/marketing-typography";

/** Maps step-3 assets to `imageKind` on POST /v1/auth/me/media/upload-file (multipart: file + imageKind). */
const STEP3_UPLOAD_KIND = {
  profile: "avatar",
  gallery: "gallery",
  kosher: "kosher",
  form3010: "form3010",
} as const;

export default function JoinSupplierStep3Page() {
  const router = useRouter();
  const isAuthHydrated = useAppSelector((state) => state.auth.isHydrated);
  const sessionUser = useAppSelector((state) => state.auth.user);
  const mp = useAppSelector((state) => state.auth.user?.marketplaceProfile);
  const { data: me } = useMeQuery(undefined, { skip: !isAuthHydrated || !sessionUser });
  const mpData = mp ?? me?.marketplaceProfile;
  const existingGalleryUrls = mpData?.gallery ?? [];
  const existingProfileUrl = mpData?.avatarImageUrl ?? null;
  const existingKosherUrl = mpData?.kosher ?? null;
  const existingForm3010Url = mpData?.form3010 ?? null;
  const galleryInputRef = useRef<HTMLInputElement>(null);
  const profileInputRef = useRef<HTMLInputElement>(null);
  const kosherInputRef = useRef<HTMLInputElement>(null);
  const form3010InputRef = useRef<HTMLInputElement>(null);

  const [galleryFiles, setGalleryFiles] = useState<File[]>([]);
  const [profileFile, setProfileFile] = useState<File | null>(null);
  const [kosherName, setKosherName] = useState("");
  const [form3010Name, setForm3010Name] = useState("");
  const [kosherFile, setKosherFile] = useState<File | null>(null);
  const [form3010File, setForm3010File] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [uploadProfileFile] = useUploadUserProfileFileMutation();

  const galleryUrls = useMemo(() => galleryFiles.map((f) => URL.createObjectURL(f)), [galleryFiles]);
  useEffect(() => {
    const urls = galleryUrls;
    return () => { urls.forEach((u) => URL.revokeObjectURL(u)); };
  }, [galleryUrls]);

  const profileSrc = useMemo(() => (profileFile ? URL.createObjectURL(profileFile) : null), [profileFile]);
  useEffect(() => {
    if (!profileSrc) return;
    return () => URL.revokeObjectURL(profileSrc);
  }, [profileSrc]);

  useEffect(() => {
    sessionStorage.removeItem("supplierJoinStep3");
  }, []);

  const addGalleryFiles = useCallback((files: FileList | File[]) => {
    const next = Array.from(files).filter((f) => /^image\/(jpeg|png|webp)$/i.test(f.type));
    setGalleryFiles((prev) => {
      const merged = [...prev, ...next];
      return merged.slice(0, JOIN_SUPPLIER_STEP3_MAX_GALLERY);
    });
  }, []);

  const onGalleryInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.length) addGalleryFiles(e.target.files);
    e.target.value = "";
  };

  const onDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragActive(false);
    if (e.dataTransfer.files?.length) addGalleryFiles(e.dataTransfer.files);
  };

  const removeGalleryAt = (index: number) => {
    setGalleryFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const clearKosherAttachment = useCallback(() => {
    setKosherName(""); setKosherFile(null);
    if (kosherInputRef.current) kosherInputRef.current.value = "";
  }, []);

  const clearForm3010Attachment = useCallback(() => {
    setForm3010Name(""); setForm3010File(null);
    if (form3010InputRef.current) form3010InputRef.current.value = "";
  }, []);

  const allFilesReady = useMemo(
    () =>
      (galleryFiles.length + existingGalleryUrls.length >= JOIN_SUPPLIER_STEP3_MIN_GALLERY) &&
      (profileFile != null || existingProfileUrl != null) &&
      (kosherFile != null || existingKosherUrl != null) &&
      (form3010File != null || existingForm3010Url != null),
    [galleryFiles.length, profileFile, kosherFile, form3010File, existingGalleryUrls.length, existingProfileUrl, existingKosherUrl, existingForm3010Url],
  );

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!allFilesReady) return;
    const next: Record<string, string> = {};
    if ((galleryFiles.length + existingGalleryUrls.length) < JOIN_SUPPLIER_STEP3_MIN_GALLERY) {
      next.gallery = `נא להעלות לפחות ${JOIN_SUPPLIER_STEP3_MIN_GALLERY} תמונות לגלריה.`;
    }
    if (!profileFile && !existingProfileUrl) {
      next.profile = "תמונת פרופיל נדרשת.";
    }
    if (!kosherFile && !existingKosherUrl) {
      next.kosher = "נדרש קובץ תעודת כשרות.";
    }
    if (!form3010File && !existingForm3010Url) {
      next.form3010 = "נדרש קובץ טופס 3010.";
    }
    if (Object.keys(next).length > 0) {
      setErrors(next);
      return;
    }
    setErrors({});
    setIsSaving(true);
    try {
      const uploads: Promise<unknown>[] = [
        uploadProfileFile({ file: profileFile!, imageKind: STEP3_UPLOAD_KIND.profile }).unwrap(),
        ...galleryFiles.map((file) =>
          uploadProfileFile({ file, imageKind: STEP3_UPLOAD_KIND.gallery }).unwrap(),
        ),
        uploadProfileFile({ file: kosherFile!, imageKind: STEP3_UPLOAD_KIND.kosher }).unwrap(),
        uploadProfileFile({ file: form3010File!, imageKind: STEP3_UPLOAD_KIND.form3010 }).unwrap(),
      ];
      await Promise.all(uploads);
      router.push("/join-supplier/step-4");
    } catch {
      setErrors({ form: "העלאת המדיה נכשלה. נסו שוב." });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <MarketingPageShell showBackgroundImage dir="rtl" lang="he">
      <div className="mx-auto flex w-full max-w-[977px] flex-col items-stretch">
        <SupplierJoinProgress percent={75} stepLabel="שלב 3 מתוך 4" title="העלאת מדיה" />

        <SupplierJoinGlassCard className="w-full px-5 py-8 sm:px-8 sm:py-10" style={{ fontFamily: marketingPloniFont }}>
          <form className="flex w-full min-w-0 flex-col gap-10 lg:gap-12" dir="rtl" lang="he" onSubmit={handleSubmit}>
            <div className="flex w-full flex-col gap-6">
              <div className="w-full text-center">
                <h2 className="text-[28px] font-bold leading-10 text-black sm:text-[36px] sm:leading-[40px]">
                  צרף/י תמונות לגלריה שלך
                </h2>
                <p className="mt-3 text-[16px] leading-7 text-black sm:text-[18px]">הפרופיל שלך נראה טוב יותר עם חיוך :)</p>
              </div>

              {(existingGalleryUrls.length > 0 || existingProfileUrl) && (
                <div className="flex flex-col gap-2 rounded-xl border border-[#BFDBFE] bg-[#F0F7FF] p-4">
                  <p className="text-sm text-[#4721DF]">כבר הועלה:</p>
                  <div className="flex flex-wrap gap-2">
                    {existingGalleryUrls.map((url) => (
                      <img key={url} src={url} alt="" className="size-16 rounded-lg object-cover" />
                    ))}
                    {existingProfileUrl && (
                      <div className="relative size-16 rounded-lg border-2 border-[#3B82F6] overflow-hidden">
                        <img src={existingProfileUrl} alt="" className="size-full object-cover" />
                        <span className="absolute bottom-0 left-0 right-0 bg-[#3B82F6] text-[8px] text-white text-center">פרופיל</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:gap-8">
                <JoinSupplierStep3GallerySection
                  galleryInputRef={galleryInputRef}
                  galleryFiles={galleryFiles}
                  galleryUrls={galleryUrls}
                  dragActive={dragActive}
                  setDragActive={setDragActive}
                  onGalleryInputChange={onGalleryInputChange}
                  onDrop={onDrop}
                  removeGalleryAt={removeGalleryAt}
                />
                <JoinSupplierStep3ProfileSection
                  profileInputRef={profileInputRef}
                  profileFile={profileFile}
                  profileSrc={profileSrc}
                  onProfileChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f && f.size <= JOIN_SUPPLIER_STEP3_PROFILE_MAX_MB * 1024 * 1024) setProfileFile(f);
                    e.target.value = "";
                  }}
                />
              </div>
              {(errors.gallery || errors.profile) && (
                <div className="flex w-full flex-col gap-1 text-center text-sm text-red-600">
                  {errors.gallery ? <p>{errors.gallery}</p> : null}
                  {errors.profile ? <p>{errors.profile}</p> : null}
                </div>
              )}
            </div>

            <div className="flex w-full flex-col gap-4 border-t border-black/10 pt-8">
              <h3 className="text-right text-[18px] font-bold leading-5 text-black">אימות לייבלים - צירוף קבצים</h3>
              {(existingKosherUrl || existingForm3010Url) && (
                <div className="flex flex-col gap-1 text-right text-sm text-[#4721DF]">
                  {existingKosherUrl && <p>תעודת כשרות כבר הועלתה</p>}
                  {existingForm3010Url && <p>טופס 3010 כבר הועלה</p>}
                </div>
              )}
              <div className="flex w-full flex-col items-end gap-3">
                <JoinSupplierStep3DocumentRow
                  inputRef={kosherInputRef}
                  fileName={kosherName}
                  placeholder="צירוף קובץ - תעודת כשרות"
                  chipLabel={kosherName ? "כשרות" : ""}
                  clearAriaLabel="הסרת קובץ כשרות"
                  onInputChange={(e) => { const f = e.target.files?.[0]; setKosherName(f?.name ?? ""); setKosherFile(f ?? null); e.target.value = ""; }}
                  onClear={clearKosherAttachment}
                />
                <JoinSupplierStep3DocumentRow
                  inputRef={form3010InputRef}
                  fileName={form3010Name}
                  placeholder="צירוף קובץ - טופס 3010"
                  chipLabel={form3010Name ? "מילואימניק" : ""}
                  clearAriaLabel="הסרת קובץ טופס 3010"
                  onInputChange={(e) => { const f = e.target.files?.[0]; setForm3010Name(f?.name ?? ""); setForm3010File(f ?? null); e.target.value = ""; }}
                  onClear={clearForm3010Attachment}
                />
              </div>
              {(errors.kosher || errors.form3010) && (
                <div className="flex w-full flex-col gap-1 text-right text-sm text-red-600">
                  {errors.kosher ? <p>{errors.kosher}</p> : null}
                  {errors.form3010 ? <p>{errors.form3010}</p> : null}
                </div>
              )}
              <p className="text-right text-[14px] leading-[22px] text-[#FF5353]">
                ניתן להעלות קבצים בפורמט JPG, PNG או PDF
              </p>
            </div>

            {errors.form && <p className="text-center text-sm text-red-600">{errors.form}</p>}

            <div className="flex flex-col gap-4 border-t border-black/5 pt-6 sm:flex-row sm:items-center sm:justify-between">
              <button
                type="submit"
                disabled={isSaving || !allFilesReady}
                title={!allFilesReady && !isSaving ? "יש להעלות את כל המדיה הנדרשת כדי להמשיך" : undefined}
                className="inline-flex h-[60px] min-w-[200px] items-center justify-center gap-3 rounded-[99px] bg-[#201C44] px-10 text-[18px] font-bold leading-7 text-white shadow-[0_8px_24px_rgba(32,28,68,0.25)] transition hover:bg-[#151238] disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ fontFamily: marketingPloniFont }}
              >
                {isSaving ? "מעלה…" : (
                  <>
                    <Image src="/icons/right_arrow.svg" alt="" width={16} height={16} className="size-4 shrink-0 rotate-180 brightness-0 invert" unoptimized aria-hidden />
                    <span>המשך לבחירת חבילה</span>
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={() => router.push("/join-supplier/step-2")}
                disabled={isSaving}
                className="inline-flex items-center justify-center gap-2 whitespace-nowrap text-[16px] font-bold leading-6 text-black disabled:opacity-50"
                style={{ fontFamily: "var(--font-assistant), ui-sans-serif, system-ui, sans-serif" }}
              >
                <span>חזרה</span>
                <Image src="/icons/right_arrow.svg" alt="" width={16} height={16} className="size-4 shrink-0" unoptimized aria-hidden />
              </button>
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
