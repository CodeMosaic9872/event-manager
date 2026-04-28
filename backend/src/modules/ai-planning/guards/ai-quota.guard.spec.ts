/// <reference types="jest" />

import { ForbiddenException } from '@nestjs/common';
import { AiQuotaGuard } from './ai-quota.guard';

describe('AiQuotaGuard', () => {
  const makeContext = (request: any) =>
    ({
      switchToHttp: () => ({
        getRequest: () => request,
      }),
    }) as any;

  it('allows registered users regardless of anonymous token', async () => {
    const prisma = {} as any;
    const guard = new AiQuotaGuard(prisma);
    await expect(
      guard.canActivate(
        makeContext({
          user: { id: 'user_1', roles: ['USER'] },
          body: {},
        }),
      ),
    ).resolves.toBe(true);
  });

  it('blocks anonymous requests above quota', async () => {
    const prisma = {
      anonymousSession: { findUnique: jest.fn().mockResolvedValue({ id: 'anon_session_1' }), update: jest.fn() },
      aiUsageCounter: { findUnique: jest.fn().mockResolvedValue({ messageCount: 10 }) },
    } as any;
    const guard = new AiQuotaGuard(prisma);

    await expect(
      guard.canActivate(
        makeContext({
          body: { anonymousToken: 'anon_token' },
        }),
      ),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('blocks when fingerprint hash does not match existing session fingerprint', async () => {
    const prisma = {
      anonymousSession: {
        findUnique: jest.fn().mockResolvedValue({ id: 'anon_session_1', fingerprintHash: 'fp_known', ipHash: null }),
        update: jest.fn(),
      },
      aiUsageCounter: { findUnique: jest.fn().mockResolvedValue({ messageCount: 1 }) },
    } as any;
    const guard = new AiQuotaGuard(prisma);

    await expect(
      guard.canActivate(
        makeContext({
          headers: { 'x-anon-fingerprint-hash': 'fp_other' },
          body: { anonymousToken: 'anon_token' },
        }),
      ),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });
});
