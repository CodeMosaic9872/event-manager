import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
type SendMessagePayload = {
    conversationId: string;
    message: string;
    userId?: string;
    anonymousToken?: string;
    eventType?: string;
    budget?: number;
    location?: string;
};
export declare class AiPlanningService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    createConversation(payload: {
        userId?: string;
        anonymousToken?: string;
        context?: Record<string, unknown>;
    }): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: import(".prisma/client").$Enums.AiConversationStatus;
        userId: string | null;
        anonymousSessionId: string | null;
        contextJson: Prisma.JsonValue | null;
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
        contextJson: Prisma.JsonValue | null;
    }>;
    sendMessage(payload: SendMessagePayload): Promise<{
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
export {};
