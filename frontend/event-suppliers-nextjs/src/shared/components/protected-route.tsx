"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAppSelector } from "@/store/hooks";
import { UserRole } from "@/shared/types";

export function ProtectedRoute({
  children,
  roles,
}: {
  children: React.ReactNode;
  roles: UserRole[];
}) {
  const user = useAppSelector((state) => state.auth.user);
  const isHydrated = useAppSelector((state) => state.auth.isHydrated);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isHydrated) return;
    if (!user) {
      const needsAdminAccess = roles.includes("admin");
      const needsSupplierAccess = roles.includes("supplier");
      const loginBase = needsAdminAccess
        ? "/auth/login/admin"
        : needsSupplierAccess
          ? "/auth/login/supplier"
          : "/auth/login";
      router.replace(`${loginBase}?next=${encodeURIComponent(pathname)}`);
      return;
    }
    if (!user.roles.some((role) => roles.includes(role))) {
      router.replace("/");
    }
  }, [isHydrated, user, router, roles, pathname]);

  if (!isHydrated) return null;
  if (!user || !user.roles.some((role) => roles.includes(role))) return null;
  return <>{children}</>;
}
