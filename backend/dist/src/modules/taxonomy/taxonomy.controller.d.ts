import { TaxonomyService } from './taxonomy.service';
import { TaxonomyMappingQueryDto } from './dto/taxonomy-mapping-query.dto';
export declare class TaxonomyController {
    private readonly taxonomyService;
    constructor(taxonomyService: TaxonomyService);
    eventTypes(): import(".prisma/client").Prisma.PrismaPromise<{
        id: string;
        key: string;
        name: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
    }[]>;
    categories(): import(".prisma/client").Prisma.PrismaPromise<{
        id: string;
        key: string;
        name: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        sortOrder: number;
    }[]>;
    subcategories(categoryId: string): import(".prisma/client").Prisma.PrismaPromise<{
        id: string;
        key: string;
        name: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        sortOrder: number;
        categoryId: string;
    }[]>;
    filterDefinitions(categoryId?: string): import(".prisma/client").Prisma.PrismaPromise<{
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
    mapping(query: TaxonomyMappingQueryDto): Promise<{
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
