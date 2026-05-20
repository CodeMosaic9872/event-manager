"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { ProtectedRoute } from "@/shared/components/protected-route";
import { marketingPloniFont } from "@/shared/lib/marketing-typography";
import {
  useGetAdminSuppliersQuery,
  useGetAdminUsersQuery,
  useGetAdminJobsQuery,
  useGetAdminIncompleteSuppliersQuery,
  useApproveSupplierMutation,
  useRejectSupplierMutation,
} from "@/shared/api/api";
import { useAppSelector } from "@/store/hooks";
import { useState } from "react";

const SUPPLIER_METRICS = [
  { month: 'יוני', total: 'סה"כ 124', metric: 'לחיצות טלפון', icon: '/icons/phone.svg' },
  { month: 'יוני', total: 'סה"כ 56', metric: 'שליחת הודעה', icon: '/icons/message.svg' },
  { month: 'יוני', total: 'סה"כ 456', metric: 'צפיות בפרופיל', icon: '/icons/eye.svg' },
  { month: 'יוני', total: 'סה"כ 21 (הכנסות ₪2,000)', metric: 'הצעות עבודה סגורות', icon: '/icons/cash.svg' },
];

export default function AdminPage() {
  const router = useRouter();
  const sessionUser = useAppSelector((s) => s.auth.user);
  const isAuthHydrated = useAppSelector((s) => s.auth.isHydrated);
  const skip = !isAuthHydrated || !sessionUser;

  const { data: allSuppliers } = useGetAdminSuppliersQuery({ page: 1, limit: 1000 }, { skip });
  const { data: allUsers = [] } = useGetAdminUsersQuery({ page: 1, limit: 1000 }, { skip });
  const { data: allJobs = [] } = useGetAdminJobsQuery({ page: 1, limit: 1000 }, { skip });
  const { data: pendingSuppliers = [], isLoading: loadingPending } = useGetAdminIncompleteSuppliersQuery({ page: 1, limit: 10 }, { skip });

  const [approveSupplier] = useApproveSupplierMutation();
  const [rejectSupplier] = useRejectSupplierMutation();

  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState("");

  const KPI_CARDS = [
    {
      title: 'סה"כ ספקים',
      value: (allSuppliers?.items?.length ?? 0).toLocaleString(),
      delta: 'רשומות פעילות',
      action: 'לצפייה בטבלת ספקים',
      icon: '/icons/total-suppliers.svg',
      href: '/admin/suppliers',
    },
    {
      title: 'סה"כ עבודות',
      value: allJobs.length.toLocaleString(),
      delta: 'מכרזים פעילים',
      action: "לצפייה בדוח המלא'",
      icon: '/icons/total-revenue.svg',
      href: '/admin/dashboard',
    },
    {
      title: 'ממתינים לאישור',
      value: pendingSuppliers.length.toString(),
      action: 'לצפייה בדוח מלא',
      icon: '/icons/pending-approvals.svg',
      href: '/admin/suppliers',
    },
    {
      title: 'משתמשים פעילים',
      value: allUsers.length.toLocaleString(),
      delta: 'חשבונות רשומים',
      action: 'ייצוא לאקסל',
      icon: '/icons/active-users.svg',
      href: '/admin/dashboard',
    },
  ];

  const onCardAction = (href: string) => {
    router.push(href);
  };

  const onQuickAction = (action: string) => {
    if (action === 'הוספת ספק') {
      router.push('/admin/suppliers');
      return;
    }
    if (action === "ניהול צ'אט AI") {
      router.push('/admin/dashboard?tab=ai');
      return;
    }
    if (action === 'הוספת דף קונספט') {
      router.push('/admin/concepts/add');
      return;
    }
    if (action === 'ניהול חבילות פרימיום') {
      router.push('/admin/premium-packages');
      return;
    }
    router.push('/admin');
  };

  return (
    <ProtectedRoute roles={["admin"]}>
      <section
        className="relative mx-auto min-h-screen w-full overflow-x-hidden px-4 pb-14 pt-24 sm:px-6"
        style={{ fontFamily: marketingPloniFont }}
        dir="rtl"
      >

        <div className="relative z-10 mx-auto flex w-full max-w-[1220px] flex-col gap-8">
          <div className="flex flex-col-reverse gap-6 lg:flex-row-reverse lg:items-center lg:justify-between">
            <div className="relative w-full max-w-[288px]">
              <input
                className="h-[42px] w-full rounded-xl border border-white/20 bg-black/5 px-4 pr-10 text-right text-sm"
                placeholder="חפש ספקים או אירועים..."
              />
              <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2">
                <Image src="/icons/search.svg" alt="search" width={18} height={18} />
              </span>
            </div>
            <div className="text-right">
              <h1 className="text-3xl leading-tight font-semibold text-black sm:text-[40px] sm:leading-10">בוקר טוב, עומרי ונמרוד</h1>
              <p className="mt-1 text-sm text-black">הנה מה שקורה בפלטפורמת האירועים שלך היום.</p>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4" dir="rtl">
            {KPI_CARDS.map((card) => (
              <article
                key={card.title}
                className="rounded-2xl border border-[#4721DF] bg-[#D3E2F5] p-6 shadow-[0px_0px_20px_rgba(91,33,182,0.3)]"
              >
                <div className="flex flex-row-reverse items-start justify-between gap-4">
                  <span className="inline-flex rounded-lg bg-[#6AB7FF] p-2">
                    <Image src={card.icon} alt="" width={22} height={16} />
                  </span>
                  <div className="text-right">
                    <p className="text-sm leading-5 font-semibold text-black">{card.title}</p>
                    <p className="text-3xl leading-tight font-bold text-black sm:text-[42px] sm:leading-10">{card.value}</p>
                  </div>
                </div>
                {card.delta ? <p className="mt-2 text-right text-sm text-black">{card.delta}</p> : null}
                <button
                  type="button"
                  onClick={() => onCardAction(card.href)}
                  className="mt-2 inline-flex cursor-pointer flex-row-reverse items-center gap-2 text-sm font-bold text-[#0061A7]"
                >
                  <span aria-hidden>←</span>
                  {card.action}
                </button>
              </article>
            ))}
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <section
              className="rounded-xl border border-[#4721DF] bg-[#D3E2F5] p-6 shadow-[0px_0px_20px_rgba(91,33,182,0.3)]"
              dir="ltr"
            >
              <div className="flex items-center justify-between gap-4 text-[#0061A7]">
                  <span className="text-sm font-semibold">חודשי / שנתי</span>
                  <div className="flex items-center gap-2 text-sm">
                    <span className="font-semibold">חפש ספק לפי שם</span>
                    <Image src="/icons/search.svg" alt="search" width={18} height={18} className="inline-block" />
                  </div>
                  <h2 className="text-right text-[28px] font-semibold text-[#201C44]">נתוני ספקים</h2>
              </div>
              <div className="mt-6 space-y-6">
                {SUPPLIER_METRICS.map((row) => (
                  <div key={row.metric} className="flex items-center justify-between gap-4">
                    <div className="flex flex-1 items-center justify-between gap-4 text-[#201C44]">
                      <span className="w-20 text-center text-sm">{row.month}</span>
                      <span className="min-w-0 flex-1 text-center text-base">{row.total}</span>
                      <span className="text-sm">{row.metric}</span>
                        <span className="inline-flex size-10 items-center justify-center rounded-xl bg-[#6AB7FF]">
                      <Image src={row.icon} alt="" width={20} height={20} />
                    </span>
                    </div>
                  </div>
                ))}
              </div>
            </section>
            <section className="font-bold rounded-xl border border-[#4721DF] bg-[#D3E2F5] p-6 shadow-[0px_0px_20px_rgba(91,33,182,0.3)]">
              <h2 className="text-right text-[28px] text-[#201C44]">אזור פעולות מהירות</h2>
              <div className="mt-6 grid gap-6 sm:grid-cols-2">
                {[
                  "הוספת ספק",
                  "ניהול חבילות פרימיום",
                  "הוספת דף קונספט",
                  "ניהול צ'אט AI",
                ].map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => onQuickAction(item)}
                    className="h-[61px] cursor-pointer rounded-[99px] border-2 border-[#201C44] px-5 text-sm font-bold text-[#201C44]"
                  >
                    {item}
                  </button>
                ))}
              </div>
            </section>
          </div>

          <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
            <section className="overflow-hidden rounded-2xl border border-white/20 bg-white/5 backdrop-blur-[6px]">
              <div className="flex flex-row-reverse items-center justify-between border-b border-black/10 px-6 py-5">
                <button
                  type="button"
                  onClick={() => router.push('/admin/suppliers')}
                  className="cursor-pointer text-sm font-semibold text-[#201C44]"
                >
                  הצג הכל
                </button>
                <div className="text-right">
                  <h3 className="text-[28px] leading-7 font-semibold text-black">אישורים ממתינים</h3>
                  <p className="text-sm text-black">ספקים חדשים שהצטרפו וממתינים לבדיקה</p>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[720px] text-right text-sm">
                  <thead className="bg-black/5 text-[#5A5A5A]">
                    <tr>
                      <th className="px-4 py-3 font-semibold">שם ספק</th>
                      <th className="px-4 py-3 font-semibold">קטגוריה</th>
                      <th className="px-4 py-3 font-semibold">תאריך הצטרפות</th>
                      <th className="px-4 py-3 font-semibold">לצפייה בפרטים</th>
                      <th className="px-4 py-3 font-semibold">פעולות</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loadingPending ? (
                      <tr>
                        <td colSpan={5} className="py-12 text-center text-sm text-[#444650]">טוען ביקורות ממתינות…</td>
                      </tr>
                    ) : pendingSuppliers.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="py-12 text-center text-sm text-[#444650]">אין ספקים הממתינים לבדיקה.</td>
                      </tr>
                    ) : (
                      pendingSuppliers.map((row) => (
                        <tr key={row.id} className="border-t border-black/10">
                          <td className="px-4 py-4">{row.businessName}</td>
                          <td className="px-4 py-4">כללי</td>
                          <td className="px-4 py-4">—</td>
                          <td className="px-4 py-4">
                            <button
                              type="button"
                              onClick={() => router.push(`/marketplace/${row.id}`)}
                              className="cursor-pointer rounded-full bg-[#6AB7FF] px-3 py-1 text-xs text-[#201C44]"
                            >
                              לצפייה
                            </button>
                          </td>
                          <td className="px-4 py-4">
                            <div className="flex justify-end gap-2">
                              <button
                                type="button"
                                onClick={() => approveSupplier(row.id)}
                                className="cursor-pointer rounded-lg bg-[#201C44] px-3 py-1 text-xs text-white transition hover:bg-[#151238]"
                              >
                                אישור
                              </button>
                              <button
                                type="button"
                                onClick={() => setRejectingId(row.id)}
                                className="cursor-pointer rounded-lg border border-rose-200 bg-white px-3 py-1 text-xs text-rose-700 transition hover:bg-rose-50"
                              >
                                דחייה
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </section>
            <section className="w-full rounded-2xl border border-white/20 bg-white/5 p-5 backdrop-blur-[6px] lg:w-[360px]">
              <div className="text-right mb-12">
                  <h3 className="text-[24px] leading-7 font-semibold text-black">צמיחת הפלטפורמה</h3>
                  <p className="text-sm text-black">מעקב חודשי אחר פעילות</p>
              </div>

              <div className="mt-5">
                <div className="flex h-[82px] items-end justify-between gap-2 px-1">
                  {[
                    { month: 'מאי', outer: 'h-[95px]', inner: 'h-[79px]', innerColor: 'bg-[#201C44]' },
                    { month: 'אפריל', outer: 'h-[63px]', inner: 'h-[32px]', innerColor: 'bg-[#4721DF]' },
                    { month: 'מרץ', outer: 'h-[71px]', inner: 'h-[57px]', innerColor: 'bg-[#4721DF]' },
                    { month: 'פברואר', outer: 'h-[38px]', inner: 'h-[25px]', innerColor: 'bg-[#4721DF]' },
                    { month: 'ינואר', outer: 'h-[24px]', inner: 'h-[12px]', innerColor: 'bg-[#4721DF]' },
                  ].map((bar) => (
                    <div key={bar.month} className="flex w-full flex-col items-center gap-1.5">
                      <div className={`relative w-full min-w-[36px] rounded-t-[8px] bg-[rgba(91,33,182,0.2)] ${bar.outer}`}>
                        <div className={`absolute inset-x-0 bottom-0 rounded-t-[8px] ${bar.inner} ${bar.innerColor}`} />
                      </div>
                      <span className="text-[10px] uppercase tracking-[0.5px] text-black">{bar.month}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-4 space-y-3">
                {[
                  { value: '45+', label: 'ספקים חדשים', dot: 'bg-[#201C44] shadow-[0px_1px_2px_#EC5B13]' },
                  { value: '1,240+', label: 'משתמשים חדשים', dot: 'bg-[#4721DF] shadow-[0px_1px_2px_#5B21B6]' },
                  { value: '892+', label: 'אירועים שהושלמו', dot: 'bg-[#201C44] shadow-[0px_1px_2px_#FBBF24]' },
                ].map((item) => (
                  <div key={item.label} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className={`size-2 rounded-full ${item.dot}`} />
                      <span className="text-sm text-black">{item.label}</span>
                    </div>
                    <span dir="ltr" className="text-4 font-bold text-black" style={{ unicodeBidi: 'isolate' }}>
                      {item.value}
                    </span>
                  </div>
                ))}
              </div>

              <button
                type="button"
                onClick={() => router.push('/admin/suppliers')}
                className="mt-6 h-[46px] w-full rounded-xl border border-white/20 bg-black/5 text-sm font-semibold text-black"
              >
                דוח פעילות מפורט
              </button>
            </section>
          </div>
        </div>

        {rejectingId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
            <div className="w-full max-w-[400px] rounded-2xl bg-white p-6 shadow-xl">
              <h3 className="text-lg font-semibold text-[#1E1B4B]">דחיית ספק</h3>
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="סיבה (אופציונלי)"
                rows={3}
                className="mt-3 w-full rounded-xl border border-[#E2E8F0] px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[#3B82F6]/30"
              />
              <div className="mt-4 flex justify-end gap-2">
                <button
                  onClick={() => { setRejectingId(null); setRejectReason(''); }}
                  className="rounded-lg border border-[#E2E8F0] px-4 py-2 text-sm font-semibold text-[#64748B]"
                >
                  ביטול
                </button>
                <button
                  onClick={() => {
                    rejectSupplier({
                      id: rejectingId!,
                      reason: rejectReason || undefined,
                      adminUserId: sessionUser?.id,
                    });
                    setRejectingId(null);
                    setRejectReason('');
                  }}
                  className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700"
                >
                  דחייה
                </button>
              </div>
            </div>
          </div>
        )}
      </section>
    </ProtectedRoute>
  );
}
