import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../../prisma/prisma.service';
import { toAdminPagination } from '../common/admin-pagination.util';

@Injectable()
export class AdminUsersService {
  constructor(private readonly prisma: PrismaService) {}

  async listUsers(page?: number, limit?: number) {
    const pg = toAdminPagination(page, limit);
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
    const pg = toAdminPagination(page, limit);
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
    const pg = toAdminPagination(page, limit);
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
}
