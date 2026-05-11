"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { useGetSupplierByIdQuery, useGetSupplierReviewsQuery } from "@/shared/api/api";
import { useAppSelector } from "@/store/hooks";
import { marketingPloniFont } from "@/shared/lib/marketing-typography";

export default function SupplierProfilePage() {
  const [showRating, setShowRating] = useState(false);
  const params = useParams<{ supplierId: string }>();
  const supplierId = params?.supplierId || "";
  const { data: supplier, isLoading, isError } = useGetSupplierByIdQuery(supplierId, { skip: !supplierId });
  const { data: reviewData } = useGetSupplierReviewsQuery({ supplierId }, { skip: !supplierId });
  const reviews = reviewData?.items ?? [];
  const sessionUser = useAppSelector((s) => s.auth.user);
  const userHasReviewed = sessionUser ? reviews.some((r) => r.authorUserId === sessionUser.id) : false;

  if (isLoading) {
    return (
      <section className="mx-auto min-h-screen w-full max-w-[1300px] px-4 pt-20 text-center text-[#201c44]" style={{ fontFamily: marketingPloniFont }}>Loading...</section>
    );
  }
  if (isError || !supplier) {
    return (
      <section className="mx-auto min-h-screen w-full max-w-[1300px] px-4 pt-20 text-center text-[#201c44]" style={{ fontFamily: marketingPloniFont }}>Supplier not found</section>
    );
  }

  return (
    <section className="relative mx-auto w-full max-w-[1300px] overflow-hidden rounded-[24px] border border-[#bfdbfe] pb-12">
      <div className="h-[180px] bg-cover bg-center" style={{ backgroundImage: supplier.coverImageUrl ? `url(${supplier.coverImageUrl})` : "url('/images/cover.png')" }} />
      <div className="-mt-20 text-center">
        <div
          className="mx-auto size-60 rounded-full border-4 border-white bg-cover bg-center shadow-xl"
          style={{ backgroundImage: supplier.avatarImageUrl ? `url(${supplier.avatarImageUrl})` : "url('/avatars/1.jpg')" }}
        />
        <h1 className="mt-8 text-5xl text-[#201c44]" style={{ fontFamily: marketingPloniFont }}>{supplier.businessName}</h1>
        <p className="text-xl text-slate-600" style={{ fontFamily: marketingPloniFont }}>{supplier.category ?? ""}</p>
      </div>

      <div className="mx-auto mt-6 max-w-[1100px]">
        <div className="flex justify-center gap-3 text-xs text-[#2d3255]">
          {supplier.ratingAvg != null && (
            <span className="rounded-full bg-[#201c44] px-3 py-2 text-white">★ {Number(supplier.ratingAvg).toFixed(1)}</span>
          )}
          {supplier.city && (
            <span className="rounded-full bg-[#201c44] px-3 py-2 text-white">{supplier.city}</span>
          )}
        </div>

        <div className="mt-8 text-center">
          <h2 className="text-4xl text-[#201c44]" style={{ fontFamily: marketingPloniFont }}>A little about us</h2>
          <p className="mx-auto mt-2 max-w-4xl text-sm text-slate-600" style={{ fontFamily: marketingPloniFont }}>
            {supplier.description}
          </p>
        </div>

        {supplier.gallery && supplier.gallery.length > 0 && (
          <div className="mt-8 grid grid-cols-4 gap-4">
            {supplier.gallery.slice(0, 4).map((url, i) => (
              <div key={i} className="h-36 rounded-xl bg-cover bg-center" style={{ backgroundImage: `url(${url})` }} />
            ))}
          </div>
        )}

        {reviews.length > 0 && (
          <div className="mt-8 grid gap-3">
            {reviews.slice(0, 2).map((r) => (
              <div key={r.id} className="rounded-xl border border-slate-200 bg-white p-3">
                <p className="text-sm text-[#3f3f69]">★ {r.rating}</p>
                {r.title && <p className="text-sm font-medium text-slate-700">{r.title}</p>}
                {r.comment && <p className="text-sm text-slate-600">{r.comment}</p>}
              </div>
            ))}
          </div>
        )}

        <div className="mt-6 flex items-center justify-between">
          {userHasReviewed ? (
            <span className="rounded-full border border-green-400 bg-green-50 px-6 py-2 text-green-700">Already reviewed</span>
          ) : (
            <button type="button" onClick={() => setShowRating(true)} className="rounded-full border border-[#201c44] px-6 py-2 text-[#201c44] cursor-pointer">Rate the supplier</button>
          )}
          <button className="rounded-full bg-[#201c44] px-8 py-2 text-white! visited:text-white hover:text-white! focus:text-white!">Contact us</button>
        </div>
      </div>

      {showRating && (
        <>
          <div className="fixed inset-0 z-40 bg-[rgba(15,23,42,0.5)]" onClick={() => setShowRating(false)} />
          <div className="fixed left-1/2 top-1/2 z-50 w-[700px] max-w-[95vw] -translate-x-1/2 -translate-y-1/2 rounded-[24px] bg-[#deecfd] p-8 shadow-2xl">
            <h2 className="text-center text-5xl text-[#1e1b4b]">Supplier rating</h2>
            <div className="mx-auto mt-5 h-36 w-36 rounded-xl bg-cover bg-center" style={{ backgroundImage: supplier.avatarImageUrl ? `url(${supplier.avatarImageUrl})` : "none" }} />
            <p className="mt-2 text-center text-sm text-slate-600">{supplier.businessName}</p>
            <div className="mt-4">
              <textarea className="h-24 w-full rounded-xl bg-white px-4 py-3" placeholder="Write a review..." />
            </div>
            <button className="mx-auto mt-6 block rounded-full bg-[#201c44] px-10 py-2 text-white">Submit a review</button>
            <button onClick={() => setShowRating(false)} className="mx-auto mt-3 block rounded-full border border-slate-400 px-10 py-2 text-[#3a4362]">Cancel</button>
          </div>
        </>
      )}
    </section>
  );
}
