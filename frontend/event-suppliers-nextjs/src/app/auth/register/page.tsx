"use client";

import Link from "next/link";
import { FormEvent, Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { setCredentials } from "@/features/auth/auth-slice";
import { useRegisterMutation } from "@/shared/api/api";
import {
  getPostLoginFallbackPath,
  getSafeInternalRedirectPath,
} from "@/shared/lib/safe-redirect-path";
import type { UserRole } from "@/shared/types";
import { useAppDispatch } from "@/store/hooks";
import { SupplierRegisterFormWithSuspense } from "./supplier-register-form";

function RegisterPageContent() {
  const searchParams = useSearchParams();
  const isSupplier = searchParams.get("role")?.toUpperCase() === "SUPPLIER";
  if (isSupplier) {
    return <SupplierRegisterFormWithSuspense />;
  }
  return <GenericRegisterForm />;
}

export default function RegisterPage() {
  return (
    <Suspense
      fallback={
        <section className="relative mx-auto min-h-[calc(100vh-120px)] w-full max-w-[1440px] overflow-hidden rounded-[24px] border border-[#bfdbfe] bg-[linear-gradient(180deg,#9BD3EF_0%,#FFFFFF_58%)] px-6 py-10">
          <div className="mx-auto mt-8 h-96 max-w-[480px] animate-pulse rounded-[24px] bg-slate-200/60" />
        </section>
      }
    >
      <RegisterPageContent />
    </Suspense>
  );
}

function GenericRegisterForm() {
  const dispatch = useAppDispatch();
  const [register, { isLoading }] = useRegisterMutation();
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [role, setRole] = useState<"USER" | "SUPPLIER">(() => {
    if (typeof window === "undefined") return "USER";
    const roleParam = new URLSearchParams(window.location.search)
      .get("role")
      ?.toUpperCase();
    return roleParam === "SUPPLIER" ? "SUPPLIER" : "USER";
  });

  useEffect(() => {
    queueMicrotask(() => {
      try {
        const raw = sessionStorage.getItem("supplierJoinStep1");
        if (!raw) return;
        const d = JSON.parse(raw) as {
          fullName?: string;
          businessName?: string;
          phone?: string;
          email?: string;
        };
        if (d.fullName) setFullName(d.fullName);
        if (d.businessName) setCompanyName(d.businessName);
        if (d.phone) setPhone(d.phone);
        if (d.email) setEmail(d.email);
      } catch {
        /* ignore */
      }
    });
  }, []);

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    let resolvedRoles: UserRole[] = [role === "SUPPLIER" ? "supplier" : "user"];
    try {
      const payload = await register({ email, password, role }).unwrap();
      resolvedRoles = payload.user.roles.map(
        (item) => item.toLowerCase() as UserRole,
      );
      dispatch(
        setCredentials({
          user: {
            id: payload.user.id,
            email: payload.user.email,
            roles: resolvedRoles,
          },
          accessToken: payload.accessToken,
          refreshToken: payload.refreshToken,
        }),
      );
    } catch {
      dispatch(
        setCredentials({
          user: {
            id: "new",
            email,
            roles: resolvedRoles,
          },
        }),
      );
    }
    const params = new URLSearchParams(window.location.search);
    const nextRaw = params.get("next");
    router.push(
      getSafeInternalRedirectPath(nextRaw, getPostLoginFallbackPath(resolvedRoles)),
    );
  };

  return (
    <section className="relative mx-auto min-h-[calc(100vh-120px)] w-full max-w-[1440px] overflow-hidden rounded-[24px] border border-[#bfdbfe] bg-[linear-gradient(180deg,#9BD3EF_0%,#FFFFFF_58%)] px-6 py-10">
      <div className="pointer-events-none absolute -left-16 top-40 size-72 rounded-full bg-[#6ab7ff]/25 blur-2xl" />
      <div className="pointer-events-none absolute -right-24 top-1/2 size-80 -translate-y-1/2 rounded-full bg-[#6ab7ff]/30 blur-2xl" />

      <form
        className="mx-auto mt-8 grid w-full max-w-[480px] gap-3 rounded-[24px] border border-[#9bb9e5] bg-[#d8e5fa]/90 p-8 shadow-[0px_10px_24px_rgba(32,28,68,0.25)]"
        onSubmit={onSubmit}
      >
        <h1 className="text-center text-[42px] leading-10 text-[#101426]">
          Create a new account
        </h1>

        <button
          type="button"
          className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-[#1e1b4b]"
        >
          Sign in with Google
        </button>

        <div className="mt-2">
          <label className="mb-1 block text-right text-sm text-slate-700">
            Full name
          </label>
          <input
            className="w-full rounded-full border border-[#c8cede] bg-[#f5f6fd] px-4 py-3"
            placeholder="Full name"
            value={fullName}
            onChange={(event) => setFullName(event.target.value)}
          />
        </div>
        <input
          required
          type="email"
          className="rounded-full border border-[#c8cede] bg-[#f5f6fd] px-4 py-3"
          placeholder="אימייל"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
        />
        <input
          className="rounded-full border border-[#c8cede] bg-[#f5f6fd] px-4 py-3"
          placeholder="050-0000000"
          value={phone}
          onChange={(event) => setPhone(event.target.value)}
        />
        <label className="mb-[-6px] mt-1 block text-right text-sm text-slate-700">
          Choose a role
        </label>
        <input
          required
          type="password"
          className="rounded-full border border-[#c8cede] bg-[#f5f6fd] px-4 py-3"
          placeholder="סיסמה"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
        />
        <select
          className="rounded-full border border-[#c8cede] bg-[#f5f6fd] px-4 py-3"
          value={role}
          onChange={(event) =>
            setRole(event.target.value as "USER" | "SUPPLIER")
          }
        >
          <option value="USER">משתמש</option>
          <option value="SUPPLIER">ספק</option>
        </select>
        <input
          className="rounded-full border border-[#c8cede] bg-[#f5f6fd] px-4 py-3"
          placeholder="company"
          value={companyName}
          onChange={(event) => setCompanyName(event.target.value)}
        />
        <button
          type="submit"
          disabled={isLoading}
          className="rounded-full bg-[#232051] px-4 py-3 text-2xl text-white disabled:opacity-60"
        >
          {isLoading ? "Creating..." : "Create a free account"}
        </button>
        <p className="text-center text-sm text-slate-600">
          Already have an account?{" "}
          <Link href="/auth/login" className="text-[#201c44] underline">
            Log in here
          </Link>
        </p>
      </form>
    </section>
  );
}
