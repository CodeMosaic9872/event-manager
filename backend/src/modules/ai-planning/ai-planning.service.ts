import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { AiProviderService } from './ai-provider.service';
import { parseAiOutput } from './ai-output.parser';

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
  constructor(
    private readonly prisma: PrismaService,
    private readonly aiProvider: AiProviderService,
  ) {}

  private scoreSupplier(input: {
    isVerified: boolean;
    ratingAvg?: Prisma.Decimal | null;
    ratingCount: number;
    locationMatch: boolean;
    categoryFit: boolean;
  }) {
    const rating = Number(input.ratingAvg ?? 0);
    const normalizedRating = Math.min(1, Math.max(0, rating / 5));
    const normalizedCount = Math.min(1, input.ratingCount / 100);
    const score =
      (input.isVerified ? 0.2 : 0) +
      normalizedRating * 0.35 +
      normalizedCount * 0.2 +
      (input.locationMatch ? 0.15 : 0) +
      (input.categoryFit ? 0.1 : 0);
    return Number(score.toFixed(4));
  }

  private estimateTokenUsage(userMessage: string, assistantMessage: string) {
    const promptTokens = Math.max(1, Math.ceil(userMessage.length / 4));
    const completionTokens = Math.max(1, Math.ceil(assistantMessage.length / 4));
    return {
      promptTokens,
      completionTokens,
      totalTokens: promptTokens + completionTokens,
    };
  }

  private normalizeEventType(value?: string) {
    if (!value) return undefined;
    const normalized = value.trim().toLowerCase();
    const map: Record<string, string> = {
      חתונה: 'wedding',
      wedding: 'wedding',
      'אירוע עסקי': 'corporate',
      corporate: 'corporate',
      יוםהולדת: 'birthday',
      'יום הולדת': 'birthday',
      birthday: 'birthday',
    };
    return map[normalized] ?? normalized;
  }

  private normalizeLocation(value?: string) {
    return value?.trim().toLowerCase().replace(/\s+/g, ' ');
  }

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

  async getConversation(id: string, page = 1, limit = 20) {
    const conversation = await this.prisma.aiConversation.findUnique({
      where: { id },
      select: {
        id: true,
        userId: true,
        anonymousSessionId: true,
        status: true,
        contextJson: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    if (!conversation) {
      throw new NotFoundException('Conversation not found');
    }
    const safePage = Math.max(1, Math.floor(page));
    const safeLimit = Math.max(1, Math.min(200, Math.floor(limit)));
    const skip = (safePage - 1) * safeLimit;
    const whereMsg = { conversationId: id };
    const [items, totalItems] = await this.prisma.$transaction([
      this.prisma.aiMessage.findMany({
        where: whereMsg,
        orderBy: { createdAt: 'asc' },
        skip,
        take: safeLimit,
      }),
      this.prisma.aiMessage.count({ where: whereMsg }),
    ]);
    return {
      conversation,
      items,
      totalItems,
    };
  }

  async sendMessage(payload: SendMessagePayload) {
    const conversation = await this.prisma.aiConversation.findUnique({
      where: { id: payload.conversationId },
    });
    if (!conversation) {
      throw new NotFoundException('Conversation not found');
    }

    const normalizedEventType = this.normalizeEventType(payload.eventType);
    const normalizedLocation = this.normalizeLocation(payload.location);

    const previousContext = (conversation.contextJson as Record<string, unknown> | null) ?? {};
    const previousEventType = typeof previousContext.eventType === 'string' ? previousContext.eventType : null;
    const eventTypeChanged = Boolean(previousEventType && normalizedEventType && previousEventType !== normalizedEventType);

    const existingMessages = await this.prisma.aiMessage.findMany({
      where: { conversationId: payload.conversationId },
      orderBy: { createdAt: 'asc' },
      select: { role: true, content: true },
    });
    const memorySummary =
      existingMessages.length > 20
        ? `Conversation has ${existingMessages.length} previous messages. Focus on latest requirements.`
        : undefined;

    const userMessage = await this.prisma.aiMessage.create({
      data: {
        conversationId: payload.conversationId,
        role: 'USER',
        content: payload.message,
      },
    });

    const retrievalStartedAt = Date.now();
    const mapping = normalizedEventType
      ? await this.prisma.eventType.findFirst({
          where: { OR: [{ id: normalizedEventType }, { key: normalizedEventType }] },
          include: { mappings: { select: { categoryId: true } } },
        })
      : null;
    const mappedCategoryIds = Array.from(new Set(mapping?.mappings.map((item) => item.categoryId) ?? []));

    const baseWhere: Prisma.SupplierWhereInput = {
      isActive: true,
      approvalStatus: 'APPROVED',
      ...(mappedCategoryIds.length
        ? {
            categories: {
              some: {
                categoryId: { in: mappedCategoryIds },
              },
            },
          }
        : {}),
      ...(normalizedLocation
        ? {
            serviceAreas: {
              some: {
                OR: [
                  { regionCode: { contains: normalizedLocation, mode: 'insensitive' } },
                  { cityCode: { contains: normalizedLocation, mode: 'insensitive' } },
                ],
              },
            },
          }
        : {}),
    };

    let assistantMessageText: string;
    let followUpQuestions: string[] = ['What is your event date?', 'What city is the event in?'];
    let budgetTips: string[] = payload.budget
      ? ['Keep a 10-15% contingency reserve in your planning budget.']
      : ['Add a budget range to improve recommendation quality.'];
    let eventIdeas: string[] = ['Consider adding a signature experience for your guests.'];
    let ctaHints: { openMarketplace: boolean; publishJob: boolean } = {
      openMarketplace: true,
      publishJob: false,
    };
    let responseRecommendations: Array<{
      supplierId: string;
      reason: string;
      confidence: number;
    }> = [];
    let failureTag: string | null = null;
    let retrievalCandidates = 0;

    let candidates: Array<{
      id: string;
      isVerified: boolean;
      ratingAvg: Prisma.Decimal | null;
      ratingCount: number;
      serviceAreas: Array<{ regionCode: string; cityCode: string | null }>;
      categories: Array<{ categoryId: string }>;
    }> = [];
    try {
      candidates = await this.prisma.supplier.findMany({
        where: baseWhere,
        take: 50,
        include: {
          serviceAreas: { select: { regionCode: true, cityCode: true } },
          categories: { select: { categoryId: true } },
        },
      });
      retrievalCandidates = candidates.length;
    } catch {
      failureTag = 'retrieval_error';
    }

    try {
      const ranked = candidates
        .map((candidate) => {
          const locationMatch = normalizedLocation
            ? candidate.serviceAreas.some(
                (area) =>
                  area.regionCode.toLowerCase().includes(normalizedLocation) ||
                  (area.cityCode ? area.cityCode.toLowerCase().includes(normalizedLocation) : false),
              )
            : false;
          const categoryFit = mappedCategoryIds.length
            ? candidate.categories.some((category) => mappedCategoryIds.includes(category.categoryId))
            : true;
          const score = this.scoreSupplier({
            isVerified: candidate.isVerified,
            ratingAvg: candidate.ratingAvg,
            ratingCount: candidate.ratingCount,
            locationMatch,
            categoryFit,
          });
          return { candidate, score, locationMatch, categoryFit };
        })
        .sort((a, b) => b.score - a.score)
        .slice(0, 5);

      responseRecommendations = ranked.map((entry) => ({
        supplierId: entry.candidate.id,
        reason: [
          entry.candidate.isVerified ? 'verified' : null,
          entry.categoryFit ? 'category fit' : null,
          entry.locationMatch ? 'location fit' : null,
        ]
          .filter(Boolean)
          .join(', '),
        confidence: entry.score,
      }));

      const timeoutMs = Number(process.env.AI_PROVIDER_TIMEOUT_MS ?? '6000');
      const rawOutput = await Promise.race([
        this.aiProvider.generatePlanningJson({
          message: payload.message,
          eventType: normalizedEventType,
          budget: payload.budget,
          location: normalizedLocation,
          recommendationCount: responseRecommendations.length,
          memorySummary,
        }),
        new Promise<string>((_, reject) => setTimeout(() => reject(new Error('timeout')), timeoutMs)),
      ]);

      const parsedOutput = parseAiOutput(rawOutput);
      assistantMessageText = parsedOutput.assistantMessage;
      followUpQuestions = parsedOutput.followUpQuestions;
      budgetTips = parsedOutput.budgetTips;
      eventIdeas = parsedOutput.eventIdeas;
      ctaHints = parsedOutput.ctaHints;

      if (!responseRecommendations.length) {
        failureTag = 'no_candidates';
      }
    } catch (error) {
      assistantMessageText =
        'I had trouble generating structured planning output. Please try again shortly or publish a job request.';
      failureTag = error instanceof Error && error.message === 'timeout' ? 'timeout' : 'parse_error';
    }

    await this.prisma.aiConversation.update({
      where: { id: payload.conversationId },
      data: {
        contextJson: {
          ...(previousContext ?? {}),
          eventType: normalizedEventType ?? previousEventType,
          location: normalizedLocation ?? previousContext.location ?? null,
          budget: payload.budget ?? previousContext.budget ?? null,
        } as Prisma.InputJsonValue,
      },
    });

    const usage = this.estimateTokenUsage(payload.message, assistantMessageText);

    const aiMessage = await this.prisma.aiMessage.create({
      data: {
        conversationId: payload.conversationId,
        role: 'ASSISTANT',
        content: assistantMessageText,
        tokenCount: usage.completionTokens,
        latencyMs: Date.now() - retrievalStartedAt,
      },
    });

    if (responseRecommendations.length) {
      await this.prisma.aiRecommendationLog.createMany({
        data: responseRecommendations.map((recommendation) => ({
          conversationId: payload.conversationId,
          messageId: userMessage.id,
          supplierId: recommendation.supplierId,
          score: recommendation.confidence,
          reasonsJson: {
            reason: recommendation.reason,
          },
          latencyMs: Date.now() - retrievalStartedAt,
        })),
      });
    } else if (failureTag) {
      await this.prisma.aiRecommendationLog.create({
        data: {
          conversationId: payload.conversationId,
          messageId: userMessage.id,
          failureTag,
          reasonsJson: {
            eventType: payload.eventType ?? null,
            location: payload.location ?? null,
          },
          latencyMs: Date.now() - retrievalStartedAt,
        },
      });
    }

    if (conversation.userId) {
      await this.prisma.aiUsageCounter.upsert({
        where: { userId: conversation.userId },
        create: {
          userId: conversation.userId,
          messageCount: 1,
        },
        update: {
          messageCount: { increment: 1 },
        },
      });
    } else if (conversation.anonymousSessionId) {
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
      reply: assistantMessageText,
      followUpQuestions,
      budgetTips,
      eventIdeas,
      recommendations: responseRecommendations,
      suggestedCategories: mappedCategoryIds,
      hints: { ...ctaHints, publishJob: responseRecommendations.length === 0 || ctaHints.publishJob },
      messageId: aiMessage.id,
      gatingStatus: 'continue',
      usage,
      decisionTrace: {
        retrievalCandidates,
        failureTag,
        eventTypeResolved: mapping?.key ?? null,
        contextReset: eventTypeChanged,
      },
    };
  }

  async trackRecommendationClick(conversationId: string, supplierId: string) {
    const latest = await this.prisma.aiRecommendationLog.findFirst({
      where: { conversationId, supplierId },
      orderBy: { createdAt: 'desc' },
    });
    if (!latest) {
      throw new NotFoundException('Recommendation not found');
    }

    return this.prisma.aiRecommendationLog.update({
      where: { id: latest.id },
      data: {
        clickedAt: new Date(),
      },
    });
  }

  async trackRecommendationAccept(conversationId: string, supplierId: string) {
    const latest = await this.prisma.aiRecommendationLog.findFirst({
      where: { conversationId, supplierId },
      orderBy: { createdAt: 'desc' },
    });
    if (!latest) {
      throw new NotFoundException('Recommendation not found');
    }

    return this.prisma.aiRecommendationLog.update({
      where: { id: latest.id },
      data: {
        acceptedAt: new Date(),
      },
    });
  }
}
