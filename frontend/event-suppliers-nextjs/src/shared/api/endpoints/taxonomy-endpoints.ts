import type { EndpointBuilder } from "@reduxjs/toolkit/query";

export type EventType = { id: string; name: string; image?: string };
export type Category = { id: string; name: string };
export type Subcategory = { id: string; name: string };

function extractItems(response: unknown) {
  if (Array.isArray(response)) return response;
  const r = response as any;
  if (r?.data?.items && Array.isArray(r.data.items)) return r.data.items;
  if (r?.items && Array.isArray(r.items)) return r.items;
  return [];
}

export function createTaxonomyEndpoints(builder: EndpointBuilder<any, any, any>) {
  return {
    getEventTypes: builder.query<EventType[], void>({
      query: () => ({ url: "/v1/taxonomy/event-types", params: { limit: 100 } }),
      transformResponse: extractItems,
      transformErrorResponse: () => [],
      providesTags: ["Taxonomy"],
    }),
    getCategories: builder.query<Category[], void>({
      query: () => ({ url: "/v1/taxonomy/categories", params: { limit: 100 } }),
      transformResponse: extractItems,
      transformErrorResponse: () => [],
      providesTags: ["Taxonomy"],
    }),
    getSubcategories: builder.query<Subcategory[], string>({
      query: (categoryId) => ({ url: `/v1/taxonomy/categories/${categoryId}/subcategories`, params: { limit: 100 } }),
      transformResponse: extractItems,
      transformErrorResponse: () => [],
      providesTags: ["Taxonomy"],
    }),
  };
}
