import { PrismaService } from '../../prisma/prisma.service';
import { TaxonomyMappingQueryDto } from './dto/taxonomy-mapping-query.dto';
export declare class TaxonomyService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    getEventTypes(): import(".prisma/client").Prisma.PrismaPromise<{
        id: string;
        key: string;
        name: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
    }[]>;
    getCategories(): import(".prisma/client").Prisma.PrismaPromise<{
        id: string;
        key: string;
        name: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        sortOrder: number;
    }[]>;
    getSubcategories(categoryId: string): import(".prisma/client").Prisma.PrismaPromise<{
        id: string;
        key: string;
        name: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        sortOrder: number;
        categoryId: string;
    }[]>;
    getFilterDefinitions(categoryId?: string): import(".prisma/client").Prisma.PrismaPromise<{
        id: string;
        key: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        sortOrder: number;
        categoryId: string | null;
        scope: string;
        label: string;
        type: string;
        optionsJson: import("@prisma/client/runtime/library").JsonValue | null;
    }[]>;
    getMapping(query: TaxonomyMappingQueryDto): Promise<{
        filters: {
            eventTypeId: string | null;
            categoryId: string | null;
        };
        count: number;
        items: {
            eventType: {
                id: string;
                key: string;
                name: string;
            };
            category: {
                id: string;
                key: string;
                name: string;
            };
            subcategory: {
                id: string;
                key: string;
                name: string;
            };
            priority: number;
            isDefault: boolean;
        }[];
    }>;
}
