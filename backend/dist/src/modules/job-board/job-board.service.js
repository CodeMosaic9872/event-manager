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
exports.JobBoardService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const automation_service_1 = require("../notifications/automation.service");
let JobBoardService = class JobBoardService {
    constructor(prisma, automationService) {
        this.prisma = prisma;
        this.automationService = automationService;
    }
    listPublicJobs() {
        return this.prisma.jobPost.findMany({
            where: { status: 'PUBLISHED' },
            orderBy: { publishedAt: 'desc' },
            take: 50,
        });
    }
    createJob(payload) {
        return this.prisma.jobPost.create({
            data: {
                ownerUserId: payload.userId,
                title: payload.title,
                description: payload.description,
                eventDate: payload.eventDate ? new Date(payload.eventDate) : null,
                eventTypeId: payload.eventTypeId ?? null,
                locationText: payload.locationText ?? null,
                budgetMin: payload.budgetMin ?? null,
                budgetMax: payload.budgetMax ?? null,
                guestCount: payload.guestCount ?? null,
            },
        });
    }
    async updateJob(jobId, userId, patch) {
        const job = await this.prisma.jobPost.findUnique({ where: { id: jobId } });
        if (!job || job.ownerUserId !== userId) {
            throw new common_1.NotFoundException('Job not found');
        }
        return this.prisma.jobPost.update({
            where: { id: jobId },
            data: {
                title: patch.title ?? job.title,
                description: patch.description ?? job.description,
                eventDate: patch.eventDate ? new Date(patch.eventDate) : job.eventDate,
            },
        });
    }
    async publishJob(jobId, userId) {
        const job = await this.prisma.jobPost.findUnique({ where: { id: jobId } });
        if (!job || job.ownerUserId !== userId) {
            throw new common_1.NotFoundException('Job not found');
        }
        if (job.eventDate && job.eventDate < new Date()) {
            throw new common_1.BadRequestException('Cannot publish job with past date');
        }
        const updated = await this.prisma.jobPost.update({
            where: { id: jobId },
            data: { status: 'PUBLISHED', publishedAt: new Date() },
        });
        await this.automationService.publish({
            eventId: `job_published_${updated.id}`,
            type: 'job.published',
            payload: { jobId: updated.id, ownerUserId: updated.ownerUserId },
        });
        return updated;
    }
    async closeJob(jobId, userId) {
        const job = await this.prisma.jobPost.findUnique({ where: { id: jobId } });
        if (!job || job.ownerUserId !== userId) {
            throw new common_1.NotFoundException('Job not found');
        }
        return this.prisma.jobPost.update({
            where: { id: jobId },
            data: { status: 'CLOSED' },
        });
    }
    listUserJobs(userId) {
        return this.prisma.jobPost.findMany({
            where: { ownerUserId: userId },
            orderBy: { updatedAt: 'desc' },
        });
    }
    async apply(jobId, supplierId, message) {
        const application = await this.prisma.jobApplication.create({
            data: {
                jobPostId: jobId,
                supplierId,
                message: message ?? null,
            },
        });
        const job = await this.prisma.jobPost.findUnique({ where: { id: jobId } });
        await this.automationService.publish({
            eventId: `job_application_${application.id}`,
            type: 'job.application.submitted',
            payload: {
                applicationId: application.id,
                jobId,
                supplierId,
                ownerUserId: job?.ownerUserId,
            },
        });
        return application;
    }
    async applyForUser(jobId, userId, message) {
        const supplier = await this.prisma.supplier.findUnique({
            where: { ownerUserId: userId },
            select: { id: true },
        });
        if (!supplier) {
            throw new common_1.NotFoundException('Supplier profile not found for user');
        }
        return this.apply(jobId, supplier.id, message);
    }
    listApplications(jobId) {
        return this.prisma.jobApplication.findMany({
            where: { jobPostId: jobId },
            include: { supplier: true },
            orderBy: { submittedAt: 'desc' },
        });
    }
    async updateApplicationStatus(id, status) {
        const application = await this.prisma.jobApplication.findUnique({ where: { id } });
        if (!application) {
            throw new common_1.NotFoundException('Application not found');
        }
        return this.prisma.jobApplication.update({
            where: { id },
            data: { status },
        });
    }
};
exports.JobBoardService = JobBoardService;
exports.JobBoardService = JobBoardService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        automation_service_1.AutomationService])
], JobBoardService);
//# sourceMappingURL=job-board.service.js.map