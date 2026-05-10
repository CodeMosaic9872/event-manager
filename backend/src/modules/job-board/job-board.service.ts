import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { JobApplicationStatus, Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { AutomationService } from '../notifications/automation.service';

type MatchResult = { score: number; reasons: string[] };

const jobPostListInclude = {
  eventType: { select: { id: true, key: true, name: true, nameEn: true } },
  category: { select: { id: true, key: true, name: true, nameEn: true } },
  subcategory: { select: { id: true, categoryId: true, key: true, name: true, nameEn: true } },
} satisfies Prisma.JobPostInclude;

@Injectable()
export class JobBoardService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly automationService: AutomationService,
  ) {}

  private toPagination(page?: number, limit?: number) {
    const safePage = Number.isFinite(page) && (page as number) > 0 ? Math.floor(page as number) : 1;
    const safeLimit = Number.isFinite(limit) && (limit as number) > 0 ? Math.min(200, Math.floor(limit as number)) : 20;
    return { skip: (safePage - 1) * safeLimit, take: safeLimit };
  }

  async getJobById(jobId: string) {
    const job = await this.prisma.jobPost.findUnique({
      where: { id: jobId },
      include: jobPostListInclude,
    });
    if (!job) {
      throw new NotFoundException('Job not found');
    }
    return job;
  }

  async listPublicJobs(page?: number, limit?: number) {
    const pg = this.toPagination(page, limit);
    const where = { status: 'PUBLISHED' } as const;
    const [items, totalItems] = await this.prisma.$transaction([
      this.prisma.jobPost.findMany({
        where,
        orderBy: { publishedAt: 'desc' },
        skip: pg.skip,
        take: pg.take,
        include: jobPostListInclude,
      }),
      this.prisma.jobPost.count({ where }),
    ]);
    return { items, totalItems };
  }

  private async validateJobTaxonomy(payload: {
    eventTypeId?: string | null;
    categoryId?: string | null;
    subcategoryId?: string | null;
  }) {
    const { eventTypeId, categoryId, subcategoryId } = payload;
    if (subcategoryId && !categoryId) {
      throw new BadRequestException('categoryId is required when subcategoryId is set');
    }
    if (categoryId) {
      const cat = await this.prisma.category.findUnique({ where: { id: categoryId }, select: { id: true } });
      if (!cat) {
        throw new BadRequestException('Invalid categoryId');
      }
    }
    if (subcategoryId) {
      const sub = await this.prisma.subcategory.findUnique({
        where: { id: subcategoryId },
        select: { id: true, categoryId: true },
      });
      if (!sub) {
        throw new BadRequestException('Invalid subcategoryId');
      }
      if (categoryId && sub.categoryId !== categoryId) {
        throw new BadRequestException('subcategoryId does not belong to the given categoryId');
      }
    }
    if (eventTypeId) {
      const et = await this.prisma.eventType.findUnique({ where: { id: eventTypeId }, select: { id: true } });
      if (!et) {
        throw new BadRequestException('Invalid eventTypeId');
      }
    }
    if (eventTypeId && categoryId && subcategoryId) {
      const map = await this.prisma.eventCategorySubcategoryMap.findFirst({
        where: { eventTypeId, categoryId, subcategoryId },
        select: { id: true },
      });
      if (!map) {
        throw new BadRequestException('Category and subcategory are not valid for this event type');
      }
    }
  }

  async createJob(payload: {
    userId: string;
    title: string;
    description: string;
    eventDate?: string;
    eventTypeId?: string;
    categoryId?: string;
    subcategoryId?: string;
    locationText?: string;
    budgetMin?: number;
    budgetMax?: number;
    guestCount?: number;
  }) {
    await this.validateJobTaxonomy({
      eventTypeId: payload.eventTypeId ?? null,
      categoryId: payload.categoryId ?? null,
      subcategoryId: payload.subcategoryId ?? null,
    });
    return this.prisma.jobPost.create({
      data: {
        ownerUserId: payload.userId,
        title: payload.title,
        description: payload.description,
        eventDate: payload.eventDate ? new Date(payload.eventDate) : null,
        eventTypeId: payload.eventTypeId ?? null,
        categoryId: payload.categoryId ?? null,
        subcategoryId: payload.subcategoryId ?? null,
        locationText: payload.locationText ?? null,
        budgetMin: payload.budgetMin ?? null,
        budgetMax: payload.budgetMax ?? null,
        guestCount: payload.guestCount ?? null,
      },
      include: jobPostListInclude,
    });
  }

  async updateJob(
    jobId: string,
    userId: string,
    patch: Partial<{
      title: string;
      description: string;
      eventDate: string;
      eventTypeId: string;
      categoryId: string;
      subcategoryId: string;
    }>,
  ) {
    const job = await this.prisma.jobPost.findUnique({ where: { id: jobId } });
    if (!job || job.ownerUserId !== userId) {
      throw new NotFoundException('Job not found');
    }
    const nextEventTypeId = patch.eventTypeId !== undefined ? patch.eventTypeId : job.eventTypeId;
    const nextCategoryId = patch.categoryId !== undefined ? patch.categoryId : job.categoryId;
    const nextSubcategoryId = patch.subcategoryId !== undefined ? patch.subcategoryId : job.subcategoryId;
    await this.validateJobTaxonomy({
      eventTypeId: nextEventTypeId,
      categoryId: nextCategoryId,
      subcategoryId: nextSubcategoryId,
    });
    const updated = await this.prisma.jobPost.update({
      where: { id: jobId },
      data: {
        title: patch.title ?? job.title,
        description: patch.description ?? job.description,
        eventDate: patch.eventDate ? new Date(patch.eventDate) : job.eventDate,
        eventTypeId: nextEventTypeId,
        categoryId: nextCategoryId,
        subcategoryId: nextSubcategoryId,
      },
    });

    const materialChanged = Boolean(
      (patch.title && patch.title !== job.title) ||
        (patch.description && patch.description !== job.description) ||
        (patch.eventDate && new Date(patch.eventDate).getTime() !== (job.eventDate?.getTime() ?? 0)) ||
        (patch.eventTypeId !== undefined && patch.eventTypeId !== job.eventTypeId) ||
        (patch.categoryId !== undefined && patch.categoryId !== job.categoryId) ||
        (patch.subcategoryId !== undefined && patch.subcategoryId !== job.subcategoryId),
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
    return this.prisma.jobPost.findUniqueOrThrow({
      where: { id: updated.id },
      include: jobPostListInclude,
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

    const mappingCategoryIds = updated.categoryId
      ? [updated.categoryId]
      : updated.eventTypeId
        ? (
            await this.prisma.eventCategorySubcategoryMap.findMany({
              where: { eventTypeId: updated.eventTypeId },
              select: { categoryId: true },
            })
          ).map((item) => item.categoryId)
        : [];
    const categoryFilter =
      updated.categoryId && updated.subcategoryId
        ? { categoryId: updated.categoryId, subcategoryId: updated.subcategoryId }
        : updated.categoryId
          ? { categoryId: updated.categoryId }
          : mappingCategoryIds.length
            ? { categoryId: { in: mappingCategoryIds } }
            : null;

    const matchingSuppliers = await this.prisma.supplier.findMany({
      where: {
        isActive: true,
        approvalStatus: 'APPROVED',
        ...(categoryFilter ? { categories: { some: categoryFilter } } : {}),
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
    return this.prisma.jobPost.findUniqueOrThrow({
      where: { id: updated.id },
      include: jobPostListInclude,
    });
  }

  async closeJob(jobId: string, userId: string) {
    const job = await this.prisma.jobPost.findUnique({ where: { id: jobId } });
    if (!job || job.ownerUserId !== userId) {
      throw new NotFoundException('Job not found');
    }
    await this.prisma.jobPost.update({
      where: { id: jobId },
      data: { status: 'CLOSED' },
    });
    return this.prisma.jobPost.findUniqueOrThrow({
      where: { id: jobId },
      include: jobPostListInclude,
    });
  }

  async archiveJob(jobId: string, userId: string) {
    const job = await this.prisma.jobPost.findUnique({ where: { id: jobId } });
    if (!job || job.ownerUserId !== userId) {
      throw new NotFoundException('Job not found');
    }
    await this.prisma.jobPost.update({
      where: { id: jobId },
      data: { status: 'ARCHIVED' },
    });
    return this.prisma.jobPost.findUniqueOrThrow({
      where: { id: jobId },
      include: jobPostListInclude,
    });
  }

  async listUserJobs(userId: string, page?: number, limit?: number) {
    const pg = this.toPagination(page, limit);
    const where = { ownerUserId: userId };
    const [items, totalItems] = await this.prisma.$transaction([
      this.prisma.jobPost.findMany({
        where,
        orderBy: { updatedAt: 'desc' },
        skip: pg.skip,
        take: pg.take,
        include: jobPostListInclude,
      }),
      this.prisma.jobPost.count({ where }),
    ]);
    return { items, totalItems };
  }

  private parseApplicationStatusesParam(raw?: string): JobApplicationStatus[] {
    const allowed: JobApplicationStatus[] = ['SUBMITTED', 'SHORTLISTED', 'REJECTED', 'WITHDRAWN'];
    if (!raw?.trim()) {
      return ['SUBMITTED'];
    }
    const parts = raw
      .split(',')
      .map((s) => s.trim().toUpperCase())
      .filter(Boolean);
    const parsed = parts.filter((s): s is JobApplicationStatus => (allowed as string[]).includes(s));
    return parsed.length ? parsed : ['SUBMITTED'];
  }

  async countApplicationsForOwnerJob(jobId: string, ownerUserId: string, statusesParam?: string) {
    const job = await this.prisma.jobPost.findUnique({
      where: { id: jobId },
      select: { ownerUserId: true },
    });
    if (!job || job.ownerUserId !== ownerUserId) {
      throw new NotFoundException('Job not found');
    }
    const statuses = this.parseApplicationStatusesParam(statusesParam);
    const count = await this.prisma.jobApplication.count({
      where: { jobPostId: jobId, status: { in: statuses } },
    });
    return { count, statuses };
  }

  async getUserMeStats(userId: string) {
    const [
      pendingApplicationsTotal,
      favoriteSuppliersCount,
      savedConceptsCount,
      jobsPublishedCount,
      jobsDraftCount,
      jobsClosedCount,
      jobsArchivedCount,
    ] = await Promise.all([
      this.prisma.jobApplication.count({
        where: {
          status: 'SUBMITTED',
          jobPost: { ownerUserId: userId },
        },
      }),
      this.prisma.favoriteSupplier.count({ where: { userId } }),
      this.prisma.savedEventConcept.count({ where: { userId } }),
      this.prisma.jobPost.count({ where: { ownerUserId: userId, status: 'PUBLISHED' } }),
      this.prisma.jobPost.count({ where: { ownerUserId: userId, status: 'DRAFT' } }),
      this.prisma.jobPost.count({ where: { ownerUserId: userId, status: 'CLOSED' } }),
      this.prisma.jobPost.count({ where: { ownerUserId: userId, status: 'ARCHIVED' } }),
    ]);
    return {
      pendingApplicationsTotal,
      favoriteSuppliersCount,
      savedConceptsCount,
      jobsPublishedCount,
      jobsDraftCount,
      jobsClosedCount,
      jobsArchivedCount,
    };
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

  async listApplications(jobId: string, page?: number, limit?: number) {
    const pg = this.toPagination(page, limit);
    const where = { jobPostId: jobId };
    const [items, totalItems] = await this.prisma.$transaction([
      this.prisma.jobApplication.findMany({
        where,
        include: {
          supplier: true,
          jobPost: { include: jobPostListInclude },
        },
        orderBy: { submittedAt: 'desc' },
        skip: pg.skip,
        take: pg.take,
      }),
      this.prisma.jobApplication.count({ where }),
    ]);
    return { items, totalItems };
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

  async listApplicationHistory(applicationId: string, page?: number, limit?: number) {
    const pg = this.toPagination(page, limit);
    const where = { jobApplicationId: applicationId };
    const [items, totalItems] = await this.prisma.$transaction([
      this.prisma.jobApplicationHistory.findMany({
        where,
        orderBy: { createdAt: 'asc' },
        skip: pg.skip,
        take: pg.take,
      }),
      this.prisma.jobApplicationHistory.count({ where }),
    ]);
    return { items, totalItems };
  }

  async listRecommendedJobsForSupplier(supplierId: string, page?: number, limit?: number) {
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
    const taxonomyOr: Prisma.JobPostWhereInput[] = [];
    if (eventTypeIds.length) {
      taxonomyOr.push({ eventTypeId: { in: eventTypeIds } });
    }
    if (categoryIds.length) {
      taxonomyOr.push({ categoryId: { in: categoryIds } });
    }
    const filterAnd: Prisma.JobPostWhereInput[] = [];
    if (taxonomyOr.length) {
      filterAnd.push({ OR: taxonomyOr });
    }
    if (locationTerms.length) {
      filterAnd.push({
        OR: locationTerms.map((term) => ({
          locationText: { contains: term, mode: 'insensitive' as const },
        })),
      });
    }
    const jobs = await this.prisma.jobPost.findMany({
      where: {
        status: 'PUBLISHED',
        ...(filterAnd.length ? { AND: filterAnd } : {}),
      },
      orderBy: [{ publishedAt: 'desc' }, { createdAt: 'desc' }],
      take: 50,
      include: jobPostListInclude,
    });
    const supplierCategoryIds = new Set(supplier.categories.map((c) => c.categoryId));
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
        supplierCategoryIds,
      });
      return {
        ...job,
        matchScore: match.score,
        matchReasons: match.reasons,
      };
    });

    const sorted = ranked.sort((a, b) => b.matchScore - a.matchScore);
    const pg = this.toPagination(page, limit);
    return {
      items: sorted.slice(pg.skip, pg.skip + pg.take),
      totalItems: sorted.length,
    };
  }

  async listRecommendedJobsForUser(userId: string, page?: number, limit?: number) {
    const supplier = await this.prisma.supplier.findUnique({
      where: { ownerUserId: userId },
      select: { id: true },
    });
    if (!supplier) {
      throw new NotFoundException('Supplier profile not found for user');
    }
    return this.listRecommendedJobsForSupplier(supplier.id, page, limit);
  }

  private calculateJobMatch(
    job: {
      title: string;
      description: string;
      eventDate: Date | null;
      locationText: string | null;
      budgetMin: number | null;
      budgetMax: number | null;
      categoryId: string | null;
      subcategoryId: string | null;
    },
    context: {
      locationTerms: string[];
      workingDays: number[];
      mappedCategoryIds: Set<string>;
      mappedSubcategoryIds: Set<string>;
      supplierSubcategoryIds: Set<string>;
      supplierCategoryIds: Set<string>;
    },
  ): MatchResult {
    const reasons: string[] = [];
    let score = 0;

    if (job.categoryId && context.supplierCategoryIds.has(job.categoryId)) {
      score += 0.12;
      reasons.push('job_category_match');
    }
    if (job.subcategoryId && context.supplierSubcategoryIds.has(job.subcategoryId)) {
      score += 0.12;
      reasons.push('job_subcategory_match');
    }

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
