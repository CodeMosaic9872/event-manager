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

  private toPagination(page?: number, limit?: number) {
    const safePage = Number.isFinite(page) && (page as number) > 0 ? Math.floor(page as number) : 1;
    const safeLimit = Number.isFinite(limit) && (limit as number) > 0 ? Math.min(200, Math.floor(limit as number)) : 20;
    return { skip: (safePage - 1) * safeLimit, take: safeLimit };
  }

  async listSuppliers(page?: number, limit?: number) {
    const pg = this.toPagination(page, limit);
    const [items, totalItems] = await this.prisma.$transaction([
      this.prisma.supplier.findMany({ orderBy: { createdAt: 'desc' }, skip: pg.skip, take: pg.take }),
      this.prisma.supplier.count(),
    ]);
    return { items, totalItems };
  }

  async listUsers(page?: number, limit?: number) {
    const pg = this.toPagination(page, limit);
    const [items, totalItems] = await this.prisma.$transaction([
      this.prisma.user.findMany({
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
        skip: pg.skip,
        take: pg.take,
      }),
      this.prisma.user.count(),
    ]);
    return { items, totalItems };
  }

  async listIncompleteUsers(page?: number, limit?: number) {
    const pg = this.toPagination(page, limit);
    const where: Prisma.UserWhereInput = {
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
    };
    const [items, totalItems] = await this.prisma.$transaction([
      this.prisma.user.findMany({
        where,
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
        skip: pg.skip,
        take: pg.take,
      }),
      this.prisma.user.count({ where }),
    ]);
    return { items, totalItems };
  }

  async listUnpaidUsers(page?: number, limit?: number) {
    const pg = this.toPagination(page, limit);
    const where: Prisma.UserWhereInput = {
      supplier: {
        is: {
          payments: {
            none: {
              status: 'PAID',
            },
          },
        },
      },
    };
    const [items, totalItems] = await this.prisma.$transaction([
      this.prisma.user.findMany({
        where,
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
        skip: pg.skip,
        take: pg.take,
      }),
      this.prisma.user.count({ where }),
    ]);
    return { items, totalItems };
  }

  async listIncompleteSuppliers(page?: number, limit?: number) {
    const pg = this.toPagination(page, limit);
    const where = { completionPercent: { lt: 100 } } as const;
    const [items, totalItems] = await this.prisma.$transaction([
      this.prisma.supplierDraft.findMany({
        where,
        include: { supplier: true },
        orderBy: { lastAutosaveAt: 'desc' },
        skip: pg.skip,
        take: pg.take,
      }),
      this.prisma.supplierDraft.count({ where }),
    ]);
    return { items, totalItems };
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

  aiUsage(page?: number, limit?: number) {
    const pg = this.toPagination(page, limit);
    return this.prisma.aiUsageCounter.findMany({ orderBy: { updatedAt: 'desc' }, skip: pg.skip, take: pg.take });
  }

  aiConversations(page?: number, limit?: number) {
    const pg = this.toPagination(page, limit);
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

  async notifications(page?: number, limit?: number) {
    const pg = this.toPagination(page, limit);
    const [items, totalItems] = await this.prisma.$transaction([
      this.prisma.notification.findMany({ orderBy: { createdAt: 'desc' }, skip: pg.skip, take: pg.take }),
      this.prisma.notification.count(),
    ]);
    return { items, totalItems };
  }

  notificationProvidersHealth() {
    return this.notificationsService.getProviderHealth();
  }

  async listJobs(page?: number, limit?: number) {
    const pg = this.toPagination(page, limit);
    const jobInclude = {
      eventType: { select: { id: true, key: true, name: true, nameEn: true } },
      category: { select: { id: true, key: true, name: true, nameEn: true } },
      subcategory: { select: { id: true, categoryId: true, key: true, name: true, nameEn: true } },
    } as const;
    const [items, totalItems] = await this.prisma.$transaction([
      this.prisma.jobPost.findMany({
        orderBy: { createdAt: 'desc' },
        skip: pg.skip,
        take: pg.take,
        include: jobInclude,
      }),
      this.prisma.jobPost.count(),
    ]);
    return { items, totalItems };
  }

  async listJobApplications(jobId?: string, page?: number, limit?: number) {
    const pg = this.toPagination(page, limit);
    const where = { jobPostId: jobId ?? undefined };
    const jobInclude = {
      eventType: { select: { id: true, key: true, name: true, nameEn: true } },
      category: { select: { id: true, key: true, name: true, nameEn: true } },
      subcategory: { select: { id: true, categoryId: true, key: true, name: true, nameEn: true } },
    } as const;
    const [items, totalItems] = await this.prisma.$transaction([
      this.prisma.jobApplication.findMany({
        where,
        include: { supplier: true, jobPost: { include: jobInclude } },
        orderBy: { submittedAt: 'desc' },
        skip: pg.skip,
        take: pg.take,
      }),
      this.prisma.jobApplication.count({ where }),
    ]);
    return { items, totalItems };
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

  async automationRules(page?: number, limit?: number) {
    const pg = this.toPagination(page, limit);
    const [items, totalItems] = await this.prisma.$transaction([
      this.prisma.notificationTemplate.findMany({
        orderBy: { createdAt: 'desc' },
        skip: pg.skip,
        take: pg.take,
      }),
      this.prisma.notificationTemplate.count(),
    ]);
    return { items, totalItems };
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

  async automationRuns(page?: number, limit?: number) {
    const pg = this.toPagination(page, limit);
    const [items, totalItems] = await this.prisma.$transaction([
      this.prisma.notification.findMany({
        orderBy: { createdAt: 'desc' },
        skip: pg.skip,
        take: pg.take,
      }),
      this.prisma.notification.count(),
    ]);
    return { items, totalItems };
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
