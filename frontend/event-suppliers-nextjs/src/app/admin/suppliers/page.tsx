"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ProtectedRoute } from "@/shared/components/protected-route";
import { marketingPloniFont } from "@/shared/lib/marketing-typography";
import {
  useApproveSupplierMutation,
  useGetAdminIncompleteSuppliersQuery,
  useGetAdminSuppliersQuery,
  useRejectSupplierMutation,
} from "@/shared/api/api";
import { useAppSelector } from "@/store/hooks";

type UiStatusFilter = "all" | "approved" | "waiting" | "rejected";

function statusTone(approvalStatus: string): string {
  const u = approvalStatus.toUpperCase();
  if (u === "APPROVED") return "bg-[#DBFFDE] text-black";
  if (u === "REJECTED") return "bg-[#FFDAD6] text-[#93000A]";
  return "bg-[#E7E8E9] text-black";
}

function statusLabel(approvalStatus: string): string {
  const u = approvalStatus.toUpperCase();
  if (u === "APPROVED") return "approved";
  if (u === "REJECTED") return "rejected";
  return "waiting";
}

function matchesStatusFilter(approvalStatus: string, filter: UiStatusFilter): boolean {
  if (filter === "all") return true;
  const u = approvalStatus.toUpperCase();
  if (filter === "approved") return u === "APPROVED";
  if (filter === "rejected") return u === "REJECTED";
  return u !== "APPROVED" && u !== "REJECTED";
}

export default function AdminSuppliersPage() {
  const router = useRouter();
  const isAuthHydrated = useAppSelector((s) => s.auth.isHydrated);
  const sessionUser = useAppSelector((s) => s.auth.user);
  const shouldSkip = !isAuthHydrated || !sessionUser;

  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<UiStatusFilter>("all");
  const [search, setSearch] = useState("");
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState("");

  const {
    data: suppliers = [],
    isLoading: loadingSuppliers,
    isError: suppliersError,
    refetch,
  } = useGetAdminSuppliersQuery({ page: 1, limit: 200 }, { skip: shouldSkip });

  const { data: incompleteSuppliers = [], isLoading: loadingIncomplete } = useGetAdminIncompleteSuppliersQuery(
    { page: 1, limit: 200 },
    { skip: shouldSkip },
  );

  const [approveSupplier, { isLoading: approving }] = useApproveSupplierMutation();
  const [rejectSupplier, { isLoading: rejecting }] = useRejectSupplierMutation();

  const filteredRows = useMemo(() => {
    const q = search.trim().toLowerCase();
    return suppliers.filter((row) => {
      if (!matchesStatusFilter(row.approvalStatus, statusFilter)) return false;
      if (q && !row.businessName.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [suppliers, statusFilter, search]);

  const activeCount = useMemo(
    () => suppliers.filter((s) => s.approvalStatus.toUpperCase() === "APPROVED").length,
    [suppliers],
  );

  const awaitingCount = incompleteSuppliers.length;

  const downloadCsv = () => {
    const headers = ["id", "businessName", "approvalStatus"];
    const lines = filteredRows.map((r) => [r.id, r.businessName, r.approvalStatus].join(","));
    const blob = new Blob([headers.join(",") + "\n" + lines.join("\n")], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "suppliers.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const canModerate = (approvalStatus: string) => approvalStatus.toUpperCase() === "PENDING";

  return (
    <ProtectedRoute roles={["admin"]}>
      <section
        dir="ltr"
        className="relative mx-auto min-h-screen w-full overflow-x-hidden px-4 pb-14 pt-24 sm:px-6"
        style={{ fontFamily: marketingPloniFont }}
      >
        <div className="relative z-10 mx-auto flex w-full max-w-[1338px] flex-col gap-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-wrap items-center gap-3">
              <div className="grid h-[79px] w-[120px] place-items-center rounded-lg bg-[#D3E2F5] shadow-[0px_1px_2px_rgba(0,0,0,0.05)]">
                <div className="text-center">
                  <p className="text-3xl leading-8 text-black">{loadingIncomplete ? "…" : awaitingCount}</p>
                  <p className="text-[10px] uppercase tracking-[-0.5px] text-black">Awaiting approval</p>
                </div>
              </div>
              <div className="grid h-[79px] w-[120px] place-items-center rounded-lg bg-[#D3E2F5] shadow-[0px_1px_2px_rgba(0,0,0,0.05)]">
                <div className="text-center">
                  <p className="text-3xl leading-8 text-[#00113A]">{loadingSuppliers ? "…" : activeCount}</p>
                  <p className="text-[10px] uppercase tracking-[-0.5px] text-black">Active suppliers</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => router.push("/admin/suppliers/add")}
                className="h-12 min-w-[209px] cursor-pointer rounded-[99px] bg-[#00113A] px-6 text-center text-2xl leading-6 text-white"
              >
                Add a provider
              </button>
            </div>
            <div className="text-right lg:max-w-[420px]">
              <h1 className="text-4xl leading-tight tracking-[-1.2px] text-[#00113A] sm:text-[56px] sm:leading-[0.95] sm:tracking-[-1.8px]">
                Supplier management
              </h1>
              <p className="mt-2 text-xl leading-6 text-[#444650]">Supplier database management</p>
              <button
                type="button"
                onClick={downloadCsv}
                className="mt-2 inline-flex cursor-pointer items-center gap-2 text-sm text-[#0061A7]"
              >
                <span aria-hidden>●</span>
                Export to Excel
              </button>
            </div>
          </div>

          {suppliersError ? (
            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
              Could not load suppliers.{" "}
              <button type="button" className="underline" onClick={() => refetch()}>
                Retry
              </button>
            </div>
          ) : null}

          <div className="mt-1 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <button
              type="button"
              onClick={() => setAdvancedOpen((o) => !o)}
              aria-expanded={advancedOpen}
              className="inline-flex w-fit cursor-pointer items-center gap-2 text-[12px] uppercase tracking-[1.2px] text-[#00113A]"
            >
              Advanced filtering
              <span aria-hidden className="text-[#00113A]">
                ▾
              </span>
            </button>
            <div className="flex flex-wrap items-center gap-3">
              <label className="sr-only" htmlFor="supplier-search">
                Search
              </label>
              <input
                id="supplier-search"
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search business name"
                className="h-9 min-w-[180px] rounded-md border border-black/10 bg-white px-3 text-sm text-[#191C1D] outline-none focus:ring-2 focus:ring-[#4721DF]/30"
              />
              <span className="text-sm text-[#00113A]">Filter by:</span>
              <label className="sr-only" htmlFor="filter-status">
                Status
              </label>
              <select
                id="filter-status"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as UiStatusFilter)}
                className="h-9 min-w-[126px] cursor-pointer appearance-none rounded-none border-0 border-b border-[rgba(197,198,210,0.1)] bg-[#D3E2F5] px-3 pr-8 text-sm text-[#191C1D] outline-none focus:ring-2 focus:ring-[#4721DF]/30"
              >
                <option value="all">Status (all)</option>
                <option value="approved">approved</option>
                <option value="waiting">waiting</option>
                <option value="rejected">rejected</option>
              </select>
            </div>
          </div>

          {advancedOpen ? (
            <div className="rounded-lg border border-[#4721DF]/20 bg-[#D3E2F5]/40 p-4 text-sm text-[#00113A]">
              <p className="font-medium">Advanced filters</p>
              <p className="mt-1 text-[#444650]">
                Region and category filters will apply when the admin suppliers API returns those fields (see public{" "}
                <code className="rounded bg-white/80 px-1">GET /v1/suppliers</code> query params in the API docs).
              </p>
            </div>
          ) : null}

          <div className="mt-2 overflow-x-auto rounded-xl bg-[rgba(237,245,255,0.41)] pb-1">
            <table className="min-w-[900px] table-fixed text-left lg:min-w-[1100px]">
              <thead className="bg-[#D3E2F5]">
                <tr className="h-14 border-b border-black/10 text-sm uppercase tracking-[0.6px] text-black">
                  <th className="w-[200px] px-4 text-center">Actions</th>
                  <th className="w-[120px] px-4">Status</th>
                  <th className="min-w-0 px-4">Business name</th>
                  <th className="w-[200px] px-4">Supplier id</th>
                </tr>
              </thead>
              <tbody className="text-black">
                {loadingSuppliers ? (
                  <tr>
                    <td colSpan={4} className="py-12 text-center text-sm text-[#444650]">
                      Loading suppliers…
                    </td>
                  </tr>
                ) : filteredRows.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-12 text-center text-sm text-[#444650]">
                      No suppliers match the current filters.
                    </td>
                  </tr>
                ) : (
                  filteredRows.map((row) => (
                    <tr key={row.id} className="h-[103px] border-y border-[#4721DF] text-[11px]">
                      <td className="px-3 align-middle">
                        <div className="flex flex-wrap items-center justify-center gap-2">
                          <button
                            type="button"
                            onClick={() => router.push(`/marketplace/${row.id}`)}
                            className="grid size-[27px] cursor-pointer place-items-center rounded bg-[#EDEEEF] text-[#0061A7]"
                            title="View public profile"
                          >
                            ✎
                          </button>
                          {canModerate(row.approvalStatus) ? (
                            <>
                              <button
                                type="button"
                                onClick={() => setRejectingId(row.id)}
                                disabled={rejecting || approving}
                                className="cursor-pointer rounded bg-[#FFDAD6] px-3 py-1 text-[10px] uppercase text-[#93000A] disabled:opacity-50"
                              >
                                Reject
                              </button>
                              <button
                                type="button"
                                onClick={() => approveSupplier(row.id)}
                                disabled={rejecting || approving}
                                className="cursor-pointer rounded bg-[#00113A] px-3 py-1 text-[10px] uppercase text-white disabled:opacity-50"
                              >
                                Approve
                              </button>
                            </>
                          ) : null}
                        </div>
                      </td>
                      <td className="px-3 align-middle">
                        <span className={`inline-flex rounded-xl px-3 py-1 text-[10px] ${statusTone(row.approvalStatus)}`}>
                          {statusLabel(row.approvalStatus)}
                        </span>
                        <div className="mt-1 text-[10px] text-[#64748B]">{row.approvalStatus}</div>
                      </td>
                      <td className="px-3 align-middle">
                        <div className="text-base leading-5 text-[#00113A]">{row.businessName}</div>
                      </td>
                      <td className="px-3 align-middle font-mono text-[11px] text-[#444650]">{row.id}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {rejectingId ? (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
            <div className="w-full max-w-[400px] rounded-2xl bg-white p-6 shadow-xl">
              <h3 className="text-lg font-semibold text-[#1E1B4B]">Reject supplier</h3>
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Reason (optional)"
                rows={3}
                className="mt-3 w-full rounded-xl border border-[#E2E8F0] px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[#3B82F6]/30"
              />
              <div className="mt-4 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setRejectingId(null);
                    setRejectReason("");
                  }}
                  className="rounded-lg border border-[#E2E8F0] px-4 py-2 text-sm text-[#64748B]"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    rejectSupplier({
                      id: rejectingId,
                      reason: rejectReason || undefined,
                      adminUserId: sessionUser?.id,
                    });
                    setRejectingId(null);
                    setRejectReason("");
                  }}
                  disabled={rejecting}
                  className="rounded-lg bg-red-600 px-4 py-2 text-sm text-white hover:bg-red-700 disabled:opacity-50"
                >
                  Reject
                </button>
              </div>
            </div>
          </div>
        ) : null}
      </section>
    </ProtectedRoute>
  );
}
