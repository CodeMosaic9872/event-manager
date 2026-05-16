import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { toAdminPagination } from '../common/admin-pagination.util';

@Injectable()
export class AdminAiService {
  constructor(private readonly prisma: PrismaService) {}

  aiUsage(page?: number, limit?: number) {
    const pg = toAdminPagination(page, limit);
    return this.prisma.aiUsageCounter.findMany({ orderBy: { updatedAt: 'desc' }, skip: pg.skip, take: pg.take });
  }

  aiConversations(page?: number, limit?: number) {
    const pg = toAdminPagination(page, limit);
    return this.prisma.aiConversation.findMany({ include: { messages: true }, skip: pg.skip, take: pg.take });
  }

  aiFailures() {
    return this.prisma.aiRecommendationLog.groupBy({
      by: ['failureTag'],
      where: { failureTag: { not: null } },
      _count: { _all: true },
      _avg: { latencyMs: true },
      orderBy: { _count: { failureTag: 'desc' } },
      take: 20,
    });
  }

  aiTopRecommendations() {
    return this.prisma.aiRecommendationLog.groupBy({
      by: ['supplierId'],
      where: { supplierId: { not: null } },
      _count: { _all: true },
      _avg: { score: true },
      orderBy: { _count: { supplierId: 'desc' } },
      take: 20,
    });
  }

  async aiRecommendationQuality() {
    const [totals, clicked, accepted] = await this.prisma.$transaction([
      this.prisma.aiRecommendationLog.count({ where: { supplierId: { not: null } } }),
      this.prisma.aiRecommendationLog.count({ where: { clickedAt: { not: null } } }),
      this.prisma.aiRecommendationLog.count({ where: { acceptedAt: { not: null } } }),
    ]);

    return {
      totalRecommendations: totals,
      clickedRecommendations: clicked,
      acceptedRecommendations: accepted,
      clickThroughRate: totals > 0 ? Number((clicked / totals).toFixed(4)) : 0,
      acceptanceRate: totals > 0 ? Number((accepted / totals).toFixed(4)) : 0,
    };
  }

  async aiPerformance() {
    const [totalLogs, failedLogs, avgLatency, distinctConversations] = await this.prisma.$transaction([
      this.prisma.aiRecommendationLog.count(),
      this.prisma.aiRecommendationLog.count({ where: { failureTag: { not: null } } }),
      this.prisma.aiRecommendationLog.aggregate({ _avg: { latencyMs: true } }),
      this.prisma.aiRecommendationLog.groupBy({
        by: ['conversationId'],
        _count: { _all: true },
        orderBy: { conversationId: 'asc' },
      }),
    ]);

    const retrievalHitRate = totalLogs > 0 ? Number(((totalLogs - failedLogs) / totalLogs).toFixed(4)) : 0;
    const averageRecommendationsPerConversation =
      distinctConversations.length > 0
        ? Number((totalLogs / distinctConversations.length).toFixed(2))
        : 0;

    return {
      totalLogs,
      failedLogs,
      retrievalHitRate,
      avgLatencyMs: avgLatency._avg.latencyMs ?? 0,
      averageRecommendationsPerConversation,
    };
  }
}
