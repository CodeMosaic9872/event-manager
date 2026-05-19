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
  if (u === "APPROVED") return "מאושר";
  if (u === "REJECTED") return "נדחה";
  if (u === "PENDING") return "ממתין";
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
                  <p className="text-2xl leading-8 font-bold text-black">{stats?.pendingApproval ?? "…"}</p>
                  <p className="text-[10px] uppercase tracking-[-0.5px] text-black">ממתינים לאישור</p>
                </div>
              </div>
              <div className="grid h-[79px] w-[120px] place-items-center rounded-lg bg-[#D3E2F5] shadow-[0px_1px_2px_rgba(0,0,0,0.05)]">
                <div className="text-center">
                  <p className="text-2xl leading-8 font-bold text-[#00113A]">{stats?.activeSuppliers ?? "…"}</p>
                  <p className="text-[10px] uppercase tracking-[-0.5px] text-black">ספקים פעילים</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => router.push("/admin/suppliers/add")}
                className="h-12 min-w-[209px] cursor-pointer rounded-[99px] bg-[#00113A] px-6 text-center text-2xl leading-6 text-white"
              >
                הוספת ספק
              </button>
            </div>
            <div className="text-right lg:max-w-[420px]">
              <h1 className="text-[36px] leading-[40px] tracking-[-1.8px] font-bold text-[#00113A]">
                ניהול ספקים
              </h1>
              <p className="mt-2 text-base leading-6 font-normal text-[#444650]">ניהול מאגר ספקים</p>
              <button
                type="button"
                onClick={downloadExport}
                disabled={exporting}
                className="mt-2 inline-flex cursor-pointer items-center gap-2 text-sm text-[#0061A7] disabled:opacity-50"
              >
                <span aria-hidden>●</span>
                {exporting ? "בעיצוב..." : "ייצוא לאקסל"}
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
              className="inline-flex w-fit cursor-pointer items-center gap-2 text-[12px] leading-4 font-bold uppercase tracking-[1.2px] text-[#00113A]"
            >
              סינון מתקדם <span aria-hidden>▾</span>
            </button>
            <div className="flex flex-wrap items-center gap-3">
              <input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="חפש לפי שם העסק"
                className="h-9 min-w-[180px] rounded-md border border-black/10 bg-white px-3 text-sm outline-none focus:ring-2 focus:ring-[#4721DF]/30"
              />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as UiStatusFilter)}
                className="h-9 min-w-[126px] cursor-pointer bg-[#D3E2F5] px-3 text-sm leading-5 text-[#191C1D]"
              >
                <option value="all">סטטוס (הכל)</option>
                <option value="approved">אושר</option>
                <option value="waiting">ממתין</option>
                <option value="pending">בהמתנה</option>
                <option value="rejected">נדחה</option>
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
                <option value="">כל הקטגוריות</option>
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
                <option value="">כל האזורים</option>
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
                <tr className="h-14 border-b border-black/10 text-sm leading-4 tracking-[0.6px] font-bold uppercase text-black">
                  <th className="w-[137px] px-3 text-center">פעולות</th>
                  <th className="w-[87px] px-3">סטטוס</th>
                  <th className="w-[166px] px-3">שם העסק</th>
                  <th className="w-[131px] px-3">קטגוריה &amp; מיקום</th>
                  <th className="w-[119px] px-3">פרטי התקשרות</th>
                  <th className="w-[194px] px-3">תיאור</th>
                  <th className="w-[127px] px-3">לייבלים</th>
                </tr>
              </thead>
              <tbody>
                {loadingSuppliers && page === 1 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-sm text-[#444650]">
                      טוען ספקים…
                    </td>
                  </tr>
                ) : accumulated.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-sm text-[#444650]">
                      אין ספקים תואמים לסינוני הנוכחיים.
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
                            className="rounded bg-[#EDEEEF] px-[6px] py-[6px] text-[10px] leading-[15px] font-bold text-[#0061A7]"
                          >
                            צפה
                          </button>
                          {canModerate(row.approvalStatus) ? (
                            <>
                              <button
                                type="button"
                                onClick={() => approveSupplier(row.id)}
                                disabled={approving || rejecting}
                                className="rounded bg-[#00113A] px-3 py-[6px] text-[10px] leading-[15px] font-bold text-white disabled:opacity-50"
                              >
                                אישור
                              </button>
                              <button
                                type="button"
                                onClick={() => setRejectingId(row.id)}
                                disabled={approving || rejecting}
                                className="rounded bg-[#FFDAD6] px-3 py-[6px] text-[10px] leading-[15px] font-bold text-[#93000A]"
                              >
                                דחיה
                              </button>
                            </>
                          ) : null}
                          <button
                            type="button"
                            onClick={() => {
                              if (window.confirm(`Delete ${row.businessName}?`)) deleteSupplier(row.id);
                            }}
                            disabled={deleting}
                            className="rounded border border-rose-200 px-3 py-[6px] text-[10px] leading-[15px] text-rose-700"
                          >
                            מחיקה
                          </button>
                        </div>
                      </td>
                      <td className="px-3 py-3">
                        <span className={`inline-flex rounded-xl px-2 py-1 text-[10px] ${statusTone(row.approvalStatus)}`}>
                          {statusLabel(row.approvalStatus)}
                        </span>
                      </td>
                      <td className="px-3 py-3">
                        <div className="text-base font-bold text-[#00113A]">{row.businessName}</div>
                        {row.city ? <div className="text-[11px] leading-4 font-normal text-black">{row.city}</div> : null}
                      </td>
                      <td className="px-3 py-3">
                        <div className="flex flex-wrap gap-1">
                          {row.categories.slice(0, 2).map((c) => (
                            <span key={c.id} className="rounded bg-[#CDE5FF] px-2 py-[3.5px] text-xs leading-4 font-normal text-[#004B74]">
                              {c.nameEn ?? c.name}
                            </span>
                          ))}
                        </div>
                        <div className="mt-1 flex flex-wrap gap-1">
                          {row.serviceAreas.slice(0, 2).map((area) => (
                            <span key={area} className="text-[11px] leading-4 font-normal">
                              {formatServiceArea(area)}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="px-3 py-3">
                        {row.contactEmail ? <div className="text-xs font-medium">{row.contactEmail}</div> : null}
                        {row.publicPhone ? <div className="text-[11px] leading-4 font-normal">{row.publicPhone}</div> : null}
                      </td>
                      <td className="px-3 py-3">
                        <p className="line-clamp-3 text-[11px] leading-[18px] font-normal text-black">{row.description ?? "—"}</p>
                        {row.address ? <p className="mt-1 text-[11px] leading-4 font-normal text-black">{row.address}</p> : null}
                      </td>
                      <td className="px-3 py-3">
                        <div className="flex flex-wrap gap-1">
                          {row.labels.slice(0, 4).map((label) => (
                            <span key={label} className="rounded bg-white/90 px-2 py-0.5 text-[10px] leading-[15px] font-bold">
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
                {isFetching ? "טוען..." : "טען עוד ספקים..."}
              </button>
            </div>
          ) : null}
        </div>

        {rejectingId ? (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
            <div className="w-full max-w-[400px] rounded-2xl bg-white p-6 shadow-xl">
              <h3 className="text-lg font-semibold text-[#1E1B4B]">דחיית ספק</h3>
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="סיבה (אופציונלי)"
                rows={3}
                className="mt-3 w-full rounded-xl border border-[#E2E8F0] px-4 py-3 text-sm"
              />
              <div className="mt-4 flex justify-end gap-2">
                <button type="button" onClick={() => { setRejectingId(null); setRejectReason(""); }} className="rounded-lg border px-4 py-2 text-sm">
                  ביטול
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