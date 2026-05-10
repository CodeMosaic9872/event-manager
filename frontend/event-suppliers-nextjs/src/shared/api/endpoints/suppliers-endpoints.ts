import type { EndpointBuilder } from "@reduxjs/toolkit/query";
import { suppliers } from "@/shared/data/mock-data";
import type { Supplier, SupplierProfileResponse, SuppliersListResponse } from "@/shared/types";
import type {
  SuppliersQuery,
  UpsertSupplierProfilePayload,
  UpdateSupplierServiceAreasPayload,
} from "@/shared/api/types";

export function createSuppliersEndpoints(
  builder: EndpointBuilder<any, any, any>,
  options: { isProduction: boolean },
) {
  const { isProduction } = options;

  return {
    getSuppliers: builder.query<SuppliersListResponse, SuppliersQuery>({
      query: (params) => ({ url: "/v1/suppliers", params }),
      transformErrorResponse: () =>
        isProduction
          ? { items: [], nextCursor: null, facets: {} }
          : {
              items: suppliers.map((supplier) => ({
                id: supplier.id,
                businessName: supplier.businessName,
                ratingAvg: supplier.rating || 0,
              })),
              nextCursor: null,
              facets: {},
            },
      providesTags: ["Suppliers"],
    }),
    getSupplierById: builder.query<SupplierProfileResponse, string>({
      queryFn: async (supplierId, _api, _extra, baseQuery) => {
        const response = await baseQuery({ url: `/v1/suppliers/${supplierId}` });
        if (!response.error && response.data) {
          return { data: response.data as SupplierProfileResponse };
        }
        const fallback = suppliers.find((supplier) => supplier.id === supplierId);
        if (!fallback) return { error: { status: 404, data: "Not found" } };
        return {
          data: {
            id: fallback.id,
            slug: fallback.id,
            businessName: fallback.businessName,
            description: fallback.description,
          },
        };
      },
      providesTags: ["Suppliers"],
    }),
    getSupplierSuggestions: builder.query<string[], string>({
      query: (q) => ({ url: "/v1/search/suggestions", params: { q, take: 8 } }),
      transformResponse: (response: Array<{ label?: string; name?: string }> | string[]) =>
        Array.isArray(response)
          ? response.map((item) => (typeof item === "string" ? item : item.label || item.name || ""))
          : [],
    }),
    getSuppliersLegacyMock: builder.query<Supplier[], string>({
      queryFn: async (searchTerm) => {
        const filtered = suppliers.filter((supplier) =>
          `${supplier.businessName} ${supplier.category || ""} ${supplier.subcategory || ""} ${(supplier.tags || []).join(" ")}`
            .toLowerCase()
            .includes(searchTerm.toLowerCase()),
        );
        return { data: filtered };
      },
      providesTags: ["Suppliers"],
    }),
    getMySupplierProfile: builder.query<SupplierProfileResponse, void>({
      query: () => ({ url: "/v1/supplier/profile" }),
    }),
    createSupplierProfile: builder.mutation<SupplierProfileResponse, UpsertSupplierProfilePayload>({
      query: (body) => ({ url: "/v1/supplier/profile", method: "POST", body }),
    }),
    updateSupplierProfile: builder.mutation<SupplierProfileResponse, UpsertSupplierProfilePayload>({
      query: (body) => ({ url: "/v1/supplier/profile", method: "PATCH", body }),
    }),
    updateSupplierServiceAreas: builder.mutation<void, UpdateSupplierServiceAreasPayload>({
      query: (body) => ({ url: "/v1/supplier/service-areas", method: "PATCH", body }),
    }),
    getUserFavorites: builder.query<SuppliersListResponse, void>({
      query: () => ({ url: "/v1/users/me/favorites" }),
      transformErrorResponse: () => ({ items: [], nextCursor: null, facets: {} }),
      providesTags: ["Suppliers"],
    }),
  };
}
