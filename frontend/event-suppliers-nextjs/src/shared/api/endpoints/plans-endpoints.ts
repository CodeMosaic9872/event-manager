import type { EndpointBuilder } from "@reduxjs/toolkit/query";
import type { SubscriptionPlanDto } from "@/shared/api/types/subscription-plan";

function extractPlans(response: unknown): SubscriptionPlanDto[] {
  if (Array.isArray(response)) return response as SubscriptionPlanDto[];
  const r = response as Record<string, unknown> | null;
  if (!r) return [];
  const data = r.data;
  if (Array.isArray(data)) return data as SubscriptionPlanDto[];
  if (data && typeof data === "object") {
    const items = (data as { items?: unknown }).items;
    if (Array.isArray(items)) return items as SubscriptionPlanDto[];
  }
  if (Array.isArray(r.items)) return r.items as SubscriptionPlanDto[];
  return [];
}

function unwrapPlan(response: unknown): SubscriptionPlanDto | null {
  if (!response || typeof response !== "object") return null;
  const r = response as Record<string, unknown>;
  const data = r.data ?? response;
  if (data && typeof data === "object" && "id" in data && "key" in data) {
    return data as SubscriptionPlanDto;
  }
  return null;
}

export function createPlansEndpoints(builder: EndpointBuilder<any, any, any>) {
  return {
    getSubscriptionPlans: builder.query<SubscriptionPlanDto[], void>({
      query: () => ({ url: "/v1/plans" }),
      transformResponse: extractPlans,
      transformErrorResponse: () => [],
      providesTags: ["Plans"],
    }),
    getSubscriptionPlanByKey: builder.query<SubscriptionPlanDto | null, string>({
      query: (key) => ({ url: `/v1/plans/${encodeURIComponent(key)}` }),
      transformResponse: unwrapPlan,
      providesTags: (_r, _e, key) => [{ type: "Plans", id: key }],
    }),
  };
}
