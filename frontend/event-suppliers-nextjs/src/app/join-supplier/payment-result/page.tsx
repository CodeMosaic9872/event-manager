"use client";

import { Suspense, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import {
  SupplierAuthPaymentResultView,
  initialPaymentOutcomeFromSearch,
} from "@/shared/components/supplier-auth/supplier-auth-payment-result";

function JoinSupplierPaymentResultInner() {
  const searchParams = useSearchParams();
  const outcome = useMemo(
    () => initialPaymentOutcomeFromSearch(searchParams),
    [searchParams],
  );

  return (
    <SupplierAuthPaymentResultView
      outcome={outcome}
      onOutcomeChange={() => {}}
      showPreviewToggle={false}
      nextPath="/supplier/dashboard"
      backToCheckoutHref="/join-supplier/step-5"
    />
  );
}

export default function JoinSupplierPaymentResultPage() {
  return (
    <Suspense
      fallback={
        <div
          className="mx-auto min-h-[50vh] w-full max-w-[744px] animate-pulse rounded-2xl bg-slate-100"
          aria-busy
          aria-label="טוען"
        />
      }
    >
      <JoinSupplierPaymentResultInner />
    </Suspense>
  );
}
