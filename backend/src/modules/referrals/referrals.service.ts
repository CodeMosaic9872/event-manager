import { Injectable, NotFoundException } from '@nestjs/common';
import { randomBytes } from 'crypto';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class ReferralsService {
  constructor(private readonly prisma: PrismaService) {}

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

  async listAttributions(supplierId: string) {
    const attributions = await this.prisma.referralAttribution.findMany({
      where: { referralLink: { supplierId } },
      orderBy: { createdAt: 'desc' },
    });
    return { supplierId, attributions };
  }

  async listRewards(supplierId: string) {
    const rewards = await this.prisma.referralReward.findMany({
      where: { supplierId },
      include: { attribution: true },
      orderBy: { createdAt: 'desc' },
    });
    return { supplierId, rewards };
  }

  adminList() {
    return this.prisma.referralReward.findMany({
      include: {
        supplier: true,
        attribution: {
          include: {
            referralLink: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 200,
    });
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
