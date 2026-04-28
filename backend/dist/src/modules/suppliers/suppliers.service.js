"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SuppliersService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const prisma_service_1 = require("../../prisma/prisma.service");
let SuppliersService = class SuppliersService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async list(query) {
        const startedAt = Date.now();
        const take = Math.min(query.take ?? 20, 100);
        const cursor = query.cursor ?? undefined;
        const hasCursor = Boolean(cursor);
        const hasEventType = Boolean(query.eventTypeId);
        const warnings = [];
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
        let allowedPairs = [];
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
        const supplierWhere = {
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
    buildRelaxationHints(query) {
        const hints = [];
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
    async getByIdOrSlug(slugOrId) {
        const supplier = await this.prisma.supplier.findFirst({
            where: {
                OR: [{ id: slugOrId }, { slug: slugOrId }],
                isActive: true,
                approvalStatus: 'APPROVED',
            },
            include: { media: true, socialLinks: true, attributes: true, serviceAreas: true, categories: true },
        });
        if (!supplier) {
            throw new common_1.NotFoundException('Supplier not found');
        }
        return supplier;
    }
    async upsertProfile(userId, payload) {
        const existing = await this.prisma.supplier.findUnique({ where: { ownerUserId: userId } });
        if (existing) {
            return this.prisma.supplier.update({
                where: { ownerUserId: userId },
                data: {
                    businessName: payload.businessName,
                    slug: payload.slug,
                    description: payload.description ?? null,
                    approvalStatus: 'PENDING',
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
            },
        });
    }
    async addMedia(userId, payload) {
        const supplier = await this.prisma.supplier.findUnique({ where: { ownerUserId: userId } });
        if (!supplier) {
            throw new common_1.NotFoundException('Supplier profile not found');
        }
        return this.prisma.supplierMedia.create({
            data: {
                supplierId: supplier.id,
                mediaType: payload.mediaType,
                url: payload.url,
                sortOrder: payload.sortOrder ?? 0,
                metadataJson: (payload.metadataJson ?? {}),
            },
        });
    }
    async deleteMedia(userId, mediaId) {
        const supplier = await this.prisma.supplier.findUnique({ where: { ownerUserId: userId } });
        if (!supplier) {
            throw new common_1.NotFoundException('Supplier profile not found');
        }
        const media = await this.prisma.supplierMedia.findUnique({ where: { id: mediaId } });
        if (!media || media.supplierId !== supplier.id) {
            throw new common_1.NotFoundException('Media item not found');
        }
        await this.prisma.supplierMedia.delete({ where: { id: mediaId } });
        return { deleted: true, id: mediaId };
    }
    async updateAttributes(userId, payload) {
        const supplier = await this.prisma.supplier.findUnique({ where: { ownerUserId: userId } });
        if (!supplier) {
            throw new common_1.NotFoundException('Supplier profile not found');
        }
        return this.prisma.supplierAttribute.upsert({
            where: { supplierId: supplier.id },
            create: {
                supplierId: supplier.id,
                insurance: payload.insurance ?? null,
                accessibility: payload.accessibility ?? null,
                kosherOptions: payload.kosherOptions === undefined
                    ? client_1.Prisma.JsonNull
                    : payload.kosherOptions,
                languagesJson: payload.languagesJson === undefined
                    ? client_1.Prisma.JsonNull
                    : payload.languagesJson,
                workingDaysJson: payload.workingDaysJson === undefined
                    ? client_1.Prisma.JsonNull
                    : payload.workingDaysJson,
                certificationsJson: payload.certificationsJson === undefined
                    ? client_1.Prisma.JsonNull
                    : payload.certificationsJson,
            },
            update: {
                insurance: payload.insurance ?? undefined,
                accessibility: payload.accessibility ?? undefined,
                kosherOptions: payload.kosherOptions === undefined
                    ? undefined
                    : payload.kosherOptions === null
                        ? client_1.Prisma.JsonNull
                        : payload.kosherOptions,
                languagesJson: payload.languagesJson === undefined
                    ? undefined
                    : payload.languagesJson === null
                        ? client_1.Prisma.JsonNull
                        : payload.languagesJson,
                workingDaysJson: payload.workingDaysJson === undefined
                    ? undefined
                    : payload.workingDaysJson === null
                        ? client_1.Prisma.JsonNull
                        : payload.workingDaysJson,
                certificationsJson: payload.certificationsJson === undefined
                    ? undefined
                    : payload.certificationsJson === null
                        ? client_1.Prisma.JsonNull
                        : payload.certificationsJson,
            },
        });
    }
    async updateServiceAreas(userId, regions) {
        const supplier = await this.prisma.supplier.findUnique({ where: { ownerUserId: userId } });
        if (!supplier) {
            throw new common_1.NotFoundException('Supplier profile not found');
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
    async suggestions(q, take = 10) {
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
        return [
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
    }
    async saveFavorite(userId, anonymousSessionId, supplierId) {
        if (!userId && !anonymousSessionId) {
            throw new common_1.BadRequestException('User or anonymous session is required');
        }
        return this.prisma.favoriteSupplier.upsert({
            where: userId
                ? { userId_supplierId: { userId, supplierId } }
                : { anonymousSessionId_supplierId: { anonymousSessionId: anonymousSessionId, supplierId } },
            create: { userId, anonymousSessionId, supplierId },
            update: {},
        });
    }
    async trackShare(userId, anonymousSessionId, supplierId, payload) {
        const supplier = await this.prisma.supplier.findUnique({
            where: { id: supplierId },
            select: { id: true, isActive: true, approvalStatus: true },
        });
        if (!supplier || !supplier.isActive || supplier.approvalStatus !== 'APPROVED') {
            throw new common_1.NotFoundException('Supplier not found');
        }
        return {
            tracked: true,
            supplierId,
            actor: {
                userId,
                anonymousSessionId,
            },
            channel: payload?.channel ?? 'unknown',
            context: payload?.context ?? null,
        };
    }
    async removeFavorite(userId, anonymousSessionId, supplierId) {
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
        throw new common_1.BadRequestException('User or anonymous session is required');
    }
    listFavorites(userId, anonymousSessionId) {
        return this.prisma.favoriteSupplier.findMany({
            where: userId ? { userId } : anonymousSessionId ? { anonymousSessionId } : { id: '__none__' },
            include: { supplier: true },
        });
    }
    async upsertDraft(supplierId, payload) {
        return this.prisma.supplierDraft.upsert({
            where: { supplierId },
            create: {
                supplierId,
                stepKey: payload.stepKey,
                completionPercent: payload.completionPercent,
                payloadJson: payload.payloadJson,
                version: payload.version ?? 1,
            },
            update: {
                stepKey: payload.stepKey,
                completionPercent: payload.completionPercent,
                payloadJson: payload.payloadJson,
                version: payload.version ? { increment: 1 } : undefined,
                lastAutosaveAt: new Date(),
            },
        });
    }
    getDraft(supplierId) {
        return this.prisma.supplierDraft.findUnique({
            where: { supplierId },
        });
    }
};
exports.SuppliersService = SuppliersService;
exports.SuppliersService = SuppliersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], SuppliersService);
//# sourceMappingURL=suppliers.service.js.map