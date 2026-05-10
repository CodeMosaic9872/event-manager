import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { BaseQueryFn, FetchArgs, FetchBaseQueryError } from "@reduxjs/toolkit/query";
import { logout, setCredentials } from "@/features/auth/auth-slice";
import { createAiAndNotificationEndpoints } from "@/shared/api/endpoints/ai-notification-endpoints";
import { createAuthEndpoints } from "@/shared/api/endpoints/auth-endpoints";
import { createJobsEndpoints } from "@/shared/api/endpoints/jobs-endpoints";
import { createSuppliersEndpoints } from "@/shared/api/endpoints/suppliers-endpoints";
import { createTaxonomyEndpoints } from "@/shared/api/endpoints/taxonomy-endpoints";

const baseUrl =
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  "http://localhost:4000";
const isProduction = process.env.NODE_ENV === "production";

const rawBaseQuery = fetchBaseQuery({
  baseUrl,
  prepareHeaders: (headers, { getState }) => {
    const state = getState() as { auth: { accessToken: string | null; refreshToken: string | null } };
    const token = state.auth.accessToken;
    if (token) headers.set("Authorization", `Bearer ${token}`);
    return headers;
  },
});

const baseQuery: BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError> = async (
  args,
  api,
  extraOptions,
) => {
  const result = await rawBaseQuery(args, api, extraOptions);

  if (!result.error && result.data && typeof result.data === "object" && (result.data as any).success === false) {
    const err = (result.data as any).error;
    return {
      error: {
        status: err?.details?.statusCode || err?.statusCode || 401,
        data: result.data,
      },
    };
  }

  return result;
};

const baseQueryWithReauth: BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError> = async (
  args,
  api,
  extraOptions,
) => {
  let result = await baseQuery(args, api, extraOptions);

  if (result.error && result.error.status === 401) {
    const state = api.getState() as { auth: { refreshToken: string | null; isHydrated: boolean } };
    const { refreshToken, isHydrated } = state.auth;

    if (!refreshToken || !isHydrated) {
      return result;
    }

    const refreshResult = await baseQuery(
      { url: "/v1/auth/refresh", method: "POST", body: { token: refreshToken } },
      api,
      extraOptions,
    );

    if (refreshResult.data) {
      const data = refreshResult.data as { accessToken: string; refreshToken: string };
      api.dispatch(
        setCredentials({
          user: (api.getState() as { auth: { user: any } }).auth.user,
          accessToken: data.accessToken,
          refreshToken: data.refreshToken,
        }),
      );
      result = await baseQuery(args, api, extraOptions);
    } else {
      api.dispatch(logout());
    }
  }

  return result;
};

export const api = createApi({
  reducerPath: "api",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["Suppliers", "Jobs", "Notifications", "Auth"],
  keepUnusedDataFor: 60,
  refetchOnReconnect: true,
  endpoints: (builder) => ({
    ...createAuthEndpoints(builder),
    ...createSuppliersEndpoints(builder, { isProduction }),
    ...createTaxonomyEndpoints(builder),
    ...createJobsEndpoints(builder),
    ...createAiAndNotificationEndpoints(builder),
  }),
});

export const {
  useLoginMutation,
  useRegisterMutation,
  useRequestOtpMutation,
  useVerifyOtpMutation,
  useRefreshTokenMutation,
  useMeQuery,
  useGetSuppliersQuery,
  useGetSupplierByIdQuery,
  useGetSupplierSuggestionsQuery,
  useGetMySupplierProfileQuery,
  useCreateSupplierProfileMutation,
  useUpdateSupplierProfileMutation,
  useUpdateSupplierServiceAreasMutation,
  useGetJobsQuery,
  useCreateJobMutation,
  useCreateConversationMutation,
  useSendConversationMessageMutation,
  useGetNotificationPreferencesQuery,
  useUpdateNotificationPreferencesMutation,
  useGetSupplierReferralLinkQuery,
  useGetRecommendedSupplierJobsQuery,
  useGetSuppliersLegacyMockQuery,
  useGetUserJobsQuery,
  useGetUserJobQuery,
  useUpdateUserJobMutation,
  useGetUserFavoritesQuery,
  useGetEventTypesQuery,
  useGetCategoriesQuery,
  useGetSubcategoriesQuery,
} = api;
