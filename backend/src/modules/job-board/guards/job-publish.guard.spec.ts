/// <reference types="jest" />

import { ForbiddenException } from '@nestjs/common';
import { JobPublishGuard } from './job-publish.guard';

describe('JobPublishGuard', () => {
  const guard = new JobPublishGuard();
  const makeContext = (request: any) =>
    ({
      switchToHttp: () => ({
        getRequest: () => request,
      }),
    }) as any;

  it('allows authenticated non-anonymous users', () => {
    expect(
      guard.canActivate(
        makeContext({
          user: { id: 'user_1', roles: ['USER'] },
        }),
      ),
    ).toBe(true);
  });

  it('blocks anonymous users from publishing jobs', () => {
    expect(() =>
      guard.canActivate(
        makeContext({
          user: { id: 'anonymous:session_1', roles: ['USER'] },
        }),
      ),
    ).toThrow(ForbiddenException);
  });
});
