import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { AutomationService } from '../notifications/automation.service';

@Injectable()
export class JobBoardService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly automationService: AutomationService,
  ) {}

  listPublicJobs() {
    return this.prisma.jobPost.findMany({
      where: { status: 'PUBLISHED' },
      orderBy: { publishedAt: 'desc' },
      take: 50,
    });
  }

  createJob(payload: {
    userId: string;
    title: string;
    description: string;
    eventDate?: string;
    eventTypeId?: string;
    locationText?: string;
    budgetMin?: number;
    budgetMax?: number;
    guestCount?: number;
  }) {
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

  async updateJob(jobId: string, userId: string, patch: Partial<{ title: string; description: string; eventDate: string }>) {
    const job = await this.prisma.jobPost.findUnique({ where: { id: jobId } });
    if (!job || job.ownerUserId !== userId) {
      throw new NotFoundException('Job not found');
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

  async publishJob(jobId: string, userId: string) {
    const job = await this.prisma.jobPost.findUnique({ where: { id: jobId } });
    if (!job || job.ownerUserId !== userId) {
      throw new NotFoundException('Job not found');
    }
    if (job.eventDate && job.eventDate < new Date()) {
      throw new BadRequestException('Cannot publish job with past date');
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

  async closeJob(jobId: string, userId: string) {
    const job = await this.prisma.jobPost.findUnique({ where: { id: jobId } });
    if (!job || job.ownerUserId !== userId) {
      throw new NotFoundException('Job not found');
    }
    return this.prisma.jobPost.update({
      where: { id: jobId },
      data: { status: 'CLOSED' },
    });
  }

  listUserJobs(userId: string) {
    return this.prisma.jobPost.findMany({
      where: { ownerUserId: userId },
      orderBy: { updatedAt: 'desc' },
    });
  }

  async apply(jobId: string, supplierId: string, message?: string) {
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

  async applyForUser(jobId: string, userId: string, message?: string) {
    const supplier = await this.prisma.supplier.findUnique({
      where: { ownerUserId: userId },
      select: { id: true },
    });
    if (!supplier) {
      throw new NotFoundException('Supplier profile not found for user');
    }
    return this.apply(jobId, supplier.id, message);
  }

  listApplications(jobId: string) {
    return this.prisma.jobApplication.findMany({
      where: { jobPostId: jobId },
      include: { supplier: true },
      orderBy: { submittedAt: 'desc' },
    });
  }

  async updateApplicationStatus(id: string, status: 'SUBMITTED' | 'SHORTLISTED' | 'REJECTED' | 'WITHDRAWN') {
    const application = await this.prisma.jobApplication.findUnique({ where: { id } });
    if (!application) {
      throw new NotFoundException('Application not found');
    }
    return this.prisma.jobApplication.update({
      where: { id },
      data: { status },
    });
  }
}
