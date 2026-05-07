"use client";

import type { DragEvent, RefObject } from "react";
import Image from "next/image";
import {
  JOIN_SUPPLIER_STEP3_MAX_GALLERY,
  JOIN_SUPPLIER_STEP3_MIN_GALLERY,
} from "@/shared/components/supplier-join/join-supplier-step-3-constants";

export type JoinSupplierStep3GallerySectionProps = {
  galleryInputRef: RefObject<HTMLInputElement | null>;
  galleryFiles: File[];
  galleryUrls: string[];
  dragActive: boolean;
  setDragActive: (v: boolean) => void;
  onGalleryInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onDrop: (e: DragEvent<HTMLDivElement>) => void;
  removeGalleryAt: (index: number) => void;
};

export function JoinSupplierStep3GallerySection({
  galleryInputRef,
  galleryFiles,
  galleryUrls,
  dragActive,
  setDragActive,
  onGalleryInputChange,
  onDrop,
  removeGalleryAt,
}: JoinSupplierStep3GallerySectionProps) {
  const galleryCount = galleryFiles.length;
  const needsMoreGallery =
    galleryCount > 0 && galleryCount < JOIN_SUPPLIER_STEP3_MIN_GALLERY;

  return (
    <div className="flex min-w-0 flex-1 flex-col gap-3">
      <div className="mt-0 flex w-full flex-row flex-wrap items-center justify-between gap-3">
        <span className="rounded-2xl bg-[#EEF6FF] px-2 py-1 text-[12px] leading-4 text-[#4721DF]">
          Minimum 3 photos
        </span>
        <span className="text-right text-[18px] leading-7 text-black">Photo gallery</span>
      </div>

      <input
        ref={galleryInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        multiple
        className="sr-only"
        onChange={onGalleryInputChange}
      />

      <div
        role="button"
        tabIndex={0}
        onClick={() => galleryInputRef.current?.click()}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") galleryInputRef.current?.click();
        }}
        onDragEnter={(e) => {
          e.preventDefault();
          setDragActive(true);
        }}
        onDragLeave={() => setDragActive(false)}
        onDragOver={(e) => e.preventDefault()}
        onDrop={onDrop}
        className={`relative flex min-h-[192px] cursor-pointer flex-col items-center justify-center rounded-[24px] border-2 border-[#201C44] bg-white px-4 py-8 transition ${
          dragActive ? "ring-2 ring-[#6AB7FF]/50" : ""
        }`}
      >
        <span className="mb-3 flex size-16 items-center justify-center rounded-full bg-[#6AB7FF]">
          <Image
            src="/upload.svg"
            alt=""
            width={41}
            height={40}
            className="size-9"
            unoptimized
            aria-hidden
          />
        </span>
        <span className="text-[16px] leading-6 text-black">Drag and drop images here</span>
        <span className="mt-1 block w-full max-w-full px-2 text-center text-[14px] leading-snug text-pretty text-black">
          Or click to select files from your computer.
        </span>
      </div>

      <div className="flex flex-wrap justify-center gap-3 pt-2">
        {Array.from({ length: Math.min(5, JOIN_SUPPLIER_STEP3_MAX_GALLERY) }).map((_, i) => {
          const file = galleryFiles[i];
          return (
            <div key={i} className="relative size-10">
              {file ? (
                <>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={galleryUrls[i]} alt="" className="size-full object-cover" />
                  <button
                    type="button"
                    onClick={(ev) => {
                      ev.stopPropagation();
                      removeGalleryAt(i);
                    }}
                    className="absolute inset-0 flex items-center justify-center bg-black/40 text-[10px] text-white opacity-0 transition hover:opacity-100"
                  >
                    ×
                  </button>
                </>
              ) : (
                <div className="flex size-full items-center justify-center">
                  <Image
                    src="/gallery.svg"
                    alt=""
                    width={24}
                    height={24}
                    className="size-40"
                    unoptimized
                    aria-hidden
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="flex flex-row flex-wrap items-center justify-between gap-2 text-[14px] leading-5">
        {needsMoreGallery ? (
          <span className="text-[#FF5353]">At least one more image must be uploaded.</span>
        ) : (
          <span className="min-w-0 shrink text-transparent">.</span>
        )}
        <span className="shrink-0 tabular-nums text-black">
          {galleryCount} of {JOIN_SUPPLIER_STEP3_MAX_GALLERY} photos uploaded
        </span>
      </div>
    </div>
  );
}
