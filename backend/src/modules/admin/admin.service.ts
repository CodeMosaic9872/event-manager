import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class AdminService {
  constructor(private readonly prisma: PrismaService) {}

  listSuppliers() {
    return this.prisma.supplier.findMany({ orderBy: { createdAt: 'desc' } });
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
    return { failures: [] };
  }

  notifications() {
    return this.prisma.notification.findMany({ orderBy: { createdAt: 'desc' }, take: 100 });
  }

  retryNotification(id: string) {
    return this.prisma.notification.update({
      where: { id },
      data: { status: 'PENDING', errorCode: null },
    });
  }

  automationRules() {
    return { rules: [] };
  }

  automationRuns() {
    return { runs: [] };
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
