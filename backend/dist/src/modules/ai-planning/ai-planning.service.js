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
exports.AiPlanningService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
let AiPlanningService = class AiPlanningService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async createConversation(payload) {
        const anonymousSession = payload.anonymousToken
            ? await this.prisma.anonymousSession.findUnique({ where: { token: payload.anonymousToken } })
            : null;
        return this.prisma.aiConversation.create({
            data: {
                userId: payload.userId ?? null,
                anonymousSessionId: anonymousSession?.id ?? null,
                contextJson: (payload.context ?? {}),
            },
        });
    }
    async getConversation(id) {
        const conversation = await this.prisma.aiConversation.findUnique({
            where: { id },
            include: { messages: true },
        });
        if (!conversation) {
            throw new common_1.NotFoundException('Conversation not found');
        }
        return conversation;
    }
    async sendMessage(payload) {
        const conversation = await this.prisma.aiConversation.findUnique({
            where: { id: payload.conversationId },
        });
        if (!conversation) {
            throw new common_1.NotFoundException('Conversation not found');
        }
        await this.prisma.aiMessage.create({
            data: {
                conversationId: payload.conversationId,
                role: 'USER',
                content: payload.message,
            },
        });
        const recommendations = await this.prisma.supplier.findMany({
            where: {
                isActive: true,
                approvalStatus: 'APPROVED',
            },
            take: 5,
            orderBy: [{ isVerified: 'desc' }, { ratingCount: 'desc' }],
            select: { id: true, businessName: true, slug: true, ratingAvg: true },
        });
        const assistantMessage = recommendations.length
            ? `I found ${recommendations.length} suppliers from the marketplace that match your planning context.`
            : 'No direct supplier matches were found. Consider publishing a job to receive applications.';
        const aiMessage = await this.prisma.aiMessage.create({
            data: {
                conversationId: payload.conversationId,
                role: 'ASSISTANT',
                content: assistantMessage,
            },
        });
        if (conversation.anonymousSessionId) {
            await this.prisma.aiUsageCounter.upsert({
                where: { anonymousSessionId: conversation.anonymousSessionId },
                create: {
                    anonymousSessionId: conversation.anonymousSessionId,
                    messageCount: 1,
                },
                update: {
                    messageCount: { increment: 1 },
                },
            });
        }
        return {
            conversationId: payload.conversationId,
            assistantMessage,
            followUpQuestions: ['What is your event date?', 'What city is the event in?'],
            recommendations: recommendations.map((supplier, index) => ({
                supplierId: supplier.id,
                reason: 'Matches marketplace eligibility and relevance signals',
                confidence: Math.max(0.5, 0.9 - index * 0.1),
            })),
            hints: {
                openMarketplace: true,
                publishJob: recommendations.length === 0,
            },
            messageId: aiMessage.id,
            gatingStatus: 'continue',
        };
    }
};
exports.AiPlanningService = AiPlanningService;
exports.AiPlanningService = AiPlanningService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], AiPlanningService);
//# sourceMappingURL=ai-planning.service.js.map