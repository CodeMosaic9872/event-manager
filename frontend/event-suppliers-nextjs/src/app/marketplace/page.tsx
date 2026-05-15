"use client";

import { Suspense } from "react";
import { MarketplaceView } from "./marketplace-view";

export default function MarketplacePage() {
  return (
    <Suspense fallback={<div className="min-h-screen" />}>
      <MarketplaceView basePath="/marketplace" variant="default" />
    </Suspense>
  );
}
