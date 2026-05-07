import type { UserRole } from "@/shared/types";

/** Allows same-origin path redirects after login/register (no protocol-relative or external). */
export function getSafeInternalRedirectPath(
  raw: string | null | undefined,
  fallback: string,
): string {
  if (!raw || typeof raw !== "string") return fallback;
  const path = raw.trim().split("?")[0];
  if (!path.startsWith("/") || path.startsWith("//")) return fallback;
  return path;
}

/** Default internal route after auth when no `next` query is present. */
export function getPostLoginFallbackPath(roles: UserRole[]): string {
  if (roles.some((r) => r === "admin")) {
    return "/admin";
  }
  if (roles.some((r) => r === "supplier")) {
    return "/supplier/dashboard";
  }
  return "/user/dashboard";
}
