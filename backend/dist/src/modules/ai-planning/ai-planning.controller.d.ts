import { AiPlanningService } from './ai-planning.service';
import { AuthUser } from '../../common/interfaces/auth-user.interface';
export declare class AiPlanningController {
    private readonly aiPlanningService;
    constructor(aiPlanningService: AiPlanningService);
    createConversation(user: AuthUser | undefined, body: {
        anonymousToken?: string;
        context?: Record<string, unknown>;
    }): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: import(".prisma/client").$Enums.AiConversationStatus;
        userId: string | null;
        anonymousSessionId: string | null;
        contextJson: import("@prisma/client/runtime/library").JsonValue | null;
    }>;
    getConversation(id: string): Promise<{
        messages: {
            id: string;
            createdAt: Date;
            role: import(".prisma/client").$Enums.AiRole;
            content: string;
            tokenCount: number | null;
            latencyMs: number | null;
            conversationId: string;
        }[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: import(".prisma/client").$Enums.AiConversationStatus;
        userId: string | null;
        anonymousSessionId: string | null;
        contextJson: import("@prisma/client/runtime/library").JsonValue | null;
    }>;
    sendMessage(user: AuthUser | undefined, id: string, body: {
        message: string;
        anonymousToken?: string;
        eventType?: string;
        budget?: number;
        location?: string;
    }): Promise<{
        conversationId: string;
        assistantMessage: string;
        followUpQuestions: string[];
        recommendations: {
            supplierId: string;
            reason: string;
            confidence: number;
        }[];
        hints: {
            openMarketplace: boolean;
            publishJob: boolean;
        };
        messageId: string;
        gatingStatus: string;
    }>;
}
