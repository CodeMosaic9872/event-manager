"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ProtectedRoute } from "@/shared/components/protected-route";
import { marketingPloniFont } from "@/shared/lib/marketing-typography";

const rows = [
  {
    supplierName: "Taste and color",
    city: "Tel Aviv",
    status: { label: "approved", tone: "bg-[#DBFFDE] text-black" },
    category: "Catering",
    region: "Center",
    email: "info@tvc.co.il",
    phone: "03-678-9000",
    description:
      "Taam & Tseb is a boutique catering that combines culinary art with an exceptional hospitality experience.",
    address: "24 HaBarzel Street, Ramat HaHayal, Tel Aviv-Yafo",
    labels: ["kashrut", "Reservist"],
    socials: "www.bajjkbjb.com",
  },
  {
    supplierName: "DJ Gilad Marco",
    city: "Haifa",
    status: { label: "waiting", tone: "bg-[#E7E8E9] text-black" },
    category: "DJ Music",
    region: "North",
    email: "gilad@musicmrk.com",
    phone: "054-123-4567",
    description: "Gilad Marco is a leading DJ in events with over a decade of experience.",
    address: "45 President Boulevard, Carmel Center, Haifa",
    labels: ["Reservist"],
    socials: "",
  },
  {
    supplierName: "Cozy studio",
    city: "Jerusalem",
    status: { label: "rejected", tone: "bg-[#FFDAD6] text-[#93000A]" },
    category: "Photography",
    region: "Jerusalem",
    email: "office@moments.co.il",
    phone: "02-555-1212",
    description: "Moments Studio documents exciting moments at weddings and prestigious events.",
    address: "12 King George St., City Center, Jerusalem",
    labels: ["kashrut"],
    socials: "",
  },
] as const;

type SupplierStatus = "approved" | "waiting" | "rejected";

type SupplierRow = {
  supplierName: string;
  city: string;
  status: { label: SupplierStatus; tone: string };
  category: string;
  region: string;
  email: string;
  phone: string;
  description: string;
  address: string;
  labels: string[];
  socials: string;
};

function initialTableData(): SupplierRow[] {
  return rows.map((r) => ({
    supplierName: r.supplierName,
    city: r.city,
    status: { label: r.status.label as SupplierStatus, tone: r.status.tone },
    category: r.category,
    region: r.region,
    email: r.email,
    phone: r.phone,
    description: r.description,
    address: r.address,
    labels: [...r.labels],
    socials: r.socials,
  }));
}

const selectClass =
  "h-9 min-w-[126px] cursor-pointer appearance-none rounded-none border-0 border-b border-[rgba(197,198,210,0.1)] bg-[#D3E2F5] px-3 pr-8 text-sm text-[#191C1D] outline-none focus:ring-2 focus:ring-[#4721DF]/30";

export default function AdminSuppliersPage() {
  const router = useRouter();
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [regionFilter, setRegionFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [tableData, setTableData] = useState<SupplierRow[]>(initialTableData);

  const filteredRows = useMemo(() => {
    return tableData.filter((row) => {
      if (statusFilter !== "all" && row.status.label !== statusFilter) return false;
      if (regionFilter !== "all" && row.region !== regionFilter) return false;
      if (categoryFilter !== "all" && row.category !== categoryFilter) return false;
      return true;
    });
  }, [tableData, statusFilter, regionFilter, categoryFilter]);

  const downloadCsv = () => {
    const headers = [
      "Business name",
      "City",
      "Status",
      "Category",
      "Region",
      "Email",
      "Phone",
      "Description",
      "Address",
    ];
    const lines = filteredRows.map((r) =>
      [
        r.supplierName,
        r.city,
        r.status.label,
        r.category,
        r.region,
        r.email,
        r.phone,
        `"${r.description.replace(/"/g, '""')}"`,
        `"${r.address.replace(/"/g, '""')}"`,
      ].join(","),
    );
    const blob = new Blob([headers.join(",") + "\n" + lines.join("\n")], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "suppliers.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <ProtectedRoute roles={["admin"]}>
      <section
        dir="ltr"
        className="relative mx-auto min-h-screen w-full overflow-x-hidden bg-[linear-gradient(180deg,#9BD3EF_0%,#FFFFFF_58%)] px-4 pb-14 pt-24 sm:px-6"
        style={{ fontFamily: marketingPloniFont }}
      >
        <div className="pointer-events-none absolute -left-24 top-24 h-[300px] w-[340px] rotate-62 rounded-[40%] bg-[linear-gradient(180deg,#2998FF_0%,#FFFFFF_60%)] opacity-70 blur-[2.5px]" />
        <div className="pointer-events-none absolute -right-24 top-72 h-[300px] w-[340px] rotate-[-119deg] rounded-[40%] bg-[linear-gradient(180deg,#2998FF_0%,#FFFFFF_60%)] opacity-70 blur-[2.5px]" />

        <div className="relative z-10 mx-auto flex w-full max-w-[1338px] flex-col gap-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-wrap items-center gap-3">
              <div className="grid h-[79px] w-[120px] place-items-center rounded-lg bg-[#D3E2F5] shadow-[0px_1px_2px_rgba(0,0,0,0.05)]">
                <div className="text-center">
                  <p className="text-3xl leading-8 text-black">12</p>
                  <p className="text-[10px] uppercase tracking-[-0.5px] text-black">Awaiting approval</p>
                </div>
              </div>
              <div className="grid h-[79px] w-[120px] place-items-center rounded-lg bg-[#D3E2F5] shadow-[0px_1px_2px_rgba(0,0,0,0.05)]">
                <div className="text-center">
                  <p className="text-3xl leading-8 text-[#00113A]">128</p>
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

          <div className="mt-1 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <button
              type="button"
              onClick={() => setAdvancedOpen((o) => !o)}
              aria-expanded={advancedOpen}
              className="inline-flex w-fit cursor-pointer items-center gap-2 text-[12px] uppercase tracking-[1.2px] text-[#00113A]"
            >
              Advanced filtering
              <Image src="/Filter.svg" alt="" aria-hidden width={12} height={12} unoptimized />
            </button>
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-sm text-[#00113A]">Filter by:</span>
              <label className="sr-only" htmlFor="filter-status">
                Status
              </label>
              <select
                id="filter-status"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className={selectClass}
              >
                <option value="all">Status (all)</option>
                <option value="approved">approved</option>
                <option value="waiting">waiting</option>
                <option value="rejected">rejected</option>
              </select>
              <label className="sr-only" htmlFor="filter-region">
                Region
              </label>
              <select
                id="filter-region"
                value={regionFilter}
                onChange={(e) => setRegionFilter(e.target.value)}
                className={selectClass}
              >
                <option value="all">All regions</option>
                <option value="Center">Center</option>
                <option value="North">North</option>
                <option value="Jerusalem">Jerusalem</option>
              </select>
              <label className="sr-only" htmlFor="filter-category">
                Category
              </label>
              <select
                id="filter-category"
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className={selectClass}
              >
                <option value="all">All categories</option>
                <option value="Catering">Catering</option>
                <option value="DJ Music">DJ Music</option>
                <option value="Photography">Photography</option>
              </select>
            </div>
          </div>

          {advancedOpen ? (
            <div className="rounded-lg border border-[#4721DF]/20 bg-[#D3E2F5]/40 p-4 text-sm text-[#00113A]">
              <p className="font-medium">Advanced filters</p>
              <p className="mt-1 text-[#444650]">More filter options can be wired to the API when available.</p>
            </div>
          ) : null}

          <div className="mt-2 overflow-x-auto rounded-xl bg-[rgba(237,245,255,0.41)] pb-1">
            <table className="min-w-[1080px] table-fixed text-left lg:min-w-[1500px]">
              <thead className="bg-[#D3E2F5]">
                <tr className="h-14 border-b border-black/10 text-sm uppercase tracking-[0.6px] text-black">
                  <th className="w-[137px] px-4 text-center">Actions</th>
                  <th className="w-[127px] px-4">Social networks</th>
                  <th className="w-[85px] px-4">Labels</th>
                  <th className="w-[89px] px-4">address</th>
                  <th className="w-[194px] px-4">Description</th>
                  <th className="w-[119px] px-4">Contact information</th>
                  <th className="w-[131px] px-4">Category &amp; Location</th>
                  <th className="w-[88px] px-4">status</th>
                  <th className="w-[166px] px-4">Business name</th>
                </tr>
              </thead>
              <tbody className="text-black">
                {filteredRows.map((row) => (
                  <tr key={row.supplierName} className="h-[103px] border-y border-[#4721DF] text-[11px]">
                    <td className="px-3 align-middle">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          type="button"
                          onClick={() => router.push(`/admin/suppliers?edit=${encodeURIComponent(row.supplierName)}`)}
                          className="grid size-[27px] cursor-pointer place-items-center rounded bg-[#EDEEEF] text-[#0061A7]"
                          title="Edit supplier"
                        >
                          ✎
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            setTableData((prev) =>
                              prev.map((r) =>
                                r.supplierName === row.supplierName
                                  ? {
                                      ...r,
                                      status: { label: "rejected", tone: "bg-[#FFDAD6] text-[#93000A]" },
                                    }
                                  : r,
                              ),
                            )
                          }
                          className="cursor-pointer rounded bg-[#FFDAD6] px-3 py-1 text-[10px] uppercase text-[#93000A]"
                        >
                          Cancellation
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            setTableData((prev) =>
                              prev.map((r) =>
                                r.supplierName === row.supplierName
                                  ? {
                                      ...r,
                                      status: { label: "approved", tone: "bg-[#DBFFDE] text-black" },
                                    }
                                  : r,
                              ),
                            )
                          }
                          className="cursor-pointer rounded bg-[#00113A] px-3 py-1 text-[10px] uppercase text-white"
                        >
                          Approval
                        </button>
                      </div>
                    </td>
                    <td className="px-3 align-middle text-left text-xs">{row.socials || "-"}</td>
                    <td className="px-3 align-middle">
                      <div className="flex flex-wrap justify-start gap-2">
                        {row.labels.map((label) => (
                          <span
                            key={label}
                            className={`rounded-xl px-2 py-0.5 text-[10px] ${
                              label === "kashrut"
                                ? "bg-[#E8F5E9] text-[#2E7D32]"
                                : "bg-[#D2E4FF] text-[#00487F]"
                            }`}
                          >
                            {label}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-3 align-middle text-[11px] leading-[13px]">{row.address}</td>
                    <td className="px-3 align-middle text-[11px] leading-[18px]">{row.description}</td>
                    <td className="px-3 align-middle">
                      <div className="text-xs">{row.email}</div>
                      <div className="mt-1 text-[11px]">{row.phone}</div>
                    </td>
                    <td className="px-3 align-middle">
                      <span className="rounded-md bg-[#CDE5FF] px-2 py-1 text-xs text-[#004B74]">{row.category}</span>
                      <div className="mt-1 text-[11px]">Region: {row.region}</div>
                    </td>
                    <td className="px-3 align-middle">
                      <span className={`inline-flex rounded-xl px-3 py-1 text-[10px] ${row.status.tone}`}>{row.status.label}</span>
                    </td>
                    <td className="px-3 align-middle">
                      <div className="text-base leading-5 text-[#00113A]">{row.supplierName}</div>
                      <div className="mt-1 text-[11px]">{row.city}</div>
                    </td>
                  </tr>
                ))}
                <tr className="h-16 border-t border-black/10 opacity-50">
                  <td colSpan={9} className="text-center text-xs">
                    Loading more providers...
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </ProtectedRoute>
  );
}
