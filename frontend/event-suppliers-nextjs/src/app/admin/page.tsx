"use client";

import { ProtectedRoute } from "@/shared/components/protected-route";

const widgets = [
  "ניהול משתמשים",
  "ניהול ספקים",
  "ניהול מודעות דרושים",
  "ניהול קטגוריות ופילטרים",
  "ניטור AI ואנליטיקות",
  "ניהול פניות ודיווחים",
];

export default function AdminPage() {
  return (
    <ProtectedRoute roles={["admin"]}>
      <section className="mx-auto w-full max-w-[1200px] rounded-[24px] border border-[#bfdbfe] bg-[linear-gradient(180deg,#9BD3EF_0%,#FFFFFF_58%)] p-8">
        <div className="rounded-2xl border border-[#4721df] bg-[rgba(198,220,255,0.30)] p-5">
          <h1 className="text-3xl text-[#201c44]">דשבורד אדמין</h1>
          <p className="mt-1 text-sm text-slate-600">
            תצוגת מעטפת לניהול ישויות מערכת, ניטור תעבורה ותהליכי אישור ספקים.
          </p>
        </div>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          {widgets.map((widget) => (
            <div key={widget} className="rounded-2xl border border-slate-200 bg-white p-4 text-sm font-medium">
              {widget}
            </div>
          ))}
        </div>
      </section>
    </ProtectedRoute>
  );
}
