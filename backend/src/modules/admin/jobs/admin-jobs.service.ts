import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { JobBoardService } from '../../job-board/job-board.service';
import { toAdminPagination } from '../common/admin-pagination.util';

@Injectable()
export class AdminJobsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jobBoardService: JobBoardService,
  ) {}

  async listJobs(page?: number, limit?: number) {
    const pg = toAdminPagination(page, limit);
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
    const pg = toAdminPagination(page, limit);
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
    return this.jobBoardService.moderateApplicationStatus(applicationId, status, reason, actorAdminId);
  }
}
