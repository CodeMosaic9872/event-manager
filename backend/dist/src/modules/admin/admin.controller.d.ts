import { AdminService } from './admin.service';
export declare class AdminController {
    private readonly adminService;
    constructor(adminService: AdminService);
    suppliers(): import(".prisma/client").Prisma.PrismaPromise<{
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
    }[]>;
    incompleteSuppliers(): import(".prisma/client").Prisma.PrismaPromise<({
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
        updatedAt: Date;
        supplierId: string;
        stepKey: string;
        completionPercent: number;
        payloadJson: import("@prisma/client/runtime/library").JsonValue;
        version: number;
        lastAutosaveAt: Date;
    })[]>;
    approve(id: string, body: {
        adminUserId?: string;
    }): Promise<{
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
    reject(id: string, body: {
        reason?: string;
        adminUserId?: string;
    }): Promise<{
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
    feature(id: string): {
        id: string;
        featured: boolean;
    };
    aiUsage(): import(".prisma/client").Prisma.PrismaPromise<{
        id: string;
        updatedAt: Date;
        userId: string | null;
        anonymousSessionId: string | null;
        messageCount: number;
        periodStartAt: Date;
        periodEndAt: Date | null;
    }[]>;
    aiFailures(): {
        failures: never[];
    };
    aiConversations(): import(".prisma/client").Prisma.PrismaPromise<({
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
        contextJson: import("@prisma/client/runtime/library").JsonValue | null;
    })[]>;
    notifications(): import(".prisma/client").Prisma.PrismaPromise<{
        id: string;
        createdAt: Date;
        payloadJson: import("@prisma/client/runtime/library").JsonValue;
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
    retryNotification(id: string): import(".prisma/client").Prisma.Prisma__NotificationClient<{
        id: string;
        createdAt: Date;
        payloadJson: import("@prisma/client/runtime/library").JsonValue;
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
    updateAutomationRule(id: string, body: Record<string, unknown>): {
        id: string;
        updated: boolean;
        body: Record<string, unknown>;
    };
    automationRuns(): {
        runs: never[];
    };
    createEventType(body: Record<string, unknown>): import(".prisma/client").Prisma.Prisma__EventTypeClient<{
        id: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        key: string;
    }, never, import("@prisma/client/runtime/library").DefaultArgs>;
    updateEventType(id: string, body: Record<string, unknown>): import(".prisma/client").Prisma.Prisma__EventTypeClient<{
        id: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        key: string;
    }, never, import("@prisma/client/runtime/library").DefaultArgs>;
    deleteEventType(id: string): import(".prisma/client").Prisma.Prisma__EventTypeClient<{
        id: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        key: string;
    }, never, import("@prisma/client/runtime/library").DefaultArgs>;
    createCategory(body: Record<string, unknown>): import(".prisma/client").Prisma.Prisma__CategoryClient<{
        id: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        key: string;
        sortOrder: number;
    }, never, import("@prisma/client/runtime/library").DefaultArgs>;
    updateCategory(id: string, body: Record<string, unknown>): import(".prisma/client").Prisma.Prisma__CategoryClient<{
        id: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        key: string;
        sortOrder: number;
    }, never, import("@prisma/client/runtime/library").DefaultArgs>;
    deleteCategory(id: string): import(".prisma/client").Prisma.Prisma__CategoryClient<{
        id: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        key: string;
        sortOrder: number;
    }, never, import("@prisma/client/runtime/library").DefaultArgs>;
    createSubcategory(body: Record<string, unknown>): import(".prisma/client").Prisma.Prisma__SubcategoryClient<{
        id: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        categoryId: string;
        key: string;
        sortOrder: number;
    }, never, import("@prisma/client/runtime/library").DefaultArgs>;
    updateSubcategory(id: string, body: Record<string, unknown>): import(".prisma/client").Prisma.Prisma__SubcategoryClient<{
        id: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        categoryId: string;
        key: string;
        sortOrder: number;
    }, never, import("@prisma/client/runtime/library").DefaultArgs>;
    deleteSubcategory(id: string): import(".prisma/client").Prisma.Prisma__SubcategoryClient<{
        id: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        categoryId: string;
        key: string;
        sortOrder: number;
    }, never, import("@prisma/client/runtime/library").DefaultArgs>;
    createFilterDefinition(body: Record<string, unknown>): import(".prisma/client").Prisma.Prisma__FilterDefinitionClient<{
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
        optionsJson: import("@prisma/client/runtime/library").JsonValue | null;
    }, never, import("@prisma/client/runtime/library").DefaultArgs>;
    updateFilterDefinition(id: string, body: Record<string, unknown>): import(".prisma/client").Prisma.Prisma__FilterDefinitionClient<{
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
        optionsJson: import("@prisma/client/runtime/library").JsonValue | null;
    }, never, import("@prisma/client/runtime/library").DefaultArgs>;
    deleteFilterDefinition(id: string): import(".prisma/client").Prisma.Prisma__FilterDefinitionClient<{
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
        optionsJson: import("@prisma/client/runtime/library").JsonValue | null;
    }, never, import("@prisma/client/runtime/library").DefaultArgs>;
}
