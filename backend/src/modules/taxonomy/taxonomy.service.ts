import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { TaxonomyMappingQueryDto } from './dto/taxonomy-mapping-query.dto';

@Injectable()
export class TaxonomyService {
  constructor(private readonly prisma: PrismaService) {}

  getEventTypes() {
    return this.prisma.eventType.findMany({ where: { isActive: true }, orderBy: { name: 'asc' } });
  }

  getCategories() {
    return this.prisma.category.findMany({ where: { isActive: true }, orderBy: { sortOrder: 'asc' } });
  }

  getSubcategories(categoryId: string) {
    return this.prisma.subcategory.findMany({
      where: { categoryId, isActive: true },
      orderBy: { sortOrder: 'asc' },
    });
  }

  getFilterDefinitions(categoryId?: string) {
    return this.prisma.filterDefinition.findMany({
      where: {
        isActive: true,
        OR: [{ scope: 'GLOBAL' }, categoryId ? { scope: 'CATEGORY', categoryId } : undefined].filter(
          Boolean,
        ) as object[],
      },
      orderBy: { sortOrder: 'asc' },
    });
  }

  async getMapping(query: TaxonomyMappingQueryDto) {
    const mappings = await this.prisma.eventCategorySubcategoryMap.findMany({
      where: {
        eventTypeId: query.eventTypeId ?? undefined,
        categoryId: query.categoryId ?? undefined,
      },
      include: {
        eventType: { select: { id: true, key: true, name: true } },
        category: { select: { id: true, key: true, name: true } },
        subcategory: { select: { id: true, key: true, name: true } },
      },
      orderBy: [{ priority: 'asc' }, { createdAt: 'asc' }],
    });

    return {
      filters: {
        eventTypeId: query.eventTypeId ?? null,
        categoryId: query.categoryId ?? null,
      },
      count: mappings.length,
      items: mappings.map((row) => ({
        eventType: row.eventType,
        category: row.category,
        subcategory: row.subcategory,
        priority: row.priority,
        isDefault: row.isDefault,
      })),
    };
  }
}
