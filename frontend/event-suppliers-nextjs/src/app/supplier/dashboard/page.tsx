"use client";

import { FormEvent, useState } from "react";
import { ProtectedRoute } from "@/shared/components/protected-route";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { saveSupplierDraftField } from "@/features/job-board/job-board-slice";
import {
  useGetRecommendedSupplierJobsQuery,
  useGetSupplierReferralLinkQuery,
} from "@/shared/api/api";

export default function SupplierDashboardPage() {
  const dispatch = useAppDispatch();
  const { data: referralData } = useGetSupplierReferralLinkQuery();
  const { data: recommendedJobs = [] } = useGetRecommendedSupplierJobsQuery();
  const draft = useAppSelector((state) => state.jobBoard.supplierDraft);
  const [showMessages, setShowMessages] = useState(false);
  const [businessName, setBusinessName] = useState(draft.businessName || "");
  const [serviceArea, setServiceArea] = useState(draft.serviceArea || "");

  const onSave = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    dispatch(saveSupplierDraftField({ key: "businessName", value: businessName }));
    dispatch(saveSupplierDraftField({ key: "serviceArea", value: serviceArea }));
  };

  return (
    <ProtectedRoute roles={["supplier", "admin"]}>
      <section className="relative mx-auto min-h-[calc(100vh-120px)] w-full max-w-[1440px] overflow-hidden rounded-[24px] border border-[#bfdbfe] bg-[linear-gradient(180deg,#9BD3EF_0%,#FFFFFF_58%)] px-6 py-8">
        <button
          type="button"
          className="absolute left-14 top-16 text-xl text-[#1e1b4b]"
          onClick={() => setShowMessages(true)}
          aria-label="Open messages"
        >
          🔔
        </button>

        <div className="mx-auto flex w-full max-w-[896px] flex-col gap-4">
          <div className="text-center">
            <h1 className="text-5xl leading-10 text-[#1e1b4b]">Welcome, Sharon Halls</h1>
            <p className="mt-2 text-sm text-slate-500">Here you can edit your business details, see job offers, and more...</p>
          </div>

          <div className="figma-panel p-5">
            <div className="mb-3 flex justify-between text-[#1e1b4b]">
              <h3>Friend brings friend</h3>
              <span>🔗</span>
            </div>
            <div className="rounded-xl border border-[#bfdbfe] bg-[#edf6ff] p-3">
              <div className="flex items-center gap-2">
                <button className="rounded-md bg-[#3b82f6] px-4 py-1 text-white">copy</button>
                <div className="rounded-md bg-white px-3 py-1 text-xs text-slate-700">
                  {referralData?.link || "https://wed-app.co.il/ref/sharon-halls"}
                </div>
              </div>
            </div>
          </div>

          <div className="figma-panel p-5">
            <div className="mb-3 flex justify-between">
              <span className="text-xs text-[#3b82f6]">View all</span>
              <h3 className="text-[#1e1b4b]">New job offers in your niche</h3>
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              {(recommendedJobs.length ? recommendedJobs : [{ id: "1", title: "Wedding DJ in Tel Aviv" }, { id: "2", title: "Amplification for a corporate event" }]).slice(0, 2).map((job) => (
                <article key={job.id} className="rounded-xl bg-white p-4">
                  <h4 className="text-right text-sm text-[#1e1b4b]">{job.title}</h4>
                  <p className="mt-1 text-right text-[11px] text-slate-500">Aug 15, 2024</p>
                </article>
              ))}
            </div>
            <button className="mt-3 rounded-full bg-[#201c44] px-6 py-2 text-xs text-white">Go to the auctions page</button>
          </div>

          <form className="figma-panel p-5" onSubmit={onSave}>
            <div className="mb-3 flex justify-between">
              <h3 className="text-[#1e1b4b]">Business details</h3>
              <span>📄</span>
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              <textarea
                className="h-28 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs"
                defaultValue="an exceptional culinary experience and spectacular modern design hall for all types of events."
              />
              <div className="grid gap-3">
                <input className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs" value={businessName} onChange={(e) => setBusinessName(e.target.value)} />
                <input className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs" value={serviceArea} onChange={(e) => setServiceArea(e.target.value)} />
              </div>
            </div>
            <button className="mt-4 rounded-full bg-[#201c44] px-5 py-2 text-xs text-white">Save changes</button>
          </form>

          <div className="figma-panel p-5">
            <div className="mb-3 flex justify-between">
              <h3 className="text-[#1e1b4b]">Links</h3>
              <span>🔗</span>
            </div>
            <div className="grid gap-2 md:grid-cols-2">
              {["Phone number", "email", "instagram", "facebook", "Tiktok page", "Website"].map((label) => (
                <div key={label} className="rounded-lg bg-white px-3 py-2 text-xs">
                  <p className="text-[10px] text-slate-400">{label}</p>
                  <p className="text-slate-700">000-0000000</p>
                </div>
              ))}
            </div>
            <button className="mt-4 rounded-full bg-[#201c44] px-5 py-2 text-xs text-white">Update links</button>
          </div>

          <div className="figma-panel p-4">
            <div className="mb-3 flex justify-between">
              <h3 className="text-[#1e1b4b]">Gallery manager</h3>
              <span>🖼️</span>
            </div>
            <div className="grid grid-cols-4 gap-2">
              <div className="flex h-20 items-center justify-center rounded-xl border border-dashed border-slate-300 bg-white text-xs text-slate-400">Add a photo</div>
              <div className="h-20 rounded-xl bg-[url('https://www.figma.com/api/mcp/asset/44128930-00e5-4110-ad8a-999291ae24e5')] bg-cover bg-center" />
              <div className="h-20 rounded-xl bg-[url('https://www.figma.com/api/mcp/asset/ac53e97a-39bb-46e5-b08b-babd313bc258')] bg-cover bg-center" />
              <div className="h-20 rounded-xl bg-[url('https://www.figma.com/api/mcp/asset/d3a5125f-4534-43a4-a2f2-13f56be7d978')] bg-cover bg-center" />
            </div>
          </div>
        </div>

        {showMessages && (
          <>
            <div className="absolute inset-0 bg-[rgba(15,23,42,0.45)]" />
            <div className="absolute left-20 top-24 w-[520px] rounded-2xl bg-[#deecfd] p-6 shadow-2xl">
              <button className="absolute left-4 top-3 text-slate-500" onClick={() => setShowMessages(false)}>x</button>
              {[1, 2, 3].map((item) => (
                <div key={item} className="mb-2 rounded-xl bg-white p-3 text-right text-xs">
                  <p className="font-semibold text-[#1e1b4b]">New message</p>
                  <p className="text-slate-600">Please note that the price of the job offer has changed by 1,000 ₪.</p>
                  <button className="mt-1 text-[#3b82f6]">To view a job offer</button>
                </div>
              ))}
            </div>
          </>
        )}
      </section>
    </ProtectedRoute>
  );
}
