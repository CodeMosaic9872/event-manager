import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  Optional,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { ListSuppliersQueryDto } from './dto/list-suppliers-query.dto';
import { MediaStorageService } from '../storage/media-storage.service';
import { AutomationService } from '../notifications/automation.service';
import type { UpsertSupplierProfileDto } from './dto/upsert-supplier-profile.dto';

const SUPPLIER_PUBLIC_INCLUDE = {
  media: { orderBy: { sortOrder: 'asc' } },
  socialLinks: true,
  attributes: true,
  serviceAreas: true,
  categories: {
    include: {
      category: { select: { id: true, key: true, name: true, nameEn: true } },
      subcategory: { select: { id: true, key: true, name: true, nameEn: true, categoryId: true } },
    },
    orderBy: { createdAt: 'asc' },
  },
} satisfies Prisma.SupplierInclude;

type SupplierPublicDetail = Prisma.SupplierGetPayload<{ include: typeof SUPPLIER_PUBLIC_INCLUDE }>;

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
      include: SUPPLIER_PUBLIC_INCLUDE,
    });
    if (!supplier) {
      throw new NotFoundException('Supplier not found');
    }
    return this.mapSupplierToPublicProfile(supplier);
  }

  /**
   * Owner-facing supplier snapshot for /auth/me: full profile, compliance URLs, draft, subscription
   * (no CardCom token), categories, media, service areas, attributes, recent approval history, counts.
   */
  async getSupplierFullForOwner(userId: string) {
    const row = await this.prisma.supplier.findUnique({
      where: { ownerUserId: userId },
      include: {
        _count: {
          select: {
            applications: true,
            favorites: true,
            media: true,
          },
        },
        media: { orderBy: { sortOrder: 'asc' } },
        socialLinks: true,
        attributes: true,
        serviceAreas: true,
        categories: {
          include: {
            category: { select: { id: true, key: true, name: true, nameEn: true } },
            subcategory: { select: { id: true, key: true, name: true, nameEn: true, categoryId: true } },
          },
          orderBy: { createdAt: 'asc' },
        },
        draft: true,
        subscription: {
          select: {
            id: true,
            supplierId: true,
            status: true,
            interval: true,
            planKey: true,
            amount: true,
            currency: true,
            nextBillingAt: true,
            lastRenewedAt: true,
            consecutiveFailures: true,
            canceledAt: true,
            tokenExpiresAt: true,
            createdAt: true,
            updatedAt: true,
          },
        },
        approvalHistory: {
          orderBy: { createdAt: 'desc' },
          take: 25,
          select: {
            id: true,
            supplierId: true,
            fromStatus: true,
            toStatus: true,
            reason: true,
            actorAdminId: true,
            createdAt: true,
          },
        },
      },
    });
    if (!row) {
      return null;
    }
    const { subscription, ratingAvg, ...rest } = row;
    const marketplaceProfile = await this.mapSupplierToPublicProfile(row as unknown as SupplierPublicDetail);
    return {
      ...rest,
      ratingAvg: ratingAvg != null ? Number(ratingAvg) : null,
      subscription: subscription
        ? {
            ...subscription,
            amount: String(subscription.amount),
          }
        : null,
      marketplaceProfile,
    };
  }

  private normalizeSocialLinkRows(
    supplierId: string,
    links: Array<{ platform: string; url: string }>,
  ): Array<{ supplierId: string; platform: string; url: string }> {
    return links.map((row) => ({
      supplierId,
      platform: row.platform.trim().toLowerCase(),
      url: row.url.trim(),
    }));
  }

  private async syncSupplierSocialLinks(
    tx: Prisma.TransactionClient,
    supplierId: string,
    socialLinks: Array<{ platform: string; url: string }>,
  ) {
    await tx.supplierSocialLink.deleteMany({ where: { supplierId } });
    if (socialLinks.length > 0) {
      await tx.supplierSocialLink.createMany({
        data: this.normalizeSocialLinkRows(supplierId, socialLinks),
      });
    }
  }

  private resolveBusinessNameForProfile(payload: {
    businessName?: string;
    slug: string;
    existingBusinessName?: string;
    isCreate: boolean;
  }): string {
    const trimmed = payload.businessName?.trim() ?? '';
    if (trimmed.length >= 2) {
      return trimmed;
    }
    if (!payload.isCreate && payload.existingBusinessName) {
      return payload.existingBusinessName;
    }
    const fromSlug = payload.slug
      .split('-')
      .filter(Boolean)
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
      .join(' ');
    return fromSlug.length >= 2 ? fromSlug : 'Supplier';
  }

  private formatCodeLabel(code: string) {
    return code
      .split(/[-_]/)
      .filter(Boolean)
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
      .join(' ');
  }

  private pickSocialLinkUrl(links: { platform: string; url: string }[], platform: string) {
    const row = links.find((l) => l.platform.toLowerCase() === platform);
    return row?.url?.trim() ? row.url.trim() : null;
  }

  private resolveSocialLinksForUpsert(
    payload: UpsertSupplierProfileDto,
    existing: Array<{ platform: string; url: string }>,
  ): Array<{ platform: string; url: string }> | undefined {
    if (payload.socialLinks !== undefined) {
      return payload.socialLinks;
    }
    const map = new Map(existing.map((l) => [l.platform.toLowerCase(), l.url]));
    let touched = false;
    const patch = (key: string, value?: string) => {
      if (value === undefined) return;
      touched = true;
      const t = value.trim();
      if (t) map.set(key, t);
      else map.delete(key);
    };
    patch('instagram', payload.instagram);
    patch('facebook', payload.facebook);
    patch('whatsapp', payload.whatsapp);
    if (!touched) return undefined;
    return Array.from(map.entries()).map(([platform, url]) => ({ platform, url }));
  }

  private async assertCategoryAssignments(
    tx: Prisma.TransactionClient,
    rows: Array<{ categoryId: string; subcategoryId?: string | null }>,
  ) {
    if (!rows.length) return;
    const seen = new Set<string>();
    for (const row of rows) {
      const dedupeKey = `${row.categoryId}:${row.subcategoryId ?? ''}`;
      if (seen.has(dedupeKey)) {
        throw new BadRequestException('Duplicate category assignment in payload');
      }
      seen.add(dedupeKey);
      const category = await tx.category.findUnique({ where: { id: row.categoryId }, select: { id: true } });
      if (!category) {
        throw new BadRequestException(`Unknown categoryId ${row.categoryId}`);
      }
      if (row.subcategoryId) {
        const sub = await tx.subcategory.findFirst({
          where: { id: row.subcategoryId, categoryId: row.categoryId },
          select: { id: true },
        });
        if (!sub) {
          throw new BadRequestException(
            `Unknown subcategoryId ${row.subcategoryId} for category ${row.categoryId}`,
          );
        }
      }
    }
  }

  private async syncSupplierCategories(
    tx: Prisma.TransactionClient,
    supplierId: string,
    rows: Array<{ categoryId: string; subcategoryId?: string | null }>,
  ) {
    await this.assertCategoryAssignments(tx, rows);
    await tx.supplierCategory.deleteMany({ where: { supplierId } });
    if (!rows.length) return;
    await tx.supplierCategory.createMany({
      data: rows.map((r) => ({
        supplierId,
        categoryId: r.categoryId,
        subcategoryId: r.subcategoryId ?? null,
      })),
    });
  }

  private async syncSupplierGallery(tx: Prisma.TransactionClient, supplierId: string, urls: string[]) {
    await tx.supplierMedia.deleteMany({ where: { supplierId, mediaType: 'gallery' } });
    if (!urls.length) return;
    await tx.supplierMedia.createMany({
      data: urls.map((url, idx) => ({
        supplierId,
        mediaType: 'gallery',
        url: url.trim(),
        sortOrder: idx,
      })),
    });
  }

  private async syncSupplierServiceAreasTx(
    tx: Prisma.TransactionClient,
    supplierId: string,
    regions: Array<{ regionCode: string; cityCode?: string }>,
  ) {
    await tx.supplierServiceArea.deleteMany({ where: { supplierId } });
    if (!regions.length) return;
    await tx.supplierServiceArea.createMany({
      data: regions.map((r) => ({
        supplierId,
        regionCode: r.regionCode.trim().toLowerCase(),
        cityCode: r.cityCode?.trim() ? r.cityCode.trim().toLowerCase() : null,
      })),
    });
  }

  private async patchAttributeLabels(
    tx: Prisma.TransactionClient,
    supplierId: string,
    rules?: string[],
    niche?: string[],
  ) {
    const rulesJson =
      rules === undefined ? undefined : (rules as unknown as Prisma.InputJsonValue);
    const nicheJson =
      niche === undefined ? undefined : (niche as unknown as Prisma.InputJsonValue);
    await tx.supplierAttribute.upsert({
      where: { supplierId },
      create: {
        supplierId,
        labelsRulesJson: rulesJson ?? Prisma.JsonNull,
        labelsNicheJson: nicheJson ?? Prisma.JsonNull,
      },
      update: {
        ...(rulesJson !== undefined && { labelsRulesJson: rulesJson }),
        ...(nicheJson !== undefined && { labelsNicheJson: nicheJson }),
      },
    });
  }

  private buildContactUpdateData(payload: UpsertSupplierProfileDto) {
    return {
      ...(payload.email !== undefined && {
        contactEmail: payload.email?.trim() ? payload.email.trim().toLowerCase() : null,
      }),
      ...(payload.phone !== undefined && {
        publicPhone: payload.phone?.trim() ? payload.phone.trim() : null,
      }),
      ...(payload.whatsapp !== undefined && {
        whatsappUrl: payload.whatsapp?.trim() ? payload.whatsapp.trim() : null,
      }),
      ...(payload.website !== undefined && {
        websiteUrl: payload.website?.trim() ? payload.website.trim() : null,
      }),
      ...(payload.address !== undefined && {
        address: payload.address?.trim() ? payload.address.trim() : null,
      }),
      ...(payload.extraLanguage !== undefined && {
        extraLanguage: payload.extraLanguage?.trim() ? payload.extraLanguage.trim() : null,
      }),
    };
  }

  private galleryUrlsFromMedia(media: Array<{ url: string; mediaType: string; sortOrder: number }>) {
    const gallery = media
      .filter((m) => m.mediaType === 'gallery')
      .slice()
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .map((m) => m.url);
    if (gallery.length) return gallery;
    return media
      .filter((m) => m.mediaType === 'image')
      .slice()
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .map((m) => m.url);
  }

  private async mapSupplierToPublicProfile(supplier: SupplierPublicDetail) {
    const links = supplier.socialLinks ?? [];
    const primaryRow = supplier.categories[0];
    const categoryLabel = primaryRow?.category?.name ?? null;
    const subcategoryLabel = primaryRow?.subcategory?.name ?? null;
    const subcategoryNames = supplier.categories
      .map((c) => c.subcategory?.name)
      .filter((n): n is string => Boolean(n));
    const serviceAreas = supplier.serviceAreas.map((a) =>
      a.cityCode ? this.formatCodeLabel(a.cityCode) : this.formatCodeLabel(a.regionCode),
    );
    let city: string | null = null;
    const withCity = supplier.serviceAreas.find((a) => a.cityCode);
    if (withCity?.cityCode) {
      city = this.formatCodeLabel(withCity.cityCode);
    } else if (supplier.serviceAreas[0]) {
      city = this.formatCodeLabel(supplier.serviceAreas[0].regionCode);
    }

    const rulesRaw = supplier.attributes?.labelsRulesJson;
    const nicheRaw = supplier.attributes?.labelsNicheJson;
    const labelsRules = Array.isArray(rulesRaw) ? (rulesRaw as string[]) : [];
    const labelsNiche = Array.isArray(nicheRaw) ? (nicheRaw as string[]) : [];
    const primaryCategoryId = primaryRow?.categoryId ?? null;

    let similar: Array<{
      id: string;
      businessName: string;
      ratingAvg: number | null;
      avatarImageUrl: string | null;
    }> = [];
    if (primaryCategoryId) {
      const similarRows = await this.prisma.supplier.findMany({
        where: {
          id: { not: supplier.id },
          isActive: true,
          approvalStatus: 'APPROVED',
          categories: { some: { categoryId: primaryCategoryId } },
        },
        take: 6,
        orderBy: [{ ratingAvg: 'desc' }, { ratingCount: 'desc' }],
        select: {
          id: true,
          businessName: true,
          ratingAvg: true,
          avatarImageUrl: true,
        },
      });
      similar = similarRows.map((s) => ({
        id: s.id,
        businessName: s.businessName,
        avatarImageUrl: s.avatarImageUrl,
        ratingAvg: s.ratingAvg != null ? Number(s.ratingAvg) : null,
      }));
    }

    return {
      id: supplier.id,
      slug: supplier.slug,
      businessName: supplier.businessName,
      description: supplier.description ?? '',
      email: supplier.contactEmail,
      category: categoryLabel,
      subcategory: subcategoryLabel,
      city,
      ratingAvg: supplier.ratingAvg != null ? Number(supplier.ratingAvg) : null,
      reviewCount: supplier.ratingCount,
      phone: supplier.publicPhone,
      whatsapp: supplier.whatsappUrl ?? this.pickSocialLinkUrl(links, 'whatsapp'),
      website: supplier.websiteUrl,
      instagram: this.pickSocialLinkUrl(links, 'instagram'),
      facebook: this.pickSocialLinkUrl(links, 'facebook'),
      avatarImageUrl: supplier.avatarImageUrl,
      coverImageUrl: supplier.coverImageUrl,
      gallery: this.galleryUrlsFromMedia(supplier.media),
      kosher: supplier.kosher,
      form3010: supplier.form3010,
      socialLinks: links.map((l) => ({ platform: l.platform, url: l.url })),
      subcategories: subcategoryNames,
      serviceAreas,
      labelsRules,
      labelsNiche,
      address: supplier.address,
      extraLanguage: supplier.extraLanguage,
      similar,
    };
  }

  async upsertProfile(userId: string, payload: UpsertSupplierProfileDto) {
    const imageFields = {
      ...(payload.avatarImageUrl !== undefined && {
        avatarImageUrl: payload.avatarImageUrl.trim() ? payload.avatarImageUrl.trim() : null,
      }),
      ...(payload.coverImageUrl !== undefined && {
        coverImageUrl: payload.coverImageUrl.trim() ? payload.coverImageUrl.trim() : null,
      }),
    };
    const complianceFields = {
      ...(payload.kosher !== undefined && {
        kosher: payload.kosher.trim() ? payload.kosher.trim() : null,
      }),
      ...(payload.form3010 !== undefined && {
        form3010: payload.form3010.trim() ? payload.form3010.trim() : null,
      }),
    };
    const contactFields = this.buildContactUpdateData(payload);
    const descriptionField =
      payload.description !== undefined
        ? { description: payload.description.trim() ? payload.description.trim() : null }
        : {};

    const existing = await this.prisma.supplier.findUnique({
      where: { ownerUserId: userId },
      include: { socialLinks: true },
    });

    const finalize = async (tx: Prisma.TransactionClient, supplierId: string) => {
      const existingSocial = await tx.supplierSocialLink.findMany({ where: { supplierId } });
      const resolvedSocial = this.resolveSocialLinksForUpsert(payload, existingSocial);
      if (resolvedSocial !== undefined) {
        await this.syncSupplierSocialLinks(tx, supplierId, resolvedSocial);
      }
      if (payload.categories !== undefined) {
        await this.syncSupplierCategories(tx, supplierId, payload.categories);
      }
      if (payload.serviceAreas !== undefined) {
        await this.syncSupplierServiceAreasTx(tx, supplierId, payload.serviceAreas);
      }
      if (payload.gallery !== undefined) {
        await this.syncSupplierGallery(tx, supplierId, payload.gallery);
      }
      if (payload.labelsRules !== undefined || payload.labelsNiche !== undefined) {
        await this.patchAttributeLabels(tx, supplierId, payload.labelsRules, payload.labelsNiche);
      }
      const row = await tx.supplier.findUniqueOrThrow({
        where: { id: supplierId },
        include: SUPPLIER_PUBLIC_INCLUDE,
      });
      return this.mapSupplierToPublicProfile(row);
    };

    if (existing) {
      return this.prisma.$transaction(async (tx) => {
        const businessName =
          payload.businessName !== undefined
            ? this.resolveBusinessNameForProfile({
                businessName: payload.businessName,
                slug: payload.slug,
                existingBusinessName: existing.businessName,
                isCreate: false,
              })
            : existing.businessName;
        const updated = await tx.supplier.update({
          where: { ownerUserId: userId },
          data: {
            businessName,
            slug: payload.slug,
            approvalStatus: 'PENDING',
            ...descriptionField,
            ...imageFields,
            ...complianceFields,
            ...contactFields,
          },
        });
        return finalize(tx, updated.id);
      });
    }

    return this.prisma.$transaction(async (tx) => {
      const businessName = this.resolveBusinessNameForProfile({
        businessName: payload.businessName,
        slug: payload.slug,
        isCreate: true,
      });
      const created = await tx.supplier.create({
        data: {
          ownerUserId: userId,
          businessName,
          slug: payload.slug,
          description: payload.description?.trim() ? payload.description.trim() : null,
          approvalStatus: 'PENDING',
          ...(payload.avatarImageUrl !== undefined && {
            avatarImageUrl: payload.avatarImageUrl.trim() ? payload.avatarImageUrl.trim() : null,
          }),
          ...(payload.coverImageUrl !== undefined && {
            coverImageUrl: payload.coverImageUrl.trim() ? payload.coverImageUrl.trim() : null,
          }),
          ...complianceFields,
          ...contactFields,
        },
      });
      return finalize(tx, created.id);
    });
  }

  /** Public supplier that can receive reviews (same visibility as marketplace profile). */
  private async resolveReviewableSupplier(slugOrId: string) {
    const supplier = await this.prisma.supplier.findFirst({
      where: {
        OR: [{ id: slugOrId }, { slug: slugOrId }],
        isActive: true,
        approvalStatus: 'APPROVED',
      },
      select: { id: true, ownerUserId: true },
    });
    if (!supplier) {
      throw new NotFoundException('Supplier not found');
    }
    return supplier;
  }

  private async recalcSupplierRating(supplierId: string) {
    const agg = await this.prisma.supplierReview.aggregate({
      where: { supplierId },
      _avg: { rating: true },
      _count: { id: true },
    });
    const count = agg._count.id;
    const avg = agg._avg.rating;
    await this.prisma.supplier.update({
      where: { id: supplierId },
      data: {
        ratingCount: count,
        ratingAvg:
          count > 0 && avg != null ? new Prisma.Decimal(Number(avg).toFixed(2)) : null,
      },
    });
  }

  async listSupplierReviews(slugOrId: string, page?: number, limit?: number) {
    const supplier = await this.resolveReviewableSupplier(slugOrId);
    const pg = this.toPagination(page, limit);
    const where = { supplierId: supplier.id };
    const [items, totalItems] = await this.prisma.$transaction([
      this.prisma.supplierReview.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: pg.skip,
        take: pg.take,
        include: { author: { select: { id: true } } },
      }),
      this.prisma.supplierReview.count({ where }),
    ]);
    return {
      items: items.map((r) => ({
        id: r.id,
        supplierId: r.supplierId,
        authorUserId: r.authorUserId,
        author: r.author ? { id: r.author.id } : null,
        rating: r.rating,
        title: r.title,
        comment: r.comment,
        createdAt: r.createdAt,
        updatedAt: r.updatedAt,
      })),
      totalItems,
    };
  }

  async createSupplierReview(
    slugOrId: string,
    authorUserId: string,
    body: { rating: number; title?: string; comment?: string },
  ) {
    const supplier = await this.resolveReviewableSupplier(slugOrId);
    if (supplier.ownerUserId === authorUserId) {
      throw new BadRequestException('You cannot review your own supplier profile');
    }
    const dup = await this.prisma.supplierReview.findUnique({
      where: {
        supplierId_authorUserId: { supplierId: supplier.id, authorUserId },
      },
    });
    if (dup) {
      throw new ConflictException('You already submitted a review for this supplier. Use PATCH .../reviews/me to update it.');
    }
    const review = await this.prisma.supplierReview.create({
      data: {
        supplierId: supplier.id,
        authorUserId,
        rating: body.rating,
        title: body.title?.trim() || null,
        comment: body.comment?.trim() || null,
      },
      include: { author: { select: { id: true } } },
    });
    await this.recalcSupplierRating(supplier.id);
    return {
      id: review.id,
      supplierId: review.supplierId,
      authorUserId: review.authorUserId,
      author: review.author ? { id: review.author.id } : null,
      rating: review.rating,
      title: review.title,
      comment: review.comment,
      createdAt: review.createdAt,
      updatedAt: review.updatedAt,
    };
  }

  async updateMySupplierReview(
    slugOrId: string,
    authorUserId: string,
    body: { rating?: number; title?: string; comment?: string },
  ) {
    if (body.rating === undefined && body.title === undefined && body.comment === undefined) {
      throw new BadRequestException('Provide at least one of rating, title, or comment to update');
    }
    const supplier = await this.resolveReviewableSupplier(slugOrId);
    const existing = await this.prisma.supplierReview.findUnique({
      where: {
        supplierId_authorUserId: { supplierId: supplier.id, authorUserId },
      },
    });
    if (!existing) {
      throw new NotFoundException('You have not reviewed this supplier yet');
    }
    const review = await this.prisma.supplierReview.update({
      where: { id: existing.id },
      data: {
        ...(body.rating !== undefined && { rating: body.rating }),
        ...(body.title !== undefined && { title: body.title.trim() ? body.title.trim() : null }),
        ...(body.comment !== undefined && { comment: body.comment.trim() ? body.comment.trim() : null }),
      },
      include: { author: { select: { id: true } } },
    });
    await this.recalcSupplierRating(supplier.id);
    return {
      id: review.id,
      supplierId: review.supplierId,
      authorUserId: review.authorUserId,
      author: review.author ? { id: review.author.id } : null,
      rating: review.rating,
      title: review.title,
      comment: review.comment,
      createdAt: review.createdAt,
      updatedAt: review.updatedAt,
    };
  }

  async deleteMySupplierReview(slugOrId: string, authorUserId: string) {
    const supplier = await this.resolveReviewableSupplier(slugOrId);
    const existing = await this.prisma.supplierReview.findUnique({
      where: {
        supplierId_authorUserId: { supplierId: supplier.id, authorUserId },
      },
    });
    if (!existing) {
      throw new NotFoundException('You have not reviewed this supplier yet');
    }
    await this.prisma.supplierReview.delete({ where: { id: existing.id } });
    await this.recalcSupplierRating(supplier.id);
    return { deleted: true as const };
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

  async uploadMediaFile(params: {
    ownerUserId?: string;
    supplierId?: string;
    file: { buffer: Buffer; originalname: string; mimetype: string; size: number };
    mediaType?: string;
    sortOrder?: number;
    attachKosher?: boolean;
    attachForm3010?: boolean;
  }) {
    let supplier;
    if (params.ownerUserId) {
      supplier = await this.prisma.supplier.findUnique({ where: { ownerUserId: params.ownerUserId } });
      if (!supplier) {
        throw new NotFoundException('Supplier profile not found');
      }
      if (params.supplierId?.trim() && supplier.id !== params.supplierId.trim()) {
        throw new ForbiddenException('supplierId does not match authenticated supplier');
      }
    } else if (params.supplierId?.trim()) {
      supplier = await this.prisma.supplier.findUnique({ where: { id: params.supplierId.trim() } });
      if (!supplier) {
        throw new NotFoundException('Supplier profile not found');
      }
    } else {
      throw new BadRequestException('supplierId is required when uploading without authentication');
    }

    const file = params.file;
    if (!file?.buffer?.length) {
      throw new BadRequestException('Empty file');
    }
    const contentType = file.mimetype?.trim() ? file.mimetype.trim() : 'application/octet-stream';
    const uploaded = await this.mediaStorage.putSupplierObject({
      supplierId: supplier.id,
      buffer: file.buffer,
      fileName: file.originalname || 'upload.bin',
      contentType,
    });
    const media = await this.prisma.supplierMedia.create({
      data: {
        supplierId: supplier.id,
        mediaType: params.mediaType?.trim() ? params.mediaType.trim() : 'image',
        url: uploaded.publicUrl,
        sortOrder: params.sortOrder ?? 0,
        metadataJson: {} as Prisma.InputJsonValue,
      },
    });
    if (params.attachKosher || params.attachForm3010) {
      await this.prisma.supplier.update({
        where: { id: supplier.id },
        data: {
          ...(params.attachKosher ? { kosher: uploaded.publicUrl } : {}),
          ...(params.attachForm3010 ? { form3010: uploaded.publicUrl } : {}),
        },
      });
    }
    return media;
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

    const fav = await this.prisma.favoriteSupplier.upsert({
      where: userId
        ? { userId_supplierId: { userId, supplierId } }
        : { anonymousSessionId_supplierId: { anonymousSessionId: anonymousSessionId!, supplierId } },
      create: { userId, anonymousSessionId, supplierId },
      update: {},
    });

    const supplier = await this.prisma.supplier.findUnique({
      where: { id: supplierId },
      select: { businessName: true },
    });
    const dayKey = new Date().toISOString().slice(0, 10);
    const actorKey = userId ?? `anon_${anonymousSessionId}`;
    await this.automationService?.publish({
      eventId: `lead_favorite_${supplierId}_${actorKey}_${dayKey}`,
      type: 'supplier.lead.received',
      payload: {
        supplierId,
        businessName: supplier?.businessName ?? '',
        leadSource: 'favorite',
      },
    });

    return fav;
  }

  async trackShare(
    userId: string | null,
    anonymousSessionId: string | null,
    supplierId: string,
    payload?: { channel?: string; context?: string },
  ) {
    const supplier = await this.prisma.supplier.findUnique({
      where: { id: supplierId },
      select: { id: true, businessName: true, isActive: true, approvalStatus: true },
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

    await this.automationService?.publish({
      eventId: `lead_share_${event.id}`,
      type: 'supplier.lead.received',
      payload: {
        supplierId,
        businessName: supplier.businessName,
        leadSource: 'share',
        shareChannel: event.channel,
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
