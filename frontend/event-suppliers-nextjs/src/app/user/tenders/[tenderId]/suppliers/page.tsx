"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useParams, usePathname, useRouter } from "next/navigation";
import { useGetJobsQuery } from "@/shared/api/api";
import {
  TenderSupplierProposalCard,
  type TenderSupplierProposal,
} from "@/shared/components/tenders/tender-supplier-proposal-card";
import { SupplierSelectionConfirmModal } from "@/shared/components/tenders/supplier-selection-confirm-modal";
import { SupplierSelectionSuccessModal } from "@/shared/components/tenders/supplier-selection-success-modal";
import { AdditionalSuppliersSection } from "@/shared/components/suppliers/additional-suppliers-section";
import { demoSupplierJobOffers } from "@/shared/data/supplier-job-offers.demo";
import { tenderSupplierProposalsDemo } from "@/shared/data/tender-supplier-proposals.demo";
import { mergeJobList } from "@/shared/lib/merge-job-list";
import { marketingPloniFont } from "@/shared/lib/marketing-typography";
import { useAppSelector } from "@/store/hooks";

function formatEventDate(iso: string | undefined) {
  if (!iso) return "May 14, 2025";
  try {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return iso;
    return d.toLocaleDateString("en-US", { day: "numeric", month: "long", year: "numeric" });
  } catch {
    return iso;
  }
}

export default function TenderSuppliersPage() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useParams<{ tenderId: string }>();
  const tenderId = params?.tenderId;
  const sessionUser = useAppSelector((state) => state.auth.user);
  const localPublishedJobs = useAppSelector((state) => state.jobBoard.jobs);
  const { data: apiJobs } = useGetJobsQuery();

  const allJobs = useMemo(
    () => mergeJobList(apiJobs, localPublishedJobs),
    [apiJobs, localPublishedJobs],
  );

  const currentTender = useMemo(() => {
    const withDummyMine = [
      ...allJobs,
      ...demoSupplierJobOffers.map((job) => ({ ...job, isMine: true as const })),
    ];
    return withDummyMine.find((job) => job.id === tenderId) ?? withDummyMine[0];
  }, [allJobs, tenderId]);

  const [selectionConfirmOpen, setSelectionConfirmOpen] = useState(false);
  const [selectionSuccessOpen, setSelectionSuccessOpen] = useState(false);
  const [selectedProposal, setSelectedProposal] = useState<TenderSupplierProposal | null>(null);

  useEffect(() => {
    if (sessionUser) return;
    router.replace(`/auth/login?next=${encodeURIComponent(pathname)}`);
  }, [sessionUser, router, pathname]);

  if (!sessionUser || !currentTender) return null;

  return (
    <div
      className="relative w-full overflow-x-hidden pb-24 pt-20 sm:pt-24 lg:pt-[123px]"
      dir="rtl"
      lang="he"
      style={{
        fontFamily: marketingPloniFont,
        background: "linear-gradient(180deg, #9BD3EF 0%, #FFFFFF 58.17%)",
      }}
    >
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div
          className="absolute -left-40 top-32 h-[396px] w-[444px] rotate-[62.64deg] rounded-[40%] bg-[linear-gradient(180deg,#2998FF_0%,#FFFFFF_60%)] opacity-70 blur-[2.5px] shadow-[6px_36px_38px_8px_#84C4FF]"
          aria-hidden
        />
        <div
          className="absolute -right-32 top-[28%] h-[396px] w-[444px] rotate-[-119.56deg] rounded-[40%] bg-[linear-gradient(180deg,#2998FF_0%,#FFFFFF_60%)] opacity-60 blur-[2.5px] shadow-[6px_36px_38px_8px_#84C4FF]"
          aria-hidden
        />
        <div
          className="absolute bottom-[18%] left-0 h-20 w-[89px] rotate-[-161.24deg] rounded-full bg-[linear-gradient(180deg,#2998FF_0%,#FFFFFF_60%)] opacity-50 blur-[13.5px] shadow-[2px_15px_16px_3px_#84C4FF]"
          aria-hidden
        />
      </div>

      <div className="relative z-10 mx-auto w-full max-w-[1200px] px-5 sm:px-8 lg:px-10">
        <section className="mb-10 w-full">
          <div className="flex w-full flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
            <div className="flex min-w-0 flex-1 flex-col items-start gap-4 text-start">
              <div className="flex w-full flex-wrap items-center justify-start gap-3">
                <span className="text-sm leading-5 text-black">#TR-8829-2024</span>
                <span className="rounded-xl bg-[#6AB7FF] px-3 py-1 text-[10px] uppercase tracking-[0.5px] text-[#4721DF]">
                  active
                </span>
              </div>
              <h1 className="w-full text-start text-[32px] font-normal leading-[40px] tracking-[-0.9px] text-[#00113A] sm:text-[36px] sm:leading-[45px]">
                {currentTender.title}
              </h1>
              <div className="flex w-full flex-wrap items-center justify-start gap-x-6 gap-y-2 text-sm leading-5 text-[#191C1D]">
                <span>{currentTender.category ?? "Catering"}</span>
                <span>{currentTender.location ?? "The Station Complex, Tel Aviv"}</span>
                <span>{formatEventDate(currentTender.eventDate)}</span>
              </div>
            </div>

            <div className="flex shrink-0 flex-wrap items-center gap-3 self-start lg:pt-1">
              <button
                type="button"
                onClick={() => router.push(`/user/tenders/${tenderId}/offer-closed`)}
                className="inline-flex h-9 items-center justify-center gap-2 rounded-[99px] bg-[#201C44] px-6 text-xs text-[#D7EBFA]"
              >
                <Image
                  src="/lock.svg"
                  alt=""
                  width={10}
                  height={13}
                  className="opacity-90 invert"
                  aria-hidden
                />
                Tender closing
              </button>
              <Link
                href="/user/dashboard"
                className="inline-flex h-9 items-center justify-center rounded-[99px] border border-black/70 px-6 text-xs text-black"
              >
                Cancellation
              </Link>
              <Link
                href={`/user/tenders/${tenderId}/edit`}
                className="inline-flex h-9 items-center justify-center rounded-[99px] border border-[#4721DF] px-6 text-xs text-[#4721DF]"
              >
                Edit tender
              </Link>
            </div>
          </div>
        </section>

        <section className="mb-16 w-full" aria-labelledby="tender-proposals-heading">
          <div className="mb-8 flex w-full flex-col items-start gap-1 text-start">
            <h2 id="tender-proposals-heading" className="text-2xl font-normal leading-8 text-[#00113A]">
              Supplier Proposals ({tenderSupplierProposalsDemo.length})
            </h2>
            <p className="text-sm font-normal leading-5 text-[#444650]">The best offers for your auction</p>
          </div>

          <ul className="flex w-full list-none flex-col items-start gap-6 md:flex-row md:flex-wrap md:justify-start md:gap-x-[65px] md:gap-y-8">
            {tenderSupplierProposalsDemo.map((proposal) => (
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
        </section>

        <AdditionalSuppliersSection className="mb-16" />
      </div>

      <SupplierSelectionConfirmModal
        open={selectionConfirmOpen}
        onClose={() => {
          setSelectionConfirmOpen(false);
          setSelectedProposal(null);
        }}
        onConfirm={() => {
          setSelectionConfirmOpen(false);
          setSelectionSuccessOpen(true);
        }}
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
