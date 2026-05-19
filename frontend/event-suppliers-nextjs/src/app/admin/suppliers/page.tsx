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
import Image from "next/image";

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

function createLabelPalette() {
  const palettes = [
    { bg: "bg-[#E8F5E9]", text: "text-[#2E7D32]" },
    { bg: "bg-[#D2E4FF]", text: "text-[#00487F]" },
    { bg: "bg-[#FCE4EC]", text: "text-[#C62828]" },
    { bg: "bg-[#FFF3E0]", text: "text-[#E65100]" },
    { bg: "bg-[#F3E5F5]", text: "text-[#6A1B9A]" },
  ];
  let i = 0;
  const used = new Map<string, { bg: string; text: string }>();
  return (key: string) => {
    if (!used.has(key)) {
      used.set(key, palettes[i % palettes.length]);
      i++;
    }
    return used.get(key)!;
  };
}

const getLabelColors = createLabelPalette();

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
  } = useGetAdminSuppliersQuery(listParams, { skip: shouldSkip, refetchOnMountOrArgChange: true });

  const { data: stats, refetch: refetchStats } = useGetAdminSupplierStatsQuery(undefined, { skip: shouldSkip, refetchOnMountOrArgChange: true });
  const { data: filterOptions, refetch: refetchFilters } = useGetAdminSupplierFilterOptionsQuery(undefined, { skip: shouldSkip, refetchOnMountOrArgChange: true });

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
        dir="rtl"
        className="relative mx-auto min-h-screen w-full overflow-x-hidden px-4 pb-14 pt-[152px] sm:px-6"
        style={{ fontFamily: marketingPloniFont }}
      >
        <div className="relative z-10 mx-auto flex w-full max-w-[1339px] flex-col gap-5">

          {/* Hero Section */}
          <div className="relative flex h-[79px] items-start justify-between">
            <div className="flex flex-col items-start gap-2">
              <h1 className="text-[36px] leading-[40px] tracking-[-1.8px] font-bold text-[#00113A]">
                ניהול ספקים
              </h1>
              <p className="text-base leading-6 font-normal text-[#444650]">ניהול מאגר ספקים</p>
            </div>

            <div className="flex items-start gap-3">
              <button
                type="button"
                onClick={() => router.push("/admin/suppliers/add")}
                className="font-bold h-12 min-w-[209px] cursor-pointer self-center rounded-[99px] bg-[#00113A] px-6 text-center text-2xl leading-6 text-white"
              >
                הוספת ספק
              </button>
              <div className="flex h-[79px] w-[120px] min-w-[120px] flex-col items-center justify-center rounded-lg bg-[#D3E2F5] shadow-[0px_1px_2px_rgba(0,0,0,0.05)]">
                <p className="text-2xl leading-8 font-bold text-[#00113A]">{stats?.activeSuppliers ?? "…"}</p>
                <p className="text-[10px] leading-[15px] tracking-[-0.5px] uppercase text-black">ספקים פעילים</p>
              </div>
              <div className="flex h-[79px] w-[120px] min-w-[120px] flex-col items-center justify-center rounded-lg bg-[#D3E2F5] shadow-[0px_1px_2px_rgba(0,0,0,0.05)]">
                <p className="text-2xl leading-8 font-bold text-black">{stats?.pendingApproval ?? "…"}</p>
                <p className="text-[10px] leading-[15px] tracking-[-0.5px] uppercase text-black">ממתינים לאישור</p>
              </div>
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

          {/* Export button */}
          <div className="flex justify-start">
            <button
              type="button"
              onClick={downloadExport}
              disabled={exporting}
              className="inline-flex cursor-pointer items-center gap-2 text-sm font-bold leading-5 text-[#0061A7] disabled:opacity-50"
            >
              {exporting ? "בעיצוב..." : "ייצוא לאקסל"}
              <Image src="/icons/left_arrow.svg" alt="download" width={10} height={10} />
            </button>
          </div>

          {/* Filters Bar */}
          <div className="flex flex-row items-center justify-center gap-4 pt-0">
            <div className="flex flex-row items-center gap-4">
              <span className="text-sm leading-5 font-bold text-[#00113A]">סינון לפי:</span>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="h-9 w-[136px] cursor-pointer bg-[#D3E2F5] border-b border-[#197,198,210]/10 text-sm leading-5 text-[#191C1D]"
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
                className="h-9 w-[136px] cursor-pointer bg-[#D3E2F5] border-b border-[#197,198,210]/10 text-sm leading-5 text-[#191C1D]"
              >
                <option value="">כל האזורים</option>
                {filterOptions?.serviceAreas.map((area) => (
                  <option key={area} value={area}>
                    {formatServiceArea(area)}
                  </option>
                ))}
              </select>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as UiStatusFilter)}
                className="h-9 w-[136px] cursor-pointer bg-[#D3E2F5] border-b border-[#197,198,210]/10 text-sm leading-5 text-[#191C1D]"
              >
                <option value="all">סטטוס (הכל)</option>
                <option value="approved">אושר</option>
                <option value="waiting">ממתין</option>
                <option value="pending">בהמתנה</option>
                <option value="rejected">נדחה</option>
              </select>
            </div>

            <div className="flex-1">
              <input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="חפש לפי שם העסק"
                className="h-9 w-[180px] rounded-md border border-black/10 bg-white px-3 text-sm outline-none focus:ring-2 focus:ring-[#4721DF]/30"
              />
            </div>
          </div>

          {/* Suppliers Table */}
          <div className="overflow-x-auto rounded-xl bg-[rgba(237,245,255,0.41)] pb-1" style={{ marginTop: 42 }}>
            <table className="min-w-[1500px] w-full table-fixed text-right">
              <thead className="bg-[#D3E2F5]">
                <tr className="h-[57px] border-b border-[#197,198,210]/10 text-sm leading-4 tracking-[0.6px] font-bold uppercase text-black">
                  <th className="w-[166px] px-6 py-5">שם העסק</th>
                  <th className="w-[87px] px-4 py-5">סטטוס</th>
                  <th className="w-[131px] px-4 py-5">קטגוריה &amp; מיקום</th>
                  <th className="w-[119px] px-4 py-5">פרטי התקשרות</th>
                  <th className="w-[194px] px-4 py-5">תיאור</th>
                  <th className="w-[89px] px-4 py-5">כתובת</th>
                  <th className="w-[85px] px-4 py-5">לייבלים</th>
                  <th className="w-[127px] px-4 py-5">רשתות חברתיות</th>
                  <th className="w-[137px] px-6 py-5 text-center">פעולות</th>
                </tr>
              </thead>
              <tbody>
                {loadingSuppliers && page === 1 ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i} className="border border-[#4721DF]/30 animate-pulse">
                      <td className="px-6 py-5"><div className="h-5 w-24 rounded bg-[#D3E2F5]" /></td>
                      <td className="px-4 py-5"><div className="h-5 w-16 rounded-xl bg-[#D3E2F5]" /></td>
                      <td className="px-4 py-5"><div className="h-4 w-16 rounded bg-[#D3E2F5]" /></td>
                      <td className="px-4 py-5"><div className="h-4 w-20 rounded bg-[#D3E2F5]" /></td>
                      <td className="px-4 py-5"><div className="h-4 w-32 rounded bg-[#D3E2F5]" /></td>
                      <td className="px-4 py-5"><div className="h-4 w-24 rounded bg-[#D3E2F5]" /></td>
                      <td className="px-4 py-5"><div className="h-4 w-12 rounded bg-[#D3E2F5]" /></td>
                      <td className="px-4 py-5"><div className="h-4 w-20 rounded bg-[#D3E2F5]" /></td>
                      <td className="px-2 py-5"><div className="h-6 w-16 rounded bg-[#D3E2F5]" /></td>
                    </tr>
                  ))
                ) : accumulated.length === 0 && !isFetching ? (
                  <tr>
                    <td colSpan={9} className="py-12 text-center text-sm text-[#444650]">
                      אין ספקים תואמים לסינוני הנוכחיים.
                    </td>
                  </tr>
                ) : (
                  accumulated.map((row) => (
                    <tr key={row.id} className="border border-[#4721DF] text-[11px] align-middle">
                      {/* Business Name */}
                      <td className="px-6 py-3">
                        <div className="text-base leading-6 font-bold text-[#00113A]">{row.businessName}</div>
                        {row.city ? <div className="text-[11px] leading-4 font-normal text-black">{row.city}</div> : null}
                      </td>
                      {/* Status */}
                      <td className="px-4 py-3">
                        <span className={`inline-flex rounded-xl px-3 py-1 text-[10px] leading-[15px] font-bold ${statusTone(row.approvalStatus)}`}>
                          {statusLabel(row.approvalStatus)}
                        </span>
                      </td>
                      {/* Category & Location */}
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-1">
                          {row.categories.slice(0, 2).map((c) => (
                            <span key={c.id} className="rounded-md bg-[#CDE5FF] px-2 py-[3.5px] text-xs leading-4 font-normal text-[#004B74]">
                              {c.nameEn ?? c.name}
                            </span>
                          ))}
                          {row.serviceAreas.slice(0, 2).map((area) => (
                            <span key={area} className="text-[11px] leading-4 font-normal">
                              {`אזור: ${formatServiceArea(area)}`}
                            </span>
                          ))}
                        </div>
                      </td>
                      {/* Contact Info */}
                      <td className="px-4 py-3">
                        {row.contactEmail ? <div className="text-xs leading-4 font-medium text-black">{row.contactEmail}</div> : null}
                        {row.publicPhone ? <div className="text-[11px] leading-4 font-normal text-black">{row.publicPhone}</div> : null}
                      </td>
                      {/* Description */}
                      <td className="px-4 py-3">
                        <p className="line-clamp-3 text-[11px] leading-[18px] font-normal text-black">{row.description ?? "—"}</p>
                      </td>
                      {/* Address */}
                      <td className="px-4 py-3">
                        {row.address ? (
                          <p className="text-[11px] leading-4 font-normal text-black">{row.address}</p>
                        ) : null}
                      </td>
                      {/* Labels */}
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-2">
                          {row.labels.slice(0, 4).map((label) => {
                            const c = getLabelColors(label);
                            return (
                              <span key={label} className={`rounded-xl px-2 py-0.5 text-[10px] leading-[15px] font-bold ${c.bg} ${c.text}`}>
                                {label}
                              </span>
                            );
                          })}
                        </div>
                      </td>
                      {/* Social Networks */}
                      <td className="px-4 py-3">
                        {row.websiteUrl ? (
                          <a href={row.websiteUrl} target="_blank" rel="noreferrer" className="block text-xs leading-[18px] text-black">
                            {row.websiteUrl}
                          </a>
                        ) : null}
                      </td>
                      {/* Actions */}
                      <td className="px-2 py-3">
                        <div className="flex flex-wrap justify-center gap-2">
                          <button
                            type="button"
                            onClick={() => router.push(`/marketplace/${row.slug}`)}
                            className="rounded bg-[#00113A] px-3 py-[6px] text-[10px] leading-[15px] font-bold uppercase text-white"
                          >
                            צפה
                          </button>
                          {canModerate(row.approvalStatus) ? (
                            <>
                              <button
                                type="button"
                                onClick={() => approveSupplier(row.id)}
                                disabled={approving || rejecting}
                                className="rounded bg-[#00113A] px-3 py-[6px] text-[10px] leading-[15px] font-bold uppercase text-white disabled:opacity-50"
                              >
                                אישור
                              </button>
                              <button
                                type="button"
                                onClick={() => setRejectingId(row.id)}
                                disabled={approving || rejecting}
                                className="rounded bg-[#FFDAD6] px-3 py-[6px] text-[10px] leading-[15px] font-bold uppercase text-[#93000A]"
                              >
                                ביטול
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
                    </tr>
                  ))
                )}
                {/* Load More as table row */}
                {hasMore && accumulated.length > 0 ? (
                  <tr className="border-t border-black/5 opacity-50">
                    <td colSpan={9} className="py-6 text-center">
                      <button
                        type="button"
                        onClick={() => setPage((p) => p + 1)}
                        disabled={isFetching}
                        className="text-xs leading-4 text-black disabled:opacity-50"
                      >
                        {isFetching ? "טוען..." : "טעינת ספקים נוספים..."}
                      </button>
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </div>

        {/* Reject Modal */}
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
