import type { EndpointBuilder } from "@reduxjs/toolkit/query";
import type { JobSummaryResponse } from "@/shared/types";
import type { CreateJobPayload, UpdateJobPayload, JobApplication } from "@/shared/api/types";

export function createJobsEndpoints(builder: EndpointBuilder<any, any, any>) {
  return {
    getJobs: builder.query<JobSummaryResponse[], { status?: string } | void>({
      query: (params) => {
        if (params && typeof params === "object" && "status" in params) {
          return { url: "/v1/jobs", params: { status: params.status } };
        }
        return { url: "/v1/jobs" };
      },
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
      query: (id) => `/v1/jobs/${id}`,
      providesTags: (_result, _error, id) => [{ type: "Jobs", id }],
    }),
    updateUserJob: builder.mutation<JobSummaryResponse, { id: string; data: UpdateJobPayload }>({
      query: ({ id, data }) => ({ url: `/v1/jobs/${id}`, method: "PATCH", body: data }),
      invalidatesTags: (_result, _error, { id }) => [{ type: "Jobs", id }, "Jobs"],
    }),
    publishJob: builder.mutation<JobSummaryResponse, string>({
      query: (id) => ({ url: `/v1/jobs/${id}/publish`, method: "POST" }),
      invalidatesTags: (_result, _error, id) => [{ type: "Jobs", id }, "Jobs"],
    }),
    getJobApplications: builder.query<JobApplication[], string>({
      query: (id) => `/v1/jobs/${id}/applications`,
      providesTags: (_result, _error, id) => [{ type: "Jobs", id }],
    }),
    closeJob: builder.mutation<JobSummaryResponse, string>({
      query: (id) => ({ url: `/v1/jobs/${id}`, method: "PATCH", body: { status: "CLOSED" } }),
      invalidatesTags: (_result, _error, id) => [{ type: "Jobs", id }, "Jobs"],
    }),
    cancelJob: builder.mutation<JobSummaryResponse, string>({
      query: (id) => ({ url: `/v1/jobs/${id}`, method: "PATCH", body: { status: "CANCELLED" } }),
      invalidatesTags: (_result, _error, id) => [{ type: "Jobs", id }, "Jobs"],
    }),
    selectApplication: builder.mutation<{ status: string }, { jobId: string; applicationId: string }>({
      query: ({ jobId, applicationId }) => ({ url: `/v1/jobs/${jobId}/applications/${applicationId}/select`, method: "POST" }),
      invalidatesTags: (_result, _error, { jobId }) => [{ type: "Jobs", id: jobId }],
    }),
  };
}
