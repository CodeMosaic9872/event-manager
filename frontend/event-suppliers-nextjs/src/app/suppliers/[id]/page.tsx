"use client";

import { useParams } from "next/navigation";
import { useGetSupplierByIdQuery } from "@/shared/api/api";
import { SupplierProfileView } from "./supplier-profile-view";
import { LoadingSkeleton } from "@/shared/components/loading-skeleton";

export default function SupplierPage() {
  const params = useParams<{ id: string }>();
  const supplierId = params?.id;

  const { data: profile, isLoading, isError } = useGetSupplierByIdQuery(supplierId!, {
    skip: !supplierId,
  });

  if (isLoading) {
    return (
      <section className="relative mx-auto w-full overflow-x-hidden bg-white pb-24 pt-20 sm:pt-24 lg:pt-[119px]">
        <div className="mx-auto max-w-[1440px] px-4">
          <LoadingSkeleton />
        </div>
      </section>
    );
  }

  if (isError || !profile) {
    return (
      <section className="relative mx-auto w-full overflow-x-hidden bg-white pb-24 pt-20 sm:pt-24 lg:pt-[119px]">
        <div className="mx-auto max-w-[576px] px-4 text-center">
          <h2 className="text-xl text-[#00113A]">Supplier not found</h2>
          <p className="mt-2 text-sm text-[#444650]">The supplier you're looking for doesn't exist or was removed.</p>
        </div>
      </section>
    );
  }

  return <SupplierProfileView profile={profile} />;
}
