import { BadRequestException, ConflictException, Injectable, NotFoundException, Optional } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { ListSuppliersQueryDto } from './dto/list-suppliers-query.dto';
import { MediaStorageService } from './media-storage.service';
import { AutomationService } from '../notifications/automation.service';

@Injectable()
export class SuppliersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly mediaStorage: MediaStorageService,
    @Optional() private readonly automationService?: AutomationService,
  ) {}

  private toPagination(page?: number, limit?: number) {
    const safePage = Number.isFinite(page) && (page as number) > 0 ? Math.floor(page as number) : 1;
    const safeLimit = Number.isFinite(limit) && (limit as number) > 0 ? Math.min(200, Math.floor(limit as number)) : 20;
    return { skip: (safePage - 1) * safeLimit, take: safeLimit };
  }

  async list(query: ListSuppliersQueryDto) {
    const startedAt = Date.now();
    const take = Math.min(query.take ?? 20, 100);
    const cursor = query.cursor ?? undefined;
    const hasCursor = Boolean(cursor);
    const hasEventType = Boolean(query.eventTypeId);
    const warnings: string[] = [];

    let categoryId = query.categoryId;
    if (categoryId) {
      const exists = await this.prisma.category.findUnique({ where: { id: categoryId }, select: { id: true } });
      if (!exists) {
        warnings.push('Ignored invalid categoryId filter');
        categoryId = undefined;
      }
    }

    let subcategoryId = query.subcategoryId;
    if (subcategoryId) {
      const exists = await this.prisma.subcategory.findUnique({
        where: { id: subcategoryId },
        select: { id: true },
      });
      if (!exists) {
        warnings.push('Ignored invalid subcategoryId filter');
        subcategoryId = undefined;
      }
    }

    let eventTypeId = query.eventTypeId;
    if (eventTypeId) {
      const exists = await this.prisma.eventType.findUnique({ where: { id: eventTypeId }, select: { id: true } });
      if (!exists) {
        warnings.push('Ignored invalid eventTypeId filter');
        eventTypeId = undefined;
      }
    }

    let allowedPairs: Array<{ categoryId: string; subcategoryId: string }> = [];
    if (eventTypeId) {
      const mappings = await this.prisma.eventCategorySubcategoryMap.findMany({
        where: {
          eventTypeId,
          categoryId: categoryId ?? undefined,
          subcategoryId: subcategoryId ?? undefined,
        },
        select: { categoryId: true, subcategoryId: true },
      });

      allowedPairs = mappings;
      if (allowedPairs.length === 0) {
        return {
          items: [],
          pageInfo: {
            hasNextPage: false,
            nextCursor: null,
            take,
          },
          relaxationHints: this.buildRelaxationHints(query),
          warnings,
          facets: {
            categories: [],
            regions: [],
          },
          searchMeta: {
            latencyMs: Date.now() - startedAt,
            constrainedByEventType: true,
          },
        };
      }
    }

    const supplierWhere: Prisma.SupplierWhereInput = {
      isActive: true,
      approvalStatus: 'APPROVED',
      businessName: query.q
        ? {
            contains: query.q,
            mode: 'insensitive',
          }
        : undefined,
      categories: eventTypeId
        ? {
            some: {
              OR: allowedPairs.map((pair) => ({
                categoryId: pair.categoryId,
                subcategoryId: pair.subcategoryId,
              })),
            },
          }
        : categoryId || subcategoryId
          ? {
              some: {
                categoryId: categoryId ?? undefined,
                subcategoryId: subcategoryId ?? undefined,
              },
            }
          : undefined,
      serviceAreas: query.locationRegionCode
        ? {
            some: {
              regionCode: query.locationRegionCode,
            },
          }
        : undefined,
      ratingAvg: query.minRating ? { gte: query.minRating } : undefined,
    };

    const items = await this.prisma.supplier.findMany({
      where: supplierWhere,
      include: {
        categories: true,
        media: true,
        serviceAreas: true,
      },
      take: take + 1,
      orderBy: [{ ratingCount: 'desc' }, { id: 'asc' }],
      cursor: hasCursor ? { id: cursor } : undefined,
      skip: hasCursor ? 1 : 0,
    });

    const hasNextPage = items.length > take;
    const sliced = hasNextPage ? items.slice(0, take) : items;
    const nextCursor = hasNextPage ? sliced[sliced.length - 1]?.id ?? null : null;
    const [categoryFacets, regionFacets] = await Promise.all([
      this.prisma.supplierCategory.groupBy({
        by: ['categoryId'],
        where: { supplier: supplierWhere },
        _count: { categoryId: true },
        orderBy: { _count: { categoryId: 'desc' } },
        take: 5,
      }),
      this.prisma.supplierServiceArea.groupBy({
        by: ['regionCode'],
        where: { supplier: supplierWhere },
        _count: { regionCode: true },
        orderBy: { _count: { regionCode: 'desc' } },
        take: 5,
      }),
    ]);

    const categoryRows = categoryFacets.length
      ? await this.prisma.category.findMany({
          where: { id: { in: categoryFacets.map((row) => row.categoryId) } },
          select: { id: true, key: true, name: true },
        })
      : [];

    const categoryNameById = new Map(categoryRows.map((row) => [row.id, row]));

    return {
      items: sliced,
      pageInfo: {
        hasNextPage,
        nextCursor,
        take,
      },
      relaxationHints: sliced.length === 0 ? this.buildRelaxationHints(query) : [],
      warnings,
      facets: {
        categories: categoryFacets.map((row) => ({
          categoryId: row.categoryId,
          key: categoryNameById.get(row.categoryId)?.key ?? null,
          name: categoryNameById.get(row.categoryId)?.name ?? null,
          count: row._count.categoryId,
        })),
        regions: regionFacets.map((row) => ({
          regionCode: row.regionCode,
          count: row._count.regionCode,
        })),
      },
      searchMeta: {
        latencyMs: Date.now() - startedAt,
        constrainedByEventType: Boolean(eventTypeId),
      },
    };
  }

  private buildRelaxationHints(query: ListSuppliersQueryDto): string[] {
    const hints: string[] = [];
    if (query.subcategoryId) {
      hints.push('Try removing subcategory filter');
    }
    if (query.categoryId) {
      hints.push('Try broadening to all categories');
    }
    if (query.locationRegionCode) {
      hints.push('Try searching all locations');
    }
    if (query.minRating) {
      hints.push('Try lowering minimum rating');
    }
    if (query.eventTypeId) {
      hints.push('Try removing event type constraint');
    }
    if (query.q) {
      hints.push('Try a shorter keyword');
    }
    return hints;
  }

  async getByIdOrSlug(slugOrId: string) {
    const supplier = await this.prisma.supplier.findFirst({
      where: {
        OR: [{ id: slugOrId }, { slug: slugOrId }],
        isActive: true,
        approvalStatus: 'APPROVED',
      },
      include: { media: true, socialLinks: true, attributes: true, serviceAreas: true, categories: true },
    });
    if (!supplier) {
      throw new NotFoundException('Supplier not found');
    }
    return supplier;
  }

  async upsertProfile(
    userId: string,
    payload: {
      businessName: string;
      slug: string;
      description?: string;
      avatarImageUrl?: string;
      coverImageUrl?: string;
    },
  ) {
    const imageFields = {
      ...(payload.avatarImageUrl !== undefined && {
        avatarImageUrl: payload.avatarImageUrl.trim() ? payload.avatarImageUrl.trim() : null,
      }),
      ...(payload.coverImageUrl !== undefined && {
        coverImageUrl: payload.coverImageUrl.trim() ? payload.coverImageUrl.trim() : null,
      }),
    };
    const existing = await this.prisma.supplier.findUnique({ where: { ownerUserId: userId } });
    if (existing) {
      return this.prisma.supplier.update({
        where: { ownerUserId: userId },
        data: {
          businessName: payload.businessName,
          slug: payload.slug,
          description: payload.description ?? null,
          approvalStatus: 'PENDING',
          ...imageFields,
        },
      });
    }
    return this.prisma.supplier.create({
      data: {
        ownerUserId: userId,
        businessName: payload.businessName,
        slug: payload.slug,
        description: payload.description ?? null,
        approvalStatus: 'PENDING',
        ...(payload.avatarImageUrl !== undefined && {
          avatarImageUrl: payload.avatarImageUrl.trim() ? payload.avatarImageUrl.trim() : null,
        }),
        ...(payload.coverImageUrl !== undefined && {
          coverImageUrl: payload.coverImageUrl.trim() ? payload.coverImageUrl.trim() : null,
        }),
      },
    });
  }

  async addMedia(userId: string, payload: { mediaType: string; url: string; sortOrder?: number; metadataJson?: Record<string, unknown> }) {
    const supplier = await this.prisma.supplier.findUnique({ where: { ownerUserId: userId } });
    if (!supplier) {
      throw new NotFoundException('Supplier profile not found');
    }
    return this.prisma.supplierMedia.create({
      data: {
        supplierId: supplier.id,
        mediaType: payload.mediaType,
        url: payload.url,
        sortOrder: payload.sortOrder ?? 0,
        metadataJson: (payload.metadataJson ?? {}) as Prisma.InputJsonValue,
      },
    });
  }

  async createMediaUploadUrl(userId: string, payload: { fileName: string; contentType: string }) {
    const supplier = await this.prisma.supplier.findUnique({ where: { ownerUserId: userId } });
    if (!supplier) {
      throw new NotFoundException('Supplier profile not found');
    }
    return this.mediaStorage.createUploadUrl({
      supplierId: supplier.id,
      fileName: payload.fileName,
      contentType: payload.contentType,
    });
  }

  async verifyMediaUpload(userId: string, payload: { key: string }) {
    const supplier = await this.prisma.supplier.findUnique({ where: { ownerUserId: userId } });
    if (!supplier) {
      throw new NotFoundException('Supplier profile not found');
    }
    return this.mediaStorage.verifyUpload({
      supplierId: supplier.id,
      key: payload.key,
    });
  }

  async completeMediaUpload(
    userId: string,
    payload: { key: string; mediaType: string; sortOrder?: number; metadataJson?: Record<string, unknown> },
  ) {
    const supplier = await this.prisma.supplier.findUnique({ where: { ownerUserId: userId } });
    if (!supplier) {
      throw new NotFoundException('Supplier profile not found');
    }

    const verified = await this.mediaStorage.verifyUpload({
      supplierId: supplier.id,
      key: payload.key,
    });

    return this.prisma.supplierMedia.create({
      data: {
        supplierId: supplier.id,
        mediaType: payload.mediaType,
        url: verified.publicUrl,
        sortOrder: payload.sortOrder ?? 0,
        metadataJson: (payload.metadataJson ?? {}) as Prisma.InputJsonValue,
      },
    });
  }

  async deleteMedia(userId: string, mediaId: string) {
    const supplier = await this.prisma.supplier.findUnique({ where: { ownerUserId: userId } });
    if (!supplier) {
      throw new NotFoundException('Supplier profile not found');
    }
    const media = await this.prisma.supplierMedia.findUnique({ where: { id: mediaId } });
    if (!media || media.supplierId !== supplier.id) {
      throw new NotFoundException('Media item not found');
    }
    await this.prisma.supplierMedia.delete({ where: { id: mediaId } });
    return { deleted: true, id: mediaId };
  }

  async updateAttributes(
    userId: string,
    payload: {
      insurance?: boolean;
      accessibility?: boolean;
      kosherOptions?: unknown;
      languagesJson?: unknown;
      workingDaysJson?: unknown;
      certificationsJson?: unknown;
    },
  ) {
    const supplier = await this.prisma.supplier.findUnique({ where: { ownerUserId: userId } });
    if (!supplier) {
      throw new NotFoundException('Supplier profile not found');
    }
    return this.prisma.supplierAttribute.upsert({
      where: { supplierId: supplier.id },
      create: {
        supplierId: supplier.id,
        insurance: payload.insurance ?? null,
        accessibility: payload.accessibility ?? null,
        kosherOptions:
          payload.kosherOptions === undefined
            ? Prisma.JsonNull
            : (payload.kosherOptions as Prisma.InputJsonValue),
        languagesJson:
          payload.languagesJson === undefined
            ? Prisma.JsonNull
            : (payload.languagesJson as Prisma.InputJsonValue),
        workingDaysJson:
          payload.workingDaysJson === undefined
            ? Prisma.JsonNull
            : (payload.workingDaysJson as Prisma.InputJsonValue),
        certificationsJson:
          payload.certificationsJson === undefined
            ? Prisma.JsonNull
            : (payload.certificationsJson as Prisma.InputJsonValue),
      },
      update: {
        insurance: payload.insurance ?? undefined,
        accessibility: payload.accessibility ?? undefined,
        kosherOptions:
          payload.kosherOptions === undefined
            ? undefined
            : payload.kosherOptions === null
              ? Prisma.JsonNull
              : (payload.kosherOptions as Prisma.InputJsonValue),
        languagesJson:
          payload.languagesJson === undefined
            ? undefined
            : payload.languagesJson === null
              ? Prisma.JsonNull
              : (payload.languagesJson as Prisma.InputJsonValue),
        workingDaysJson:
          payload.workingDaysJson === undefined
            ? undefined
            : payload.workingDaysJson === null
              ? Prisma.JsonNull
              : (payload.workingDaysJson as Prisma.InputJsonValue),
        certificationsJson:
          payload.certificationsJson === undefined
            ? undefined
            : payload.certificationsJson === null
              ? Prisma.JsonNull
              : (payload.certificationsJson as Prisma.InputJsonValue),
      },
    });
  }

  async updateServiceAreas(userId: string, regions: Array<{ regionCode: string; cityCode?: string }>) {
    const supplier = await this.prisma.supplier.findUnique({ where: { ownerUserId: userId } });
    if (!supplier) {
      throw new NotFoundException('Supplier profile not found');
    }
    await this.prisma.supplierServiceArea.deleteMany({ where: { supplierId: supplier.id } });
    if (regions.length === 0) {
      return { supplierId: supplier.id, serviceAreas: [] };
    }
    await this.prisma.supplierServiceArea.createMany({
      data: regions.map((row) => ({
        supplierId: supplier.id,
        regionCode: row.regionCode,
        cityCode: row.cityCode ?? null,
      })),
    });
    const serviceAreas = await this.prisma.supplierServiceArea.findMany({ where: { supplierId: supplier.id } });
    return { supplierId: supplier.id, serviceAreas };
  }

  async suggestions(q: string, take = 10) {
    const limit = Math.min(Math.max(take, 1), 20);
    const [suppliers, categories, subcategories] = await Promise.all([
      this.prisma.supplier.findMany({
        where: {
          isActive: true,
          approvalStatus: 'APPROVED',
          businessName: { contains: q, mode: 'insensitive' },
        },
        take: limit,
        select: { id: true, slug: true, businessName: true },
      }),
      this.prisma.category.findMany({
        where: {
          isActive: true,
          OR: [{ name: { contains: q, mode: 'insensitive' } }, { key: { contains: q, mode: 'insensitive' } }],
        },
        take: limit,
        select: { id: true, key: true, name: true },
      }),
      this.prisma.subcategory.findMany({
        where: {
          isActive: true,
          OR: [{ name: { contains: q, mode: 'insensitive' } }, { key: { contains: q, mode: 'insensitive' } }],
        },
        take: limit,
        select: { id: true, key: true, name: true, categoryId: true },
      }),
    ]);

    const items = [
      ...suppliers.map((supplier) => ({
        id: supplier.id,
        label: supplier.businessName,
        type: 'supplier',
        value: supplier.slug,
      })),
      ...categories.map((category) => ({
        id: category.id,
        label: category.name,
        type: 'category',
        value: category.key,
      })),
      ...subcategories.map((subcategory) => ({
        id: subcategory.id,
        label: subcategory.name,
        type: 'subcategory',
        value: subcategory.key,
      })),
    ].slice(0, limit);
    return { items, totalItems: items.length };
  }

  async saveFavorite(userId: string | null, anonymousSessionId: string | null, supplierId: string) {
    if (!userId && !anonymousSessionId) {
      throw new BadRequestException('User or anonymous session is required');
    }

    return this.prisma.favoriteSupplier.upsert({
      where: userId
        ? { userId_supplierId: { userId, supplierId } }
        : { anonymousSessionId_supplierId: { anonymousSessionId: anonymousSessionId!, supplierId } },
      create: { userId, anonymousSessionId, supplierId },
      update: {},
    });
  }

  async trackShare(
    userId: string | null,
    anonymousSessionId: string | null,
    supplierId: string,
    payload?: { channel?: string; context?: string },
  ) {
    const supplier = await this.prisma.supplier.findUnique({
      where: { id: supplierId },
      select: { id: true, isActive: true, approvalStatus: true },
    });
    if (!supplier || !supplier.isActive || supplier.approvalStatus !== 'APPROVED') {
      throw new NotFoundException('Supplier not found');
    }

    const event = await this.prisma.supplierShareEvent.create({
      data: {
        supplierId,
        userId: userId ?? null,
        anonymousSessionId: anonymousSessionId ?? null,
        channel: payload?.channel ?? 'unknown',
        context: payload?.context ?? null,
      },
    });

    return {
      tracked: true,
      id: event.id,
      supplierId,
      actor: {
        userId,
        anonymousSessionId,
      },
      channel: event.channel,
      context: event.context,
    };
  }

  async removeFavorite(userId: string | null, anonymousSessionId: string | null, supplierId: string) {
    if (userId) {
      return this.prisma.favoriteSupplier.delete({
        where: { userId_supplierId: { userId, supplierId } },
      });
    }
    if (anonymousSessionId) {
      return this.prisma.favoriteSupplier.delete({
        where: { anonymousSessionId_supplierId: { anonymousSessionId, supplierId } },
      });
    }
    throw new BadRequestException('User or anonymous session is required');
  }

  async listFavorites(userId: string | null, anonymousSessionId: string | null, page?: number, limit?: number) {
    const where = userId ? { userId } : anonymousSessionId ? { anonymousSessionId } : { id: '__none__' };
    const pg = this.toPagination(page, limit);
    const [items, totalItems] = await this.prisma.$transaction([
      this.prisma.favoriteSupplier.findMany({
        where,
        include: { supplier: true },
        skip: pg.skip,
        take: pg.take,
      }),
      this.prisma.favoriteSupplier.count({ where }),
    ]);
    return { items, totalItems };
  }

  async upsertDraftForUser(
    userId: string,
    payload: { stepKey: string; completionPercent: number; payloadJson: Record<string, unknown>; version?: number },
  ) {
    const supplier = await this.prisma.supplier.findUnique({
      where: { ownerUserId: userId },
      select: { id: true },
    });
    if (!supplier) {
      throw new NotFoundException('Supplier profile not found for user');
    }
    const existing = await this.prisma.supplierDraft.findUnique({
      where: { supplierId: supplier.id },
    });
    if (!existing) {
      if (payload.version !== undefined && payload.version !== 1) {
        throw new ConflictException('Draft version mismatch');
      }
      const draft = await this.prisma.supplierDraft.create({
        data: {
          supplierId: supplier.id,
          stepKey: payload.stepKey,
          completionPercent: payload.completionPercent,
          payloadJson: payload.payloadJson as Prisma.InputJsonValue,
          version: 1,
        },
      });
      await this.maybePublishOnboardingAbandonedEvent({
        userId,
        supplierId: supplier.id,
        stepKey: payload.stepKey,
        completionPercent: payload.completionPercent,
        version: draft.version,
      });
      return draft;
    }
    if (payload.version !== undefined && payload.version !== existing.version) {
      throw new ConflictException('Draft version mismatch');
    }
    const draft = await this.prisma.supplierDraft.update({
      where: { supplierId: supplier.id },
      data: {
        stepKey: payload.stepKey,
        completionPercent: payload.completionPercent,
        payloadJson: payload.payloadJson as Prisma.InputJsonValue,
        version: { increment: 1 },
        lastAutosaveAt: new Date(),
      },
    });
    await this.maybePublishOnboardingAbandonedEvent({
      userId,
      supplierId: supplier.id,
      stepKey: payload.stepKey,
      completionPercent: payload.completionPercent,
      version: draft.version,
    });
    return draft;
  }

  async getDraftForUser(userId: string) {
    const supplier = await this.prisma.supplier.findUnique({
      where: { ownerUserId: userId },
      select: { id: true },
    });
    if (!supplier) {
      throw new NotFoundException('Supplier profile not found for user');
    }
    return this.prisma.supplierDraft.findUnique({
      where: { supplierId: supplier.id },
    });
  }

  private async maybePublishOnboardingAbandonedEvent(payload: {
    userId: string;
    supplierId: string;
    stepKey: string;
    completionPercent: number;
    version: number;
  }) {
    if (payload.completionPercent >= 100) {
      return;
    }

    await this.automationService?.publish({
      eventId: `evt_supplier_onboarding_abandoned_${payload.supplierId}_${payload.version}`,
      type: 'supplier.onboarding.abandoned',
      payload: {
        userId: payload.userId,
        supplierId: payload.supplierId,
        stepKey: payload.stepKey,
        completionPercent: payload.completionPercent,
      },
    });
  }
}
