import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
export declare class AdminService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    listSuppliers(): Prisma.PrismaPromise<{
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
    }[]>;
    listIncompleteSuppliers(): Prisma.PrismaPromise<({
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
        updatedAt: Date;
        supplierId: string;
        stepKey: string;
        completionPercent: number;
        payloadJson: Prisma.JsonValue;
        version: number;
        lastAutosaveAt: Date;
    })[]>;
    approveSupplier(id: string, actorAdminId?: string): Promise<{
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
    rejectSupplier(id: string, reason?: string, actorAdminId?: string): Promise<{
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
    aiUsage(): Prisma.PrismaPromise<{
        id: string;
        updatedAt: Date;
        userId: string | null;
        anonymousSessionId: string | null;
        messageCount: number;
        periodStartAt: Date;
        periodEndAt: Date | null;
    }[]>;
    aiConversations(): Prisma.PrismaPromise<({
        messages: {
            id: string;
            createdAt: Date;
            conversationId: string;
            role: import(".prisma/client").$Enums.AiRole;
            content: string;
            tokenCount: number | null;
            latencyMs: number | null;
        }[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string | null;
        anonymousSessionId: string | null;
        status: import(".prisma/client").$Enums.AiConversationStatus;
        contextJson: Prisma.JsonValue | null;
    })[]>;
    aiFailures(): {
        failures: never[];
    };
    notifications(): Prisma.PrismaPromise<{
        id: string;
        createdAt: Date;
        payloadJson: Prisma.JsonValue;
        status: import(".prisma/client").$Enums.NotificationStatus;
        recipientUserId: string | null;
        recipientSupplierId: string | null;
        channel: import(".prisma/client").$Enums.NotificationChannel;
        templateKey: string;
        providerMessageId: string | null;
        errorCode: string | null;
        scheduledAt: Date | null;
        sentAt: Date | null;
    }[]>;
    retryNotification(id: string): Prisma.Prisma__NotificationClient<{
        id: string;
        createdAt: Date;
        payloadJson: Prisma.JsonValue;
        status: import(".prisma/client").$Enums.NotificationStatus;
        recipientUserId: string | null;
        recipientSupplierId: string | null;
        channel: import(".prisma/client").$Enums.NotificationChannel;
        templateKey: string;
        providerMessageId: string | null;
        errorCode: string | null;
        scheduledAt: Date | null;
        sentAt: Date | null;
    }, never, import("@prisma/client/runtime/library").DefaultArgs>;
    automationRules(): {
        rules: never[];
    };
    automationRuns(): {
        runs: never[];
    };
    createEventType(payload: {
        key: string;
        name: string;
        isActive?: boolean;
    }): Prisma.Prisma__EventTypeClient<{
        id: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        key: string;
    }, never, import("@prisma/client/runtime/library").DefaultArgs>;
    updateEventType(id: string, payload: {
        key?: string;
        name?: string;
        isActive?: boolean;
    }): Prisma.Prisma__EventTypeClient<{
        id: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        key: string;
    }, never, import("@prisma/client/runtime/library").DefaultArgs>;
    deleteEventType(id: string): Prisma.Prisma__EventTypeClient<{
        id: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        key: string;
    }, never, import("@prisma/client/runtime/library").DefaultArgs>;
    createCategory(payload: {
        key: string;
        name: string;
        sortOrder?: number;
        isActive?: boolean;
    }): Prisma.Prisma__CategoryClient<{
        id: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        key: string;
        sortOrder: number;
    }, never, import("@prisma/client/runtime/library").DefaultArgs>;
    updateCategory(id: string, payload: {
        key?: string;
        name?: string;
        sortOrder?: number;
        isActive?: boolean;
    }): Prisma.Prisma__CategoryClient<{
        id: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        key: string;
        sortOrder: number;
    }, never, import("@prisma/client/runtime/library").DefaultArgs>;
    deleteCategory(id: string): Prisma.Prisma__CategoryClient<{
        id: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        key: string;
        sortOrder: number;
    }, never, import("@prisma/client/runtime/library").DefaultArgs>;
    createSubcategory(payload: {
        categoryId: string;
        key: string;
        name: string;
        sortOrder?: number;
        isActive?: boolean;
    }): Prisma.Prisma__SubcategoryClient<{
        id: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        categoryId: string;
        key: string;
        sortOrder: number;
    }, never, import("@prisma/client/runtime/library").DefaultArgs>;
    updateSubcategory(id: string, payload: {
        categoryId?: string;
        key?: string;
        name?: string;
        sortOrder?: number;
        isActive?: boolean;
    }): Prisma.Prisma__SubcategoryClient<{
        id: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        categoryId: string;
        key: string;
        sortOrder: number;
    }, never, import("@prisma/client/runtime/library").DefaultArgs>;
    deleteSubcategory(id: string): Prisma.Prisma__SubcategoryClient<{
        id: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        categoryId: string;
        key: string;
        sortOrder: number;
    }, never, import("@prisma/client/runtime/library").DefaultArgs>;
    createFilterDefinition(payload: {
        scope: string;
        categoryId?: string;
        key: string;
        label: string;
        type: string;
        optionsJson?: unknown;
        sortOrder?: number;
        isActive?: boolean;
    }): Prisma.Prisma__FilterDefinitionClient<{
        id: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        categoryId: string | null;
        key: string;
        sortOrder: number;
        scope: string;
        label: string;
        type: string;
        optionsJson: Prisma.JsonValue | null;
    }, never, import("@prisma/client/runtime/library").DefaultArgs>;
    updateFilterDefinition(id: string, payload: {
        scope?: string;
        categoryId?: string | null;
        key?: string;
        label?: string;
        type?: string;
        optionsJson?: unknown;
        sortOrder?: number;
        isActive?: boolean;
    }): Prisma.Prisma__FilterDefinitionClient<{
        id: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        categoryId: string | null;
        key: string;
        sortOrder: number;
        scope: string;
        label: string;
        type: string;
        optionsJson: Prisma.JsonValue | null;
    }, never, import("@prisma/client/runtime/library").DefaultArgs>;
    deleteFilterDefinition(id: string): Prisma.Prisma__FilterDefinitionClient<{
        id: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        categoryId: string | null;
        key: string;
        sortOrder: number;
        scope: string;
        label: string;
        type: string;
        optionsJson: Prisma.JsonValue | null;
    }, never, import("@prisma/client/runtime/library").DefaultArgs>;
}
