export function toAdminPagination(page?: number, limit?: number) {
  const safePage = Number.isFinite(page) && (page as number) > 0 ? Math.floor(page as number) : 1;
  const safeLimit = Number.isFinite(limit) && (limit as number) > 0 ? Math.min(200, Math.floor(limit as number)) : 20;
  return { skip: (safePage - 1) * safeLimit, take: safeLimit };
}
