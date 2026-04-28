/// <reference types="jest" />

import { ForbiddenException } from '@nestjs/common';
import { SupplierOnlyGuard } from './supplier-only.guard';

describe('SupplierOnlyGuard', () => {
  const guard = new SupplierOnlyGuard();
  const makeContext = (request: any) =>
    ({
      switchToHttp: () => ({
        getRequest: () => request,
      }),
    }) as any;

  it('allows supplier role', () => {
    expect(
      guard.canActivate(
        makeContext({
          user: { id: 'user_1', roles: ['SUPPLIER'] },
        }),
      ),
    ).toBe(true);
  });

  it('blocks non-supplier users', () => {
    expect(() =>
      guard.canActivate(
        makeContext({
          user: { id: 'user_2', roles: ['USER'] },
        }),
      ),
    ).toThrow(ForbiddenException);
  });
});
