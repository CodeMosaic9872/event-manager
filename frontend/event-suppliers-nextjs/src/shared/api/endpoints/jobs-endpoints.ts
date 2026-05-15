import type { BaseQueryFn, EndpointBuilder, FetchArgs, FetchBaseQueryError } from "@reduxjs/toolkit/query";
import type { JobSummaryResponse } from "@/shared/types";
import type {
  ApplyToJobPayload,
  CreateJobPayload,
  JobApplication,
  UpdateJobPayload,
} from "@/shared/api/types";
import {
  mapJobPostToSummary,
  mapJobPostsArray,
  mapPaginatedJobApplications,
  mapRecommendedJobsArray,
  unwrapApiPayload,
} from "@/shared/api/job-mapper";

type ApiTag =
  | "Suppliers"
  | "Jobs"
  | "Notifications"
  | "Auth"
  | "AdminSuppliers"
  | "AdminJobs"
  | "AdminUsers"
  | "AdminReferrals"
  | "AdminNotifications"
  | "AdminAutomations";

type JobsBuilder = EndpointBuilder<
  BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError>,
  ApiTag,
  "api"
>;

const defaultPageLimit = { page: 1, limit: 100 };

export function createJobsEndpoints(builder: JobsBuilder) {
  return {
    getJobs: builder.query<JobSummaryResponse[], { page?: number; limit?: number } | void>({
      query: (params) => {
        const page = params && typeof params === "object" && "page" in params ? params.page : defaultPageLimit.page;
        const limit = params && typeof params === "object" && "limit" in params ? params.limit : defaultPageLimit.limit;
        return { url: "/v1/jobs", params: { page, limit } };
      },
      transformResponse: (response: unknown) => {
        const mapped = mapJobPostsArray(response);
        if (mapped.length > 0) return mapped;
        if (Array.isArray(response)) {
          return response
            .map((row) => mapJobPostToSummary(row))
            .filter((x): x is JobSummaryResponse => x != null);
        }
        return [];
      },
      transformErrorResponse: () => [],
      providesTags: ["Jobs"],
    }),
    createJob: builder.mutation<{ id: string; userId: string; title: string; status: string }, CreateJobPayload>({
      query: (body) => ({ url: "/v1/jobs", method: "POST", body }),
      invalidatesTags: ["Jobs"],
    }),
    getSupplierReferralLink: builder.query<{ link: string }, string>({
      query: (supplierId) => ({ url: `/v1/supplier/referrals/link`, params: { supplierId } }),
      transformResponse: (response: unknown) => {
        const inner = unwrapApiPayload(response) as { link?: string; referralLink?: string } | Record<string, unknown>;
        if (inner && typeof inner === "object") {
          const rec = inner as Record<string, unknown>;
          const link = rec.link ?? rec.referralLink;
          if (typeof link === "string") return { link };
        }
        return { link: "" };
      },
      transformErrorResponse: () => ({ link: "" }),
    }),
    getRecommendedSupplierJobs: builder.query<JobSummaryResponse[], { page?: number; limit?: number } | void>({
      query: (params) => {
        const page = params && typeof params === "object" && "page" in params ? params.page : 1;
        const limit = params && typeof params === "object" && "limit" in params ? params.limit : 50;
        return { url: "/v1/supplier/jobs/recommended", params: { page, limit } };
      },
      transformResponse: (response: unknown) => {
        const mapped = mapRecommendedJobsArray(response);
        if (mapped.length > 0) return mapped;
        if (Array.isArray(response)) {
          return response
            .map((row) => mapJobPostToSummary(row, { isRecommended: true }))
            .filter((x): x is JobSummaryResponse => x != null);
        }
        return [];
      },
      transformErrorResponse: () => [],
      providesTags: ["Jobs"],
    }),
    getUserJobs: builder.query<JobSummaryResponse[], { page?: number; limit?: number } | void>({
      query: (params) => {
        const page = params && typeof params === "object" && "page" in params ? params.page : 1;
        const limit = params && typeof params === "object" && "limit" in params ? params.limit : 100;
        return { url: "/v1/users/me/jobs", params: { page, limit } };
      },
      transformResponse: (response: unknown) => {
        const mapped = mapJobPostsArray(response);
        if (mapped.length > 0) return mapped.map((j) => ({ ...j, isMine: true }));
        if (Array.isArray(response)) {
          return response
            .map((row) => mapJobPostToSummary(row, { isMine: true }))
            .filter((x): x is JobSummaryResponse => x != null);
        }
        return [];
      },
      transformErrorResponse: () => [],
      providesTags: ["Jobs"],
    }),
    getUserJob: builder.query<JobSummaryResponse, string>({
      query: (id) => `/v1/jobs/${encodeURIComponent(id)}`,
      transformResponse: (response: unknown) => {
        const inner = unwrapApiPayload(response);
        return mapJobPostToSummary(inner) ?? (inner as JobSummaryResponse);
      },
      providesTags: (_result, _error, id) => [{ type: "Jobs", id }],
    }),
    updateUserJob: builder.mutation<JobSummaryResponse, { id: string; data: UpdateJobPayload }>({
      query: ({ id, data }) => ({ url: `/v1/jobs/${encodeURIComponent(id)}`, method: "PATCH", body: data }),
      transformResponse: (response: unknown) => {
        const inner = unwrapApiPayload(response);
        return mapJobPostToSummary(inner) ?? (inner as JobSummaryResponse);
      },
      invalidatesTags: (_result, _error, { id }) => [{ type: "Jobs", id }, "Jobs"],
    }),
    publishJob: builder.mutation<JobSummaryResponse, string>({
      query: (id) => ({ url: `/v1/jobs/${encodeURIComponent(id)}/publish`, method: "POST" }),
      transformResponse: (response: unknown) => {
        const inner = unwrapApiPayload(response);
        return mapJobPostToSummary(inner) ?? (inner as JobSummaryResponse);
      },
      invalidatesTags: (_result, _error, id) => [{ type: "Jobs", id }, "Jobs"],
    }),
    applyToJob: builder.mutation<Record<string, unknown>, ApplyToJobPayload>({
      query: ({ jobId, message }) => ({
        url: `/v1/jobs/${encodeURIComponent(jobId)}/applications`,
        method: "POST",
        body: { message: message ?? "" },
      }),
      invalidatesTags: ["Jobs"],
    }),
    getJobApplications: builder.query<JobApplication[], string>({
      query: (id) => ({ url: `/v1/jobs/${encodeURIComponent(id)}/applications`, params: { page: 1, limit: 200 } }),
      transformResponse: (response: unknown) => mapPaginatedJobApplications(response),
      providesTags: (_result, _error, id) => [{ type: "Jobs", id }],
    }),
    closeJob: builder.mutation<JobSummaryResponse, string>({
      query: (id) => ({ url: `/v1/jobs/${encodeURIComponent(id)}`, method: "PATCH", body: { status: "CLOSED" } }),
      invalidatesTags: (_result, _error, id) => [{ type: "Jobs", id }, "Jobs"],
    }),
    cancelJob: builder.mutation<JobSummaryResponse, string>({
      query: (id) => ({ url: `/v1/jobs/${encodeURIComponent(id)}`, method: "PATCH", body: { status: "CANCELLED" } }),
      invalidatesTags: (_result, _error, id) => [{ type: "Jobs", id }, "Jobs"],
    }),
    selectApplication: builder.mutation<{ status: string }, { jobId: string; applicationId: string }>({
      query: ({ jobId, applicationId }) => ({
        url: `/v1/jobs/${encodeURIComponent(jobId)}/applications/${encodeURIComponent(applicationId)}/select`,
        method: "POST",
      }),
      invalidatesTags: (_result, _error, { jobId }) => [{ type: "Jobs", id: jobId }],
    }),
  };
}
