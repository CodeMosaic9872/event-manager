import type { EndpointBuilder } from "@reduxjs/toolkit/query";

/** Query params shared by several admin list endpoints (OpenAPI: page, limit). */
export type AdminListQueryParams = {
  page?: number;
  limit?: number;
};

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

export type AdminReferralRewardItem = {
  id: string;
  supplierId: string;
  attributionId: string;
  status: string;
  createdAt: string;
  updatedAt: string;
};

export type AdminReferralsResponse = {
  items: AdminReferralRewardItem[];
  totalItems: number;
};

export type AdminJobItem = {
  id: string;
  title: string;
  status: string;
  createdAt: string;
  userId?: string;
};

export type AdminJobApplicationItem = {
  id: string;
  supplierId: string;
  status: string;
};

export type AdminAutomationMetrics = {
  totalRules?: number;
  activeRules?: number;
  totalRuns?: number;
  recentRuns?: number;
};

function unwrapDataArray<T>(response: unknown): T[] {
  if (Array.isArray(response)) return response;
  if (response && typeof response === "object") {
    const r = response as Record<string, unknown>;
    if (Array.isArray(r.data)) return r.data as T[];
    const data = r.data as Record<string, unknown> | undefined;
    if (data && Array.isArray(data.items)) return data.items as T[];
  }
  return [];
}

function normalizeNullableString(value: unknown): string | null {
  if (value == null) return null;
  if (typeof value === "string") return value;
  return null;
}

function normalizeAdminUser(raw: Record<string, unknown>): AdminUserItem {
  return {
    id: String(raw.id),
    email: normalizeNullableString(raw.email),
    phone: normalizeNullableString(raw.phone),
    status: String(raw.status ?? ""),
    roles: Array.isArray(raw.roles) ? (raw.roles as string[]) : [],
    supplierId: normalizeNullableString(raw.supplierId),
    supplierApprovalStatus: normalizeNullableString(raw.supplierApprovalStatus),
    createdAt: String(raw.createdAt ?? ""),
  };
}

function unwrapReferralsResponse(response: unknown): AdminReferralsResponse {
  if (response && typeof response === "object") {
    const r = response as Record<string, unknown>;
    const inner = (r.data ?? r) as Record<string, unknown>;
    const items = Array.isArray(inner.items) ? (inner.items as AdminReferralRewardItem[]) : [];
    const total = typeof inner.totalItems === "number" ? inner.totalItems : items.length;
    return { items, totalItems: total };
  }
  return { items: [], totalItems: 0 };
}

function unwrapAutomationMetrics(response: unknown): AdminAutomationMetrics {
  if (response && typeof response === "object") {
    const r = response as Record<string, unknown>;
    const inner = (r.data ?? r) as Record<string, unknown>;
    return {
      totalRules: typeof inner.totalRules === "number" ? inner.totalRules : undefined,
      activeRules: typeof inner.activeRules === "number" ? inner.activeRules : undefined,
      totalRuns: typeof inner.totalRuns === "number" ? inner.totalRuns : undefined,
      recentRuns: typeof inner.recentRuns === "number" ? inner.recentRuns : undefined,
    };
  }
  return {};
}

export function createAdminEndpoints(builder: EndpointBuilder<any, any, any>) {
  return {
    getAdminSuppliers: builder.query<AdminSupplierItem[], AdminListQueryParams | void>({
      query: (params) => ({
        url: "/v1/admin/suppliers",
        params: { page: 1, limit: 50, ...(params ?? {}) },
      }),
      transformResponse: (response: unknown) => unwrapDataArray<AdminSupplierItem>(response),
      providesTags: ["AdminSuppliers"],
    }),
    getAdminIncompleteSuppliers: builder.query<AdminSupplierItem[], AdminListQueryParams | void>({
      query: (params) => ({
        url: "/v1/admin/suppliers/incomplete",
        params: { page: 1, limit: 50, ...(params ?? {}) },
      }),
      transformResponse: (response: unknown) => unwrapDataArray<AdminSupplierItem>(response),
      providesTags: ["AdminSuppliers"],
    }),
    approveSupplier: builder.mutation<void, string>({
      query: (id) => ({ url: `/v1/admin/suppliers/${id}/approve`, method: "POST" }),
      invalidatesTags: ["AdminSuppliers"],
    }),
    rejectSupplier: builder.mutation<void, { id: string; reason?: string; adminUserId?: string }>({
      query: ({ id, reason, adminUserId }) => ({
        url: `/v1/admin/suppliers/${id}/reject`,
        method: "POST",
        body: { reason, ...(adminUserId ? { adminUserId } : {}) },
      }),
      invalidatesTags: ["AdminSuppliers"],
    }),
    featureSupplier: builder.mutation<void, string>({
      query: (id) => ({ url: `/v1/admin/suppliers/${id}/feature`, method: "POST" }),
      invalidatesTags: ["AdminSuppliers"],
    }),
    getAdminJobs: builder.query<AdminJobItem[], AdminListQueryParams | void>({
      query: (params) => ({
        url: "/v1/admin/jobs",
        params: { page: 1, limit: 50, ...(params ?? {}) },
      }),
      transformResponse: (response: unknown) => unwrapDataArray<AdminJobItem>(response),
      providesTags: ["AdminJobs"],
    }),
    getAdminJobApplications: builder.query<
      AdminJobApplicationItem[],
      { jobId: string } & AdminListQueryParams
    >({
      query: ({ jobId, page = 1, limit = 20 }) => ({
        url: "/v1/admin/jobs/applications",
        params: { jobId, page, limit },
      }),
      transformResponse: (response: unknown) => unwrapDataArray<AdminJobApplicationItem>(response),
      providesTags: ["AdminJobs"],
    }),
    archiveJob: builder.mutation<void, string>({
      query: (id) => ({ url: `/v1/admin/jobs/${id}/archive`, method: "POST" }),
      invalidatesTags: ["AdminJobs"],
    }),
    getAdminUsers: builder.query<AdminUserItem[], AdminListQueryParams | void>({
      query: (params) => ({
        url: "/v1/admin/users",
        params: { page: 1, limit: 50, ...(params ?? {}) },
      }),
      transformResponse: (response: unknown) =>
        unwrapDataArray<Record<string, unknown>>(response).map(normalizeAdminUser),
      providesTags: ["AdminUsers"],
    }),
    getAdminIncompleteUsers: builder.query<AdminUserItem[], AdminListQueryParams | void>({
      query: (params) => ({
        url: "/v1/admin/users/incomplete",
        params: { page: 1, limit: 50, ...(params ?? {}) },
      }),
      transformResponse: (response: unknown) =>
        unwrapDataArray<Record<string, unknown>>(response).map(normalizeAdminUser),
      providesTags: ["AdminUsers"],
    }),
    getAdminUnpaidUsers: builder.query<AdminUserItem[], AdminListQueryParams | void>({
      query: (params) => ({
        url: "/v1/admin/users/unpaid",
        params: { page: 1, limit: 50, ...(params ?? {}) },
      }),
      transformResponse: (response: unknown) =>
        unwrapDataArray<Record<string, unknown>>(response).map(normalizeAdminUser),
      providesTags: ["AdminUsers"],
    }),
    getAdminReferrals: builder.query<AdminReferralsResponse, void>({
      query: () => ({ url: "/v1/admin/referrals" }),
      transformResponse: (response: unknown) => unwrapReferralsResponse(response),
      providesTags: ["AdminReferrals"],
    }),
    getAdminNotifications: builder.query<{ id: string; type: string; status: string }[], void>({
      query: () => ({ url: "/v1/admin/notifications" }),
      transformResponse: (response: unknown) =>
        unwrapDataArray<{ id: string; type: string; status: string }>(response),
      providesTags: ["AdminNotifications"],
    }),
    getAdminAutomationMetrics: builder.query<AdminAutomationMetrics, void>({
      query: () => ({ url: "/v1/admin/automations/metrics" }),
      transformResponse: (response: unknown) => unwrapAutomationMetrics(response),
      providesTags: ["AdminAutomations"],
    }),
  };
}
