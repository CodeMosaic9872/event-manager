"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { addJob } from "@/features/job-board/job-board-slice";
import { useCreateJobMutation } from "@/shared/api/api";

export default function PublishJobPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [createJob, { isLoading }] = useCreateJobMutation();
  const user = useAppSelector((state) => state.auth.user);
  const [form, setForm] = useState({
    title: "",
    eventType: "חתונה",
    city: "",
    budget: "",
    date: "",
    description: "",
  });

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!user) {
      router.push("/auth/register?reason=publish-job");
      return;
    }
    try {
      await createJob({
        title: form.title,
        description: form.description,
        eventDate: form.date,
        locationText: form.city,
        budgetMin: Number(form.budget.split("-")[0]) || undefined,
        budgetMax: Number(form.budget.split("-")[1]) || undefined,
      }).unwrap();
    } catch {
      dispatch(addJob({ id: Date.now().toString(), ...form }));
    }
    router.push("/jobs");
  };

  return (
    <section className="mx-auto w-full max-w-[1200px] rounded-[24px] border border-[#bfdbfe] bg-[linear-gradient(180deg,#9BD3EF_0%,#FFFFFF_58%)] p-8">
      <h1 className="text-right text-3xl text-[#201c44]">פרסום מכרז חדש</h1>
      <form className="mt-6 grid gap-4 rounded-2xl border border-[#4721df] bg-[rgba(198,220,255,0.30)] p-6" onSubmit={onSubmit}>
        <input
          required
          className="rounded-xl border border-slate-300 bg-white px-3 py-2"
          placeholder="כותרת מודעה"
          value={form.title}
          onChange={(event) => setForm({ ...form, title: event.target.value })}
        />
        <input
          required
          className="rounded-xl border border-slate-300 bg-white px-3 py-2"
          placeholder="סוג אירוע"
          value={form.eventType}
          onChange={(event) => setForm({ ...form, eventType: event.target.value })}
        />
        <input
          required
          className="rounded-xl border border-slate-300 bg-white px-3 py-2"
          placeholder="עיר"
          value={form.city}
          onChange={(event) => setForm({ ...form, city: event.target.value })}
        />
        <input
          required
          className="rounded-xl border border-slate-300 bg-white px-3 py-2"
          placeholder="תקציב"
          value={form.budget}
          onChange={(event) => setForm({ ...form, budget: event.target.value })}
        />
        <input
          required
          type="date"
          className="rounded-xl border border-slate-300 bg-white px-3 py-2"
          value={form.date}
          onChange={(event) => setForm({ ...form, date: event.target.value })}
        />
        <textarea
          required
          className="rounded-xl border border-slate-300 bg-white px-3 py-2"
          placeholder="תיאור מלא"
          value={form.description}
          onChange={(event) => setForm({ ...form, description: event.target.value })}
        />
        <button
          className="figma-primary-btn disabled:opacity-60"
          type="submit"
          disabled={isLoading}
        >
          {isLoading ? "מפרסם..." : "פרסום"}
        </button>
      </form>
    </section>
  );
}
