import { Injectable, NotFoundException } from '@nestjs/common';
import { randomBytes } from 'crypto';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class ReferralsService {
  constructor(private readonly prisma: PrismaService) {}

  private toPagination(page?: number, limit?: number) {
    const safePage = Number.isFinite(page) && (page as number) > 0 ? Math.floor(page as number) : 1;
    const safeLimit = Number.isFinite(limit) && (limit as number) > 0 ? Math.min(200, Math.floor(limit as number)) : 20;
    return { skip: (safePage - 1) * safeLimit, take: safeLimit };
  }

  private buildReferralUrl(code: string) {
    const baseUrl = process.env.REFERRAL_BASE_URL ?? 'https://event-marketplace.example/ref';
    return `${baseUrl}/${code}`;
  }

  async getLink(supplierId: string) {
    const supplier = await this.prisma.supplier.findUnique({ where: { id: supplierId } });
    if (!supplier) {
      throw new NotFoundException('Supplier not found');
    }
    const existing = await this.prisma.referralLink.findFirst({
      where: { supplierId, isActive: true },
      orderBy: { createdAt: 'desc' },
    });
    if (existing) {
      return {
        supplierId,
        referralCode: existing.code,
        url: existing.url,
      };
    }
    const code = `REF-${randomBytes(4).toString('hex').toUpperCase()}`;
    const created = await this.prisma.referralLink.create({
      data: { supplierId, code, url: this.buildReferralUrl(code) },
    });
    return {
      supplierId,
      referralCode: created.code,
      url: created.url,
    };
  }

  async regenerateLink(supplierId: string) {
    const supplier = await this.prisma.supplier.findUnique({ where: { id: supplierId } });
    if (!supplier) {
      throw new NotFoundException('Supplier not found');
    }
    const code = `REF-${randomBytes(4).toString('hex').toUpperCase()}`;
    const created = await this.prisma.$transaction(async (tx) => {
      await tx.referralLink.updateMany({
        where: { supplierId, isActive: true },
        data: { isActive: false },
      });
      return tx.referralLink.create({
        data: { supplierId, code, url: this.buildReferralUrl(code) },
      });
    });
    return {
      supplierId,
      referralCode: created.code,
      url: created.url,
    };
  }

  async listAttributions(supplierId: string, page?: number, limit?: number) {
    const pg = this.toPagination(page, limit);
    const where = { referralLink: { supplierId } };
    const [items, totalItems] = await this.prisma.$transaction([
      this.prisma.referralAttribution.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: pg.skip,
        take: pg.take,
      }),
      this.prisma.referralAttribution.count({ where }),
    ]);
    return { supplierId, items, totalItems };
  }

  async listRewards(supplierId: string, page?: number, limit?: number) {
    const pg = this.toPagination(page, limit);
    const where = { supplierId };
    const [items, totalItems] = await this.prisma.$transaction([
      this.prisma.referralReward.findMany({
        where,
        include: { attribution: true },
        orderBy: { createdAt: 'desc' },
        skip: pg.skip,
        take: pg.take,
      }),
      this.prisma.referralReward.count({ where }),
    ]);
    return { supplierId, items, totalItems };
  }

  async adminList(page?: number, limit?: number) {
    const pg = this.toPagination(page, limit);
    const [items, totalItems] = await this.prisma.$transaction([
      this.prisma.referralReward.findMany({
        include: {
          supplier: true,
          attribution: {
            include: {
              referralLink: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: pg.skip,
        take: pg.take,
      }),
      this.prisma.referralReward.count(),
    ]);
    return { items, totalItems };
  }

  async patchReward(id: string, payload: { status?: 'PENDING' | 'APPROVED' | 'REJECTED' | 'PAID' }) {
    const reward = await this.prisma.referralReward.findUnique({ where: { id } });
    if (!reward) {
      throw new NotFoundException('Referral reward not found');
    }
    const updated = await this.prisma.referralReward.update({
      where: { id },
      data: {
        status: payload.status ?? undefined,
        approvedAt: payload.status === 'APPROVED' ? new Date() : undefined,
        paidAt: payload.status === 'PAID' ? new Date() : undefined,
      },
    });
    return {
      id: updated.id,
      updated: true,
      body: { status: updated.status },
    };
  }
}
