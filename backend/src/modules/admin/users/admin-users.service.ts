import { ConflictException, Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../../prisma/prisma.service';
import { SmsService } from '../../sms/sms.service';
import { toAdminPagination } from '../common/admin-pagination.util';

@Injectable()
export class AdminUsersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly smsService: SmsService,
  ) {}

  async createSupplierUser(payload: { email: string; phone: string }) {
    const email = payload.email.trim().toLowerCase();
    const phone = this.smsService.normalizeIsraeliMobile(payload.phone);

    const existingByEmail = await this.prisma.user.findUnique({ where: { email } });
    const existingByPhone = await this.prisma.user.findUnique({ where: { phone } });

    if (existingByEmail || existingByPhone) {
      throw new ConflictException('User already exists');
    }

    const created = await this.prisma.user.create({
      data: {
        email,
        phone,
        status: 'ACTIVE',
        roles: { create: [{ role: 'SUPPLIER' }] },
      },
      include: { roles: true },
    });

    return {
      id: created.id,
      email: created.email!,
      phone: created.phone!,
      status: created.status,
      roles: created.roles.map((r) => r.role),
      createdAt: created.createdAt.toISOString(),
    };
  }

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
