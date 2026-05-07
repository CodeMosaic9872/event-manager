"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState, type Dispatch, type SetStateAction } from "react";
import { SUPPLIER_LIST } from "@/shared/data/supplier-catalog";
import { SupplierGlassCard } from "@/shared/components/supplier-glass-card";

const FILTER_CATEGORIES = ["דיג'יים", "אולמות אירועים", "צילום והפקה", "קייטרינג"] as const;
const FILTER_RULES = ["ספק משרד הביטחון", "מילואים", "ביטוחים", "פתוח בשבת"] as const;
const LOCATIONS = ["כל הארץ", "מרכז", "צפון", "דרום"] as const;
const LANGUAGES = ["בחר שפה", "עברית", "אנגלית", "ערבית", "רוסית"] as const;
const NICHE_CHIPS = ["חניה חינם", "נגיש", "כשר למהדרין", "אירוע חיצוני", "נגישות לכיסא גלגלים"] as const;
const SORT_OPTIONS = ["הרלוונטיות ביותר", "דירוג גבוה", "הכי חדש", "מחיר מהנמוך לגבוה"] as const;

export default function VacationSelectionSuppliersPage() {
  const [selectedCategories, setSelectedCategories] = useState<string[]>(["אולמות אירועים"]);
  const [selectedRules, setSelectedRules] = useState<string[]>(["מילואים"]);
  const [selectedNiches, setSelectedNiches] = useState<string[]>([]);
  const [selectedRating, setSelectedRating] = useState<"4.5+" | "4+" | null>("4.5+");
  const [locationOpen, setLocationOpen] = useState(false);
  const [languageOpen, setLanguageOpen] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState("כל הארץ");
  const [selectedLanguage, setSelectedLanguage] = useState("בחר שפה");
  const [sortOpen, setSortOpen] = useState(false);
  const [selectedSort, setSelectedSort] = useState<(typeof SORT_OPTIONS)[number]>("הרלוונטיות ביותר");
  const [visibleCount, setVisibleCount] = useState(9);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);

  const toggleArrayValue = (
    value: string,
    list: string[],
    setter: Dispatch<SetStateAction<string[]>>,
  ) => {
    setter(list.includes(value) ? list.filter((item) => item !== value) : [...list, value]);
  };

  const displayedSuppliers = useMemo(() => {
    return Array.from({ length: visibleCount }, (_, index) => {
      const supplier = SUPPLIER_LIST[index % SUPPLIER_LIST.length];
      return {
        ...supplier,
        rowKey: `${supplier.id}-${index}`,
      };
    });
  }, [visibleCount]);

  useEffect(() => {
    const observerTarget = loadMoreRef.current;
    if (!observerTarget || !hasMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const first = entries[0];
        if (!first?.isIntersecting || isLoadingMore) return;

        setIsLoadingMore(true);
        window.setTimeout(() => {
          setVisibleCount((prev) => {
            const next = prev + 6;
            if (next >= 60) {
              setHasMore(false);
              return 60;
            }
            return next;
          });
          setIsLoadingMore(false);
        }, 650);
      },
      { rootMargin: "220px" },
    );

    observer.observe(observerTarget);
    return () => observer.disconnect();
  }, [hasMore, isLoadingMore]);

  return (
    <section className="relative mx-auto min-h-[2002px] w-full overflow-x-hidden bg-white">
      <div className="absolute -top-px left-1/2 h-[1066px] w-[1824px] -translate-x-1/2 bg-[linear-gradient(180deg,#9BD3EF_0%,#FFFFFF_58%)]" />
      <div className="pointer-events-none absolute left-[1361px] top-[732px] hidden h-[233px] w-[261px] rotate-149 rounded-full bg-[linear-gradient(180deg,#2998FF_0%,#FFFFFF_60.33%)] blur-[20.5px] min-[1450px]:block" />

      <div className="relative z-10 mx-auto flex w-full max-w-[1280px] flex-col gap-8 px-4 pt-20 sm:gap-10 sm:px-6 sm:pt-24 lg:px-8 lg:pt-[132px]">
        <div className="mx-auto w-full max-w-[1024px]">
          <div className="flex h-16 items-center rounded-[30px] border-2 border-[#201C44] bg-white/25 p-1 backdrop-blur-[6px]">
            <div className="flex w-full items-center gap-3 px-4">
              <span className="hidden text-[18px] sm:block">🔎</span>
              <input
                className="h-[52px] w-full bg-transparent text-right text-[18px] text-black outline-none placeholder:text-black/60"
                placeholder="חיפוש ספקים, דיג׳יים, צלמים או אולמות..."
              />
            </div>
          </div>
          <div className="mt-3 flex flex-wrap items-center justify-end gap-x-3 gap-y-1 text-xs text-black">
            <button type="button" className="underline">
              אולמות בשרון
            </button>
            <button type="button" className="underline">
              קייטרינג טבעוני
            </button>
            <button type="button" className="underline">
              דיג׳יי לחתונה
            </button>
            <span>פופולרי:</span>
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
                    <span>{selectedSort}</span>
                  </button>
                  {sortOpen && (
                    <div className="absolute right-0 z-20 mt-1 w-full rounded-md border border-black/10 bg-white shadow-md">
                      {SORT_OPTIONS.map((option) => (
                        <button
                          key={option}
                          type="button"
                          className="block w-full px-3 py-2 text-right text-sm hover:bg-black/5"
                          onClick={() => {
                            setSelectedSort(option);
                            setSortOpen(false);
                          }}
                        >
                          {option}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <span>מיון לפי:</span>
              </div>
              <div className="min-w-0 text-right">
                <h2 className="text-2xl text-black">ספקים מומלצים</h2>
                <p className="text-sm text-black">מצאנו 128 ספקים התואמים לחיפוש שלך.</p>
              </div>
            </div>

            <div className="mb-4 grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3 lg:gap-6">
              {displayedSuppliers.map((supplier) => (
                <SupplierGlassCard
                  key={supplier.rowKey}
                  href={`/suppliers/${supplier.id}`}
                  name={supplier.name}
                  subtitle={supplier.subtitle}
                  description={supplier.description}
                  location={supplier.location}
                  rating={supplier.rating}
                  imageUrl={supplier.imageUrl}
                />
              ))}
            </div>

            <div className="mt-6 flex justify-center">
              <div className="flex flex-col items-center gap-4">
                {hasMore ? <div className="size-12 rounded-full border border-black/10" /> : null}
                <p className="text-sm text-black">
                  {hasMore
                    ? isLoadingMore
                      ? "טוען ספקים נוספים..."
                      : "גלול לטעינת ספקים נוספים"
                    : "הגעת לסוף הרשימה"}
                </p>
                <div ref={loadMoreRef} className="h-1 w-full" />
              </div>
            </div>
          </main>

          <aside className="order-1 w-full rounded-2xl border border-black/10 bg-[linear-gradient(180deg,rgba(230,238,242,0.3564)_0%,rgba(133,138,140,0.1512)_100%)] p-5 backdrop-blur-[6px] sm:p-6 lg:order-2 lg:w-[288px] lg:min-w-[288px]">
            <div className="mb-8 flex items-center justify-between">
              <button
                type="button"
                className="text-xs text-[#201C44] underline"
                onClick={() => {
                  setSelectedCategories(["אולמות אירועים"]);
                  setSelectedRules(["מילואים"]);
                  setSelectedNiches([]);
                  setSelectedRating("4.5+");
                  setSelectedLocation("כל הארץ");
                  setSelectedLanguage("בחר שפה");
                  setLocationOpen(false);
                  setLanguageOpen(false);
                }}
              >
                איפוס
              </button>
              <h3 className="text-[18px] leading-7 text-black">מסננים</h3>
            </div>

            <button
              type="button"
              className="mb-4 flex w-full items-center justify-between rounded-lg border border-black/15 bg-white/60 px-3 py-2 text-sm text-[#201C44] lg:hidden"
              onClick={() => setMobileFiltersOpen((prev) => !prev)}
            >
              <span>{mobileFiltersOpen ? "▴" : "▾"}</span>
              <span>{mobileFiltersOpen ? "סגור מסננים" : "פתח מסננים"}</span>
            </button>

            <div className={`${mobileFiltersOpen ? "block" : "hidden"} space-y-8 text-sm text-black lg:block`}>
              <div>
                <p className="mb-3 text-xs uppercase text-right tracking-[0.7px]">קטגוריה</p>
                <div className="space-y-2">
                  {FILTER_CATEGORIES.map((item) => (
                    <label key={item} className="flex cursor-pointer items-center justify-end gap-3">
                      <span>{item}</span>
                      <input
                        type="checkbox"
                        checked={selectedCategories.includes(item)}
                        onChange={() => toggleArrayValue(item, selectedCategories, setSelectedCategories)}
                        className="size-4 rounded border-black/20 accent-[#6AB7FF]"
                      />
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <p className="mb-3 text-xs uppercase text-right tracking-[0.7px]">כללי סינון</p>
                <div className="space-y-2">
                  {FILTER_RULES.map((item) => (
                    <label key={item} className="flex cursor-pointer items-center justify-end gap-3">
                      <span>{item}</span>
                      <input
                        type="checkbox"
                        checked={selectedRules.includes(item)}
                        onChange={() => toggleArrayValue(item, selectedRules, setSelectedRules)}
                        className="size-4 rounded border-black/20 accent-[#6AB7FF]"
                      />
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <p className="mb-3 text-xs uppercase text-right tracking-[0.7px]">מיקום</p>
                <div className="relative">
                  <button
                    type="button"
                    className="flex w-full items-center justify-between rounded-lg border border-black/10 bg-black/5 px-3 py-2 text-right"
                    onClick={() => {
                      setLocationOpen((prev) => !prev);
                      setLanguageOpen(false);
                    }}
                  >
                    <span>{locationOpen ? "▴" : "▾"}</span>
                    <span>{selectedLocation}</span>
                  </button>
                  {locationOpen && (
                    <div className="absolute z-20 mt-1 w-full rounded-lg border border-black/10 bg-white shadow-md">
                      {LOCATIONS.map((option) => (
                        <button
                          key={option}
                          type="button"
                          className="block w-full px-3 py-2 text-right text-sm hover:bg-black/5"
                          onClick={() => {
                            setSelectedLocation(option);
                            setLocationOpen(false);
                          }}
                        >
                          {option}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div>
                <p className="mb-3 text-xs uppercase text-right tracking-[0.7px]">דובר שפות נוספות</p>
                <div className="relative">
                  <button
                    type="button"
                    className="flex w-full items-center justify-between rounded-lg border border-black/10 bg-black/5 px-3 py-2 text-right"
                    onClick={() => {
                      setLanguageOpen((prev) => !prev);
                      setLocationOpen(false);
                    }}
                  >
                    <span>{languageOpen ? "▴" : "▾"}</span>
                    <span>{selectedLanguage}</span>
                  </button>
                  {languageOpen && (
                    <div className="absolute z-20 mt-1 w-full rounded-lg border border-black/10 bg-white shadow-md">
                      {LANGUAGES.map((option) => (
                        <button
                          key={option}
                          type="button"
                          className="block w-full px-3 py-2 text-right text-sm hover:bg-black/5"
                          onClick={() => {
                            setSelectedLanguage(option);
                            setLanguageOpen(false);
                          }}
                        >
                          {option}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div>
                <p className="mb-3 text-xs uppercase text-right tracking-[0.7px]">דירוג מינימום</p>
                <div className="flex gap-2">
                  <button
                    type="button"
                    className={`flex flex-1 items-center justify-center gap-1 rounded px-2 py-1 ${
                      selectedRating === "4.5+"
                        ? "border border-[#6AB7FF] bg-white/30"
                        : "border border-black/10 bg-white/20"
                    }`}
                    onClick={() => setSelectedRating("4.5+")}
                  >
                    <span>★</span>
                    <span>4.5+</span>
                  </button>
                  <button
                    type="button"
                    className={`flex flex-1 items-center justify-center gap-1 rounded px-2 py-1 ${
                      selectedRating === "4+"
                        ? "border border-[#6AB7FF] bg-white/30"
                        : "border border-black/10 bg-white/20"
                    }`}
                    onClick={() => setSelectedRating("4+")}
                  >
                    <span>★</span>
                    <span>4+</span>
                  </button>
                </div>
              </div>

              <div>
                <p className="mb-3 text-xs uppercase text-right tracking-[0.7px]">מסננים לפי נישה</p>
                <div className="flex flex-wrap justify-end gap-2">
                  {NICHE_CHIPS.map((chip) => (
                    <button
                      key={chip}
                      type="button"
                      onClick={() => toggleArrayValue(chip, selectedNiches, setSelectedNiches)}
                      className={`rounded px-2 py-1 text-xs ${
                        selectedNiches.includes(chip)
                          ? "border border-[#6AB7FF] bg-white/30"
                          : "border border-black/10 bg-black/5"
                      }`}
                    >
                      {chip}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </aside>
        </div>

        <div className="flex justify-end">
          <Link
            href="/vacation-selection-categories"
            className="inline-flex h-12 w-full max-w-[227px] items-center justify-center gap-2 rounded-[99px] border-2 border-black/45 bg-white text-[16px] text-black/70"
          >
            <span aria-hidden>←</span> חזרה לרשימת הקטגוריות
          </Link>
        </div>
      </div>

      <footer className="mt-12 flex min-h-[120px] w-full items-center justify-center border border-black/10 bg-[rgba(230,239,244,0.42)] px-4 py-8 backdrop-blur-[6px] sm:min-h-[155px]">
        <div className="flex items-center gap-3 text-2xl text-black">
          <span className="-rotate-90 text-xl" aria-hidden>
            →
          </span>
          <span>פתח תפריט</span>
        </div>
      </footer>
    </section>
  );
}
