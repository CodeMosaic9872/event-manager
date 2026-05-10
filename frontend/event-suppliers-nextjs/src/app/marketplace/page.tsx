"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState, Suspense } from "react";
import { useGetSuppliersQuery, useGetCategoriesQuery } from "@/shared/api/api";
import { SupplierGlassCard } from "@/shared/components/supplier-glass-card";
import type { SuppliersQuery } from "@/shared/api/types";

const LOCATIONS = [
  { label: "כל הארץ", value: "" },
  { label: "מרכז", value: "center" },
  { label: "צפון", value: "north" },
  { label: "דרום", value: "south" },
] as const;

const SORT_OPTIONS = [
  { label: "הרלוונטיות ביותר", value: "relevance" },
  { label: "דירוג גבוה", value: "rating_desc" },
  { label: "הכי חדש", value: "newest" },
  { label: "מחיר מהנמוך לגבוה", value: "price_asc" },
] as const;

const RATING_OPTIONS = [
  { label: "4.5+", value: 4.5 },
  { label: "4+", value: 4 },
] as const;

function MarketplaceContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const q = searchParams.get("q") ?? "";
  const categoryId = searchParams.get("categoryId") ?? "";
  const location = searchParams.get("location") ?? "";
  const minRating = searchParams.get("minRating") ? Number(searchParams.get("minRating")) : undefined;
  const sort = searchParams.get("sort") ?? "relevance";
  const cursor = searchParams.get("cursor") ?? undefined;

  const [searchInput, setSearchInput] = useState(q);
  const [selectedCategoryId, setSelectedCategoryId] = useState(categoryId);
  const [selectedLocation, setSelectedLocation] = useState(location);
  const [selectedRating, setSelectedRating] = useState<number | undefined>(minRating);
  const [selectedSort, setSelectedSort] = useState(sort);
  const [locationOpen, setLocationOpen] = useState(false);
  const [sortOpen, setSortOpen] = useState(false);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [accumulatedSuppliers, setAccumulatedSuppliers] = useState<any[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null | undefined>(cursor);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);

  const updateParams = useCallback((updates: Record<string, string | undefined>) => {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(updates).forEach(([key, value]) => {
      if (value === undefined || value === "" || value === null) {
        params.delete(key);
      } else {
        params.set(key, value);
      }
    });
    params.delete("cursor");
    router.replace(`/marketplace?${params.toString()}`, { scroll: false });
  }, [searchParams, router]);

  const query: SuppliersQuery = {
    q: q || undefined,
    categoryId: categoryId || undefined,
    locationRegionCode: location || undefined,
    minRating,
    take: 9,
    cursor: undefined,
  };

  if (sort === "rating_desc") query.minRating = 1;
  if (sort === "newest") query.q = q || undefined;
  if (sort === "price_asc") query.q = q || undefined;

  const { data: apiData, isLoading, isFetching } = useGetSuppliersQuery(query);
  const { data: categories = [] } = useGetCategoriesQuery();

  useEffect(() => {
    if (!apiData) return;
    setAccumulatedSuppliers(apiData.items);
    setNextCursor(apiData.nextCursor);
  }, [apiData]);

  const handleLoadMore = useCallback(() => {
    if (!nextCursor || isFetching) return;
    updateParams({ cursor: nextCursor });
  }, [nextCursor, isFetching, updateParams]);

  useEffect(() => {
    const node = loadMoreRef.current;
    if (!node || !nextCursor || isFetching) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) handleLoadMore();
      },
      { rootMargin: "220px" },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [handleLoadMore, nextCursor, isFetching]);

  const handleSearch = () => {
    updateParams({ q: searchInput || undefined });
  };

  const handleSearchKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleSearch();
  };

  const handleCategoryChange = (catId: string) => {
    const newId = selectedCategoryId === catId ? "" : catId;
    setSelectedCategoryId(newId);
    updateParams({ categoryId: newId || undefined });
  };

  const handleLocationChange = (value: string) => {
    setSelectedLocation(value);
    setLocationOpen(false);
    updateParams({ location: value || undefined });
  };

  const handleRatingChange = (value: number) => {
    const newVal = selectedRating === value ? undefined : value;
    setSelectedRating(newVal);
    updateParams({ minRating: newVal ? String(newVal) : undefined });
  };

  const handleSortChange = (value: string) => {
    setSelectedSort(value);
    setSortOpen(false);
    updateParams({ sort: value === "relevance" ? undefined : value });
  };

  const handleReset = () => {
    setSelectedCategoryId("");
    setSelectedRating(undefined);
    setSelectedLocation("");
    setSelectedSort("relevance");
    setLocationOpen(false);
    router.replace("/marketplace", { scroll: false });
  };

  const countLabel = useMemo(() => {
    if (apiData?.facets && typeof apiData.facets === "object" && "totalCount" in apiData.facets) {
      return String((apiData.facets as any).totalCount);
    }
    return accumulatedSuppliers.length;
  }, [apiData, accumulatedSuppliers]);

  return (
    <section className="relative mx-auto min-h-screen w-full overflow-x-hidden bg-white">
      <div className="absolute -top-px left-1/2 h-[1066px] w-[1824px] -translate-x-1/2" />

      <div className="relative z-10 mx-auto flex w-full max-w-[1280px] flex-col gap-8 px-4 pt-20 sm:gap-10 sm:px-6 sm:pt-24 lg:px-8 lg:pt-[132px]">
        <div className="mx-auto w-full max-w-[1024px]">
          <div className="flex h-16 items-center rounded-[30px] border-2 border-[#201C44] bg-white/25 p-1 backdrop-blur-[6px]">
            <div className="flex w-full items-center gap-3 px-4">
              <span className="hidden text-[18px] sm:block">🔎</span>
              <input
                className="h-[52px] w-full bg-transparent text-right text-[18px] text-black outline-none placeholder:text-black/60"
                placeholder="ספקים, דיג׳יים, צלמים או אולמות..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyDown={handleSearchKeyDown}
              />
              <button
                type="button"
                onClick={handleSearch}
                className="shrink-0 rounded-full bg-[#201C44] px-4 py-1.5 text-sm text-white"
              >
                חפש
              </button>
            </div>
          </div>
        </div>

        <div dir="ltr" className="flex flex-col gap-6 lg:flex-row lg:items-start lg:gap-8">
          <main className="order-2 w-full min-w-0 lg:order-1 lg:w-[912px]">
            <div className="mb-6 flex items-center justify-between">
              <div className="flex shrink-0 items-center gap-3 text-sm text-black">
                <div className="relative">
                  <button
                    type="button"
                    className="flex min-w-[170px] items-center justify-between rounded-md border border-black/10 bg-white/70 px-3 py-1.5 text-right"
                    onClick={() => setSortOpen((prev) => !prev)}
                  >
                    <span>{sortOpen ? "▴" : "▾"}</span>
                    <span>{SORT_OPTIONS.find((s) => s.value === selectedSort)?.label ?? "הרלוונטיות ביותר"}</span>
                  </button>
                  {sortOpen && (
                    <div className="absolute right-0 z-20 mt-1 w-full rounded-md border border-black/10 bg-white shadow-md">
                      {SORT_OPTIONS.map((option) => (
                        <button
                          key={option.value}
                          type="button"
                          className={`block w-full px-3 py-2 text-right text-sm hover:bg-black/5 ${option.value === selectedSort ? "font-bold text-[#4721DF]" : ""}`}
                          onClick={() => handleSortChange(option.value)}
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <span>מיון לפי:</span>
              </div>
              <div className="min-w-0 text-right">
                <h2 className="text-2xl text-black">ספקים מומלצים</h2>
                <p className="text-sm text-black">מצאנו {countLabel} ספקים התואמים לחיפוש שלך.</p>
              </div>
            </div>

            {isLoading ? (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3 lg:gap-6">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="h-[340px] animate-pulse rounded-2xl bg-gray-100" />
                ))}
              </div>
            ) : accumulatedSuppliers.length === 0 ? (
              <p className="py-20 text-center text-lg text-gray-400">לא נמצאו ספקים. נסה לשנות את המסננים.</p>
            ) : (
              <>
                <div className="mb-4 grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3 lg:gap-6">
                  {accumulatedSuppliers.map((supplier) => (
                    <SupplierGlassCard
                      key={supplier.id}
                      href={`/suppliers/${supplier.id}`}
                      name={supplier.businessName ?? supplier.name ?? ""}
                      subtitle={supplier.category ?? ""}
                      description={supplier.description ?? ""}
                      location={supplier.city ?? ""}
                      rating={supplier.ratingAvg ?? supplier.rating ?? 0}
                      imageUrl={supplier.imageUrl ?? undefined}
                    />
                  ))}
                </div>

                <div className="mt-6 flex justify-center">
                  <div className="flex flex-col items-center gap-4">
                    {nextCursor ? <div className="size-12 animate-spin rounded-full border-2 border-[#201C44] border-t-transparent" /> : null}
                    <p className="text-sm text-black">
                      {isFetching ? "טוען ספקים נוספים..." : nextCursor ? "גלול לטעינת ספקים נוספים" : "הגעת לסוף הרשימה"}
                    </p>
                    <div ref={loadMoreRef} className="h-1 w-full" />
                  </div>
                </div>
              </>
            )}
          </main>

          <aside className="order-1 w-full rounded-2xl border border-black/10 bg-[linear-gradient(180deg,rgba(230,238,242,0.3564)_0%,rgba(133,138,140,0.1512)_100%)] p-5 backdrop-blur-[6px] sm:p-6 lg:order-2 lg:w-[288px] lg:min-w-[288px]">
            <div className="mb-8 flex items-center justify-between">
              <button type="button" className="text-xs text-[#201C44] underline" onClick={handleReset}>איפוס</button>
              <h3 className="text-[18px] leading-7 text-black">מסננים</h3>
            </div>

            <button type="button" className="mb-4 flex w-full items-center justify-between rounded-lg border border-black/15 bg-white/60 px-3 py-2 text-sm text-[#201C44] lg:hidden" onClick={() => setMobileFiltersOpen((prev) => !prev)}>
              <span>{mobileFiltersOpen ? "▴" : "▾"}</span>
              <span>{mobileFiltersOpen ? "סגור מסננים" : "פתח מסננים"}</span>
            </button>

            <div className={`${mobileFiltersOpen ? "block" : "hidden"} space-y-8 text-sm text-black lg:block`}>
              <div>
                <p className="mb-3 text-xs uppercase text-right tracking-[0.7px]">קטגוריה</p>
                <div className="space-y-2">
                  {categories.slice(0, 10).map((cat) => (
                    <label key={cat.id} className="flex cursor-pointer items-center justify-end gap-3">
                      <span>{cat.name}</span>
                      <input
                        type="checkbox"
                        checked={selectedCategoryId === cat.id}
                        onChange={() => handleCategoryChange(cat.id)}
                        className="size-4 rounded border-black/20 accent-[#6AB7FF]"
                      />
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <p className="mb-3 text-xs uppercase text-right tracking-[0.7px]">מיקום</p>
                <div className="relative">
                  <button type="button" className="flex w-full items-center justify-between rounded-lg border border-black/10 bg-black/5 px-3 py-2 text-right" onClick={() => setLocationOpen((prev) => !prev)}>
                    <span>{locationOpen ? "▴" : "▾"}</span>
                    <span>{LOCATIONS.find((l) => l.value === selectedLocation)?.label ?? "כל הארץ"}</span>
                  </button>
                  {locationOpen && (
                    <div className="absolute z-20 mt-1 w-full rounded-lg border border-black/10 bg-white shadow-md">
                      {LOCATIONS.map((option) => (
                        <button key={option.value} type="button" className="block w-full px-3 py-2 text-right text-sm hover:bg-black/5" onClick={() => handleLocationChange(option.value)}>
                          {option.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div>
                <p className="mb-3 text-xs uppercase text-right tracking-[0.7px]">דירוג מינימום</p>
                <div className="flex gap-2">
                  {RATING_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      className={`flex flex-1 items-center justify-center gap-1 rounded px-2 py-1 ${selectedRating === opt.value ? "border border-[#6AB7FF] bg-white/30" : "border border-black/10 bg-white/20"}`}
                      onClick={() => handleRatingChange(opt.value)}
                    >
                      <span>★</span>
                      <span>{opt.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>

      <footer className="mt-12 flex min-h-[120px] w-full items-center justify-center border border-black/10 bg-[rgba(230,239,244,0.42)] px-4 py-8 backdrop-blur-[6px] sm:min-h-[155px]">
        <div className="flex items-center gap-3 text-2xl text-black">
          <span className="-rotate-90 text-xl" aria-hidden>→</span>
          <span>פתח תפריט</span>
        </div>
      </footer>
    </section>
  );
}

export default function MarketplacePage() {
  return (
    <Suspense fallback={<div className="min-h-screen" />}>
      <MarketplaceContent />
    </Suspense>
  );
}
