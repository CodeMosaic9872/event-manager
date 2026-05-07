"use client";

import type { RefObject } from "react";
import Image from "next/image";

export type JoinSupplierStep3DocumentRowProps = {
  inputRef: RefObject<HTMLInputElement | null>;
  fileName: string;
  placeholder: string;
  chipLabel: string;
  clearAriaLabel: string;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onClear: () => void;
};

export function JoinSupplierStep3DocumentRow({
  inputRef,
  fileName,
  placeholder,
  chipLabel,
  clearAriaLabel,
  onInputChange,
  onClear,
}: JoinSupplierStep3DocumentRowProps) {
  return (
    <>
      <input
        ref={inputRef}
        type="file"
        accept=".jpg,.jpeg,.png,.pdf"
        className="sr-only"
        onChange={onInputChange}
      />
      <div className="flex w-full min-w-0 flex-col items-end gap-3 sm:max-w-none sm:flex-row sm:items-center sm:justify-end">
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="relative box-border h-[50px] min-h-[50px] w-full max-w-[351px] rounded-2xl border border-black/10 bg-white py-3 pr-14 pl-4 text-left text-[16px] leading-[19px] text-black outline-none focus:border-[#4721DF]/35 focus:ring-2 focus:ring-[#6AB7FF]/40 sm:min-w-[280px]"
        >
          <span className="block min-w-0 truncate pe-1">{fileName || placeholder}</span>
          <span className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2">
            <Image
              src="/linking.svg"
              alt=""
              width={20}
              height={10}
              className="h-[10px] w-5"
              unoptimized
              aria-hidden
            />
          </span>
        </button>
        <span className="inline-flex shrink-0 items-center gap-2 rounded-full border border-[#6AB7FF] bg-[#6AB7FF] px-3 py-2 text-[14px] leading-5 text-black">
          <button
            type="button"
            onClick={onClear}
            className="flex size-6 shrink-0 items-center justify-center rounded-full hover:bg-black/10"
            aria-label={clearAriaLabel}
          >
            <Image
              src="/cross.svg"
              alt=""
              width={9}
              height={9}
              className="size-[9px]"
              unoptimized
              aria-hidden
            />
          </button>
          <span>{chipLabel}</span>
        </span>
      </div>
    </>
  );
}
