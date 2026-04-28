import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { ListSuppliersQueryDto } from './dto/list-suppliers-query.dto';
export declare class SuppliersService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    list(query: ListSuppliersQueryDto): Promise<{
        items: ({
            categories: {
                id: string;
                createdAt: Date;
                supplierId: string;
                categoryId: string;
                subcategoryId: string | null;
            }[];
            serviceAreas: {
                id: string;
                supplierId: string;
                regionCode: string;
                cityCode: string | null;
            }[];
            media: {
                id: string;
                createdAt: Date;
                supplierId: string;
                sortOrder: number;
                mediaType: string;
                url: string;
                metadataJson: Prisma.JsonValue | null;
            }[];
        } & {
            id: string;
            ownerUserId: string;
            businessName: string;
            slug: string;
            description: string | null;
            approvalStatus: import(".prisma/client").$Enums.SupplierApprovalStatus;
            isActive: boolean;
            isVerified: boolean;
            ratingAvg: Prisma.Decimal | null;
            ratingCount: number;
            createdAt: Date;
            updatedAt: Date;
            deletedAt: Date | null;
        })[];
        pageInfo: {
            hasNextPage: boolean;
            nextCursor: string | null;
            take: number;
        };
        relaxationHints: string[];
        warnings: string[];
        facets: {
            categories: {
                categoryId: string;
                key: string | null;
                name: string | null;
                count: number;
            }[];
            regions: {
                regionCode: string;
                count: number;
            }[];
        };
        searchMeta: {
            latencyMs: number;
            constrainedByEventType: boolean;
        };
    }>;
    private buildRelaxationHints;
    getByIdOrSlug(slugOrId: string): Promise<{
        categories: {
            id: string;
            createdAt: Date;
            supplierId: string;
            categoryId: string;
            subcategoryId: string | null;
        }[];
        serviceAreas: {
            id: string;
            supplierId: string;
            regionCode: string;
            cityCode: string | null;
        }[];
        media: {
            id: string;
            createdAt: Date;
            supplierId: string;
            sortOrder: number;
            mediaType: string;
            url: string;
            metadataJson: Prisma.JsonValue | null;
        }[];
        socialLinks: {
            id: string;
            supplierId: string;
            url: string;
            platform: string;
        }[];
        attributes: {
            id: string;
            supplierId: string;
            insurance: boolean | null;
            accessibility: boolean | null;
            kosherOptions: Prisma.JsonValue | null;
            languagesJson: Prisma.JsonValue | null;
            govSupplierFlags: Prisma.JsonValue | null;
            workingDaysJson: Prisma.JsonValue | null;
            certificationsJson: Prisma.JsonValue | null;
        } | null;
    } & {
        id: string;
        ownerUserId: string;
        businessName: string;
        slug: string;
        description: string | null;
        approvalStatus: import(".prisma/client").$Enums.SupplierApprovalStatus;
        isActive: boolean;
        isVerified: boolean;
        ratingAvg: Prisma.Decimal | null;
        ratingCount: number;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
    }>;
    upsertProfile(userId: string, payload: {
        businessName: string;
        slug: string;
        description?: string;
    }): Promise<{
        id: string;
        ownerUserId: string;
        businessName: string;
        slug: string;
        description: string | null;
        approvalStatus: import(".prisma/client").$Enums.SupplierApprovalStatus;
        isActive: boolean;
        isVerified: boolean;
        ratingAvg: Prisma.Decimal | null;
        ratingCount: number;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
    }>;
    addMedia(userId: string, payload: {
        mediaType: string;
        url: string;
        sortOrder?: number;
        metadataJson?: Record<string, unknown>;
    }): Promise<{
        id: string;
        createdAt: Date;
        supplierId: string;
        sortOrder: number;
        mediaType: string;
        url: string;
        metadataJson: Prisma.JsonValue | null;
    }>;
    deleteMedia(userId: string, mediaId: string): Promise<{
        deleted: boolean;
        id: string;
    }>;
    updateAttributes(userId: string, payload: {
        insurance?: boolean;
        accessibility?: boolean;
        kosherOptions?: unknown;
        languagesJson?: unknown;
        workingDaysJson?: unknown;
        certificationsJson?: unknown;
    }): Promise<{
        id: string;
        supplierId: string;
        insurance: boolean | null;
        accessibility: boolean | null;
        kosherOptions: Prisma.JsonValue | null;
        languagesJson: Prisma.JsonValue | null;
        govSupplierFlags: Prisma.JsonValue | null;
        workingDaysJson: Prisma.JsonValue | null;
        certificationsJson: Prisma.JsonValue | null;
    }>;
    updateServiceAreas(userId: string, regions: Array<{
        regionCode: string;
        cityCode?: string;
    }>): Promise<{
        supplierId: string;
        serviceAreas: {
            id: string;
            supplierId: string;
            regionCode: string;
            cityCode: string | null;
        }[];
    }>;
    suggestions(q: string, take?: number): Promise<{
        id: string;
        label: string;
        type: string;
        value: string;
    }[]>;
    saveFavorite(userId: string | null, anonymousSessionId: string | null, supplierId: string): Promise<{
        id: string;
        createdAt: Date;
        supplierId: string;
        userId: string | null;
        anonymousSessionId: string | null;
    }>;
    trackShare(userId: string | null, anonymousSessionId: string | null, supplierId: string, payload?: {
        channel?: string;
        context?: string;
    }): Promise<{
        tracked: boolean;
        supplierId: string;
        actor: {
            userId: string | null;
            anonymousSessionId: string | null;
        };
        channel: string;
        context: string | null;
    }>;
    removeFavorite(userId: string | null, anonymousSessionId: string | null, supplierId: string): Promise<{
        id: string;
        createdAt: Date;
        supplierId: string;
        userId: string | null;
        anonymousSessionId: string | null;
    }>;
    listFavorites(userId: string | null, anonymousSessionId: string | null): Prisma.PrismaPromise<({
        supplier: {
            id: string;
            ownerUserId: string;
            businessName: string;
            slug: string;
            description: string | null;
            approvalStatus: import(".prisma/client").$Enums.SupplierApprovalStatus;
            isActive: boolean;
            isVerified: boolean;
            ratingAvg: Prisma.Decimal | null;
            ratingCount: number;
            createdAt: Date;
            updatedAt: Date;
            deletedAt: Date | null;
        };
    } & {
        id: string;
        createdAt: Date;
        supplierId: string;
        userId: string | null;
        anonymousSessionId: string | null;
    })[]>;
    upsertDraft(supplierId: string, payload: {
        stepKey: string;
        completionPercent: number;
        payloadJson: Record<string, unknown>;
        version?: number;
    }): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        supplierId: string;
        stepKey: string;
        completionPercent: number;
        payloadJson: Prisma.JsonValue;
        version: number;
        lastAutosaveAt: Date;
    }>;
    getDraft(supplierId: string): Prisma.Prisma__SupplierDraftClient<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        supplierId: string;
        stepKey: string;
        completionPercent: number;
        payloadJson: Prisma.JsonValue;
        version: number;
        lastAutosaveAt: Date;
    } | null, null, import("@prisma/client/runtime/library").DefaultArgs>;
}
