import { PrismaService } from '../../prisma/prisma.service';
import { SuppliersService } from './suppliers.service';
import { AuthUser } from '../../common/interfaces/auth-user.interface';
import { ListSuppliersQueryDto } from './dto/list-suppliers-query.dto';
import { SupplierSuggestionsQueryDto } from './dto/supplier-suggestions-query.dto';
import { UpsertSupplierProfileDto } from './dto/upsert-supplier-profile.dto';
import { UpsertSupplierDraftDto } from './dto/supplier-draft.dto';
import { ShareSupplierDto } from './dto/share-supplier.dto';
import { AddSupplierMediaDto, UpdateSupplierAttributesDto, UpdateSupplierServiceAreasDto } from './dto/supplier-private-profile.dto';
export declare class SuppliersController {
    private readonly suppliersService;
    private readonly prisma;
    constructor(suppliersService: SuppliersService, prisma: PrismaService);
    listSuppliers(query: ListSuppliersQueryDto): Promise<{
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
                metadataJson: import("@prisma/client/runtime/library").JsonValue | null;
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
            ratingAvg: import("@prisma/client/runtime/library").Decimal | null;
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
    getSupplier(slugOrId: string): Promise<{
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
            metadataJson: import("@prisma/client/runtime/library").JsonValue | null;
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
            kosherOptions: import("@prisma/client/runtime/library").JsonValue | null;
            languagesJson: import("@prisma/client/runtime/library").JsonValue | null;
            govSupplierFlags: import("@prisma/client/runtime/library").JsonValue | null;
            workingDaysJson: import("@prisma/client/runtime/library").JsonValue | null;
            certificationsJson: import("@prisma/client/runtime/library").JsonValue | null;
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
        ratingAvg: import("@prisma/client/runtime/library").Decimal | null;
        ratingCount: number;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
    }>;
    suggestions(query: SupplierSuggestionsQueryDto): Promise<{
        id: string;
        label: string;
        type: string;
        value: string;
    }[]>;
    createProfile(user: AuthUser | undefined, body: UpsertSupplierProfileDto): Promise<{
        id: string;
        ownerUserId: string;
        businessName: string;
        slug: string;
        description: string | null;
        approvalStatus: import(".prisma/client").$Enums.SupplierApprovalStatus;
        isActive: boolean;
        isVerified: boolean;
        ratingAvg: import("@prisma/client/runtime/library").Decimal | null;
        ratingCount: number;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
    }>;
    patchProfile(user: AuthUser | undefined, body: UpsertSupplierProfileDto): Promise<{
        id: string;
        ownerUserId: string;
        businessName: string;
        slug: string;
        description: string | null;
        approvalStatus: import(".prisma/client").$Enums.SupplierApprovalStatus;
        isActive: boolean;
        isVerified: boolean;
        ratingAvg: import("@prisma/client/runtime/library").Decimal | null;
        ratingCount: number;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
    }>;
    addMedia(user: AuthUser | undefined, body: AddSupplierMediaDto): Promise<{
        id: string;
        createdAt: Date;
        supplierId: string;
        sortOrder: number;
        mediaType: string;
        url: string;
        metadataJson: import("@prisma/client/runtime/library").JsonValue | null;
    }>;
    deleteMedia(user: AuthUser | undefined, id: string): Promise<{
        deleted: boolean;
        id: string;
    }>;
    updateAttributes(user: AuthUser | undefined, body: UpdateSupplierAttributesDto): Promise<{
        id: string;
        supplierId: string;
        insurance: boolean | null;
        accessibility: boolean | null;
        kosherOptions: import("@prisma/client/runtime/library").JsonValue | null;
        languagesJson: import("@prisma/client/runtime/library").JsonValue | null;
        govSupplierFlags: import("@prisma/client/runtime/library").JsonValue | null;
        workingDaysJson: import("@prisma/client/runtime/library").JsonValue | null;
        certificationsJson: import("@prisma/client/runtime/library").JsonValue | null;
    }>;
    updateServiceAreas(user: AuthUser | undefined, body: UpdateSupplierServiceAreasDto): Promise<{
        supplierId: string;
        serviceAreas: {
            id: string;
            supplierId: string;
            regionCode: string;
            cityCode: string | null;
        }[];
    }>;
    favorite(supplierId: string, authorization?: string): Promise<{
        id: string;
        createdAt: Date;
        supplierId: string;
        userId: string | null;
        anonymousSessionId: string | null;
    }>;
    share(supplierId: string, authorization?: string, body?: ShareSupplierDto): Promise<{
        tracked: boolean;
        supplierId: string;
        actor: {
            userId: string | null;
            anonymousSessionId: string | null;
        };
        channel: string;
        context: string | null;
    }>;
    unfavorite(supplierId: string, authorization?: string): Promise<{
        id: string;
        createdAt: Date;
        supplierId: string;
        userId: string | null;
        anonymousSessionId: string | null;
    }>;
    listFavorites(authorization?: string): Promise<({
        supplier: {
            id: string;
            ownerUserId: string;
            businessName: string;
            slug: string;
            description: string | null;
            approvalStatus: import(".prisma/client").$Enums.SupplierApprovalStatus;
            isActive: boolean;
            isVerified: boolean;
            ratingAvg: import("@prisma/client/runtime/library").Decimal | null;
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
    saveDraft(body: UpsertSupplierDraftDto): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        supplierId: string;
        stepKey: string;
        completionPercent: number;
        payloadJson: import("@prisma/client/runtime/library").JsonValue;
        version: number;
        lastAutosaveAt: Date;
    }>;
    getDraft(supplierId: string): import(".prisma/client").Prisma.Prisma__SupplierDraftClient<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        supplierId: string;
        stepKey: string;
        completionPercent: number;
        payloadJson: import("@prisma/client/runtime/library").JsonValue;
        version: number;
        lastAutosaveAt: Date;
    } | null, null, import("@prisma/client/runtime/library").DefaultArgs>;
    private resolveActor;
}
