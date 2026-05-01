"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { useGetSupplierByIdQuery } from "@/shared/api/api";

export default function SupplierProfilePage() {
  const [showRating, setShowRating] = useState(false);
  const params = useParams<{ supplierId: string }>();
  const supplierId = params?.supplierId || "";
  const { data: supplier, isLoading } = useGetSupplierByIdQuery(supplierId, {
    skip: !supplierId,
  });
  if (isLoading) return <section className="card">טוען פרופיל ספק...</section>;
  if (!supplier) return <section className="card">הספק לא נמצא.</section>;

  return (
    <section className="relative mx-auto w-full max-w-[1300px] overflow-hidden rounded-[24px] border border-[#bfdbfe] bg-[linear-gradient(180deg,#9BD3EF_0%,#FFFFFF_58%)] pb-12">
      <div className="h-[180px] bg-[url('https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?q=80&w=1600&auto=format&fit=crop')] bg-cover bg-center" />
      <div className="-mt-20 text-center">
        <div className="mx-auto size-60 rounded-full border-4 border-white bg-[url('https://images.unsplash.com/photo-1566753323558-f4e0952af115?q=80&w=800&auto=format&fit=crop')] bg-cover bg-center shadow-xl" />
        <h1 className="mt-8 text-5xl text-[#201c44]">DJ Galaxy - A magical experience</h1>
        <p className="text-xl text-slate-600">DJ and entertainment services</p>
      </div>

      <div className="mx-auto mt-6 max-w-[1100px]">
        <div className="flex justify-center gap-3 text-xs text-[#2d3255]">
          {["Facebook", "Email", "site", "Instagram", "phone", "WhatsApp", "Save", "Share"].map((label) => (
            <button key={label} className="rounded-full bg-[#201c44] px-3 py-2 text-white">
              {label}
            </button>
          ))}
        </div>

        <div className="mt-8 text-center">
          <h2 className="text-4xl text-[#201c44]">A little about us</h2>
          <p className="mx-auto mt-2 max-w-4xl text-sm text-slate-600">
            DJ Galaxy brings you over a decade of experience in the world of events. We specialize in creating a unique atmosphere.
          </p>
        </div>

        <div className="mt-8 grid grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="h-36 rounded-xl bg-cover bg-center"
              style={{
                backgroundImage:
                  i === 1
                    ? "url('https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=1200&auto=format&fit=crop')"
                    : i === 2
                      ? "url('https://images.unsplash.com/photo-1519671482749-fd09be7ccebf?q=80&w=1200&auto=format&fit=crop')"
                      : i === 3
                        ? "url('https://images.unsplash.com/photo-1571266028243-95c6f9f0f8d6?q=80&w=1200&auto=format&fit=crop')"
                        : "url('https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?q=80&w=1200&auto=format&fit=crop')",
              }}
            />
          ))}
        </div>

        <div className="mt-8 grid gap-3">
          {[1, 2].map((i) => (
            <div key={i} className="rounded-xl border border-slate-200 bg-white p-3">
              <p className="text-sm text-[#3f3f69]">★★★★★</p>
              <p className="text-sm text-slate-600">
                A true professional. He knew how to read the audience perfectly.
              </p>
            </div>
          ))}
        </div>

        <div className="mt-6 flex items-center justify-between">
          <button
            type="button"
            onClick={() => setShowRating(true)}
            className="rounded-full border border-[#201c44] px-6 py-2 text-[#201c44]"
          >
            Rate the supplier
          </button>
          <button className="rounded-full bg-[#201c44] px-8 py-2 text-white! visited:text-white hover:text-white! focus:text-white!">Contact us</button>
        </div>

        <div className="mt-10 grid grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <article key={i} className="rounded-2xl border border-slate-200 bg-white p-2">
              <div className="h-28 rounded-xl bg-slate-200" />
              <p className="mt-2 text-right text-xs text-slate-600">Vendor #{i}</p>
            </article>
          ))}
        </div>

        <div className="mt-8 text-right">
          <button className="rounded-full border border-slate-400 px-6 py-2 text-sm text-[#3a4362]">
            Back to the Vendor Marketplace →
          </button>
        </div>
      </div>

      {showRating && (
        <>
          <div className="absolute inset-0 bg-[rgba(15,23,42,0.5)]" />
          <div className="absolute left-1/2 top-1/2 w-[700px] -translate-x-1/2 -translate-y-1/2 rounded-[24px] bg-[#deecfd] p-8 shadow-2xl">
            <h2 className="text-center text-5xl text-[#1e1b4b]">Supplier rating</h2>
            <div className="mx-auto mt-5 h-36 w-36 rounded-xl bg-[url('https://images.unsplash.com/photo-1566753323558-f4e0952af115?q=80&w=800&auto=format&fit=crop')] bg-cover bg-center" />
            <p className="mt-2 text-center text-sm text-slate-600">DJ Galaxy</p>
            <p className="mt-4 text-center text-4xl text-[#4f46e5]">★★★★☆</p>
            <div className="mt-6">
              <label className="mb-1 block text-right text-sm text-slate-700">Full name</label>
              <input className="w-full rounded-xl bg-white px-4 py-3" placeholder="Full name" />
            </div>
            <div className="mt-4">
              <label className="mb-1 block text-right text-sm text-slate-700">Write a review</label>
              <textarea className="h-24 w-full rounded-xl bg-white px-4 py-3" placeholder="Share your experience with the supplier." />
            </div>
            <button className="mx-auto mt-6 block rounded-full bg-[#201c44] px-10 py-2 text-white">Submit a review</button>
            <button
              onClick={() => setShowRating(false)}
              className="mx-auto mt-3 block rounded-full border border-slate-400 px-10 py-2 text-[#3a4362]"
            >
              Cancel
            </button>
          </div>
        </>
      )}
    </section>
  );
}
