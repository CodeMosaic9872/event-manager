"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ProtectedRoute } from "@/shared/components/protected-route";
import {
  useGetAdminSuppliersQuery,
  useGetAdminUsersQuery,
  useGetAdminJobsQuery,
  useGetAdminReferralsQuery,
  useApproveSupplierMutation,
  useRejectSupplierMutation,
  useArchiveJobMutation,
  useGetAdminAutomationMetricsQuery,
  useGetAdminAiUsageQuery,
  useGetAdminAiFailuresQuery,
  useGetAdminMatchingRunsQuery,
  useGetCategoriesQuery,
  useGetSubcategoriesQuery,
  useTriggerMatchingMutation,
  useMeQuery,
} from "@/shared/api/api";
import { useAppSelector } from "@/store/hooks";

type Tab = "suppliers" | "users" | "jobs" | "referrals" | "ai" | "taxonomy";

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-xl border border-[#BFDBFE] bg-white p-4 shadow-sm">
      <p className="text-xs text-[#64748B]">{label}</p>
      <p className="mt-1 text-2xl font-semibold text-[#1E1B4B]">{value}</p>
    </div>
  );
}

function Spinner() {
  return (
    <div className="flex items-center justify-center py-12">
      <svg className="animate-spin size-8 text-[#4721DF]" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="31.4 31.4" strokeLinecap="round" />
      </svg>
    </div>
  );
}

export default function AdminDashboardPage() {
  const isAuthHydrated = useAppSelector((state) => state.auth.isHydrated);
  const sessionUser = useAppSelector((state) => state.auth.user);
  const shouldSkip = !isAuthHydrated || !sessionUser;
  const { data: me } = useMeQuery(undefined, { skip: shouldSkip });

  const router = useRouter();
  const searchParams = useSearchParams();
  const initialTab = (searchParams.get("tab") as Tab) || "suppliers";

  const [tab, setTab] = useState<Tab>(initialTab);
  const [rejectReason, setRejectReason] = useState("");
  const [rejectingId, setRejectingId] = useState<string | null>(null);

  useEffect(() => {
    const t = searchParams.get("tab") as Tab;
    if (t && t !== tab) setTab(t);
  }, [searchParams]);

  const handleTabChange = (newTab: Tab) => {
    setTab(newTab);
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", newTab);
    router.push(`?${params.toString()}`, { scroll: false });
  };

  const { data: suppliersPage, isLoading: loadingSuppliers } = useGetAdminSuppliersQuery(
    { page: 1, limit: 200 },
    { skip: shouldSkip },
  );
  const suppliers = suppliersPage?.items ?? [];
  const { data: users = [], isLoading: loadingUsers } = useGetAdminUsersQuery({ page: 1, limit: 200 }, { skip: shouldSkip });
  const { data: jobs = [], isLoading: loadingJobs } = useGetAdminJobsQuery({ page: 1, limit: 200 }, { skip: shouldSkip });
  const { data: referrals } = useGetAdminReferralsQuery(undefined, { skip: shouldSkip });
  const { data: metrics } = useGetAdminAutomationMetricsQuery(undefined, { skip: shouldSkip });
  const { data: aiUsage } = useGetAdminAiUsageQuery(undefined, { skip: shouldSkip });
  const { data: aiFailures = [] } = useGetAdminAiFailuresQuery(undefined, { skip: shouldSkip });
  const { data: matchingRuns = [] } = useGetAdminMatchingRunsQuery(undefined, { skip: shouldSkip });
  const { data: categories = [] } = useGetCategoriesQuery(undefined, { skip: shouldSkip });

  const [approveSupplier] = useApproveSupplierMutation();
  const [rejectSupplier] = useRejectSupplierMutation();
  const [archiveJob] = useArchiveJobMutation();
  const [triggerMatching] = useTriggerMatchingMutation();

  return (
    <ProtectedRoute roles={["admin"]}>
      <div className="min-h-screen bg-[#F8FAFC]">
        <div className="mx-auto max-w-[1200px] px-6 py-8">
          <header className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-[#1E1B4B]">Admin Dashboard</h1>
              <p className="text-sm text-[#64748B]">{me?.email}</p>
            </div>
          </header>

          <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
            <StatCard label="Suppliers" value={suppliers.length} />
            <StatCard label="Users" value={users.length} />
            <StatCard label="Jobs" value={jobs.length} />
            <StatCard label="Referrals" value={referrals?.totalItems ?? 0} />
          </div>

          <div className="mb-6 flex gap-2 rounded-xl bg-white p-1 shadow-sm overflow-x-auto">
            {(["suppliers", "users", "jobs", "referrals", "ai", "taxonomy"] as Tab[]).map((t) => (
              <button
                key={t}
                onClick={() => handleTabChange(t)}
                className={`min-w-[100px] rounded-lg px-4 py-2 text-sm font-medium capitalize transition ${tab === t ? "bg-[#201C44] text-white" : "text-[#64748B] hover:bg-[#F1F5F9]"}`}
              >
                {t}
              </button>
            ))}
          </div>

          {tab === "suppliers" && (
            <div className="rounded-xl border border-[#BFDBFE] bg-white shadow-sm">
              <div className="border-b border-[#E2E8F0] px-6 py-4">
                <h2 className="text-lg font-semibold text-[#1E1B4B]">Supplier Approvals</h2>
              </div>
              {loadingSuppliers ? <Spinner /> : suppliers.length === 0 ? (
                <p className="px-6 py-8 text-center text-sm text-[#94A3B8]">No suppliers to review.</p>
              ) : (
                <div className="divide-y divide-[#F1F5F9]">
                  {suppliers.map((s) => (
                    <div key={s.id} className="flex items-center justify-between px-6 py-4">
                      <div>
                        <p className="font-medium text-[#1E1B4B]">{s.businessName}</p>
                        <p className={`text-xs ${s.approvalStatus === "PENDING" ? "text-amber-600" : s.approvalStatus === "APPROVED" ? "text-green-600" : "text-red-600"}`}>
                          {s.approvalStatus}
                        </p>
                      </div>
                      {s.approvalStatus === "PENDING" && (
                        <div className="flex gap-2">
                          <button
                            onClick={() => approveSupplier(s.id)}
                            className="rounded-lg bg-green-600 px-4 py-1.5 text-sm text-white transition hover:bg-green-700"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => setRejectingId(s.id)}
                            className="rounded-lg bg-red-600 px-4 py-1.5 text-sm text-white transition hover:bg-red-700"
                          >
                            Reject
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {tab === "users" && (
            <div className="rounded-xl border border-[#BFDBFE] bg-white shadow-sm">
              <div className="border-b border-[#E2E8F0] px-6 py-4">
                <h2 className="text-lg font-semibold text-[#1E1B4B]">Users</h2>
              </div>
              {loadingUsers ? <Spinner /> : users.length === 0 ? (
                <p className="px-6 py-8 text-center text-sm text-[#94A3B8]">No users found.</p>
              ) : (
                <div className="divide-y divide-[#F1F5F9]">
                  {users.map((u) => (
                    <div key={u.id} className="flex items-center justify-between px-6 py-4">
                      <div>
                        <p className="font-medium text-[#1E1B4B]">{u.email ?? u.phone ?? "—"}</p>
                        <p className="text-xs text-[#94A3B8]">
                          {u.roles.join(", ")} · {u.status} · {u.supplierApprovalStatus ?? "—"}
                        </p>
                      </div>
                      <p className="text-xs text-[#94A3B8]">{new Date(u.createdAt).toLocaleDateString()}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {tab === "jobs" && (
            <div className="rounded-xl border border-[#BFDBFE] bg-white shadow-sm">
              <div className="border-b border-[#E2E8F0] px-6 py-4">
                <h2 className="text-lg font-semibold text-[#1E1B4B]">Jobs</h2>
              </div>
              {loadingJobs ? <Spinner /> : jobs.length === 0 ? (
                <p className="px-6 py-8 text-center text-sm text-[#94A3B8]">No jobs found.</p>
              ) : (
                <div className="divide-y divide-[#F1F5F9]">
                  {jobs.map((j) => (
                    <div key={j.id} className="flex items-center justify-between px-6 py-4">
                      <div>
                        <p className="font-medium text-[#1E1B4B]">{j.title}</p>
                        <p className={`text-xs ${j.status === "ACTIVE" ? "text-green-600" : "text-[#94A3B8]"}`}>{j.status}</p>
                      </div>
                      <button
                        onClick={() => archiveJob(j.id)}
                        className="rounded-lg border border-[#E2E8F0] px-4 py-1.5 text-sm text-[#64748B] transition hover:bg-[#F1F5F9]"
                      >
                        Archive
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {tab === "referrals" && (
            <div className="rounded-xl border border-[#BFDBFE] bg-white shadow-sm">
              <div className="border-b border-[#E2E8F0] px-6 py-4">
                <h2 className="text-lg font-semibold text-[#1E1B4B]">Referrals</h2>
              </div>
              {!referrals ? <Spinner /> : referrals.items.length === 0 ? (
                <p className="px-6 py-8 text-center text-sm text-[#94A3B8]">No referrals found.</p>
              ) : (
                <div className="divide-y divide-[#F1F5F9]">
                  {referrals.items.map((r) => (
                    <div key={r.id} className="flex items-center justify-between px-6 py-4">
                      <div>
                        <p className="text-sm text-[#1E1B4B]">{r.id}</p>
                        <p className="text-xs text-[#94A3B8]">
                          Status: {r.status}
                          {r.supplierId ? ` · Supplier: ${r.supplierId}` : ""}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {tab === "ai" && (
            <div className="space-y-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-xl border border-[#BFDBFE] bg-white p-6 shadow-sm">
                  <h3 className="text-sm font-semibold text-[#1E1B4B]">AI Usage</h3>
                  <div className="mt-4 space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-[#64748B]">Total Requests</span>
                      <span className="font-medium">{aiUsage?.totalRequests ?? 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-[#64748B]">Tokens Used</span>
                      <span className="font-medium">{aiUsage?.tokensUsed ?? 0}</span>
                    </div>
                  </div>
                </div>
                <div className="rounded-xl border border-[#BFDBFE] bg-white p-6 shadow-sm">
                  <h3 className="text-sm font-semibold text-[#1E1B4B]">Matching</h3>
                  <button
                    onClick={() => triggerMatching({})}
                    className="mt-4 w-full rounded-lg bg-[#201C44] py-2 text-sm text-white transition hover:bg-[#151238]"
                  >
                    Trigger Manual Matching
                  </button>
                </div>
              </div>

              <div className="rounded-xl border border-[#BFDBFE] bg-white shadow-sm">
                <div className="border-b border-[#E2E8F0] px-6 py-4">
                  <h2 className="text-lg font-semibold text-[#1E1B4B]">Matching Runs</h2>
                </div>
                <div className="divide-y divide-[#F1F5F9]">
                  {matchingRuns.map((run) => (
                    <div key={run.id} className="flex items-center justify-between px-6 py-4">
                      <div>
                        <p className="text-sm font-medium text-[#1E1B4B]">Run {run.id.slice(-6)}</p>
                        <p className="text-xs text-[#94A3B8]">Status: {run.status} · Job: {run.jobId}</p>
                      </div>
                      <span className="rounded-full bg-blue-50 px-2 py-1 text-xs text-blue-600">
                        {run.matchedSuppliersCount} Matches
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-xl border border-red-100 bg-white shadow-sm">
                <div className="border-b border-red-100 px-6 py-4">
                  <h2 className="text-lg font-semibold text-red-700">AI Failures</h2>
                </div>
                <div className="divide-y divide-[#F1F5F9]">
                  {aiFailures.map((f, i) => (
                    <div key={i} className="px-6 py-4">
                      <p className="text-sm text-red-600 font-mono break-all">{f.errorMessage || "Unknown error"}</p>
                      <p className="text-xs text-[#94A3B8]">{f.timestamp}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {tab === "taxonomy" && (
            <div className="rounded-xl border border-[#BFDBFE] bg-white shadow-sm">
              <div className="border-b border-[#E2E8F0] px-6 py-4 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-[#1E1B4B]">Categories</h2>
                <button className="text-sm text-[#0061A7] font-medium transition hover:underline">+ Add Category</button>
              </div>
              <div className="divide-y divide-[#F1F5F9]">
                {categories.map((c) => (
                  <div key={c.id} className="flex items-center justify-between px-6 py-4">
                    <p className="font-medium text-[#1E1B4B]">{c.name}</p>
                    <div className="flex gap-3">
                      <button className="text-xs text-[#64748B] transition hover:text-[#4721DF]">Edit</button>
                      <button className="text-xs text-red-600 transition hover:text-red-700">Delete</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}


          {metrics && (
            <div className="mt-6 rounded-xl border border-[#BFDBFE] bg-white p-6 shadow-sm">
              <h3 className="mb-4 text-sm font-semibold text-[#1E1B4B]">Automation Metrics</h3>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                <StatCard label="Total Rules" value={metrics.totalRules ?? 0} />
                <StatCard label="Active Rules" value={metrics.activeRules ?? 0} />
                <StatCard label="Total Runs" value={metrics.totalRuns ?? 0} />
                <StatCard label="Recent Runs" value={metrics.recentRuns ?? 0} />
              </div>
            </div>
          )}
        </div>

        {rejectingId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
            <div className="w-full max-w-[400px] rounded-2xl bg-white p-6 shadow-xl">
              <h3 className="text-lg font-semibold text-[#1E1B4B]">Reject Supplier</h3>
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Reason (optional)"
                rows={3}
                className="mt-3 w-full rounded-xl border border-[#E2E8F0] px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[#3B82F6]/30"
              />
              <div className="mt-4 flex justify-end gap-2">
                <button
                  onClick={() => { setRejectingId(null); setRejectReason(""); }}
                  className="rounded-lg border border-[#E2E8F0] px-4 py-2 text-sm text-[#64748B]"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    rejectSupplier({
                      id: rejectingId,
                      reason: rejectReason || undefined,
                      adminUserId: sessionUser?.id,
                    });
                    setRejectingId(null);
                    setRejectReason("");
                  }}
                  className="rounded-lg bg-red-600 px-4 py-2 text-sm text-white hover:bg-red-700"
                >
                  Reject
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
