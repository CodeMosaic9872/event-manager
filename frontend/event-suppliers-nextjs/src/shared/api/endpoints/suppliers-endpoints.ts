import type { EndpointBuilder } from "@reduxjs/toolkit/query";
import type { SupplierProfileResponse, SuppliersListResponse } from "@/shared/types";
import type {
  SuppliersQuery,
  UpsertSupplierProfilePayload,
  UpdateSupplierServiceAreasPayload,
  CreateReviewPayload,
  UpdateReviewPayload,
  ReviewListResponse,
  ReviewResponse,
  CreateMediaUploadUrlPayload,
  CreateMediaUploadUrlResponse,
  CompleteMediaUploadPayload,
  CompleteMediaUploadResponse,
} from "@/shared/api/types";

export function createSuppliersEndpoints(builder: EndpointBuilder<any, any, any>) {
  return {
    getSuppliers: builder.query<SuppliersListResponse, SuppliersQuery>({
      query: (params) => ({ url: "/v1/suppliers", params }),
      transformResponse: (response: unknown) => {
        if (response && typeof response === "object") {
          const r = response as any;
          if (r.data && r.data.items) return r.data as SuppliersListResponse;
          if (r.items) return response as SuppliersListResponse;
        }
        return { items: [], nextCursor: null, facets: {} };
      },
      transformErrorResponse: () => ({ items: [], nextCursor: null, facets: {} }),
      providesTags: ["Suppliers"],
    }),
    getSupplierById: builder.query<SupplierProfileResponse, string>({
      query: (supplierId) => ({ url: `/v1/suppliers/${supplierId}` }),
      transformResponse: (response: unknown) => {
        if (response && typeof response === "object") {
          const r = response as any;
          if (r.data) return r.data as SupplierProfileResponse;
          return response as SupplierProfileResponse;
        }
        return response as SupplierProfileResponse;
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
    createSupplierReview: builder.mutation<ReviewResponse, { supplierId: string } & CreateReviewPayload>({
      query: ({ supplierId, ...body }) => ({ url: `/v1/suppliers/${supplierId}/reviews`, method: "POST", body }),
      invalidatesTags: ["Suppliers"],
    }),
    getSupplierReviews: builder.query<ReviewListResponse, { supplierId: string; page?: number; limit?: number }>({
      query: ({ supplierId, page = 1, limit = 20 }) => ({ url: `/v1/suppliers/${supplierId}/reviews`, params: { page, limit } }),
      transformResponse: (response: unknown) => {
        if (response && typeof response === "object") {
          const r = response as any;
          if (r.data) return r.data as ReviewListResponse;
          if (r.items) return response as ReviewListResponse;
        }
        return { items: [], totalItems: 0 };
      },
    }),
    updateMySupplierReview: builder.mutation<ReviewResponse, { supplierId: string } & UpdateReviewPayload>({
      query: ({ supplierId, ...body }) => ({ url: `/v1/suppliers/${supplierId}/reviews/me`, method: "PATCH", body }),
      invalidatesTags: ["Suppliers"],
    }),
    deleteMySupplierReview: builder.mutation<void, { supplierId: string }>({
      query: ({ supplierId }) => ({ url: `/v1/suppliers/${supplierId}/reviews/me`, method: "DELETE" }),
      invalidatesTags: ["Suppliers"],
    }),
    createMediaUploadUrl: builder.mutation<CreateMediaUploadUrlResponse, CreateMediaUploadUrlPayload>({
      query: (body) => ({ url: "/v1/supplier/media/upload-url", method: "POST", body }),
      transformResponse: (response: unknown) => {
        const r = response as any;
        if (r?.data) return r.data as CreateMediaUploadUrlResponse;
        return response as CreateMediaUploadUrlResponse;
      },
    }),
    completeMediaUpload: builder.mutation<CompleteMediaUploadResponse, CompleteMediaUploadPayload>({
      query: (body) => ({ url: "/v1/supplier/media/complete-upload", method: "POST", body }),
      transformResponse: (response: unknown) => {
        const r = response as any;
        if (r?.data) return r.data as CompleteMediaUploadResponse;
        return response as CompleteMediaUploadResponse;
      },
    }),
  };
}
