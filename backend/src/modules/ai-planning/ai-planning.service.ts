import { Injectable, NotFoundException } from '@nestjs/common';
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

@Injectable()
export class AiPlanningService {
  constructor(private readonly prisma: PrismaService) {}

  async createConversation(payload: { userId?: string; anonymousToken?: string; context?: Record<string, unknown> }) {
    const anonymousSession = payload.anonymousToken
      ? await this.prisma.anonymousSession.findUnique({ where: { token: payload.anonymousToken } })
      : null;

    return this.prisma.aiConversation.create({
      data: {
        userId: payload.userId ?? null,
        anonymousSessionId: anonymousSession?.id ?? null,
        contextJson: (payload.context ?? {}) as Prisma.InputJsonValue,
      },
    });
  }

  async getConversation(id: string) {
    const conversation = await this.prisma.aiConversation.findUnique({
      where: { id },
      include: { messages: true },
    });
    if (!conversation) {
      throw new NotFoundException('Conversation not found');
    }
    return conversation;
  }

  async sendMessage(payload: SendMessagePayload) {
    const conversation = await this.prisma.aiConversation.findUnique({
      where: { id: payload.conversationId },
    });
    if (!conversation) {
      throw new NotFoundException('Conversation not found');
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
}
