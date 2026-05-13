"use client";

import Image from "next/image";
import Link from "next/link";
import dynamic from "next/dynamic";
import { useEffect, useMemo, useState } from "react";
import { useParams, usePathname, useRouter } from "next/navigation";
import {
  useGetUserJobQuery,
  useGetJobApplicationsQuery,
  useCloseJobMutation,
  useCancelJobMutation,
  useSelectApplicationMutation,
} from "@/shared/api/api";
import { AdditionalSuppliersSection } from "@/features/suppliers/components/additional-suppliers-section";
import {
  TenderSupplierProposalCard,
  type TenderSupplierProposal,
} from "@/shared/components/tenders/tender-supplier-proposal-card";
import { tenderSupplierProposalsDemo } from "@/shared/data/tender-supplier-proposals.demo";
import { marketingPloniFont } from "@/shared/lib/marketing-typography";
import { useAppSelector } from "@/store/hooks";
import { LoadingSkeleton } from "@/shared/components/loading-skeleton";

const SupplierSelectionConfirmModal = dynamic(
  () =>
    import("@/features/tenders/components/supplier-selection-modals").then(
      (m) => m.SupplierSelectionConfirmModal,
    ),
  { ssr: false },
);
const SupplierSelectionSuccessModal = dynamic(
  () =>
    import("@/features/tenders/components/supplier-selection-modals").then(
      (m) => m.SupplierSelectionSuccessModal,
    ),
  { ssr: false },
);

function formatEventDate(iso: string | undefined) {
  if (!iso) return "";
  try {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return iso;
    return d.toLocaleDateString("en-US", { day: "numeric", month: "long", year: "numeric" });
  } catch {
    return iso;
  }
}

function mapApplicationToProposal(app: any): TenderSupplierProposal {
  return {
    id: app.id,
    businessName: app.supplierName ?? app.supplier?.businessName ?? "Supplier",
    rating: app.supplierRating != null ? String(app.supplierRating) : "—",
    reviewCount: app.supplierReviewCount != null ? String(app.supplierReviewCount) : "0",
    badges: [],
    phone: app.supplier?.phone ?? "",
    priceNis: app.price ?? 0,
    logoSrc: app.supplier?.avatar ?? undefined,
  };
}

export default function TenderSuppliersPage() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useParams<{ tenderId: string }>();
  const tenderId = params?.tenderId;
  const sessionUser = useAppSelector((state) => state.auth.user);
  const isAuthHydrated = useAppSelector((state) => state.auth.isHydrated);

  useEffect(() => {
    if (!isAuthHydrated) return;
    if (sessionUser) return;
    router.replace(`/auth/login?next=${encodeURIComponent(pathname)}`);
  }, [sessionUser, isAuthHydrated, router, pathname]);

  const { data: currentTender, isLoading: isTenderLoading, isError: isTenderError } = useGetUserJobQuery(
    tenderId!,
    { skip: !tenderId || !isAuthHydrated || !sessionUser },
  );

  const { data: applications = [], isLoading: isAppsLoading } = useGetJobApplicationsQuery(
    tenderId!,
    { skip: !tenderId || !isAuthHydrated || !sessionUser },
  );

  const proposals: TenderSupplierProposal[] = useMemo(() => {
    if (applications.length > 0) return applications.map(mapApplicationToProposal);
    return tenderSupplierProposalsDemo;
  }, [applications]);

  const [closeJob, { isLoading: isClosing }] = useCloseJobMutation();
  const [cancelJob, { isLoading: isCancelling }] = useCancelJobMutation();
  const [selectApplication] = useSelectApplicationMutation();

  const [selectionConfirmOpen, setSelectionConfirmOpen] = useState(false);
  const [selectionSuccessOpen, setSelectionSuccessOpen] = useState(false);
  const [selectedProposal, setSelectedProposal] = useState<TenderSupplierProposal | null>(null);
  const [actionError, setActionError] = useState("");

  const handleCloseTender = async () => {
    if (!tenderId) return;
    setActionError("");
    try {
      await closeJob(tenderId).unwrap();
      router.push(`/user/tenders/${tenderId}/offer-closed`);
    } catch {
      setActionError("Failed to close tender. Please try again.");
    }
  };

  const handleCancelTender = async () => {
    if (!tenderId) return;
    setActionError("");
    try {
      await cancelJob(tenderId).unwrap();
      router.push("/user/dashboard");
    } catch {
      setActionError("Failed to cancel tender. Please try again.");
    }
  };

  const handleSelectSupplier = async () => {
    if (!tenderId || !selectedProposal) return;
    try {
      await selectApplication({ jobId: tenderId, applicationId: selectedProposal.id }).unwrap();
      setSelectionConfirmOpen(false);
      setSelectionSuccessOpen(true);
    } catch {
      setActionError("Failed to select supplier. Please try again.");
    }
  };

  if (!isAuthHydrated) return null;
  if (!sessionUser) return null;

  if (isTenderLoading || isAppsLoading) {
    return (
      <div className="relative w-full overflow-x-hidden pb-24 pt-20 sm:pt-24 lg:pt-[123px]" style={{ fontFamily: marketingPloniFont }}>
        <div className="relative z-10 mx-auto w-full max-w-[1200px] px-5 sm:px-8 lg:px-10">
          <LoadingSkeleton />
        </div>
      </div>
    );
  }

  if (isTenderError || !currentTender) {
    return (
      <div className="relative w-full overflow-x-hidden pb-24 pt-20 sm:pt-24 lg:pt-[123px]" style={{ fontFamily: marketingPloniFont }}>
        <div className="relative z-10 mx-auto max-w-[576px] px-5 text-center">
          <svg className="mx-auto mb-4 size-12 text-red-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
            <circle cx="12" cy="12" r="10" />
            <path d="M12 8v4M12 16h.01" />
          </svg>
          <h2 className="text-xl text-red-800">Could not load tender</h2>
          <p className="mt-2 text-sm text-red-600">The API returned an error. Check your connection.</p>
          <div className="mt-6 flex justify-center gap-4">
            <Link href="/user/dashboard" className="rounded-[99px] border border-red-300 px-6 py-2 text-sm text-red-700">Back to dashboard</Link>
            <button onClick={() => window.location.reload()} className="rounded-[99px] bg-red-600 px-6 py-2 text-sm text-white">Retry</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="relative w-full overflow-x-hidden pb-24 pt-20 sm:pt-24 lg:pt-[123px]"
      dir="rtl" lang="he"
      style={{ fontFamily: marketingPloniFont }}
    >
      <div className="relative z-10 mx-auto w-full max-w-[1200px] px-5 sm:px-8 lg:px-10">
        <section className="mb-10 w-full">
          <div className="flex w-full flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
            <div className="flex min-w-0 flex-1 flex-col items-start gap-4 text-start">
              <div className="flex w-full flex-wrap items-center justify-start gap-3">
                <span className="text-sm leading-5 text-black">#{tenderId?.slice(0, 8) ?? ""}</span>
                <span className="rounded-xl bg-[#6AB7FF] px-3 py-1 text-[10px] uppercase tracking-[0.5px] text-[#4721DF]">
                  {currentTender.status ?? "active"}
                </span>
              </div>
              <h1 className="w-full text-start text-[32px] font-normal leading-[40px] tracking-[-0.9px] text-[#00113A] sm:text-[36px] sm:leading-[45px]">
                {currentTender.title}
              </h1>
              <div className="flex w-full flex-wrap items-center justify-start gap-x-6 gap-y-2 text-sm leading-5 text-[#191C1D]">
                {currentTender.category && <span>{currentTender.category}</span>}
                {(currentTender.locationText || currentTender.location) && (
                  <span>{currentTender.locationText ?? currentTender.location}</span>
                )}
                {currentTender.eventDate && <span>{formatEventDate(currentTender.eventDate)}</span>}
              </div>
            </div>

            <div className="flex shrink-0 flex-wrap items-center gap-3 self-start lg:pt-1">
              <button
                type="button"
                onClick={handleCloseTender}
                disabled={isClosing}
                className="inline-flex h-9 items-center justify-center gap-2 rounded-[99px] bg-[#201C44] px-6 text-xs text-[#D7EBFA] disabled:opacity-60"
              >
                <Image src="/icons/lock.svg" alt="" width={10} height={13} className="opacity-90 invert" aria-hidden />
                {isClosing ? "Closing..." : "Tender closing"}
              </button>
              <button
                type="button"
                onClick={handleCancelTender}
                disabled={isCancelling}
                className="inline-flex h-9 items-center justify-center rounded-[99px] border border-black/70 px-6 text-xs text-black disabled:opacity-60"
              >
                {isCancelling ? "Cancelling..." : "Cancellation"}
              </button>
              <Link
                href={`/user/tenders/${tenderId}/edit`}
                className="inline-flex h-9 items-center justify-center rounded-[99px] border border-[#4721DF] px-6 text-xs text-[#4721DF]"
              >
                Edit tender
              </Link>
            </div>
          </div>
        </section>

        {actionError && (
          <div className="mb-6 flex items-center gap-3 rounded-lg border border-red-300 bg-red-50 p-4 text-right text-sm text-red-800">
            <svg className="size-5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <circle cx="12" cy="12" r="10" />
              <path d="M12 8v4M12 16h.01" />
            </svg>
            <span className="flex-1">{actionError}</span>
          </div>
        )}

        <section className="mb-16 w-full" aria-labelledby="tender-proposals-heading">
          <div className="mb-8 flex w-full flex-col items-start gap-1 text-start">
            <h2 id="tender-proposals-heading" className="text-2xl font-normal leading-8 text-[#00113A]">
              Supplier Proposals ({proposals.length})
            </h2>
            <p className="text-sm font-normal leading-5 text-[#444650]">The best offers for your auction</p>
          </div>

          {proposals.length === 0 ? (
            <p className="text-center text-[#444650]">No proposals yet. Suppliers will submit offers once they see your tender.</p>
          ) : (
            <ul className="flex w-full list-none flex-col items-start gap-6 md:flex-row md:flex-wrap md:justify-start md:gap-x-[65px] md:gap-y-8">
              {proposals.map((proposal) => (
                <li key={proposal.id} className="flex justify-start">
                  <TenderSupplierProposalCard
                    {...proposal}
                    onSelect={() => {
                      setSelectedProposal(proposal);
                      setSelectionConfirmOpen(true);
                    }}
                  />
                </li>
              ))}
            </ul>
          )}
        </section>

        <AdditionalSuppliersSection className="mb-16" />
      </div>

      <SupplierSelectionConfirmModal
        open={selectionConfirmOpen}
        onClose={() => {
          setSelectionConfirmOpen(false);
          setSelectedProposal(null);
        }}
        onConfirm={handleSelectSupplier}
      />

      <SupplierSelectionSuccessModal
        open={selectionSuccessOpen}
        onClose={() => {
          setSelectionSuccessOpen(false);
          setSelectedProposal(null);
        }}
        supplierName={selectedProposal?.businessName ?? ""}
        supplierPhone={selectedProposal?.phone ?? ""}
      />
    </div>
  );
}
