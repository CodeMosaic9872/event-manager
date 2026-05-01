"use client";

import Link from "next/link";
import { eventCategoryMap } from "@/shared/data/mock-data";
import { useGetSupplierSuggestionsQuery, useGetSuppliersQuery } from "@/shared/api/api";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  setLocationRegionCode,
  setMinRating,
  setSelectedCategory,
  setSearchTerm,
  setSelectedEventType,
  setSelectedSubcategory,
  toggleFavorite,
} from "@/features/marketplace/marketplace-slice";

export default function MarketplacePage() {
  const dispatch = useAppDispatch();
  const {
    searchTerm,
    selectedEventType,
    selectedCategory,
    selectedSubcategory,
    locationRegionCode,
    minRating,
    favorites,
  } = useAppSelector((state) => state.marketplace);

  const { data } = useGetSuppliersQuery({
    q: searchTerm || undefined,
    eventTypeId: selectedEventType || undefined,
    categoryId: selectedCategory || undefined,
    subcategoryId: selectedSubcategory || undefined,
    locationRegionCode: locationRegionCode || undefined,
    minRating: minRating || undefined,
    take: 24,
  });
  const { data: suggestions = [] } = useGetSupplierSuggestionsQuery(searchTerm, {
    skip: searchTerm.trim().length < 2,
  });
  const relevantSubcategories = eventCategoryMap[selectedEventType] || [];
  const filtered = data?.items || [];

  return (
    <section className="mx-auto w-full max-w-[1300px] rounded-[24px] border border-[#bfdbfe] bg-[linear-gradient(180deg,#9BD3EF_0%,#FFFFFF_58%)] px-6 py-8">
      <div className="grid gap-4 p-5">
        <div className="grid gap-2">
          <input
            className="rounded-full border border-[#201c44] bg-white px-5 py-2"
            placeholder="חיפוש ספקים, דיג'יים, צלמים..."
            value={searchTerm}
            onChange={(event) => dispatch(setSearchTerm(event.target.value))}
          />
          {suggestions.length > 0 && (
            <div className="rounded-xl border border-[#bfdbfe] bg-white p-2 text-sm text-slate-600">
              {suggestions.filter(Boolean).slice(0, 5).map((item) => (
                <button
                  key={item}
                  type="button"
                  className="ml-2 rounded-md bg-white px-2 py-1"
                  onClick={() => dispatch(setSearchTerm(item))}
                >
                  {item}
                </button>
              ))}
            </div>
          )}
        </div>
        <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-5">
          <select
            className="rounded-lg border border-slate-300 bg-white px-3 py-2"
            value={selectedEventType}
            onChange={(event) => dispatch(setSelectedEventType(event.target.value))}
          >
            {Object.keys(eventCategoryMap).map((eventType) => (
              <option key={eventType}>{eventType}</option>
            ))}
          </select>
          <select
            className="rounded-lg border border-slate-300 bg-white px-3 py-2"
            value={selectedCategory}
            onChange={(event) => dispatch(setSelectedCategory(event.target.value))}
          >
            <option value="">כל הקטגוריות</option>
            <option value="music">מוזיקה</option>
            <option value="food">אוכל</option>
            <option value="photo">צילום</option>
          </select>
          <select
            className="rounded-lg border border-slate-300 bg-white px-3 py-2"
            value={selectedSubcategory}
            onChange={(event) => dispatch(setSelectedSubcategory(event.target.value))}
          >
            <option value="">כל תתי הקטגוריות</option>
            {relevantSubcategories.map((subcategory) => (
              <option key={subcategory}>{subcategory}</option>
            ))}
          </select>
          <select
            className="rounded-lg border border-slate-300 bg-white px-3 py-2"
            value={locationRegionCode}
            onChange={(event) => dispatch(setLocationRegionCode(event.target.value))}
          >
            <option value="">כל האזורים</option>
            <option value="north">צפון</option>
            <option value="center">מרכז</option>
            <option value="south">דרום</option>
          </select>
          <select
            className="rounded-lg border border-slate-300 bg-white px-3 py-2"
            value={minRating}
            onChange={(event) => dispatch(setMinRating(Number(event.target.value)))}
          >
            <option value={0}>כל דירוג</option>
            <option value={3}>3+</option>
            <option value={4}>4+</option>
            <option value={4.5}>4.5+</option>
          </select>
        </div>
      </div>
      <div className="mt-2 grid gap-4 lg:grid-cols-[1fr_300px]">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((supplier) => (
            <article key={supplier.id} className="rounded-2xl border border-slate-200 bg-white p-4 text-center">
              <div className="mx-auto mb-3 size-16 rounded-full border-2 border-[#6ab7ff] bg-slate-200" />
              <h2 className="text-lg text-[#201c44]">{supplier.businessName}</h2>
              <p className="text-xs text-slate-500">MUSIC AND PRODUCTION</p>
              <div className="mt-2 flex justify-center gap-1 text-[10px] text-slate-400">
                <span className="rounded bg-slate-100 px-2 py-1">img</span>
                <span className="rounded bg-slate-100 px-2 py-1">img</span>
                <span className="rounded bg-slate-100 px-2 py-1">img</span>
              </div>
              <p className="mt-2 text-xs text-slate-600">All of Israel (south)</p>
              <p className="text-xs text-amber-500">{supplier.ratingAvg} ★</p>
              <div className="mt-3 flex items-center justify-center gap-2 text-xs">
                <Link href={`/marketplace/${supplier.id}`}>profile</Link>
                <button
                  type="button"
                  className="rounded-full border border-slate-300 px-3 py-1"
                  onClick={() => dispatch(toggleFavorite(supplier.id))}
                >
                  {favorites.includes(supplier.id) ? "saved" : "save"}
                </button>
              </div>
            </article>
          ))}
        </div>
        <aside className="rounded-2xl border border-slate-200 bg-white/70 p-4">
          <h3 className="text-right text-lg text-[#201c44]">Filters</h3>
          <p className="mt-4 text-right text-xs text-slate-500">MINIMUM RATING</p>
          <div className="mt-2 flex gap-2">
            <button className="rounded bg-[#dbeafe] px-3 py-1 text-xs">4.5+</button>
            <button className="rounded bg-[#dbeafe] px-3 py-1 text-xs">4+</button>
          </div>
          <p className="mt-4 text-right text-xs text-slate-500">FILTERS PER NICHE</p>
          <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
            {["Free parking", "strictly kosher", "outdoor event", "Disabled access"].map((tag) => (
              <span key={tag} className="rounded border border-slate-200 bg-slate-50 px-2 py-1 text-center">
                {tag}
              </span>
            ))}
          </div>
        </aside>
      </div>
      <div className="mt-8 flex items-center justify-center gap-6">
        <div className="size-10 animate-spin rounded-full border-4 border-[#6ab7ff] border-t-transparent" />
        <p className="text-sm text-[#2d3255]">Loading more providers...</p>
      </div>
      <div className="mt-6 text-right">
        <Link href="/event-production/supplier-categories" className="inline-flex items-center gap-3 rounded-full border border-slate-400 px-8 py-3 text-sm text-[#3a4362]">
          Back to category list <span>→</span>
        </Link>
      </div>
    </section>
  );
}
