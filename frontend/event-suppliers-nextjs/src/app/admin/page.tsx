"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { ProtectedRoute } from "@/shared/components/protected-route";
import { marketingPloniFont } from "@/shared/lib/marketing-typography";

const KPI_CARDS = [
  {
    title: "Total suppliers",
    value: "1,240",
    delta: "5.2%+ from last month",
    action: "To view the supplier table",
    icon: "/total-suppliers.svg",
  },
  {
    title: "Total revenue",
    value: "₪450,230",
    delta: "12%+ from last month",
    action: "To view the full report",
    icon: "/total-revenue.svg",
  },
    {
      title: "Pending approvals",
      value: "12",
      delta: "",
      action: "To view the full report",
      icon: "/pending-approvals.svg",
    },
      {
    title: "Active users",
    value: "8,500",
    delta: "0.5%- from last month",
    action: "Export to Excel",
    icon: "/active-users.svg",
  },
] as const;

const SUPPLIER_METRICS = [
  { month: "June", total: "Total 124", metric: "Phone clicks", icon: "/phone.svg" },
  { month: "June", total: "Total 56", metric: "Sending a message", icon: "/message.svg" },
  { month: "June", total: "Total 456", metric: "Profile views", icon: "/eye.svg" },
  { month: "June", total: "Total 21 (income ₪2,000)", metric: "Number of job offers closed", icon: "/cash.svg" },
] as const;

const PENDING_APPROVALS = [
  { supplier: "Roy Levy Event Photography", category: "Photography", date: "12/10/2023" },
  { supplier: "DJ Cosmic", category: "Music", date: "14/10/2023" },
  { supplier: "Catering Blessing", category: "Catering", date: "15/10/2023" },
  { supplier: "DJ Max", category: "Music", date: "10/16/2023" },
] as const;

export default function AdminPage() {
  const router = useRouter();

  const onCardAction = (title: string) => {
    if (title === "Total suppliers" || title === "Pending approvals") {
      router.push("/admin/suppliers");
      return;
    }

    if (title === "Active users") {
      router.push("/users");
      return;
    }

    router.push("/admin");
  };

  const onQuickAction = (action: string) => {
    if (action === "Add a provider") {
      router.push("/admin/suppliers");
      return;
    }

    if (action === "Adding a concept page") {
      router.push("/admin/concepts/add");
      return;
    }

    if (action === "Premium package management") {
      router.push("/admin/premium-packages");
      return;
    }

    if (action === "I added products to the store.") {
      router.push("/admin/store/products/add");
      return;
    }

    router.push("/admin");
  };

  return (
    <ProtectedRoute roles={["admin"]}>
      <section
        className="relative mx-auto min-h-screen w-full overflow-x-hidden bg-[linear-gradient(180deg,#9BD3EF_0%,#FFFFFF_58%)] px-4 pb-14 pt-24 sm:px-6"
        style={{ fontFamily: marketingPloniFont }}
        dir="rtl"
      >
        <div className="pointer-events-none absolute -left-28 top-28 h-[396px] w-[444px] rotate-62 rounded-[40%] bg-[linear-gradient(180deg,#2998FF_0%,#FFFFFF_60%)] opacity-70 blur-[2.5px]" />
        <div className="pointer-events-none absolute -right-28 top-52 h-[396px] w-[444px] rotate-[-119deg] rounded-[40%] bg-[linear-gradient(180deg,#2998FF_0%,#FFFFFF_60%)] opacity-70 blur-[2.5px]" />
        <div className="pointer-events-none absolute -left-4 top-[860px] h-20 w-[89px] rotate-[-161deg] rounded-full bg-[linear-gradient(180deg,#2998FF_0%,#FFFFFF_60%)] opacity-60 blur-[13.5px]" />

        <div className="relative z-10 mx-auto flex w-full max-w-[1220px] flex-col gap-8">
          <div className="flex flex-col-reverse gap-6 lg:flex-row-reverse lg:items-center lg:justify-between">
            <div className="relative w-full max-w-[288px]">
              <input
                className="h-[42px] w-full rounded-xl border border-white/20 bg-black/5 px-4 pr-10 text-right text-sm"
                placeholder="Search for suppliers or events..."
              />
              <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-lg">⌕</span>
            </div>
            <div className="text-right">
              <h1 className="text-3xl leading-tight text-black sm:text-[40px] sm:leading-10">Good morning, Omri and Nimrod</h1>
              <p className="mt-1 text-sm text-black">Here&apos;s what&apos;s happening on your event platform today.</p>
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
                    <Image src={card.icon} alt="" width={22} height={16} unoptimized />
                  </span>
                  <div className="text-right">
                    <p className="text-sm leading-5 text-black">{card.title}</p>
                    <p className="text-3xl leading-tight text-black sm:text-[42px] sm:leading-10">{card.value}</p>
                  </div>
                </div>
                {card.delta ? <p className="mt-2 text-right text-sm text-black">{card.delta}</p> : null}
                <button
                  type="button"
                  onClick={() => onCardAction(card.title)}
                  className="mt-2 inline-flex cursor-pointer flex-row-reverse items-center gap-2 text-sm text-[#0061A7]"
                >
                  <span aria-hidden>←</span>
                  {card.action}
                </button>
              </article>
            ))}
          </div>

          <div className="grid gap-6 lg:grid-cols-[0.72fr_1.28fr]">
          <section
              className="rounded-xl border border-[#4721DF] bg-[#D3E2F5] p-6 shadow-[0px_0px_20px_rgba(91,33,182,0.3)]"
              dir="ltr"
            >
              <div className="flex items-center justify-between gap-4 text-[#0061A7]">
                <span className="text-sm">Monthly / Annual</span>
                <div className="flex items-center gap-2 text-sm">
                  <span>Search for a provider by name</span>
                  <span aria-hidden>⌕</span>
                </div>
                <h2 className="text-right text-[28px] text-[#201C44]">Supplier data</h2>
              </div>
              <div className="mt-6 space-y-6">
                {SUPPLIER_METRICS.map((row) => (
                  <div key={row.metric} className="flex items-center justify-between gap-4">
                    <span className="inline-flex size-10 items-center justify-center rounded-xl bg-[#6AB7FF]">
                      <Image src={row.icon} alt="" width={20} height={20} unoptimized />
                    </span>
                    <div className="flex flex-1 items-center justify-between gap-4 text-[#201C44]">
                      <span className="w-20 text-left text-sm">{row.month}</span>
                      <span className="min-w-0 flex-1 text-center text-base">{row.total}</span>
                      <span className="w-52 text-right text-sm">{row.metric}</span>
                    </div>
                  </div>
                ))}
              </div>
            </section>
            <section className="rounded-xl border border-[#4721DF] bg-[#D3E2F5] p-6 shadow-[0px_0px_20px_rgba(91,33,182,0.3)]">
              <h2 className="text-right text-[28px] text-[#201C44]">Quick Actions Area</h2>
              <div className="mt-6 grid gap-6 sm:grid-cols-2">
                {[
                  "Premium package management",
                  "Add a provider",
                  "AI chat management",
                  "Adding a concept page",
                  "I added products to the store.",
                ].map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => onQuickAction(item)}
                    className="h-[61px] cursor-pointer rounded-[99px] border-2 border-[#201C44] px-5 text-sm text-[#201C44]"
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
                  onClick={() => router.push("/admin/suppliers")}
                  className="cursor-pointer text-sm text-[#201C44]"
                >
                  Show all
                </button>
                <div className="text-right">
                  <h3 className="text-[28px] leading-7 text-black">Pending approvals</h3>
                  <p className="text-sm text-black">New suppliers who have joined and are awaiting review</p>
                </div>
              </div>
              <div className="overflow-x-auto">
              <table className="w-full min-w-[720px] text-right text-sm">
                <thead className="bg-black/5 text-[#5A5A5A]">
                  <tr>
                    <th className="px-4 py-3">Supplier name</th>
                    <th className="px-4 py-3">category</th>
                    <th className="px-4 py-3">Joining date</th>
                    <th className="px-4 py-3">To view details</th>
                    <th className="px-4 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {PENDING_APPROVALS.map((row) => (
                    <tr key={row.supplier} className="border-t border-black/10">
                      <td className="px-4 py-4">{row.supplier}</td>
                      <td className="px-4 py-4">{row.category}</td>
                      <td className="px-4 py-4">{row.date}</td>
                      <td className="px-4 py-4">
                        <button
                          type="button"
                          onClick={() => router.push("/admin/suppliers")}
                          className="cursor-pointer rounded-full bg-[#6AB7FF] px-3 py-1 text-xs text-[#201C44]"
                        >
                          To watch
                        </button>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => router.push("/admin/suppliers")}
                            className="cursor-pointer rounded-lg bg-[#201C44] px-3 py-1 text-xs text-white"
                          >
                            Approval
                          </button>
                          <button
                            type="button"
                            onClick={() => router.push("/admin/suppliers")}
                            className="cursor-pointer rounded-lg border border-rose-200 bg-black/5 px-3 py-1 text-xs text-rose-700"
                          >
                            Rejection
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              </div>
            </section>
            <section className="w-full rounded-2xl border border-white/20 bg-white/5 p-5 backdrop-blur-[6px] lg:w-[360px]">
              <div className="text-right">
                <h3 className="text-[24px] leading-7 text-black">Platform growth</h3>
                <p className="mt-1 text-sm text-black">Monthly activity tracking</p>
              </div>

              <div className="mt-5">
                <div className="flex h-[82px] items-end justify-between gap-2 px-1">
                  {[
                    { month: "MAY", outer: "h-[95px]", inner: "h-[79px]", innerColor: "bg-[#201C44]" },
                    { month: "APRIL", outer: "h-[63px]", inner: "h-[32px]", innerColor: "bg-[#4721DF]" },
                    { month: "MARCH", outer: "h-[71px]", inner: "h-[57px]", innerColor: "bg-[#4721DF]" },
                    { month: "FEBRUARY", outer: "h-[38px]", inner: "h-[25px]", innerColor: "bg-[#4721DF]" },
                    { month: "JANUARY", outer: "h-[24px]", inner: "h-[12px]", innerColor: "bg-[#4721DF]" },
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
                  { value: "45+", label: "New suppliers", dot: "bg-[#201C44] shadow-[0px_1px_2px_#EC5B13]" },
                  { value: "1,240+", label: "New users", dot: "bg-[#4721DF] shadow-[0px_1px_2px_#5B21B6]" },
                  { value: "892+", label: "Completed events", dot: "bg-[#201C44] shadow-[0px_1px_2px_#FBBF24]" },
                ].map((item) => (
                  <div key={item.label} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className={`size-2 rounded-full ${item.dot}`} />
                      <span className="text-sm text-black">{item.label}</span>
                    </div>
                    <span dir="ltr" className="text-4 font-bold text-black" style={{ unicodeBidi: "isolate" }}>
                      {item.value}
                    </span>
                  </div>
                ))}
              </div>

              <button
                type="button"
                onClick={() => router.push("/admin/suppliers")}
                className="mt-6 h-[46px] w-full rounded-xl border border-white/20 bg-black/5 text-sm text-black"
              >
                Detailed activity report
              </button>
            </section>

          </div>
        </div>
      </section>
    </ProtectedRoute>
  );
}
