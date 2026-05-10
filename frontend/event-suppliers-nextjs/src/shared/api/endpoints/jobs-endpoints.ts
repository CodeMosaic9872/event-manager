import type { EndpointBuilder } from "@reduxjs/toolkit/query";
import type { JobSummaryResponse } from "@/shared/types";
import type { CreateJobPayload, UpdateJobPayload } from "@/shared/api/types";

export function createJobsEndpoints(builder: EndpointBuilder<any, any, any>) {
  return {
    getJobs: builder.query<JobSummaryResponse[], void>({
      query: () => ({ url: "/v1/jobs" }),
      transformResponse: (response: unknown) => {
        if (Array.isArray(response)) return response as JobSummaryResponse[];
        if (response && typeof response === "object" && "items" in response && Array.isArray((response as any).items)) {
          return (response as any).items as JobSummaryResponse[];
        }
        return [];
      },
      transformErrorResponse: () => [],
      providesTags: ["Jobs"],
    }),
    createJob: builder.mutation<{ id: string; userId: string; title: string; status: string }, CreateJobPayload>(
      {
        query: (body) => ({ url: "/v1/jobs", method: "POST", body }),
        invalidatesTags: ["Jobs"],
      },
    ),
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
    getUserJobs: builder.query<JobSummaryResponse[], void>({
      query: () => ({ url: "/v1/users/me/jobs" }),
      transformResponse: (response: unknown) => {
        if (Array.isArray(response)) return response as JobSummaryResponse[];
        if (response && typeof response === "object" && "items" in response && Array.isArray((response as any).items)) {
          return (response as any).items as JobSummaryResponse[];
        }
        return [];
      },
      transformErrorResponse: () => [],
      providesTags: ["Jobs"],
    }),
    getUserJob: builder.query<JobSummaryResponse, string>({
      query: (id) => `/v1/users/me/jobs/${id}`,
      providesTags: (_result, _error, id) => [{ type: "Jobs", id }],
    }),
    updateUserJob: builder.mutation<JobSummaryResponse, { id: string; data: UpdateJobPayload }>({
      query: ({ id, data }) => ({ url: `/v1/users/me/jobs/${id}`, method: "PATCH", body: data }),
      invalidatesTags: (_result, _error, { id }) => [{ type: "Jobs", id }, "Jobs"],
    }),
  };
}
