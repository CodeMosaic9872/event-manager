/**
 * Build a URL with merged query params: start from current search params, apply updates (null removes key).
 */
export function mergeSearchParamsToHref(
  pathname: string,
  current: Record<string, string | string[] | undefined>,
  updates: Record<string, string | undefined | null>,
): string {
  const p = new URLSearchParams();
  for (const [key, value] of Object.entries(current)) {
    if (value === undefined || value === null) continue;
    const v = Array.isArray(value) ? value[0] : value;
    if (typeof v !== "string") continue;
    p.set(key, v);
  }
  for (const [key, value] of Object.entries(updates)) {
    if (value === null || value === undefined) {
      p.delete(key);
      continue;
    }
    p.set(key, value);
  }
  const q = p.toString();
  return q ? `${pathname}?${q}` : pathname;
}
