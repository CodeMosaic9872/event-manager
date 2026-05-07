import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { createAiAndNotificationEndpoints } from "@/shared/api/endpoints/ai-notification-endpoints";
import { createAuthEndpoints } from "@/shared/api/endpoints/auth-endpoints";
import { createJobsEndpoints } from "@/shared/api/endpoints/jobs-endpoints";
import { createSuppliersEndpoints } from "@/shared/api/endpoints/suppliers-endpoints";

const baseUrl =
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  "http://localhost:4000";
const isProduction = process.env.NODE_ENV === "production";

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
  keepUnusedDataFor: 60,
  refetchOnReconnect: true,
  endpoints: (builder) => ({
    ...createAuthEndpoints(builder),
    ...createSuppliersEndpoints(builder, { isProduction }),
    ...createJobsEndpoints(builder),
    ...createAiAndNotificationEndpoints(builder),
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
