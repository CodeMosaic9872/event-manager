"use client";

import { SupplierJoinCheckoutSummary } from "@/shared/components/supplier-join/supplier-join-checkout-summary";
import { SupplierJoinPaymentPanel } from "@/shared/components/supplier-join/supplier-join-payment-panel";
import { ProtectedRoute } from "@/shared/components/protected-route";
import { SUPPLIER_PLAN_CHECKOUT } from "@/shared/lib/supplier-join-plan";
import { marketingPloniFont } from "@/shared/lib/marketing-typography";

export default function AdminSupplierRegistrationPaymentPage() {
  const plan = SUPPLIER_PLAN_CHECKOUT.annual;

  return (
    <ProtectedRoute roles={["admin"]}>
      <section
        dir="rtl"
        className="relative mx-auto min-h-screen w-full overflow-x-hidden bg-[linear-gradient(180deg,#9BD3EF_0%,#FFFFFF_58%)] px-4 pb-16 pt-24 sm:px-6"
      >
        <div className="pointer-events-none absolute -left-24 top-24 h-[300px] w-[340px] rotate-62 rounded-[40%] bg-[linear-gradient(180deg,#2998FF_0%,#FFFFFF_60%)] opacity-70 blur-[2.5px]" />
        <div className="pointer-events-none absolute -right-24 top-72 h-[300px] w-[340px] rotate-[-119deg] rounded-[40%] bg-[linear-gradient(180deg,#2998FF_0%,#FFFFFF_60%)] opacity-70 blur-[2.5px]" />

        <div className="relative z-10 mx-auto flex w-full max-w-6xl flex-col gap-8">
          <header className="text-right" style={{ fontFamily: marketingPloniFont }}>
            <h1 className="text-3xl font-normal leading-tight text-black sm:text-[52px] sm:leading-[1.05]">
              Supplier Registration - Payment
            </h1>
            <p className="mt-2 text-base leading-6 text-black">
              One last step before joining the leading supplier community.
            </p>
          </header>

          <div className="grid w-full grid-cols-1 gap-8 xl:grid-cols-[minmax(0,439px)_minmax(0,628px)] xl:gap-8" dir="ltr" lang="en">
            <SupplierJoinCheckoutSummary plan={plan} styleFont={marketingPloniFont} />
            <SupplierJoinPaymentPanel
              styleFont={marketingPloniFont}
              successRedirectPath="/admin"
              submitLabel="Make a payment now"
            />
          </div>
        </div>
      </section>
    </ProtectedRoute>
  );
}
