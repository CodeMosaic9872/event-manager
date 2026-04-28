import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { AutomationService } from '../notifications/automation.service';

type MatchResult = { score: number; reasons: string[] };

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
    const updated = await this.prisma.jobPost.update({
      where: { id: jobId },
      data: {
        title: patch.title ?? job.title,
        description: patch.description ?? job.description,
        eventDate: patch.eventDate ? new Date(patch.eventDate) : job.eventDate,
      },
    });

    const materialChanged = Boolean(
      (patch.title && patch.title !== job.title) ||
        (patch.description && patch.description !== job.description) ||
        (patch.eventDate && new Date(patch.eventDate).getTime() !== (job.eventDate?.getTime() ?? 0)),
    );
    if (materialChanged) {
      const applications = await this.prisma.jobApplication.findMany({
        where: { jobPostId: jobId },
        select: { supplierId: true },
      });
      await this.automationService.publish({
        eventId: `job_material_updated_${updated.id}_${updated.updatedAt.getTime()}`,
        type: 'job.material.updated',
        payload: {
          jobId: updated.id,
          ownerUserId: updated.ownerUserId,
          supplierIds: applications.map((item) => item.supplierId),
        },
      });
    }
    return updated;
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

    const mappingCategoryIds = updated.eventTypeId
      ? (
          await this.prisma.eventCategorySubcategoryMap.findMany({
            where: { eventTypeId: updated.eventTypeId },
            select: { categoryId: true },
          })
        ).map((item) => item.categoryId)
      : [];
    const matchingSuppliers = await this.prisma.supplier.findMany({
      where: {
        isActive: true,
        approvalStatus: 'APPROVED',
        ...(mappingCategoryIds.length
          ? { categories: { some: { categoryId: { in: mappingCategoryIds } } } }
          : {}),
      },
      select: { id: true },
      take: 100,
    });
    if (matchingSuppliers.length) {
      await this.automationService.publish({
        eventId: `job_matching_published_${updated.id}`,
        type: 'job.matching.published',
        payload: {
          jobId: updated.id,
          ownerUserId: updated.ownerUserId,
          supplierIds: matchingSuppliers.map((s) => s.id),
        },
      });
    }
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

  async archiveJob(jobId: string, userId: string) {
    const job = await this.prisma.jobPost.findUnique({ where: { id: jobId } });
    if (!job || job.ownerUserId !== userId) {
      throw new NotFoundException('Job not found');
    }
    return this.prisma.jobPost.update({
      where: { id: jobId },
      data: { status: 'ARCHIVED' },
    });
  }

  listUserJobs(userId: string) {
    return this.prisma.jobPost.findMany({
      where: { ownerUserId: userId },
      orderBy: { updatedAt: 'desc' },
    });
  }

  async apply(jobId: string, supplierId: string, message?: string) {
    const application = await this.prisma.$transaction(async (tx) => {
      const created = await tx.jobApplication.create({
        data: {
          jobPostId: jobId,
          supplierId,
          message: message ?? null,
        },
      });
      await tx.jobApplicationHistory.create({
        data: {
          jobApplicationId: created.id,
          fromStatus: null,
          toStatus: 'SUBMITTED',
          actorType: 'SUPPLIER',
          actorId: supplierId,
        },
      });
      return created;
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

  async withdrawForUser(jobId: string, userId: string) {
    const supplier = await this.prisma.supplier.findUnique({
      where: { ownerUserId: userId },
      select: { id: true },
    });
    if (!supplier) {
      throw new NotFoundException('Supplier profile not found for user');
    }
    const application = await this.prisma.jobApplication.findUnique({
      where: { jobPostId_supplierId: { jobPostId: jobId, supplierId: supplier.id } },
    });
    if (!application) {
      throw new NotFoundException('Application not found');
    }
    return this.prisma.$transaction(async (tx) => {
      const updated = await tx.jobApplication.update({
        where: { id: application.id },
        data: { status: 'WITHDRAWN' },
      });
      await tx.jobApplicationHistory.create({
        data: {
          jobApplicationId: application.id,
          fromStatus: application.status,
          toStatus: 'WITHDRAWN',
          actorType: 'SUPPLIER',
          actorId: supplier.id,
        },
      });
      return updated;
    });
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
    return this.prisma.$transaction(async (tx) => {
      const updated = await tx.jobApplication.update({
        where: { id },
        data: { status },
      });
      await tx.jobApplicationHistory.create({
        data: {
          jobApplicationId: id,
          fromStatus: application.status,
          toStatus: status,
          actorType: 'ADMIN',
          actorId: null,
        },
      });
      return updated;
    });
  }

  async moderateApplicationStatus(
    id: string,
    status: 'SUBMITTED' | 'SHORTLISTED' | 'REJECTED' | 'WITHDRAWN',
    reason?: string,
    actorAdminId?: string,
  ) {
    const application = await this.prisma.jobApplication.findUnique({ where: { id } });
    if (!application) {
      throw new NotFoundException('Application not found');
    }
    return this.prisma.$transaction(async (tx) => {
      const updated = await tx.jobApplication.update({
        where: { id },
        data: { status },
      });
      await tx.jobApplicationHistory.create({
        data: {
          jobApplicationId: id,
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

  listApplicationHistory(applicationId: string) {
    return this.prisma.jobApplicationHistory.findMany({
      where: { jobApplicationId: applicationId },
      orderBy: { createdAt: 'asc' },
    });
  }

  async listRecommendedJobsForSupplier(supplierId: string) {
    const supplier = await this.prisma.supplier.findUnique({
      where: { id: supplierId },
      include: {
        categories: { select: { categoryId: true, subcategoryId: true } },
        serviceAreas: { select: { regionCode: true, cityCode: true } },
        attributes: { select: { workingDaysJson: true } },
      },
    });
    if (!supplier) {
      throw new NotFoundException('Supplier not found');
    }
    const categoryIds = supplier.categories.map((c) => c.categoryId);
    const supplierSubcategoryIds = new Set(
      supplier.categories.map((c) => c.subcategoryId).filter((id): id is string => Boolean(id)),
    );
    const mappedEventTypes = categoryIds.length
      ? await this.prisma.eventCategorySubcategoryMap.findMany({
          where: { categoryId: { in: categoryIds } },
          select: { eventTypeId: true, subcategoryId: true, categoryId: true },
        })
      : [];
    const eventTypeIds = Array.from(new Set(mappedEventTypes.map((m) => m.eventTypeId)));
    const eventTypeCategoryMap = new Map<string, Set<string>>();
    const eventTypeSubcategoryMap = new Map<string, Set<string>>();
    for (const mapping of mappedEventTypes) {
      if (!eventTypeCategoryMap.has(mapping.eventTypeId)) {
        eventTypeCategoryMap.set(mapping.eventTypeId, new Set<string>());
      }
      if (!eventTypeSubcategoryMap.has(mapping.eventTypeId)) {
        eventTypeSubcategoryMap.set(mapping.eventTypeId, new Set<string>());
      }
      eventTypeCategoryMap.get(mapping.eventTypeId)?.add(mapping.categoryId);
      eventTypeSubcategoryMap.get(mapping.eventTypeId)?.add(mapping.subcategoryId);
    }

    const locationTerms = supplier.serviceAreas.flatMap((a) => [a.regionCode, a.cityCode].filter(Boolean) as string[]);
    const workingDays = this.extractWorkingDays(supplier.attributes?.workingDaysJson);
    const jobs = await this.prisma.jobPost.findMany({
      where: {
        status: 'PUBLISHED',
        ...(eventTypeIds.length ? { eventTypeId: { in: eventTypeIds } } : {}),
        ...(locationTerms.length
          ? {
              OR: locationTerms.map((term) => ({
                locationText: { contains: term, mode: 'insensitive' as const },
              })),
            }
          : {}),
      },
      orderBy: [{ publishedAt: 'desc' }, { createdAt: 'desc' }],
      take: 50,
    });
    const ranked = jobs.map((job) => {
      const mappedCategoryIds = job.eventTypeId
        ? (eventTypeCategoryMap.get(job.eventTypeId) ?? new Set<string>())
        : new Set<string>();
      const mappedSubcategoryIds = job.eventTypeId
        ? (eventTypeSubcategoryMap.get(job.eventTypeId) ?? new Set<string>())
        : new Set<string>();
      const match = this.calculateJobMatch(job, {
        locationTerms,
        workingDays,
        mappedCategoryIds,
        mappedSubcategoryIds,
        supplierSubcategoryIds,
      });
      return {
        ...job,
        matchScore: match.score,
        matchReasons: match.reasons,
      };
    });

    return ranked.sort((a, b) => b.matchScore - a.matchScore);
  }

  async listRecommendedJobsForUser(userId: string) {
    const supplier = await this.prisma.supplier.findUnique({
      where: { ownerUserId: userId },
      select: { id: true },
    });
    if (!supplier) {
      throw new NotFoundException('Supplier profile not found for user');
    }
    return this.listRecommendedJobsForSupplier(supplier.id);
  }

  private calculateJobMatch(
    job: {
      title: string;
      description: string;
      eventDate: Date | null;
      locationText: string | null;
      budgetMin: number | null;
      budgetMax: number | null;
    },
    context: {
      locationTerms: string[];
      workingDays: number[];
      mappedCategoryIds: Set<string>;
      mappedSubcategoryIds: Set<string>;
      supplierSubcategoryIds: Set<string>;
    },
  ): MatchResult {
    const reasons: string[] = [];
    let score = 0;

    // Category/event-type map already pre-filters candidates; reward that baseline.
    if (context.mappedCategoryIds.size > 0) {
      score += 0.35;
      reasons.push('category_match');
    }
    if (context.supplierSubcategoryIds.size > 0 && context.mappedSubcategoryIds.size > 0) {
      const hasSubcategoryOverlap = Array.from(context.supplierSubcategoryIds).some((id) =>
        context.mappedSubcategoryIds.has(id),
      );
      if (hasSubcategoryOverlap) {
        score += 0.15;
        reasons.push('subcategory_match');
      }
    }

    if (context.locationTerms.length > 0 && job.locationText) {
      const location = job.locationText.toLowerCase();
      if (context.locationTerms.some((term) => location.includes(term.toLowerCase()))) {
        score += 0.2;
        reasons.push('location_match');
      }
    }

    if (job.eventDate) {
      if (job.eventDate > new Date()) {
        score += 0.05;
        reasons.push('future_event');
      }
      if (context.workingDays.length > 0 && context.workingDays.includes(job.eventDate.getUTCDay())) {
        score += 0.15;
        reasons.push('working_day_match');
      }
    }

    if (job.budgetMin !== null || job.budgetMax !== null) {
      score += 0.05;
      reasons.push('budget_specified');
    }

    const content = `${job.title} ${job.description}`.toLowerCase();
    if (context.locationTerms.some((term) => content.includes(term.toLowerCase()))) {
      score += 0.05;
      reasons.push('location_context');
    }

    return { score: Number(Math.min(1, score).toFixed(4)), reasons };
  }

  private extractWorkingDays(workingDaysJson: unknown): number[] {
    if (!Array.isArray(workingDaysJson)) {
      return [];
    }
    return workingDaysJson
      .map((value) => {
        if (typeof value === 'number' && value >= 0 && value <= 6) {
          return value;
        }
        if (typeof value === 'string') {
          const normalized = value.trim().toLowerCase();
          const names = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
          const index = names.findIndex((name) => normalized.startsWith(name));
          return index >= 0 ? index : null;
        }
        return null;
      })
      .filter((day): day is number => day !== null);
  }
}
