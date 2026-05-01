import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { TaxonomyMappingQueryDto } from './dto/taxonomy-mapping-query.dto';

@Injectable()
export class TaxonomyService {
  constructor(private readonly prisma: PrismaService) {}

  private toPagination(page?: number, limit?: number) {
    const safePage = Number.isFinite(page) && (page as number) > 0 ? Math.floor(page as number) : 1;
    const safeLimit = Number.isFinite(limit) && (limit as number) > 0 ? Math.min(200, Math.floor(limit as number)) : 20;
    return { skip: (safePage - 1) * safeLimit, take: safeLimit };
  }

  async getEventTypes(page?: number, limit?: number) {
    const pg = this.toPagination(page, limit);
    const where = { isActive: true };
    const [items, totalItems] = await this.prisma.$transaction([
      this.prisma.eventType.findMany({ where, orderBy: { name: 'asc' }, skip: pg.skip, take: pg.take }),
      this.prisma.eventType.count({ where }),
    ]);
    return { items, totalItems };
  }

  async getCategories(page?: number, limit?: number) {
    const pg = this.toPagination(page, limit);
    const where = { isActive: true };
    const [items, totalItems] = await this.prisma.$transaction([
      this.prisma.category.findMany({ where, orderBy: { sortOrder: 'asc' }, skip: pg.skip, take: pg.take }),
      this.prisma.category.count({ where }),
    ]);
    return { items, totalItems };
  }

  async getSubcategories(categoryId: string, page?: number, limit?: number) {
    const pg = this.toPagination(page, limit);
    const where = { categoryId, isActive: true };
    const [items, totalItems] = await this.prisma.$transaction([
      this.prisma.subcategory.findMany({
        where,
        orderBy: { sortOrder: 'asc' },
        skip: pg.skip,
        take: pg.take,
      }),
      this.prisma.subcategory.count({ where }),
    ]);
    return { items, totalItems };
  }

  async getFilterDefinitions(categoryId?: string, page?: number, limit?: number) {
    const pg = this.toPagination(page, limit);
    const where = {
      isActive: true,
      OR: [{ scope: 'GLOBAL' }, categoryId ? { scope: 'CATEGORY', categoryId } : undefined].filter(Boolean) as object[],
    };
    const [items, totalItems] = await this.prisma.$transaction([
      this.prisma.filterDefinition.findMany({
        where,
        orderBy: { sortOrder: 'asc' },
        skip: pg.skip,
        take: pg.take,
      }),
      this.prisma.filterDefinition.count({ where }),
    ]);
    return { items, totalItems };
  }

  async getMapping(query: TaxonomyMappingQueryDto, page?: number, limit?: number) {
    const pg = this.toPagination(page, limit);
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
      skip: pg.skip,
      take: pg.take,
    });
    const totalItems = await this.prisma.eventCategorySubcategoryMap.count({
      where: {
        eventTypeId: query.eventTypeId ?? undefined,
        categoryId: query.categoryId ?? undefined,
      },
    });

    return {
      filters: {
        eventTypeId: query.eventTypeId ?? null,
        categoryId: query.categoryId ?? null,
      },
      count: mappings.length,
      totalItems,
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
