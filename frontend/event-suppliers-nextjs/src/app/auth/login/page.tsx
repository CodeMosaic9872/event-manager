"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { setCredentials } from "@/features/auth/auth-slice";
import { useLoginMutation } from "@/shared/api/api";
import { useAppDispatch } from "@/store/hooks";

export default function LoginPage() {
  const dispatch = useAppDispatch();
  const [login, { isLoading }] = useLoginMutation();
  const router = useRouter();
  const [identity, setIdentity] = useState("");
  const [passwordOrOtp, setPasswordOrOtp] = useState("");
  const [error, setError] = useState("");

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    try {
      const payload = await login({ email: identity, password: passwordOrOtp }).unwrap();
      dispatch(
        setCredentials({
          user: {
            id: payload.user.id,
            email: payload.user.email,
            roles: payload.user.roles.map((role) => role.toLowerCase() as "user" | "supplier" | "admin"),
          },
          accessToken: payload.accessToken,
          refreshToken: payload.refreshToken,
        }),
      );
      const nextPath = new URLSearchParams(window.location.search).get("next") || "/";
      router.push(nextPath);
    } catch {
      setError("ההתחברות נכשלה, נוצר משתמש דמו להמשך פיתוח.");
      dispatch(
        setCredentials({
          user: { id: "demo-user", email: identity, roles: ["user"] },
        }),
      );
      const nextPath = new URLSearchParams(window.location.search).get("next") || "/";
      router.push(nextPath);
    }
  };

  return (
    <section className="relative mx-auto min-h-[calc(100vh-120px)] w-full max-w-[1440px] overflow-hidden rounded-[24px] border border-[#bfdbfe] bg-[linear-gradient(180deg,#9BD3EF_0%,#FFFFFF_58%)] px-6 py-10">
      <div className="pointer-events-none absolute -left-16 top-40 size-72 rounded-full bg-[#6ab7ff]/25 blur-2xl" />
      <div className="pointer-events-none absolute -right-24 top-1/2 size-80 -translate-y-1/2 rounded-full bg-[#6ab7ff]/30 blur-2xl" />

      <form
        className="mx-auto mt-8 w-full max-w-[480px] rounded-[24px] border border-[#9bb9e5] bg-[#d8e5fa]/90 p-8 shadow-[0px_10px_24px_rgba(32,28,68,0.25)]"
        onSubmit={onSubmit}
      >
        <div className="mx-auto mb-6 w-[244px] rounded-full border border-[#d0d7e7] bg-[#eef2ff] p-1 shadow-inner">
          <div className="grid grid-cols-2 text-center text-sm">
            <div className="rounded-full bg-[#201c44] px-4 py-2 text-white">User login</div>
            <div className="px-4 py-2 text-slate-500">Provider login</div>
          </div>
        </div>

        <div className="text-center">
          <h1 className="text-[42px] leading-10 text-[#101426]">User login</h1>
          <p className="mt-3 text-sm text-slate-500">
            Select your preferred login method to log in.
          </p>
        </div>

        <button
          type="button"
          className="mt-7 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-[#1e1b4b]"
        >
          Sign in with Google
        </button>

        <div className="mt-7 rounded-xl border border-slate-200 bg-white p-1">
          <div className="grid grid-cols-2 text-center text-sm">
            <button type="button" className="rounded-lg px-3 py-2 text-slate-500">
              Phone number
            </button>
            <button type="button" className="rounded-lg bg-[#201c44] px-3 py-2 text-white">
              Email
            </button>
          </div>
        </div>

        <div className="mt-4 grid gap-3">
          <label className="text-right text-sm text-slate-700">Email / Phone</label>
          <input
            required
            className="rounded-xl border border-[#c8cede] bg-[#f5f6fd] px-4 py-3"
            placeholder="Enter your details"
            value={identity}
            onChange={(event) => setIdentity(event.target.value)}
          />
          <button
            type="button"
            className="rounded-full bg-[#232051] px-4 py-3 text-2xl text-white"
          >
            Getting a code
          </button>
          <div className="mt-2 border-t border-slate-300 pt-3">
            <div className="mb-2 flex items-center justify-between text-xs text-slate-500">
              <span>Send again</span>
              <span>Enter verification code (OTP)</span>
            </div>
            <div className="grid grid-cols-4 gap-2">
              {[1, 2, 3, 4].map((item) => (
                <input key={item} className="h-12 rounded-lg border border-slate-200 bg-[#f7f8fc] text-center" />
              ))}
            </div>
          </div>
          <input
            type="password"
            required
            className="rounded-xl border border-slate-300 bg-white px-4 py-3"
            placeholder="Password (or OTP)"
            value={passwordOrOtp}
            onChange={(event) => setPasswordOrOtp(event.target.value)}
          />
          {error && <p className="text-sm text-red-700">{error}</p>}
          <button
            type="submit"
            disabled={isLoading}
            className="rounded-full bg-[#c4c8d6] px-4 py-3 text-[#232051] disabled:opacity-60"
          >
            {isLoading ? "Logging in..." : "Logging in to the system"}
          </button>
        </div>

        <p className="mt-6 text-center text-sm text-slate-600">
          First time?{" "}
          <Link href="/auth/register" className="text-[#201c44] underline">
            Register as a user / supplier
          </Link>
        </p>
      </form>
    </section>
  );
}
