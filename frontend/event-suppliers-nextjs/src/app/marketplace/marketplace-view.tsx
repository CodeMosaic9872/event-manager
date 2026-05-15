"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useGetSuppliersQuery, useGetCategoriesQuery, useGetSubcategoriesQuery, useGetEventTypesQuery } from "@/shared/api/api";
import type { SuppliersQuery } from "@/shared/api/types";
import { mergeSearchParamsToHref } from "@/shared/lib/search-params-merge";
import { labelForEventProductionSlug } from "@/shared/data/event-production-event-types";
import { labelForBusinessSubtypeSlug } from "@/shared/data/event-production-business-subtypes";
import { SupplierGlassCard } from "@/shared/components/supplier-glass-card";
import { PillAction } from "@/shared/components/pill-action";
import {
  MARKETPLACE_GENERAL_FILTERS,
  MARKETPLACE_LANGUAGE_OPTIONS,
  MARKETPLACE_NICHE_TAGS,
  parseCommaKeys,
  serializeCommaKeys,
} from "@/shared/data/marketplace-filter-options";
import { taxonomyCategoryNameFromVacationSupplierParam } from "@/shared/data/vacation-supplier-category-taxonomy";

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
  { label: "+4", value: 4 },
  { label: "+4.5", value: 4.5 },
] as const;

const SUGGESTED_CHIPS = ["פופולרי:", "דיג'יי לחתונה", "קיטרינג בשרי", "אולמות בצפון"] as const;

function urlSearchParamsToRecord(sp: URLSearchParams): Record<string, string | string[] | undefined> {
  const record: Record<string, string | string[] | undefined> = {};
  sp.forEach((value, key) => {
    const existing = record[key];
    if (existing === undefined) record[key] = value;
    else if (Array.isArray(existing)) existing.push(value);
    else record[key] = [existing as string, value];
  });
  return record;
}

export type MarketplaceViewProps = {
  basePath: string;
  variant?: "default" | "vacation";
};

export function MarketplaceView({ basePath, variant = "default" }: MarketplaceViewProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const q = searchParams.get("q") ?? "";
  const categoryId = searchParams.get("categoryId") ?? "";
  const location = searchParams.get("location") ?? "";
  const minRating = searchParams.get("minRating") ? Number(searchParams.get("minRating")) : undefined;
  const sort = searchParams.get("sort") ?? "relevance";
  const cursor = searchParams.get("cursor") ?? undefined;

  const subcategoryId = searchParams.get("subcategoryId") ?? "";
  const generalParam = searchParams.get("general") ?? "";
  const nicheParam = searchParams.get("niche") ?? "";
  const langParam = searchParams.get("lang") ?? "";

  const eventTypeSlug = searchParams.get("eventType") ?? "";
  const businessTypeSlug = searchParams.get("businessType") ?? "";

  const [searchInput, setSearchInput] = useState(q);
  const [locationOpen, setLocationOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const [sortOpen, setSortOpen] = useState(false);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const accumulatedRef = useRef<unknown[]>([]);
  const lastProcessedDataRef = useRef(apiData);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);

  const { data: eventTypes = [] } = useGetEventTypesQuery();

  const resolvedEventTypeId = useMemo(() => {
    const label = labelForEventProductionSlug(eventTypeSlug);
    if (!label || !eventTypes.length) return undefined;
    const match = eventTypes.find((et) => et.name === label);
    return match?.id;
  }, [eventTypeSlug, eventTypes]);

  const updateParams = useCallback(
    (updates: Record<string, string | undefined>) => {
      const params = new URLSearchParams(searchParams.toString());
      Object.entries(updates).forEach(([key, value]) => {
        if (value === undefined || value === "" || value === null) {
          params.delete(key);
        } else {
          params.set(key, value);
        }
      });
      params.delete("cursor");
      router.replace(`${basePath}?${params.toString()}`, { scroll: false });
    },
    [searchParams, router, basePath],
  );

  const suppliersQuery: SuppliersQuery = useMemo(() => {
    const query: SuppliersQuery = {
      q: q || undefined,
      categoryId: categoryId || undefined,
      subcategoryId: subcategoryId || undefined,
      locationRegionCode: location || undefined,
      minRating,
      take: 9,
      cursor: cursor || undefined,
      eventTypeId: resolvedEventTypeId,
      general: generalParam || undefined,
      niche: nicheParam || undefined,
      lang: langParam || undefined,
    };
    if (sort === "rating_desc") query.minRating = 1;
    if (sort === "newest") query.q = q || undefined;
    if (sort === "price_asc") query.q = q || undefined;
    return query;
  }, [q, categoryId, subcategoryId, location, minRating, cursor, sort, resolvedEventTypeId, generalParam, nicheParam, langParam]);

  const { data: apiData, isLoading, isFetching } = useGetSuppliersQuery(suppliersQuery);
  const { data: categories = [] } = useGetCategoriesQuery();
  const { data: subcategoriesForCategory = [], isFetching: subcategoriesLoading } = useGetSubcategoriesQuery(
    categoryId,
    { skip: !categoryId },
  );


  const accumulatedSuppliers = useMemo(() => {
    if (!apiData) return accumulatedRef.current;
    if (apiData !== lastProcessedDataRef.current) {
      lastProcessedDataRef.current = apiData;
      const cursorParam = searchParams.get("cursor");
      if (cursorParam) {
        const seen = new Set(accumulatedRef.current.map((s) => (s as Record<string,unknown>).id as string));
        for (const item of apiData.items) {
          if (!seen.has(item.id)) accumulatedRef.current.push(item);
        }
      } else {
        accumulatedRef.current = apiData.items;
      }
    }
    return accumulatedRef.current;
  }, [apiData, searchParams]);

  const nextCursor = apiData?.nextCursor ?? null;


  useEffect(() => {
    const raw = searchParams.get("supplierCategory");
    if (!raw || categories.length === 0) return;
    const decoded = decodeURIComponent(raw).trim();
    const canonicalName = taxonomyCategoryNameFromVacationSupplierParam(decoded);
    const match =
      categories.find((c) => c.name.trim() === decoded) ||
      categories.find((c) => c.name.trim() === canonicalName);
    if (!match || categoryId === match.id) return;
    updateParams({ categoryId: match.id, subcategoryId: undefined });
  }, [categories, searchParams, categoryId, updateParams]);

  useEffect(() => {
    if (!categoryId) return;
    if (subcategoriesLoading) return;
    if (subcategoriesForCategory.length === 0) {
      if (subcategoryId) updateParams({ subcategoryId: undefined });
      return;
    }
    if (!subcategoryId) return;
    const valid = subcategoriesForCategory.some((s) => s.id === subcategoryId);
    if (!valid) updateParams({ subcategoryId: undefined });
  }, [categoryId, subcategoryId, subcategoriesForCategory, subcategoriesLoading, updateParams]);

  const handleLoadMore = useCallback(() => {
    if (!nextCursor || isFetching) return;
    const params = new URLSearchParams(searchParams.toString());
    params.set("cursor", nextCursor);
    router.replace(`${basePath}?${params.toString()}`, { scroll: false });
  }, [nextCursor, isFetching, searchParams, router, basePath]);

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
    const newId = categoryId === catId ? "" : catId;
    const cat = categories.find((c) => c.id === newId);
    updateParams({
      categoryId: newId || undefined,
      supplierCategory: newId && cat ? cat.name : undefined,
      subcategoryId: undefined,
    });
  };

  const handleSubcategoryChange = (subId: string) => {
    const next = subcategoryId === subId ? undefined : subId;
    updateParams({ subcategoryId: next });
  };

  const handleLocationChange = (value: string) => {
    setLocationOpen(false);
    updateParams({ location: value || undefined });
  };

  const handleRatingChange = (value: number) => {
    const newVal = minRating === value ? undefined : value;
    updateParams({ minRating: newVal ? String(newVal) : undefined });
  };

  const handleSortChange = (value: string) => {
    setSortOpen(false);
    updateParams({ sort: value === "relevance" ? undefined : value });
  };

  const generalKeysSelected = useMemo(() => new Set(parseCommaKeys(generalParam)), [generalParam]);
  const nicheKeysSelected = useMemo(() => new Set(parseCommaKeys(nicheParam)), [nicheParam]);

  const toggleGeneralKey = (key: string) => {
    const next = new Set(generalKeysSelected);
    if (next.has(key)) next.delete(key);
    else next.add(key);
    updateParams({ general: serializeCommaKeys([...next]) });
  };

  const toggleNicheKey = (key: string) => {
    const next = new Set(nicheKeysSelected);
    if (next.has(key)) next.delete(key);
    else next.add(key);
    updateParams({ niche: serializeCommaKeys([...next]) });
  };

  const handleLangChange = (value: string) => {
    setLangOpen(false);
    updateParams({ lang: value || undefined });
  };

  const handleReset = () => {
    setLocationOpen(false);

    if (variant === "vacation") {
      const preserved = new URLSearchParams();
      ["eventType", "businessType"].forEach((k) => {
        const v = searchParams.get(k);
        if (v) preserved.set(k, v);
      });
      preserved.delete("supplierCategory");
      preserved.delete("categoryId");
      preserved.delete("subcategoryId");
      preserved.delete("q");
      preserved.delete("location");
      preserved.delete("minRating");
      preserved.delete("sort");
      preserved.delete("cursor");
      preserved.delete("general");
      preserved.delete("niche");
      preserved.delete("lang");
      const qs = preserved.toString();
      router.replace(qs ? `${basePath}?${qs}` : basePath, { scroll: false });
      return;
    }

    router.replace(basePath, { scroll: false });
  };

  const countLabel = useMemo(() => {
    const totalFromApi =
      apiData?.facets && typeof apiData.facets === "object" && "totalCount" in apiData.facets
        ? (apiData.facets as Record<string,unknown>).totalCount
        : undefined;
    if (totalFromApi != null) return String(totalFromApi);
    if (Array.isArray(accumulatedSuppliers)) return accumulatedSuppliers.length;
    return 0;
  }, [apiData, accumulatedSuppliers]);

  const eventFlowSummary = useMemo(() => {
    if (variant !== "vacation") return null;
    const et = labelForEventProductionSlug(eventTypeSlug);
    const bt = labelForBusinessSubtypeSlug(businessTypeSlug);
    const parts = [et, bt].filter(Boolean) as string[];
    return parts.length ? parts.join(" · ") : null;
  }, [variant, eventTypeSlug, businessTypeSlug]);

  const searchPlaceholder =
    variant === "vacation"
      ? "חפש ספקים, דיג'ייז, צלמים או אולמות..."
      : "ספקים, דיג׳יים, צלמים או אולמות...";

  const resultsSubtitle =
    variant === "vacation"
      ? `מצאנו ${countLabel} ספקים המתאימים את החיפוש שלך`
      : `מצאנו ${countLabel} ספקים התואמים לחיפוש שלך.`;

  const sortPrefix = variant === "vacation" ? "מיין לפי:" : "מיון לפי:";
  const ratingSectionTitle = variant === "vacation" ? "דירוג מינימלי" : "דירוג מינימום";
  const footerMenuLabel = variant === "vacation" ? "לפתיחת התפריט" : "פתח תפריט";

  const categoriesToShow = categories;


  const backToCategoriesHref = mergeSearchParamsToHref(
    "/vacation-selection-categories",
    urlSearchParamsToRecord(searchParams),
    {},
  );

  return (
    <section className="relative mx-auto min-h-screen w-full overflow-x-hidden bg-white">
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: "url('/images/background-1.png')",
          backgroundSize: "cover",
          backgroundPosition: "top center",
          backgroundRepeat: "no-repeat",
        }}
      />

      <div className="relative z-10 mx-auto flex w-full max-w-[1280px] flex-col gap-8 px-4 pt-20 sm:gap-10 sm:px-6 sm:pt-24 lg:px-8 lg:pt-[132px]">
        <div className="mx-auto w-full max-w-[1024px]">
          <div className="flex h-16 items-center rounded-[30px] border-2 border-[#201C44] bg-white/25 p-1 backdrop-blur-[6px]">
            <div className="flex w-full items-center gap-3 px-4">
              <Image src="/icons/search.svg" alt="" width={24} height={24} className="h-6 w-6" />
              <input
                className="h-[52px] w-full bg-transparent text-right text-[18px] text-black outline-none placeholder:text-black/60"
                placeholder={searchPlaceholder}
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyDown={handleSearchKeyDown}
                dir="rtl"
              />
            </div>
          </div>
          {variant === "vacation" && (
            <div className="mt-3 flex flex-wrap items-center justify-center gap-2 text-sm">
              {SUGGESTED_CHIPS.map((chip) => (
                <button
                  key={chip}
                  type="button"
                  className="rounded-full border border-black/10 bg-white/50 px-3 py-1 text-black/80 backdrop-blur-sm hover:bg-white/80"
                  onClick={() => {
                    setSearchInput(chip);
                    updateParams({ q: chip });
                  }}
                >
                  {chip}
                </button>
              ))}
            </div>
          )}
        </div>

        <div dir="ltr" className="flex flex-col gap-6 lg:flex-row lg:items-start lg:gap-8">
          <main className="order-2 w-full min-w-0 lg:order-1 lg:w-[912px]">
            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex shrink-0 items-center gap-3 text-sm text-black">
                <div className="relative">
                  <button
                    type="button"
                    className="flex min-w-[170px] items-center justify-between rounded-md border border-black/10 bg-white/70 px-3 py-1.5 text-right"
                    onClick={() => setSortOpen((prev) => !prev)}
                  >
                    <span>{sortOpen ? "▴" : "▾"}</span>
                    <span>{SORT_OPTIONS.find((s) => s.value === sort)?.label ?? "הכי רלוונטי"}</span>
                  </button>
                  {sortOpen && (
                    <div className="absolute right-0 z-20 mt-1 w-full rounded-md border border-black/10 bg-white shadow-md">
                      {SORT_OPTIONS.map((option) => (
                        <button
                          key={option.value}
                          type="button"
                          className={`block w-full px-3 py-2 text-right text-sm hover:bg-black/5 ${option.value === sort ? "font-bold text-[#4721DF]" : ""}`}
                          onClick={() => handleSortChange(option.value)}
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <span className="text-right">{sortPrefix}</span>
              </div>
              <div className="min-w-0 text-right">
                <h2 className="text-2xl font-bold text-black">ספקים מומלצים</h2>
                <p className="text-sm text-black">{resultsSubtitle}</p>
                {variant === "vacation" && eventFlowSummary ? (
                  <p className="mt-1 text-xs text-black/70">{eventFlowSummary}</p>
                ) : null}
              </div>
            </div>

            {isLoading ? (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3 lg:gap-6">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="h-[340px] animate-pulse rounded-2xl bg-gray-100" />
                ))}
              </div>
            ) : (accumulatedSuppliers?.length ?? 0) === 0 ? (
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
                    {nextCursor ? (
                      <div className="size-12 animate-spin rounded-full border-2 border-[#201C44] border-t-transparent" />
                    ) : null}
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
              <button type="button" className="font-bold text-xs text-[#201C44] underline" onClick={handleReset}>
                איפוס
              </button>
              <h3 className="text-[18px] leading-7 text-black font-bold">מסננים</h3>
            </div>

            <button
              type="button"
              className="mb-4 flex w-full items-center justify-between rounded-lg border border-black/15 bg-white/60 px-3 py-2 text-sm text-[#201C44] lg:hidden"
              onClick={() => setMobileFiltersOpen((prev) => !prev)}
            >
              <span>{mobileFiltersOpen ? "▴" : "▾"}</span>
              <span>{mobileFiltersOpen ? "סגור מסננים" : "פתח מסננים"}</span>
            </button>

            <div
              dir="rtl"
              className={`${mobileFiltersOpen ? "block" : "hidden"} space-y-8 text-sm text-black lg:block`}
            >
              <div>
                <p className="mb-3 font-bold text-xs uppercase text-right tracking-[0.7px]">קטגוריה</p>
                <div className="space-y-2 pr-1">
                  {categoriesToShow.map((cat) => (
                    <label key={cat.id} className="grid cursor-pointer grid-cols-[auto_1fr] items-center gap-3">
                      <input
                        type="checkbox"
                        checked={categoryId === cat.id}
                        onChange={() => handleCategoryChange(cat.id)}
                        className="size-4 shrink-0 justify-self-end rounded border-black/20 accent-[#6AB7FF]"
                      />
                      <span className="text-right">{cat.name}</span>
                    </label>
                  ))}
                </div>

                {categoryId ? (
                  <div className="mt-4 border-t border-black/10 pt-4">
                    <p className="mb-3 font-bold text-xs uppercase text-right tracking-[0.7px]">תת-קטגוריה</p>
                    {subcategoriesLoading ? (
                      <p className="text-right text-xs text-black/50">טוען תת-קטגוריות…</p>
                    ) : subcategoriesForCategory.length === 0 ? (
                      <p className="text-right text-xs text-black/50">אין תת-קטגוריות לקטגוריה זו</p>
                    ) : (
                      <div className="space-y-2 pr-1">
                        {subcategoriesForCategory.map((sub) => (
                          <label
                            key={sub.id}
                            className="grid cursor-pointer grid-cols-[auto_1fr] items-center gap-3"
                          >
                            <input
                              type="checkbox"
                              checked={subcategoryId === sub.id}
                              onChange={() => handleSubcategoryChange(sub.id)}
                              className="size-4 shrink-0 justify-self-end rounded border-black/20 accent-[#6AB7FF]"
                            />
                            <span className="text-right">{sub.name}</span>
                          </label>
                        ))}
                      </div>
                    )}
                  </div>
                ) : null}
              </div>

              <div>
                <p className="mb-3 font-bold text-xs uppercase text-right tracking-[0.7px]">מסננים כלליים</p>
                <div className="space-y-2">
                  {MARKETPLACE_GENERAL_FILTERS.map(({ key, label }) => (
                    <label key={key} className="grid cursor-pointer grid-cols-[auto_1fr] items-center gap-3">
                      <input
                        type="checkbox"
                        checked={generalKeysSelected.has(key)}
                        onChange={() => toggleGeneralKey(key)}
                        className="size-4 shrink-0 justify-self-end rounded border-black/20 accent-[#6AB7FF]"
                      />
                      <span className="text-right">{label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <p className="mb-3 font-bold text-xs uppercase text-right tracking-[0.7px]">מיקום</p>
                <div className="relative">
                  <button
                    type="button"
                    className="flex w-full items-center justify-between rounded-lg border border-black/10 bg-black/5 px-3 py-2 text-right"
                    onClick={() => {
                      setLocationOpen((prev) => !prev);
                      setLangOpen(false);
                    }}
                  >
                    <span className="text-black/50">{locationOpen ? "▴" : "▾"}</span>
                    <span>{LOCATIONS.find((l) => l.value === location)?.label ?? "כל הארץ"}</span>
                  </button>
                  {locationOpen && (
                    <div className="absolute z-20 mt-1 w-full rounded-lg border border-black/10 bg-white shadow-md">
                      {LOCATIONS.map((option) => (
                        <button
                          key={option.value}
                          type="button"
                          className="block w-full px-3 py-2 text-right text-sm hover:bg-black/5"
                          onClick={() => handleLocationChange(option.value)}
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div>
                <p className="mb-3 font-bold text-xs uppercase text-right tracking-[0.7px]">דובר שפות נוספות</p>
                <div className="relative">
                  <button
                    type="button"
                    className="flex w-full items-center justify-between rounded-lg border border-black/10 bg-black/5 px-3 py-2 text-right"
                    onClick={() => {
                      setLangOpen((prev) => !prev);
                      setLocationOpen(false);
                    }}
                  >
                    <span className="text-black/50">{langOpen ? "▴" : "▾"}</span>
                    <span>
                      {MARKETPLACE_LANGUAGE_OPTIONS.find((o) => o.value === langParam)?.label ?? "בחר שפה"}
                    </span>
                  </button>
                  {langOpen && (
                    <div className="absolute z-20 mt-1 w-full rounded-lg border border-black/10 bg-white shadow-md">
                      {MARKETPLACE_LANGUAGE_OPTIONS.map((option) => (
                        <button
                          key={option.value || "none"}
                          type="button"
                          className="block w-full px-3 py-2 text-right text-sm hover:bg-black/5"
                          onClick={() => handleLangChange(option.value)}
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div>
                <p className="mb-3 font-bold text-xs uppercase text-right tracking-[0.7px]">{ratingSectionTitle}</p>
                <div className="flex gap-2">
                  {RATING_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      className={`flex flex-1 items-center justify-center gap-1 rounded px-2 py-1 ${minRating === opt.value ? "border border-[#6AB7FF] bg-white/30" : "border border-black/10 bg-white/20"}`}
                      onClick={() => handleRatingChange(opt.value)}
                    >
                      <span>{opt.label}</span>
                      <span>★</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <p className="mb-3 font-bold text-xs uppercase text-right tracking-[0.7px]">מסננים פרטניים</p>
                <div className="flex flex-wrap justify-end gap-2">
                  {MARKETPLACE_NICHE_TAGS.map(({ key, label }) => {
                    const on = nicheKeysSelected.has(key);
                    return (
                      <button
                        key={key}
                        type="button"
                        onClick={() => toggleNicheKey(key)}
                        className={`rounded-full border px-3 py-1.5 text-xs transition-colors ${on ? "border-[#6AB7FF] bg-white/40 text-[#201C44]" : "border-black/15 bg-white/25 text-black hover:bg-white/40"}`}
                      >
                        {label}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </aside>
        </div>

        {variant === "vacation" && (
          <div className="flex w-full">
            <PillAction
              href={backToCategoriesHref}
              variant="outline"
              className="font-bold border-[rgba(98,98,98,0.46)] bg-white! text-[rgba(0,0,0,0.66)]! visited:bg-white! visited:text-[rgba(0,0,0,0.66)]! hover:bg-white! hover:text-[rgba(0,0,0,0.66)]!"
            >
       <Image src="/icons/right_arrow.svg" alt="" width={16} height={16} className="h-4 w-4" />
חזרה לרשימת קטגוריות       
            </PillAction>
          </div>
        )}
      </div>

      <footer className="mt-12 flex min-h-[120px] w-full items-center justify-center border border-black/10 bg-[rgba(230,239,244,0.42)] px-4 py-8 backdrop-blur-[6px] sm:min-h-[155px]">
        <Link href="/" className="flex items-center gap-3 text-2xl text-black font-bold">
          ›
          <span>{footerMenuLabel}</span>
        </Link>
      </footer>
    </section>
  );
}
