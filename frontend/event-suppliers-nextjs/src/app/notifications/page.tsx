"use client";

import { useState } from "react";
import {
  useGetNotificationPreferencesQuery,
  useUpdateNotificationPreferencesMutation,
} from "@/shared/api/api";

export default function NotificationsPage() {
  const { data, isLoading } = useGetNotificationPreferencesQuery();
  const [updatePrefs, { isLoading: isSaving }] = useUpdateNotificationPreferencesMutation();
  const [local, setLocal] = useState({
    emailEnabled: true,
    pushEnabled: true,
  });

  const state = data || local;

  return (
    <section className="mx-auto w-full max-w-[1200px] rounded-[24px] border border-[#bfdbfe] p-8">
      <div className="rounded-2xl border border-[#4721df] bg-[rgba(198,220,255,0.30)] p-5">
        <h1 className="text-3xl text-[#201c44]">מרכז התראות</h1>
        <p className="mt-1 text-sm text-slate-600">ניהול התראות אימייל ו-Push עבור פעילות דרושים וספקים.</p>
      </div>
      <div className="mt-4 grid gap-3 rounded-2xl border border-slate-200 bg-white p-5">
        {isLoading && <p className="text-sm text-slate-600">טוען העדפות...</p>}
        <label className="flex items-center justify-between rounded-lg border border-slate-200 p-3">
          <span>התראות אימייל</span>
          <input
            type="checkbox"
            checked={state.emailEnabled}
            onChange={(event) =>
              setLocal((prev) => ({
                ...prev,
                emailEnabled: event.target.checked,
              }))
            }
          />
        </label>
        <label className="flex items-center justify-between rounded-lg border border-slate-200 p-3">
          <span>התראות Push</span>
          <input
            type="checkbox"
            checked={state.pushEnabled}
            onChange={(event) =>
              setLocal((prev) => ({
                ...prev,
                pushEnabled: event.target.checked,
              }))
            }
          />
        </label>
        <button
          type="button"
          className="figma-primary-btn w-fit disabled:opacity-60"
          disabled={isSaving}
          onClick={() =>
            updatePrefs({
              emailEnabled: local.emailEnabled,
              pushEnabled: local.pushEnabled,
            })
          }
        >
          {isSaving ? "שומר..." : "שמירת העדפות"}
        </button>
      </div>
    </section>
  );
}
