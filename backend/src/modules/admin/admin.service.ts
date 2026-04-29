import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class AdminService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notificationsService: NotificationsService,
  ) {}

  listSuppliers() {
    return this.prisma.supplier.findMany({ orderBy: { createdAt: 'desc' } });
  }

  listUsers() {
    return this.prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        roles: true,
        supplier: {
          select: {
            id: true,
            approvalStatus: true,
            isActive: true,
          },
        },
      },
      take: 500,
    });
  }

  listIncompleteUsers() {
    return this.prisma.user.findMany({
      where: {
        OR: [
          { email: null },
          { phone: null },
          {
            supplier: {
              is: {
                approvalStatus: { in: ['DRAFT', 'PENDING'] },
              },
            },
          },
        ],
      },
      orderBy: { createdAt: 'desc' },
      include: {
        roles: true,
        supplier: {
          select: {
            id: true,
            approvalStatus: true,
            isActive: true,
          },
        },
      },
      take: 500,
    });
  }

  listUnpaidUsers() {
    return this.prisma.user.findMany({
      where: {
        supplier: {
          is: {
            isActive: false,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      include: {
        roles: true,
        supplier: {
          select: {
            id: true,
            approvalStatus: true,
            isActive: true,
          },
        },
      },
      take: 500,
    });
  }

  listIncompleteSuppliers() {
    return this.prisma.supplierDraft.findMany({
      where: { completionPercent: { lt: 100 } },
      include: { supplier: true },
      orderBy: { lastAutosaveAt: 'desc' },
    });
  }

  approveSupplier(id: string, actorAdminId?: string) {
    return this.prisma.$transaction(async (tx) => {
      const existing = await tx.supplier.findUniqueOrThrow({ where: { id } });
      const updated = await tx.supplier.update({
        where: { id },
        data: { approvalStatus: 'APPROVED' },
      });
      await tx.supplierApprovalHistory.create({
        data: {
          supplierId: id,
          fromStatus: existing.approvalStatus,
          toStatus: 'APPROVED',
          actorAdminId: actorAdminId ?? null,
        },
      });
      return updated;
    });
  }

  rejectSupplier(id: string, reason?: string, actorAdminId?: string) {
    return this.prisma.$transaction(async (tx) => {
      const existing = await tx.supplier.findUniqueOrThrow({ where: { id } });
      const updated = await tx.supplier.update({
        where: { id },
        data: { approvalStatus: 'REJECTED' },
      });
      await tx.supplierApprovalHistory.create({
        data: {
          supplierId: id,
          fromStatus: existing.approvalStatus,
          toStatus: 'REJECTED',
          reason: reason ?? null,
          actorAdminId: actorAdminId ?? null,
        },
      });
      return updated;
    });
  }

  aiUsage() {
    return this.prisma.aiUsageCounter.findMany({ orderBy: { updatedAt: 'desc' }, take: 100 });
  }

  aiConversations() {
    return this.prisma.aiConversation.findMany({ include: { messages: true }, take: 50 });
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

  notifications() {
    return this.prisma.notification.findMany({ orderBy: { createdAt: 'desc' }, take: 100 });
  }

  notificationProvidersHealth() {
    return this.notificationsService.getProviderHealth();
  }

  listJobs() {
    return this.prisma.jobPost.findMany({
      orderBy: { createdAt: 'desc' },
      take: 200,
    });
  }

  listJobApplications(jobId?: string) {
    return this.prisma.jobApplication.findMany({
      where: { jobPostId: jobId ?? undefined },
      include: { supplier: true, jobPost: true },
      orderBy: { submittedAt: 'desc' },
      take: 200,
    });
  }

  archiveJob(jobId: string) {
    return this.prisma.jobPost.update({
      where: { id: jobId },
      data: { status: 'ARCHIVED' },
    });
  }

  async moderateJobApplication(
    applicationId: string,
    status: 'SUBMITTED' | 'SHORTLISTED' | 'REJECTED' | 'WITHDRAWN',
    reason?: string,
    actorAdminId?: string,
  ) {
    const application = await this.prisma.jobApplication.findUnique({ where: { id: applicationId } });
    if (!application) {
      throw new NotFoundException('Application not found');
    }
    return this.prisma.$transaction(async (tx) => {
      const updated = await tx.jobApplication.update({
        where: { id: applicationId },
        data: { status },
      });
      await tx.jobApplicationHistory.create({
        data: {
          jobApplicationId: applicationId,
          fromStatus: application.status,
          toStatus: status,
          reason: reason ?? null,
          actorType: 'ADMIN',
          actorId: actorAdminId ?? null,
        },
      });
      return updated;
    });
  }

  retryNotification(id: string) {
    return this.prisma.notification.update({
      where: { id },
      data: { status: 'PENDING', errorCode: null },
    });
  }

  automationRules() {
    return this.prisma.notificationTemplate.findMany({
      orderBy: { createdAt: 'desc' },
      take: 100,
    });
  }

  updateAutomationRule(id: string, payload: { isActive?: boolean; config?: Record<string, unknown> }) {
    return this.prisma.notificationTemplate.update({
      where: { id },
      data: {
        isActive: payload.isActive ?? undefined,
        bodyTemplate: payload.config ? JSON.stringify(payload.config) : undefined,
        version: { increment: 1 },
      },
    });
  }

  automationRuns() {
    return this.prisma.notification.findMany({
      orderBy: { createdAt: 'desc' },
      take: 200,
    });
  }

  processAutomationRuns(limit = 50) {
    return this.notificationsService.dispatchPendingEmails(limit);
  }

  async automationMetrics() {
    const [pending, sent, failed] = await this.prisma.$transaction([
      this.prisma.notification.count({ where: { status: 'PENDING' } }),
      this.prisma.notification.count({ where: { status: 'SENT' } }),
      this.prisma.notification.count({ where: { status: 'FAILED' } }),
    ]);
    return {
      pending,
      sent,
      failed,
      total: pending + sent + failed,
    };
  }

  createEventType(payload: { key: string; name: string; isActive?: boolean }) {
    return this.prisma.eventType.create({
      data: {
        key: payload.key,
        name: payload.name,
        isActive: payload.isActive ?? true,
      },
    });
  }

  updateEventType(id: string, payload: { key?: string; name?: string; isActive?: boolean }) {
    return this.prisma.eventType.update({
      where: { id },
      data: {
        key: payload.key ?? undefined,
        name: payload.name ?? undefined,
        isActive: payload.isActive ?? undefined,
      },
    });
  }

  deleteEventType(id: string) {
    return this.prisma.eventType.delete({ where: { id } });
  }

  createCategory(payload: { key: string; name: string; sortOrder?: number; isActive?: boolean }) {
    return this.prisma.category.create({
      data: {
        key: payload.key,
        name: payload.name,
        sortOrder: payload.sortOrder ?? 0,
        isActive: payload.isActive ?? true,
      },
    });
  }

  updateCategory(id: string, payload: { key?: string; name?: string; sortOrder?: number; isActive?: boolean }) {
    return this.prisma.category.update({
      where: { id },
      data: {
        key: payload.key ?? undefined,
        name: payload.name ?? undefined,
        sortOrder: payload.sortOrder ?? undefined,
        isActive: payload.isActive ?? undefined,
      },
    });
  }

  deleteCategory(id: string) {
    return this.prisma.category.delete({ where: { id } });
  }

  createSubcategory(payload: { categoryId: string; key: string; name: string; sortOrder?: number; isActive?: boolean }) {
    return this.prisma.subcategory.create({
      data: {
        categoryId: payload.categoryId,
        key: payload.key,
        name: payload.name,
        sortOrder: payload.sortOrder ?? 0,
        isActive: payload.isActive ?? true,
      },
    });
  }

  updateSubcategory(
    id: string,
    payload: { categoryId?: string; key?: string; name?: string; sortOrder?: number; isActive?: boolean },
  ) {
    return this.prisma.subcategory.update({
      where: { id },
      data: {
        categoryId: payload.categoryId ?? undefined,
        key: payload.key ?? undefined,
        name: payload.name ?? undefined,
        sortOrder: payload.sortOrder ?? undefined,
        isActive: payload.isActive ?? undefined,
      },
    });
  }

  deleteSubcategory(id: string) {
    return this.prisma.subcategory.delete({ where: { id } });
  }

  createFilterDefinition(payload: {
    scope: string;
    categoryId?: string;
    key: string;
    label: string;
    type: string;
    optionsJson?: unknown;
    sortOrder?: number;
    isActive?: boolean;
  }) {
    return this.prisma.filterDefinition.create({
      data: {
        scope: payload.scope,
        categoryId: payload.categoryId ?? null,
        key: payload.key,
        label: payload.label,
        type: payload.type,
        optionsJson:
          payload.optionsJson === undefined
            ? Prisma.JsonNull
            : (payload.optionsJson as Prisma.InputJsonValue),
        sortOrder: payload.sortOrder ?? 0,
        isActive: payload.isActive ?? true,
      },
    });
  }

  updateFilterDefinition(
    id: string,
    payload: {
      scope?: string;
      categoryId?: string | null;
      key?: string;
      label?: string;
      type?: string;
      optionsJson?: unknown;
      sortOrder?: number;
      isActive?: boolean;
    },
  ) {
    return this.prisma.filterDefinition.update({
      where: { id },
      data: {
        scope: payload.scope ?? undefined,
        categoryId: payload.categoryId ?? undefined,
        key: payload.key ?? undefined,
        label: payload.label ?? undefined,
        type: payload.type ?? undefined,
        optionsJson:
          payload.optionsJson === undefined
            ? undefined
            : payload.optionsJson === null
              ? Prisma.JsonNull
              : (payload.optionsJson as Prisma.InputJsonValue),
        sortOrder: payload.sortOrder ?? undefined,
        isActive: payload.isActive ?? undefined,
      },
    });
  }

  deleteFilterDefinition(id: string) {
    return this.prisma.filterDefinition.delete({ where: { id } });
  }
}
