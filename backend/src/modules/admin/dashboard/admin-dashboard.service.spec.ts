/// <reference types="jest" />

import { AdminDashboardService } from './admin-dashboard.service';

describe('AdminDashboardService', () => {
  const prisma = {
    $transaction: jest.fn((ops: unknown[]) => Promise.all(ops as Promise<unknown>[])),
    supplier: {
      count: jest.fn(),
      findMany: jest.fn(),
    },
    user: { count: jest.fn() },
    supplierPayment: {
      aggregate: jest.fn(),
      count: jest.fn(),
    },
    supplierShareEvent: { count: jest.fn() },
    jobApplication: { count: jest.fn() },
    jobPost: { count: jest.fn() },
  };

  let service: AdminDashboardService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new AdminDashboardService(prisma as never);
  });

  it('returns dashboard sections with KPIs and pending approvals', async () => {
    prisma.supplier.count
      .mockResolvedValueOnce(100)
      .mockResolvedValueOnce(10)
      .mockResolvedValueOnce(8)
      .mockResolvedValueOnce(5)
      .mockResolvedValue(0);
    prisma.user.count.mockResolvedValueOnce(500).mockResolvedValueOnce(40).mockResolvedValueOnce(35).mockResolvedValue(0);
    prisma.supplierPayment.aggregate
      .mockResolvedValueOnce({ _sum: { amount: 1000 } })
      .mockResolvedValueOnce({ _sum: { amount: 800 } })
      .mockResolvedValue({ _sum: { amount: 450230 } });
    prisma.supplierShareEvent.count.mockResolvedValue(0);
    prisma.jobApplication.count.mockResolvedValue(0);
    prisma.jobPost.count.mockResolvedValue(0);
    prisma.supplier.findMany.mockResolvedValue([
      {
        id: 'sup_1',
        businessName: 'Roy Levy Photography',
        createdAt: new Date('2023-10-12'),
        categories: [{ category: { name: 'Photography', nameEn: null, key: 'photo' }, subcategory: null }],
      },
    ]);

    const result = await service.getDashboard({ pendingLimit: 5, growthMonths: 2 });

    expect(result.kpis.totalSuppliers.value).toBe(100);
    expect(result.kpis.pendingApprovals.value).toBe(5);
    expect(result.pendingApprovals.items).toHaveLength(1);
    expect(result.pendingApprovals.items[0].businessName).toBe('Roy Levy Photography');
    expect(result.pendingApprovals.items[0].categoryName).toBe('Photography');
    expect(result.platformGrowth.months).toHaveLength(2);
  });
});
