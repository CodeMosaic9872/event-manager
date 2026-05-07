import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import {
  AuthTokensResponse,
  AuthUser,
  JobSummaryResponse,
  Supplier,
  SupplierProfileResponse,
  SuppliersListResponse,
} from "@/shared/types";
import { suppliers } from "@/shared/data/mock-data";

type LoginPayload = { email: string; password: string };
type RegisterPayload = { email: string; password: string; role: "USER" | "SUPPLIER" | "ADMIN" };
type RefreshPayload = { token: string };
type SuppliersQuery = {
  q?: string;
  eventTypeId?: string;
  categoryId?: string;
  subcategoryId?: string;
  locationRegionCode?: string;
  minRating?: number;
  take?: number;
  cursor?: string;
};
type CreateJobPayload = {
  title: string;
  description: string;
  eventDate?: string;
  eventTypeId?: string;
  locationText?: string;
  budgetMin?: number;
  budgetMax?: number;
  guestCount?: number;
};
type CreateConversationResponse = { id: string };
type SendMessagePayload = { id: string; message: string };
type NotificationPreferences = {
  userId: string;
  emailEnabled: boolean;
  pushEnabled: boolean;
  mutedTemplates: string[];
};

const baseUrl =
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  "https://event-manager-backend.inkys2.easypanel.host";
const toRole = (roles: string[]): AuthUser["roles"] =>
  roles.map((role) => role.toLowerCase() as AuthUser["roles"][number]);

export const api = createApi({
  reducerPath: "api",
  baseQuery: fetchBaseQuery({
    baseUrl,
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as { auth: { accessToken: string | null } }).auth.accessToken;
      if (token) headers.set("Authorization", `Bearer ${token}`);
      return headers;
    },
  }),
  tagTypes: ["Suppliers", "Jobs", "Notifications", "Auth"],
  endpoints: (builder) => ({
    login: builder.mutation<AuthTokensResponse, LoginPayload>({
      query: (body) => ({ url: "/v1/auth/login", method: "POST", body }),
      invalidatesTags: ["Auth"],
    }),
    register: builder.mutation<AuthTokensResponse, RegisterPayload>({
      query: (body) => ({ url: "/v1/auth/register", method: "POST", body }),
      invalidatesTags: ["Auth"],
    }),
    refreshToken: builder.mutation<{ accessToken: string; refreshToken: string }, RefreshPayload>({
      query: (body) => ({ url: "/v1/auth/refresh", method: "POST", body }),
    }),
    me: builder.query<AuthUser, void>({
      query: () => ({ url: "/v1/auth/me" }),
      transformResponse: (response: { id: string; email: string; roles: string[] }) => ({
        id: response.id,
        email: response.email,
        roles: toRole(response.roles),
      }),
      providesTags: ["Auth"],
    }),
    getSuppliers: builder.query<SuppliersListResponse, SuppliersQuery>({
      query: (params) => ({ url: "/v1/suppliers", params }),
      transformErrorResponse: () => ({
        items: suppliers.map((supplier) => ({
          id: supplier.id,
          businessName: supplier.businessName,
          ratingAvg: supplier.rating || 0,
        })),
        nextCursor: null,
        facets: {},
      }),
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
    getJobs: builder.query<JobSummaryResponse[], void>({
      query: () => ({ url: "/v1/jobs" }),
      transformResponse: (response: JobSummaryResponse[]) => response,
      transformErrorResponse: () => [],
      providesTags: ["Jobs"],
    }),
    createJob: builder.mutation<
      { id: string; userId: string; title: string; status: string },
      CreateJobPayload
    >({
      query: (body) => ({ url: "/v1/jobs", method: "POST", body }),
      invalidatesTags: ["Jobs"],
    }),
    createConversation: builder.mutation<CreateConversationResponse, { eventType?: string }>({
      query: (body) => ({ url: "/v1/ai/conversations", method: "POST", body }),
    }),
    sendConversationMessage: builder.mutation<
      { reply?: string; recommendations?: Array<{ supplierId: string; businessName?: string }> },
      SendMessagePayload
    >({
      query: ({ id, message }) => ({
        url: `/v1/ai/conversations/${id}/messages`,
        method: "POST",
        body: { message },
      }),
    }),
    getNotificationPreferences: builder.query<NotificationPreferences, void>({
      query: () => ({ url: "/v1/notifications/preferences" }),
      providesTags: ["Notifications"],
    }),
    updateNotificationPreferences: builder.mutation<
      NotificationPreferences,
      Partial<NotificationPreferences>
    >({
      query: (body) => ({ url: "/v1/notifications/preferences", method: "PUT", body }),
      invalidatesTags: ["Notifications"],
    }),
    getSupplierReferralLink: builder.query<{ link: string }, void>({
      query: () => ({ url: "/v1/supplier/referrals/link" }),
      transformResponse: (res: { link?: string; referralLink?: string }) => ({
        link: res.link || res.referralLink || "",
      }),
      transformErrorResponse: () => ({ link: "" }),
    }),
    getRecommendedSupplierJobs: builder.query<Array<{ id: string; title: string }>, void>({
      query: () => ({ url: "/v1/supplier/jobs/recommended" }),
      transformErrorResponse: () => [],
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
  }),
});

export const {
  useLoginMutation,
  useRegisterMutation,
  useRefreshTokenMutation,
  useMeQuery,
  useGetSuppliersQuery,
  useGetSupplierByIdQuery,
  useGetSupplierSuggestionsQuery,
  useGetJobsQuery,
  useCreateJobMutation,
  useCreateConversationMutation,
  useSendConversationMessageMutation,
  useGetNotificationPreferencesQuery,
  useUpdateNotificationPreferencesMutation,
  useGetSupplierReferralLinkQuery,
  useGetRecommendedSupplierJobsQuery,
  useGetSuppliersLegacyMockQuery,
} = api;
