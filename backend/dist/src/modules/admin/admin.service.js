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
exports.AdminService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const prisma_service_1 = require("../../prisma/prisma.service");
let AdminService = class AdminService {
    constructor(prisma) {
        this.prisma = prisma;
    }
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
    approveSupplier(id, actorAdminId) {
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
    rejectSupplier(id, reason, actorAdminId) {
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
    retryNotification(id) {
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
    createEventType(payload) {
        return this.prisma.eventType.create({
            data: {
                key: payload.key,
                name: payload.name,
                isActive: payload.isActive ?? true,
            },
        });
    }
    updateEventType(id, payload) {
        return this.prisma.eventType.update({
            where: { id },
            data: {
                key: payload.key ?? undefined,
                name: payload.name ?? undefined,
                isActive: payload.isActive ?? undefined,
            },
        });
    }
    deleteEventType(id) {
        return this.prisma.eventType.delete({ where: { id } });
    }
    createCategory(payload) {
        return this.prisma.category.create({
            data: {
                key: payload.key,
                name: payload.name,
                sortOrder: payload.sortOrder ?? 0,
                isActive: payload.isActive ?? true,
            },
        });
    }
    updateCategory(id, payload) {
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
    deleteCategory(id) {
        return this.prisma.category.delete({ where: { id } });
    }
    createSubcategory(payload) {
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
    updateSubcategory(id, payload) {
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
    deleteSubcategory(id) {
        return this.prisma.subcategory.delete({ where: { id } });
    }
    createFilterDefinition(payload) {
        return this.prisma.filterDefinition.create({
            data: {
                scope: payload.scope,
                categoryId: payload.categoryId ?? null,
                key: payload.key,
                label: payload.label,
                type: payload.type,
                optionsJson: payload.optionsJson === undefined
                    ? client_1.Prisma.JsonNull
                    : payload.optionsJson,
                sortOrder: payload.sortOrder ?? 0,
                isActive: payload.isActive ?? true,
            },
        });
    }
    updateFilterDefinition(id, payload) {
        return this.prisma.filterDefinition.update({
            where: { id },
            data: {
                scope: payload.scope ?? undefined,
                categoryId: payload.categoryId ?? undefined,
                key: payload.key ?? undefined,
                label: payload.label ?? undefined,
                type: payload.type ?? undefined,
                optionsJson: payload.optionsJson === undefined
                    ? undefined
                    : payload.optionsJson === null
                        ? client_1.Prisma.JsonNull
                        : payload.optionsJson,
                sortOrder: payload.sortOrder ?? undefined,
                isActive: payload.isActive ?? undefined,
            },
        });
    }
    deleteFilterDefinition(id) {
        return this.prisma.filterDefinition.delete({ where: { id } });
    }
};
exports.AdminService = AdminService;
exports.AdminService = AdminService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], AdminService);
//# sourceMappingURL=admin.service.js.map