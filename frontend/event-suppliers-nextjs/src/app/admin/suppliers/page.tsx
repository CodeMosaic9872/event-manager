"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ProtectedRoute } from "@/shared/components/protected-route";
import { marketingPloniFont } from "@/shared/lib/marketing-typography";
import type { AdminSupplierListItem, AdminSupplierListQueryParams } from "@/shared/api/endpoints/admin-endpoints";
import {
  useApproveSupplierMutation,
  useDeleteAdminSupplierMutation,
  useGetAdminSupplierFilterOptionsQuery,
  useGetAdminSupplierStatsQuery,
  useGetAdminSuppliersQuery,
  useLazyGetAdminSuppliersExportQuery,
  useRejectSupplierMutation,
} from "@/shared/api/api";
import { useAppSelector } from "@/store/hooks";

type UiStatusFilter = AdminSupplierListQueryParams["status"];

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
  if (u === "PENDING") return "waiting";
  return u.toLowerCase();
}

function formatServiceArea(key: string): string {
  const labels: Record<string, string> = {
    north: "North",
    south: "South",
    center: "Center",
    jerusalem: "Jerusalem",
  };
  return labels[key] ?? key;
}

export default function AdminSuppliersPage() {
  const router = useRouter();
  const isAuthHydrated = useAppSelector((s) => s.auth.isHydrated);
  const sessionUser = useAppSelector((s) => s.auth.user);
  const shouldSkip = !isAuthHydrated || !sessionUser;

  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<UiStatusFilter>("all");
  const [categoryId, setCategoryId] = useState("");
  const [serviceArea, setServiceArea] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [accumulated, setAccumulated] = useState<AdminSupplierListItem[]>([]);
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState("");

  const listParams = useMemo<AdminSupplierListQueryParams>(
    () => ({
      page,
      limit: 50,
      q: search.trim() || undefined,
      status: statusFilter,
      categoryId: categoryId || undefined,
      serviceArea: serviceArea || undefined,
    }),
    [page, search, statusFilter, categoryId, serviceArea],
  );

  const {
    data: suppliersPage,
    isLoading: loadingSuppliers,
    isFetching,
    isError: suppliersError,
    refetch,
  } = useGetAdminSuppliersQuery(listParams, { skip: shouldSkip });

  const { data: stats } = useGetAdminSupplierStatsQuery(undefined, { skip: shouldSkip });
  const { data: filterOptions } = useGetAdminSupplierFilterOptionsQuery(undefined, { skip: shouldSkip });

  const [approveSupplier, { isLoading: approving }] = useApproveSupplierMutation();
  const [rejectSupplier, { isLoading: rejecting }] = useRejectSupplierMutation();
  const [deleteSupplier, { isLoading: deleting }] = useDeleteAdminSupplierMutation();
  const [triggerExport, { isFetching: exporting }] = useLazyGetAdminSuppliersExportQuery();

  const totalItems = suppliersPage?.totalItems ?? 0;

  useEffect(() => {
    if (!suppliersPage?.items) return;
    setAccumulated((prev) => (page === 1 ? suppliersPage.items : [...prev, ...suppliersPage.items]));
  }, [suppliersPage, page]);

  useEffect(() => {
    setPage(1);
    setAccumulated([]);
  }, [search, statusFilter, categoryId, serviceArea]);

  const hasMore = accumulated.length < totalItems;

  const downloadExport = async () => {
    const result = await triggerExport({
      ...listParams,
      page: 1,
      limit: 5000,
    }).unwrap();
    if (!result?.csv) return;
    const blob = new Blob([result.csv], { type: result.contentType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = result.filename;
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
                  <p className="text-3xl leading-8 text-black">{stats?.pendingApproval ?? "…"}</p>
                  <p className="text-[10px] uppercase tracking-[-0.5px] text-black">Awaiting approval</p>
                </div>
              </div>
              <div className="grid h-[79px] w-[120px] place-items-center rounded-lg bg-[#D3E2F5] shadow-[0px_1px_2px_rgba(0,0,0,0.05)]">
                <div className="text-center">
                  <p className="text-3xl leading-8 text-[#00113A]">{stats?.activeSuppliers ?? "…"}</p>
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
                onClick={downloadExport}
                disabled={exporting}
                className="mt-2 inline-flex cursor-pointer items-center gap-2 text-sm text-[#0061A7] disabled:opacity-50"
              >
                <span aria-hidden>●</span>
                {exporting ? "Exporting…" : "Export to Excel"}
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
              Advanced filtering <span aria-hidden>▾</span>
            </button>
            <div className="flex flex-wrap items-center gap-3">
              <input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search business name"
                className="h-9 min-w-[180px] rounded-md border border-black/10 bg-white px-3 text-sm outline-none focus:ring-2 focus:ring-[#4721DF]/30"
              />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as UiStatusFilter)}
                className="h-9 min-w-[126px] cursor-pointer bg-[#D3E2F5] px-3 text-sm"
              >
                <option value="all">Status (all)</option>
                <option value="approved">approved</option>
                <option value="waiting">waiting</option>
                <option value="pending">pending</option>
                <option value="rejected">rejected</option>
              </select>
            </div>
          </div>

          {advancedOpen ? (
            <div className="flex flex-wrap gap-3 rounded-lg border border-[#4721DF]/20 bg-[#D3E2F5]/40 p-4">
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="h-9 min-w-[160px] bg-white px-3 text-sm"
              >
                <option value="">All categories</option>
                {filterOptions?.categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nameEn ?? c.name}
                  </option>
                ))}
              </select>
              <select
                value={serviceArea}
                onChange={(e) => setServiceArea(e.target.value)}
                className="h-9 min-w-[140px] bg-white px-3 text-sm"
              >
                <option value="">All regions</option>
                {filterOptions?.serviceAreas.map((area) => (
                  <option key={area} value={area}>
                    {formatServiceArea(area)}
                  </option>
                ))}
              </select>
            </div>
          ) : null}

          <div className="mt-2 overflow-x-auto rounded-xl bg-[rgba(237,245,255,0.41)] pb-1">
            <table className="min-w-[1100px] w-full table-fixed text-left">
              <thead className="bg-[#D3E2F5]">
                <tr className="h-14 border-b border-black/10 text-xs uppercase text-black">
                  <th className="w-[140px] px-3 text-center">Actions</th>
                  <th className="w-[90px] px-3">Status</th>
                  <th className="min-w-[160px] px-3">Business name</th>
                  <th className="w-[140px] px-3">Category & location</th>
                  <th className="w-[130px] px-3">Contact</th>
                  <th className="min-w-[180px] px-3">Description</th>
                  <th className="w-[120px] px-3">Labels</th>
                </tr>
              </thead>
              <tbody>
                {loadingSuppliers && page === 1 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-sm text-[#444650]">
                      Loading suppliers…
                    </td>
                  </tr>
                ) : accumulated.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-sm text-[#444650]">
                      No suppliers match the current filters.
                    </td>
                  </tr>
                ) : (
                  accumulated.map((row) => (
                    <tr key={row.id} className="border-y border-[#4721DF] text-[11px] align-top">
                      <td className="px-2 py-3">
                        <div className="flex flex-wrap justify-center gap-1">
                          <button
                            type="button"
                            onClick={() => router.push(`/marketplace/${row.slug}`)}
                            className="rounded bg-[#EDEEEF] px-2 py-1 text-[10px] text-[#0061A7]"
                          >
                            View
                          </button>
                          {canModerate(row.approvalStatus) ? (
                            <>
                              <button
                                type="button"
                                onClick={() => approveSupplier(row.id)}
                                disabled={approving || rejecting}
                                className="rounded bg-[#00113A] px-2 py-1 text-[10px] text-white disabled:opacity-50"
                              >
                                Approve
                              </button>
                              <button
                                type="button"
                                onClick={() => setRejectingId(row.id)}
                                disabled={approving || rejecting}
                                className="rounded bg-[#FFDAD6] px-2 py-1 text-[10px] text-[#93000A]"
                              >
                                Reject
                              </button>
                            </>
                          ) : null}
                          <button
                            type="button"
                            onClick={() => {
                              if (window.confirm(`Delete ${row.businessName}?`)) deleteSupplier(row.id);
                            }}
                            disabled={deleting}
                            className="rounded border border-rose-200 px-2 py-1 text-[10px] text-rose-700"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                      <td className="px-3 py-3">
                        <span className={`inline-flex rounded-xl px-2 py-1 text-[10px] ${statusTone(row.approvalStatus)}`}>
                          {statusLabel(row.approvalStatus)}
                        </span>
                      </td>
                      <td className="px-3 py-3">
                        <div className="text-sm font-medium text-[#00113A]">{row.businessName}</div>
                        {row.city ? <div className="text-[10px] text-[#64748B]">{row.city}</div> : null}
                      </td>
                      <td className="px-3 py-3">
                        <div className="flex flex-wrap gap-1">
                          {row.categories.slice(0, 2).map((c) => (
                            <span key={c.id} className="rounded bg-white/80 px-1.5 py-0.5 text-[10px]">
                              {c.nameEn ?? c.name}
                            </span>
                          ))}
                        </div>
                        <div className="mt-1 flex flex-wrap gap-1">
                          {row.serviceAreas.slice(0, 2).map((area) => (
                            <span key={area} className="rounded bg-[#6AB7FF]/30 px-1.5 py-0.5 text-[10px]">
                              {formatServiceArea(area)}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="px-3 py-3">
                        {row.contactEmail ? <div className="truncate">{row.contactEmail}</div> : null}
                        {row.publicPhone ? <div>{row.publicPhone}</div> : null}
                      </td>
                      <td className="px-3 py-3">
                        <p className="line-clamp-3 text-[10px] text-[#444650]">{row.description ?? "—"}</p>
                        {row.address ? <p className="mt-1 text-[10px] text-[#64748B]">{row.address}</p> : null}
                      </td>
                      <td className="px-3 py-3">
                        <div className="flex flex-wrap gap-1">
                          {row.labels.slice(0, 4).map((label) => (
                            <span key={label} className="rounded bg-white/90 px-1.5 py-0.5 text-[10px]">
                              {label}
                            </span>
                          ))}
                        </div>
                        {row.websiteUrl ? (
                          <a href={row.websiteUrl} target="_blank" rel="noreferrer" className="mt-1 block truncate text-[10px] text-[#0061A7]">
                            {row.websiteUrl}
                          </a>
                        ) : null}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {hasMore ? (
            <div className="flex justify-center">
              <button
                type="button"
                onClick={() => setPage((p) => p + 1)}
                disabled={isFetching}
                className="text-sm text-[#0061A7] disabled:opacity-50"
              >
                {isFetching ? "Loading…" : "Load more suppliers…"}
              </button>
            </div>
          ) : null}
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
                className="mt-3 w-full rounded-xl border border-[#E2E8F0] px-4 py-3 text-sm"
              />
              <div className="mt-4 flex justify-end gap-2">
                <button type="button" onClick={() => { setRejectingId(null); setRejectReason(""); }} className="rounded-lg border px-4 py-2 text-sm">
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    rejectSupplier({ id: rejectingId, reason: rejectReason || undefined, adminUserId: sessionUser?.id });
                    setRejectingId(null);
                    setRejectReason("");
                  }}
                  disabled={rejecting}
                  className="rounded-lg bg-red-600 px-4 py-2 text-sm text-white disabled:opacity-50"
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