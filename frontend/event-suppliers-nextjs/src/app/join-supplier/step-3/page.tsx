"use client";

import { type DragEvent, type FormEvent, useCallback, useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useUploadUserProfileFileMutation } from "@/shared/api/api";
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
      galleryFiles.length >= JOIN_SUPPLIER_STEP3_MIN_GALLERY &&
      profileFile != null &&
      kosherFile != null &&
      form3010File != null,
    [galleryFiles.length, profileFile, kosherFile, form3010File],
  );

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!allFilesReady) return;
    const next: Record<string, string> = {};
    if (galleryFiles.length < JOIN_SUPPLIER_STEP3_MIN_GALLERY) {
      next.gallery = `Please upload at least ${JOIN_SUPPLIER_STEP3_MIN_GALLERY} gallery photos.`;
    }
    if (!profileFile) {
      next.profile = "Profile picture is required.";
    }
    if (!kosherFile) {
      next.kosher = "Kosher certificate file is required.";
    }
    if (!form3010File) {
      next.form3010 = "Form 3010 file is required.";
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
      setErrors({ form: "Failed to upload media. Please try again." });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <MarketingPageShell showBackgroundImage className="bg-white!" dir="rtl" lang="he">
      <div className="mx-auto flex w-full max-w-[977px] flex-col items-stretch">
        <SupplierJoinProgress percent={75} stepLabel="Step 3 of 4" title="Media upload" />

        <SupplierJoinGlassCard className="w-full px-5 py-8 sm:px-8 sm:py-10" style={{ fontFamily: marketingPloniFont }}>
          <form className="flex w-full min-w-0 flex-col gap-10 lg:gap-12" dir="ltr" lang="en" onSubmit={handleSubmit}>
            <div className="flex w-full flex-col gap-6">
              <div className="w-full text-center">
                <h2 className="text-[28px] font-normal leading-10 text-black sm:text-[36px] sm:leading-[40px]">Add photos to your gallery</h2>
                <p className="mt-3 text-[16px] leading-7 text-black sm:text-[18px]">Your profile looks better with a smile :)</p>
              </div>

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
              <h3 className="text-right text-[18px] leading-5 text-black">Label Validation - Attaching Files</h3>
              <div className="flex w-full flex-col items-end gap-3">
                <JoinSupplierStep3DocumentRow
                  inputRef={kosherInputRef}
                  fileName={kosherName}
                  placeholder="Attach a file - Kosher certificate"
                  chipLabel={kosherName ? "kashrut" : ""}
                  clearAriaLabel="Remove kashrut attachment"
                  onInputChange={(e) => { const f = e.target.files?.[0]; setKosherName(f?.name ?? ""); setKosherFile(f ?? null); e.target.value = ""; }}
                  onClear={clearKosherAttachment}
                />
                <JoinSupplierStep3DocumentRow
                  inputRef={form3010InputRef}
                  fileName={form3010Name}
                  placeholder="Attach a file - Form 3010"
                  chipLabel={form3010Name ? "Reservist" : ""}
                  clearAriaLabel="Remove Reservist attachment"
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
              <p className="text-right text-[14px] leading-[22px] text-[#FF5353]">You can upload files in JPG, PNG or PDF format.</p>
            </div>

            {errors.form && <p className="text-center text-sm text-red-600">{errors.form}</p>}

            <div className="flex flex-col gap-4 border-t border-black/5 pt-6 sm:flex-row sm:items-center sm:justify-between">
              <button
                type="submit"
                disabled={isSaving || !allFilesReady}
                title={!allFilesReady && !isSaving ? "Add profile photo, gallery, and both documents to continue" : undefined}
                className="inline-flex h-[60px] min-w-[200px] items-center justify-center gap-3 rounded-[99px] bg-[#201C44] px-10 text-[18px] font-normal leading-7 text-white shadow-[0_8px_24px_rgba(32,28,68,0.25)] transition hover:bg-[#151238] disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ fontFamily: marketingPloniFont }}
              >
                {isSaving ? "Uploading..." : (
                  <>
                    <Image src="/icons/right_arrow.svg" alt="" width={16} height={16} className="size-4 shrink-0 rotate-180 brightness-0 invert" unoptimized aria-hidden />
                    <span>Continue to choose a package</span>
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
                <span>return</span>
                <Image src="/icons/right_arrow.svg" alt="" width={16} height={16} className="size-4 shrink-0" unoptimized aria-hidden />
              </button>
            </div>
          </form>
        </SupplierJoinGlassCard>

        <p className="mt-8 w-full max-w-2xl text-left text-[14px] leading-5 text-[#64748B]">
          The information is saved automatically. You can edit it even after registration is complete.
        </p>
      </div>
    </MarketingPageShell>
  );
}
