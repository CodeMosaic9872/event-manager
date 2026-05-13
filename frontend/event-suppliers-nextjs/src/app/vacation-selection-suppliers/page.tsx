"use client";

import { Suspense } from "react";
import { MarketplaceView } from "@/app/marketplace/marketplace-view";

export default function VacationSelectionSuppliersPage() {
  return (
    <Suspense fallback={<div className="min-h-screen" />}>
      <MarketplaceView basePath="/vacation-selection-suppliers" variant="vacation" />
    </Suspense>
  );
}
