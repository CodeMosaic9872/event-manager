import type { EndpointBuilder } from "@reduxjs/toolkit/query";

/** Query params shared by several admin list endpoints (OpenAPI: page, limit). */
export type AdminListQueryParams = {
  page?: number;
  limit?: number;
};

export type AdminSupplierListQueryParams = AdminListQueryParams & {
  q?: string;
  status?: "all" | "approved" | "pending" | "waiting" | "rejected" | "draft";
  categoryId?: string;
  categoryKey?: string;
  serviceArea?: string;
};

export type AdminSupplierCategoryTag = {
  id: string;
  key: string;
  name: string;
  nameEn: string | null;
  subcategoryId?: string | null;
  subcategoryKey?: string | null;
  subcategoryName?: string | null;
};

export type AdminSupplierListItem = {
  id: string;
  ownerUserId: string;
  businessName: string;
  slug: string;
  approvalStatus: string;
  isActive: boolean;
  isVerified: boolean;
  city: string | null;
  description: string | null;
  contactEmail: string | null;
  publicPhone: string | null;
  address: string | null;
  websiteUrl: string | null;
  serviceAreas: string[];
  categories: AdminSupplierCategoryTag[];
  socialLinks: { platform: string; url: string }[];
  labels: string[];
  createdAt: string;
  updatedAt: string;
};

/** @deprecated Use AdminSupplierListItem */
export type AdminSupplierItem = Pick<AdminSupplierListItem, "id" | "businessName" | "approvalStatus">;

export type AdminSuppliersListResponse = {
  items: AdminSupplierListItem[];
  totalItems: number;
};

export type AdminSupplierStats = {
  activeSuppliers: number;
  pendingApproval: number;
  totalSuppliers: number;
};

export type AdminSupplierFilterOptions = {
  categories: Array<{ id: string; key: string; name: string; nameEn: string | null }>;
  serviceAreas: string[];
};

export type AdminSupplierExportResult = {
  filename: string;
  contentType: string;
  csv: string;
  rowCount: number;
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

export type AdminDashboardKpiMetric = {
  value: number;
  changePercent?: number;
  periodLabel?: string;
  currency?: string;
};

export type AdminDashboardResponse = {
  period: { year: number; month: number; label: string };
  kpis: {
    totalSuppliers: AdminDashboardKpiMetric;
    totalRevenue: AdminDashboardKpiMetric;
    pendingApprovals: AdminDashboardKpiMetric;
    activeUsers: AdminDashboardKpiMetric;
  };
  supplierEngagement: {
    phoneClicks: number;
    messagesSent: number;
    profileViews: number;
    closedJobOffers: { count: number; revenueAmount: number; currency: string };
  };
  platformGrowth: {
    months: Array<{
      year: number;
      month: number;
      label: string;
      newSuppliers: number;
      newUsers: number;
      paidEvents: number;
    }>;
    totals: { newSuppliers: number; newUsers: number; paidEvents: number };
  };
  pendingApprovals: {
    items: Array<{
      id: string;
      businessName: string;
      categoryName: string | null;
      joinedAt: string;
    }>;
    totalItems: number;
  };
};

export type AdminDashboardQueryParams = {
  year?: number;
  month?: number;
  supplierSearch?: string;
  pendingLimit?: number;
  growthMonths?: number;
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

function unwrapPaginatedList<T>(response: unknown): { items: T[]; totalItems: number } {
  if (response && typeof response === "object") {
    const r = response as Record<string, unknown>;
    const inner = (r.data ?? r) as Record<string, unknown>;
    const items = Array.isArray(inner.items) ? (inner.items as T[]) : [];
    const total = typeof inner.totalItems === "number" ? inner.totalItems : items.length;
    return { items, totalItems: total };
  }
  return { items: [], totalItems: 0 };
}

function unwrapData<T>(response: unknown): T | null {
  if (response && typeof response === "object") {
    const r = response as Record<string, unknown>;
    return (r.data ?? r) as T;
  }
  return null;
}

function unwrapDashboard(response: unknown): AdminDashboardResponse | null {
  if (response && typeof response === "object") {
    const r = response as Record<string, unknown>;
    const inner = (r.data ?? r) as AdminDashboardResponse;
    if (inner && typeof inner === "object" && inner.kpis) return inner;
  }
  return null;
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
    getAdminSuppliers: builder.query<AdminSuppliersListResponse, AdminSupplierListQueryParams | void>({
      query: (params) => ({
        url: "/v1/admin/suppliers",
        params: { page: 1, limit: 50, ...(params ?? {}) },
      }),
      transformResponse: (response: unknown) => unwrapPaginatedList<AdminSupplierListItem>(response),
      providesTags: ["AdminSuppliers"],
    }),
    getAdminSupplierStats: builder.query<AdminSupplierStats | null, void>({
      query: () => ({ url: "/v1/admin/suppliers/stats" }),
      transformResponse: (response: unknown) => unwrapData<AdminSupplierStats>(response),
      providesTags: ["AdminSuppliers"],
    }),
    getAdminSupplierFilterOptions: builder.query<AdminSupplierFilterOptions | null, void>({
      query: () => ({ url: "/v1/admin/suppliers/filter-options" }),
      transformResponse: (response: unknown) => unwrapData<AdminSupplierFilterOptions>(response),
      providesTags: ["AdminSuppliers"],
    }),
    getAdminSuppliersExport: builder.query<AdminSupplierExportResult | null, AdminSupplierListQueryParams | void>({
      query: (params) => ({
        url: "/v1/admin/suppliers/export",
        params: params ?? {},
      }),
      transformResponse: (response: unknown) => unwrapData<AdminSupplierExportResult>(response),
    }),
    getAdminSupplierById: builder.query<AdminSupplierListItem | null, string>({
      query: (id) => ({ url: `/v1/admin/suppliers/${id}` }),
      transformResponse: (response: unknown) => unwrapData<AdminSupplierListItem>(response),
      providesTags: (_r, _e, id) => [{ type: "AdminSuppliers", id }],
    }),
    deleteAdminSupplier: builder.mutation<void, string>({
      query: (id) => ({ url: `/v1/admin/suppliers/${id}`, method: "DELETE" }),
      invalidatesTags: ["AdminSuppliers", "AdminDashboard"],
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
      invalidatesTags: ["AdminSuppliers", "AdminDashboard"],
    }),
    rejectSupplier: builder.mutation<void, { id: string; reason?: string; adminUserId?: string }>({
      query: ({ id, reason, adminUserId }) => ({
        url: `/v1/admin/suppliers/${id}/reject`,
        method: "POST",
        body: { reason, ...(adminUserId ? { adminUserId } : {}) },
      }),
      invalidatesTags: ["AdminSuppliers", "AdminDashboard"],
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
    getAdminDashboard: builder.query<AdminDashboardResponse | null, AdminDashboardQueryParams | void>({
      query: (params) => ({
        url: "/v1/admin/dashboard",
        params: params ?? {},
      }),
      transformResponse: (response: unknown) => unwrapDashboard(response),
      providesTags: ["AdminDashboard"],
    }),
  };
}
