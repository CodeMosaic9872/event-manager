"use client";

import { type DragEvent, type FormEvent, useCallback, useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { SupplierJoinGlassCard } from "@/shared/components/supplier-join/supplier-join-glass-card";
import { SupplierJoinProgress } from "@/shared/components/supplier-join/supplier-join-progress";
import { MarketingPageShell } from "@/shared/components/marketing-page-shell";
import { JoinSupplierStep3DocumentRow } from "@/shared/components/supplier-join/join-supplier-step-3-document-row";
import { JoinSupplierStep3GallerySection } from "@/shared/components/supplier-join/join-supplier-step-3-gallery-section";
import {
  JOIN_SUPPLIER_STEP3_MAX_GALLERY,
  JOIN_SUPPLIER_STEP3_PROFILE_MAX_MB,
} from "@/shared/components/supplier-join/join-supplier-step-3-constants";
import { JoinSupplierStep3ProfileSection } from "@/shared/components/supplier-join/join-supplier-step-3-profile-section";
import { marketingPloniFont } from "@/shared/lib/marketing-typography";

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
  const [dragActive, setDragActive] = useState(false);

  const galleryUrls = useMemo(
    () => galleryFiles.map((f) => URL.createObjectURL(f)),
    [galleryFiles],
  );
  useEffect(() => {
    const urls = galleryUrls;
    return () => {
      urls.forEach((u) => URL.revokeObjectURL(u));
    };
  }, [galleryUrls]);

  const profileSrc = useMemo(
    () => (profileFile ? URL.createObjectURL(profileFile) : null),
    [profileFile],
  );
  useEffect(() => {
    if (!profileSrc) return;
    return () => URL.revokeObjectURL(profileSrc);
  }, [profileSrc]);

  const galleryCount = galleryFiles.length;

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
    setKosherName("");
    const input = kosherInputRef.current;
    if (input) input.value = "";
  }, []);

  const clearForm3010Attachment = useCallback(() => {
    setForm3010Name("");
    const input = form3010InputRef.current;
    if (input) input.value = "";
  }, []);

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      sessionStorage.setItem(
        "supplierJoinStep3",
        JSON.stringify({
          galleryCount,
          profileSelected: Boolean(profileFile),
          kosherFileName: kosherName || null,
          form3010FileName: form3010Name || null,
        }),
      );
    } catch {
      /* ignore */
    }
    router.push("/join-supplier/step-4");
  };

  return (
    <MarketingPageShell showBackgroundImage className="bg-white!" dir="rtl" lang="he">
      <div className="mx-auto flex w-full max-w-[977px] flex-col items-stretch">
        <SupplierJoinProgress percent={75} stepLabel="Step 3 of 4" title="Media upload" />

        <SupplierJoinGlassCard
          className="w-full px-5 py-8 sm:px-8 sm:py-10"
          style={{ fontFamily: marketingPloniFont }}
        >
          <form
            className="flex w-full min-w-0 flex-col gap-10 lg:gap-12"
            dir="ltr"
            lang="en"
            onSubmit={handleSubmit}
          >
            <div className="flex w-full flex-col gap-6">
              <div className="w-full text-center">
                <h2 className="text-[28px] font-normal leading-10 text-black sm:text-[36px] sm:leading-[40px]">
                  Add photos to your gallery
                </h2>
                <p className="mt-3 text-[16px] leading-7 text-black sm:text-[18px]">
                  Your profile looks better with a smile :)
                </p>
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
            </div>

            <div className="flex w-full flex-col gap-4 border-t border-black/10 pt-8">
              <h3 className="text-right text-[18px] leading-5 text-black">
                Label Validation - Attaching Files
              </h3>

              <div className="flex w-full flex-col items-end gap-3">
                <JoinSupplierStep3DocumentRow
                  inputRef={kosherInputRef}
                  fileName={kosherName}
                  placeholder="Attach a file - Kosher certificate"
                  chipLabel="kashrut"
                  clearAriaLabel="Remove kashrut attachment"
                  onInputChange={(e) => {
                    const f = e.target.files?.[0];
                    setKosherName(f?.name ?? "");
                    e.target.value = "";
                  }}
                  onClear={clearKosherAttachment}
                />
                <JoinSupplierStep3DocumentRow
                  inputRef={form3010InputRef}
                  fileName={form3010Name}
                  placeholder="Attach a file - Form 3010"
                  chipLabel="Reservist"
                  clearAriaLabel="Remove Reservist attachment"
                  onInputChange={(e) => {
                    const f = e.target.files?.[0];
                    setForm3010Name(f?.name ?? "");
                    e.target.value = "";
                  }}
                  onClear={clearForm3010Attachment}
                />
              </div>

              <p className="text-right text-[14px] leading-[22px] text-[#FF5353]">
                You can upload files in JPG, PNG or PDF format.
              </p>
            </div>

            <div className="flex flex-col gap-4 border-t border-black/5 pt-6 sm:flex-row sm:items-center sm:justify-between">
              <button
                type="submit"
                className="inline-flex h-[60px] min-w-[200px] items-center justify-center gap-3 rounded-[99px] bg-[#201C44] px-10 text-[18px] font-normal leading-7 text-white shadow-[0_8px_24px_rgba(32,28,68,0.25)] transition hover:bg-[#151238]"
                style={{ fontFamily: marketingPloniFont }}
              >
                <Image
                  src="/right_arrow.svg"
                  alt=""
                  width={16}
                  height={16}
                  className="size-4 shrink-0 rotate-180 brightness-0 invert"
                  unoptimized
                  aria-hidden
                />
                <span>Continue to choose a package</span>
              </button>
              <button
                type="button"
                onClick={() => router.push("/join-supplier/step-2")}
                className="inline-flex items-center justify-center gap-2 whitespace-nowrap text-[16px] font-bold leading-6 text-black"
                style={{
                  fontFamily: "var(--font-assistant), ui-sans-serif, system-ui, sans-serif",
                }}
              >
                <span>return</span>
                <Image
                  src="/right_arrow.svg"
                  alt=""
                  width={16}
                  height={16}
                  className="size-4 shrink-0"
                  unoptimized
                  aria-hidden
                />
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
