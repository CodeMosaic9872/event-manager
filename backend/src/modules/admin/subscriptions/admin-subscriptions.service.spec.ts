import { ConflictException } from '@nestjs/common';
import { AdminSubscriptionsService } from './admin-subscriptions.service';

describe('AdminSubscriptionsService', () => {
  it('createSubscription rejects when supplier already subscribed', async () => {
    const prisma = {
      supplier: { findFirst: jest.fn().mockResolvedValue({ id: 'sup_1', deletedAt: null }) },
      supplierSubscription: {
        findUnique: jest.fn().mockResolvedValue({ id: 'sub_1' }),
      },
    } as any;
    const plansService = { getById: jest.fn(), billingAmountFromPlan: jest.fn() } as any;
    const service = new AdminSubscriptionsService(prisma, plansService);

    await expect(
      service.createSubscription({
        supplierId: 'sup_1',
        interval: 'MONTHLY',
        amount: 99,
        cardcomToken: 'tok_abc',
        nextBillingAt: '2026-06-01T00:00:00.000Z',
      }),
    ).rejects.toBeInstanceOf(ConflictException);
  });
});
