/// <reference types="jest" />

import { AdminSuppliersService } from './admin-suppliers.service';

describe('AdminSuppliersService', () => {
  const prisma = {
    $transaction: jest.fn((ops: unknown[]) => Promise.all(ops as Promise<unknown>[])),
    supplier: { count: jest.fn(), findMany: jest.fn(), findFirst: jest.fn() },
    category: { findMany: jest.fn() },
  };

  let service: AdminSuppliersService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new AdminSuppliersService(prisma as never, {} as never, {} as never);
  });

  it('getSupplierStats returns active and pending counts', async () => {
    prisma.supplier.count.mockResolvedValueOnce(128).mockResolvedValueOnce(12).mockResolvedValueOnce(140);

    const stats = await service.getSupplierStats();

    expect(stats).toEqual({
      activeSuppliers: 128,
      pendingApproval: 12,
      totalSuppliers: 140,
    });
  });

  it('listSuppliers applies status and search filters', async () => {
    prisma.supplier.findMany.mockResolvedValue([]);
    prisma.supplier.count.mockResolvedValue(0);

    await service.listSuppliers({ page: 1, limit: 20, status: 'approved', q: 'taam' });

    expect(prisma.supplier.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          deletedAt: null,
          approvalStatus: 'APPROVED',
          OR: expect.any(Array),
        }),
      }),
    );
  });
});
