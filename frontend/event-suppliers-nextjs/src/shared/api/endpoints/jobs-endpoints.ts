import type { EndpointBuilder } from "@reduxjs/toolkit/query";
import type { JobSummaryResponse } from "@/shared/types";
import type { CreateJobPayload } from "@/shared/api/types";

export function createJobsEndpoints(builder: EndpointBuilder<any, any, any>) {
  return {
    getJobs: builder.query<JobSummaryResponse[], void>({
      query: () => ({ url: "/v1/jobs" }),
      transformResponse: (response: JobSummaryResponse[]) => response,
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
  };
}
