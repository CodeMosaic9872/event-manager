import { TaxonomyService } from './taxonomy.service';

describe('TaxonomyService', () => {
  it('returns mapping response contract from DB rows', async () => {
    const prisma = {
      eventCategorySubcategoryMap: {
        findMany: jest.fn().mockResolvedValue([
          {
            priority: 1,
            isDefault: true,
            eventType: { id: 'e1', key: 'wedding', name: 'Wedding' },
            category: { id: 'c1', key: 'food', name: 'Food' },
            subcategory: { id: 's1', key: 'catering', name: 'Catering' },
          },
        ]),
      },
    } as any;

    const service = new TaxonomyService(prisma);
    const result = await service.getMapping({ eventTypeId: 'e1', categoryId: 'c1' });

    expect(prisma.eventCategorySubcategoryMap.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          eventTypeId: 'e1',
          categoryId: 'c1',
        },
      }),
    );
    expect(result).toEqual({
      filters: {
        eventTypeId: 'e1',
        categoryId: 'c1',
      },
      count: 1,
      items: [
        {
          eventType: { id: 'e1', key: 'wedding', name: 'Wedding' },
          category: { id: 'c1', key: 'food', name: 'Food' },
          subcategory: { id: 's1', key: 'catering', name: 'Catering' },
          priority: 1,
          isDefault: true,
        },
      ],
    });
  });
});
