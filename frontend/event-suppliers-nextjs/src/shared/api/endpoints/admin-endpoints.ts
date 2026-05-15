import type { EndpointBuilder } from "@reduxjs/toolkit/query";

export type AdminSupplierItem = {
  id: string;
  businessName: string;
  approvalStatus: string;
};

export type AdminUserItem = {
  id: string;
  email: string | null;
  phone: string | null;
  status: string;
  roles: string[];
  supplierId: string | null;
  supplierApprovalStatus: string | null;
  createdAt: string;
};

export type AdminReferralItem = {
  id: string;
  referrerUserId?: string;
  refereeUserId?: string;
  rewardStatus?: string;
  createdAt?: string;
};

export type AdminReferralsResponse = {
  items: AdminReferralItem[];
  totalItems: number;
};

export type AdminJobItem = {
  id: string;
  title: string;
  status: string;
  createdAt: string;
  userId?: string;
};

export type AdminAutomationMetrics = {
  totalRules?: number;
  activeRules?: number;
  totalRuns?: number;
  recentRuns?: number;
};

export function createAdminEndpoints(builder: EndpointBuilder<any, any, any>) {
  return {
    getAdminSuppliers: builder.query<AdminSupplierItem[], void>({
      query: () => ({ url: "/v1/admin/suppliers" }),
      providesTags: ["AdminSuppliers"],
    }),
    getAdminIncompleteSuppliers: builder.query<AdminSupplierItem[], void>({
      query: () => ({ url: "/v1/admin/suppliers/incomplete" }),
      providesTags: ["AdminSuppliers"],
    }),
    approveSupplier: builder.mutation<void, string>({
      query: (id) => ({ url: `/v1/admin/suppliers/${id}/approve`, method: "POST" }),
      invalidatesTags: ["AdminSuppliers"],
    }),
    rejectSupplier: builder.mutation<void, { id: string; reason?: string }>({
      query: ({ id, reason }) => ({ url: `/v1/admin/suppliers/${id}/reject`, method: "POST", body: { reason } }),
      invalidatesTags: ["AdminSuppliers"],
    }),
    getAdminJobs: builder.query<AdminJobItem[], void>({
      query: () => ({ url: "/v1/admin/jobs" }),
      providesTags: ["AdminJobs"],
    }),
    getAdminJobApplications: builder.query<{ id: string; supplierId: string; status: string }[], void>({
      query: () => ({ url: "/v1/admin/jobs/applications" }),
      providesTags: ["AdminJobs"],
    }),
    archiveJob: builder.mutation<void, string>({
      query: (id) => ({ url: `/v1/admin/jobs/${id}/archive`, method: "POST" }),
      invalidatesTags: ["AdminJobs"],
    }),
    getAdminUsers: builder.query<AdminUserItem[], void>({
      query: () => ({ url: "/v1/admin/users" }),
      providesTags: ["AdminUsers"],
    }),
    getAdminIncompleteUsers: builder.query<AdminUserItem[], void>({
      query: () => ({ url: "/v1/admin/users/incomplete" }),
      providesTags: ["AdminUsers"],
    }),
    getAdminReferrals: builder.query<AdminReferralsResponse, void>({
      query: () => ({ url: "/v1/admin/referrals" }),
      providesTags: ["AdminReferrals"],
    }),
    getAdminNotifications: builder.query<{ id: string; type: string; status: string }[], void>({
      query: () => ({ url: "/v1/admin/notifications" }),
      providesTags: ["AdminNotifications"],
    }),
    getAdminAutomationMetrics: builder.query<AdminAutomationMetrics, void>({
      query: () => ({ url: "/v1/admin/automations/metrics" }),
      providesTags: ["AdminAutomations"],
    }),
  };
}
