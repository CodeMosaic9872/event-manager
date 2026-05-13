"use client";

import type { RefObject } from "react";
import Image from "next/image";
import { JOIN_SUPPLIER_STEP3_PROFILE_MAX_MB } from "@/shared/components/supplier-join/join-supplier-step-3-constants";

export type JoinSupplierStep3ProfileSectionProps = {
  profileInputRef: RefObject<HTMLInputElement | null>;
  profileFile: File | null;
  profileSrc: string | null;
  onProfileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
};

export function JoinSupplierStep3ProfileSection({
  profileInputRef,
  profileFile,
  profileSrc,
  onProfileChange,
}: JoinSupplierStep3ProfileSectionProps) {
  return (
    <div className="flex w-full shrink-0 flex-col gap-4 lg:w-[245px] lg:shrink-0">
      <span className="w-full text-right text-[18px] leading-7 text-black">Profile picture</span>
      <input
        ref={profileInputRef}
        type="file"
        accept="image/jpeg,image/png"
        className="sr-only"
        onChange={onProfileChange}
      />
      <div className="flex w-full flex-col items-center gap-2">
        <button
          type="button"
          onClick={() => profileInputRef.current?.click()}
          className="relative flex aspect-square w-full max-w-[224px] flex-col items-center justify-center gap-2 rounded-full border-4 border-dashed border-[#201C44] bg-white px-4 text-center transition hover:bg-slate-50"
        >
          {profileFile && profileSrc ? (
            <span className="absolute inset-1 overflow-hidden rounded-full">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={profileSrc}
                alt=""
                className="block size-full object-cover"
              />
            </span>
          ) : (
            <>
              <span className="flex size-12 items-center justify-center bg-white">
                <Image
                  src="/icons/camera-blue.svg"
                  alt=""
                  width={44}
                  height={40}
                  className="h-9 w-auto max-w-[40px]"
                  unoptimized
                  aria-hidden
                />
              </span>
              <span
                className="text-[12px] leading-4 text-black"
                style={{
                  fontFamily: "var(--font-assistant), ui-sans-serif, system-ui, sans-serif",
                }}
              >
                Click to upload a picture
              </span>
            </>
          )}
        </button>
        {!profileFile ? (
          <p className="max-w-[130px] text-center text-[12px] leading-4 text-black">
            Recommended: Clear JPG/PNG facial image up to {JOIN_SUPPLIER_STEP3_PROFILE_MAX_MB}MB
          </p>
        ) : null}
      </div>
    </div>
  );
}
