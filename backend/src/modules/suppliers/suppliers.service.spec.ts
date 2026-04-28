import { SuppliersService } from './suppliers.service';

describe('SuppliersService', () => {
  it('returns cursor pagination metadata when next page exists', async () => {
    const prisma = {
      supplier: {
        findMany: jest.fn().mockResolvedValue([
          { id: 's1', ratingCount: 50 },
          { id: 's2', ratingCount: 40 },
          { id: 's3', ratingCount: 30 },
        ]),
      },
      category: {
        findUnique: jest.fn().mockResolvedValue(null),
        findMany: jest.fn().mockResolvedValue([]),
      },
      subcategory: {
        findUnique: jest.fn().mockResolvedValue(null),
      },
      eventType: {
        findUnique: jest.fn().mockResolvedValue(null),
      },
      supplierCategory: {
        groupBy: jest.fn().mockResolvedValue([]),
      },
      supplierServiceArea: {
        groupBy: jest.fn().mockResolvedValue([]),
      },
    } as any;

    const service = new SuppliersService(prisma);
    const result = await service.list({ take: 2 });

    expect(prisma.supplier.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        take: 3,
        skip: 0,
      }),
    );
    expect(result.items).toHaveLength(2);
    expect(result.pageInfo).toEqual({
      hasNextPage: true,
      nextCursor: 's2',
      take: 2,
    });
  });

  it('applies layered filters to supplier query', async () => {
    const prisma = {
      supplier: {
        findMany: jest.fn().mockResolvedValue([]),
      },
      category: {
        findUnique: jest.fn().mockResolvedValue({ id: 'cat_1' }),
        findMany: jest.fn().mockResolvedValue([]),
      },
      subcategory: {
        findUnique: jest.fn().mockResolvedValue({ id: 'sub_1' }),
      },
      eventType: {
        findUnique: jest.fn().mockResolvedValue(null),
      },
      supplierCategory: {
        groupBy: jest.fn().mockResolvedValue([]),
      },
      supplierServiceArea: {
        groupBy: jest.fn().mockResolvedValue([]),
      },
    } as any;

    const service = new SuppliersService(prisma);
    await service.list({
      q: 'music',
      categoryId: 'cat_1',
      subcategoryId: 'sub_1',
      locationRegionCode: 'north',
      minRating: 4.2,
      take: 10,
    });

    expect(prisma.supplier.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          businessName: expect.objectContaining({ contains: 'music' }),
          categories: {
            some: {
              categoryId: 'cat_1',
              subcategoryId: 'sub_1',
            },
          },
          serviceAreas: {
            some: {
              regionCode: 'north',
            },
          },
          ratingAvg: { gte: 4.2 },
        }),
      }),
    );
  });
});
