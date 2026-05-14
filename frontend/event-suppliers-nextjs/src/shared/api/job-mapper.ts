import type { JobApplication } from "@/shared/api/types";
import type { JobSummaryResponse } from "@/shared/types";

/** Same as common `r?.data ?? r` for wrapped API responses. */
export function unwrapApiPayload(response: unknown): unknown {
  if (response == null || typeof response !== "object") return response;
  const r = response as Record<string, unknown>;
  if (!("data" in r)) return response;
  const inner = r["data"];
  return inner != null ? inner : response;
}

function asRecord(v: unknown): Record<string, unknown> | null {
  return v != null && typeof v === "object" ? (v as Record<string, unknown>) : null;
}

function num(v: unknown, fallback = 0): number {
  if (typeof v === "number" && !Number.isNaN(v)) return v;
  if (typeof v === "string" && v.trim() !== "") {
    const n = Number(v);
    return Number.isNaN(n) ? fallback : n;
  }
  return fallback;
}

function str(v: unknown): string | undefined {
  return typeof v === "string" ? v : undefined;
}

function taxonomyName(v: unknown): string | undefined {
  const o = asRecord(v);
  return o ? str(o.name) : undefined;
}

function eventDateIso(v: unknown): string | undefined {
  if (typeof v === "string") return v;
  if (v instanceof Date) return v.toISOString();
  return undefined;
}

/**
 * Maps `JobDetailResponseDto` / `RecommendedJobResponseDto` (and similar) to `JobSummaryResponse`.
 */
export function mapJobPostToSummary(
  raw: unknown,
  extra?: Partial<Pick<JobSummaryResponse, "isMine" | "isRecommended" | "matchScore" | "matchReasons">>,
): JobSummaryResponse | null {
  const row = asRecord(raw);
  if (!row) return null;
  const id = str(row.id);
  const title = str(row.title);
  if (!id || !title) return null;

  const category =
    taxonomyName(row.category) ??
    taxonomyName(row.eventType) ??
    taxonomyName(row.subcategory);

  const guestCount = num(row.guestCount, NaN);
  const audienceLabel =
    !Number.isNaN(guestCount) && guestCount > 0
      ? `כמות קהל: ${guestCount.toLocaleString("he-IL")} איש`
      : undefined;

  const budgetMin = num(row.budgetMin, 0);
  const budgetMax = num(row.budgetMax, 0);

  return {
    id,
    title,
    status: str(row.status) ?? "",
    budgetMin,
    budgetMax,
    eventTypeId: str(row.eventTypeId),
    category,
    eventDate: eventDateIso(row.eventDate),
    description: str(row.description),
    locationText: str(row.locationText),
    location: str(row.locationText) ?? str(row.location),
    audienceLabel,
    ownerUserId: str(row.ownerUserId),
    guestCount: !Number.isNaN(guestCount) && guestCount > 0 ? guestCount : undefined,
    ...extra,
  };
}

export function mapJobPostsArray(response: unknown): JobSummaryResponse[] {
  const root = unwrapApiPayload(response);
  const obj = asRecord(root);
  if (!obj) return [];
  const items = obj.items;
  if (!Array.isArray(items)) return [];
  return items.map((row) => mapJobPostToSummary(row)).filter((x): x is JobSummaryResponse => x != null);
}

export function mapJobApplicationListItem(raw: unknown): JobApplication | null {
  const row = asRecord(raw);
  if (!row) return null;
  const id = str(row.id);
  const jobPostId = str(row.jobPostId);
  const supplierId = str(row.supplierId);
  if (!id || !jobPostId || !supplierId) return null;
  const supplier = asRecord(row.supplier);
  const ratingRaw = supplier?.ratingAvg ?? supplier?.rating;
  const reviewRaw = supplier?.reviewCount ?? supplier?.review_count;
  const priceRaw = row.price;
  return {
    id,
    jobId: jobPostId,
    supplierId,
    supplierName: str(supplier?.businessName) ?? "Supplier",
    supplierRating: typeof ratingRaw === "number" ? ratingRaw : undefined,
    supplierReviewCount: typeof reviewRaw === "number" ? reviewRaw : undefined,
    price: typeof priceRaw === "number" ? priceRaw : undefined,
    message: str(row.message),
    status: str(row.status),
  };
}

export function mapPaginatedJobApplications(response: unknown): JobApplication[] {
  const root = unwrapApiPayload(response);
  const obj = asRecord(root);
  if (!obj) return [];
  const items = obj.items;
  if (!Array.isArray(items)) return [];
  return items.map(mapJobApplicationListItem).filter((x): x is JobApplication => x != null);
}

function flattenMatchReasons(raw: unknown): string[] | undefined {
  if (!Array.isArray(raw)) return undefined;
  const out: string[] = [];
  for (const x of raw) {
    if (typeof x === "string") out.push(x);
    else if (Array.isArray(x)) for (const y of x) if (typeof y === "string") out.push(y);
  }
  return out.length ? out : undefined;
}

/** `GET /v1/supplier/jobs/recommended` → `PaginatedRecommendedJobsResponseDto`. */
export function mapRecommendedJobsArray(response: unknown): JobSummaryResponse[] {
  const root = unwrapApiPayload(response);
  const obj = asRecord(root);
  if (!obj) return [];
  const items = obj.items;
  if (!Array.isArray(items)) return [];
  const out: JobSummaryResponse[] = [];
  for (const row of items) {
    const r = asRecord(row);
    if (!r) continue;
    const base = mapJobPostToSummary(row, { isRecommended: true });
    if (!base) continue;
    const reasons = flattenMatchReasons(r.matchReasons);
    const enriched: JobSummaryResponse = {
      ...base,
      isRecommended: true,
      matchScore: num(r.matchScore, 0),
      ...(reasons ? { matchReasons: reasons } : {}),
    };
    out.push(enriched);
  }
  return out;
}
