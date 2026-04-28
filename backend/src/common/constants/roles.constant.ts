export const PLATFORM_ROLES = ['USER', 'SUPPLIER', 'ADMIN'] as const;

export type PlatformRole = (typeof PLATFORM_ROLES)[number];
