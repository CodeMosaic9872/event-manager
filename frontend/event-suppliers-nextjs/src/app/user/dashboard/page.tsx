"use client";

import Link from "next/link";

export default function UserDashboardPage() {
  return (
    <section className="relative mx-auto min-h-[calc(100vh-120px)] w-full max-w-[1440px] overflow-hidden rounded-[24px] border border-[#bfdbfe] bg-[linear-gradient(180deg,#9BD3EF_0%,#FFFFFF_58%)] px-6 py-8">
      <div className="pointer-events-none absolute -left-24 top-40 size-80 rounded-full bg-[#6ab7ff]/30 blur-2xl" />
      <div className="mx-auto max-w-[1000px]">
        <div className="mb-6 flex items-start justify-between">
          <div />
          <div className="text-right">
            <h1 className="text-5xl text-[#1e1b4b]">Welcome, Daniel.</h1>
            <h2 className="mt-2 text-4xl text-[#1e1b4b]">Quick actions</h2>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="figma-panel p-6 text-right">
            <h3 className="text-xl text-[#1e1b4b]">Supplier Approval Page</h3>
            <p className="mt-2 text-sm text-slate-500">You have 3 suppliers awaiting approval.</p>
            <button className="mt-5 rounded-full bg-[#201c44] px-6 py-2 text-sm text-white">← Choosing suppliers</button>
          </div>
          <div className="figma-panel p-6 text-right">
            <h3 className="text-xl text-[#1e1b4b]">Add a new tender</h3>
            <p className="mt-2 text-sm text-slate-500">Add a tender to find the breaks that suit your bud.</p>
            <button className="mt-5 rounded-full bg-[#201c44] px-6 py-2 text-sm text-white">← To open a tender</button>
          </div>
        </div>

        <h2 className="mt-10 text-right text-4xl text-[#1e1b4b]">Manage my tenders</h2>
        <div className="mt-3 grid gap-4 md:grid-cols-2">
          {[1, 2].map((x) => (
            <article key={x} className="figma-panel p-5 text-right">
              <div className="mb-2 text-[10px] text-[#3b82f6]">MY AUCTION</div>
              <h3 className="text-2xl text-[#1e1b4b]">Amplification and lighting for a company conference</h3>
              <p className="mt-1 text-xs text-slate-500">Aug 15, 2024</p>
              <div className="mt-4 flex items-center justify-between">
                <button className="rounded-full bg-[#201c44] px-4 py-1 text-xs text-white">proposal managem</button>
                <p className="text-xl text-[#1e1b4b]">₪5,000</p>
              </div>
              <button className="mt-4 rounded-full bg-[#201c44] px-5 py-2 text-xs text-white">← Tendering</button>
            </article>
          ))}
        </div>

        <div className="mt-12 grid gap-3 md:grid-cols-3">
          {[1, 2, 3].map((item) => (
            <article key={item} className="rounded-2xl border border-slate-200 bg-white p-4 text-center">
              <div className="mx-auto mb-3 size-16 rounded-full border-2 border-[#6ab7ff] bg-slate-200" />
              <h3 className="text-xl text-[#201c44]">DJ Alon Perry</h3>
              <p className="text-xs text-slate-500">MUSIC AND PRODUCTION</p>
              <p className="mt-2 text-xs text-slate-600">All of Israel | South</p>
              <p className="text-xs text-amber-500">4.3 ★</p>
            </article>
          ))}
        </div>

        <div className="mt-10 grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl border border-[#4721df] bg-white overflow-hidden">
            <div className="h-40 bg-[url('https://images.unsplash.com/photo-1511578314322-379afb476865?q=80&w=1200&auto=format&fit=crop')] bg-cover bg-center" />
            <div className="p-4 text-right">
              <h3 className="text-3xl text-[#1e1b4b]">Annual Technology Conference</h3>
              <Link href="#" className="text-sm text-[#3b82f6]">To view the concept</Link>
            </div>
          </div>
          <div className="rounded-2xl border border-[#4721df] bg-white overflow-hidden">
            <div className="h-40 bg-[url('https://images.unsplash.com/photo-1478144592103-25e218a04891?q=80&w=1200&auto=format&fit=crop')] bg-cover bg-center" />
            <div className="p-4 text-right">
              <h3 className="text-3xl text-[#1e1b4b]">Summer wedding in Jaffa</h3>
              <Link href="#" className="text-sm text-[#3b82f6]">To view the concept</Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
