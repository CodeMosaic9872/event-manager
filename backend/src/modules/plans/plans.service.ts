import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { BillingInterval, Prisma, SubscriptionPlan } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { computeVatFromPretax, pretaxToDecimalTotal } from './plans.util';
import { toAdminPagination } from '../admin/common/admin-pagination.util';

@Injectable()
export class PlansService {
  constructor(private readonly prisma: PrismaService) {}

  serializePlan(row: SubscriptionPlan) {
    const pretaxNum = Number(row.pretaxAmount);
    const { vat, total } = computeVatFromPretax(pretaxNum);
    return {
      id: row.id,
      key: row.key,
      name: row.name,
      summaryTitle: row.summaryTitle,
      totalPeriodNote: row.totalPeriodNote,
      interval: row.interval,
      pretaxAmount: String(row.pretaxAmount),
      totalWithVat: String(total),
      vatAmount: String(vat),
      currency: row.currency,
      billingMonths: row.billingMonths,
      badge: row.badge,
      isFeatured: row.isFeatured,
      sortOrder: row.sortOrder,
      isActive: row.isActive,
      features: row.features,
      createdAt: row.createdAt.toISOString(),
      updatedAt: row.updatedAt.toISOString(),
    };
  }

  async listActivePlans() {
    const rows = await this.prisma.subscriptionPlan.findMany({
      where: { isActive: true },
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
    });
    return rows.map((row) => this.serializePlan(row));
  }

  async getByKey(key: string) {
    const row = await this.prisma.subscriptionPlan.findUnique({ where: { key } });
    if (!row || !row.isActive) {
      throw new NotFoundException('Subscription plan not found');
    }
    return this.serializePlan(row);
  }

  async getById(id: string) {
    const row = await this.prisma.subscriptionPlan.findUnique({ where: { id } });
    if (!row) {
      throw new NotFoundException('Subscription plan not found');
    }
    return row;
  }

  async resolvePlanForCheckout(input: { planId?: string; planKey?: string }) {
    if (input.planId) {
      const plan = await this.getById(input.planId);
      if (!plan.isActive) {
        throw new NotFoundException('Subscription plan is not active');
      }
      return plan;
    }
    if (input.planKey) {
      const plan = await this.prisma.subscriptionPlan.findUnique({ where: { key: input.planKey } });
      if (!plan || !plan.isActive) {
        throw new NotFoundException('Subscription plan not found');
      }
      return plan;
    }
    return null;
  }

  billingAmountFromPlan(plan: SubscriptionPlan): Prisma.Decimal {
    return pretaxToDecimalTotal(plan.pretaxAmount);
  }

  async listPlans(page?: number, limit?: number, activeOnly?: boolean) {
    const pg = toAdminPagination(page, limit);
    const where = activeOnly === true ? { isActive: true } : activeOnly === false ? { isActive: false } : {};
    const [rows, totalItems] = await this.prisma.$transaction([
      this.prisma.subscriptionPlan.findMany({
        where,
        orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
        skip: pg.skip,
        take: pg.take,
      }),
      this.prisma.subscriptionPlan.count({ where }),
    ]);
    return { items: rows.map((row) => this.serializePlan(row)), totalItems };
  }

  async getPlan(id: string) {
    const row = await this.getById(id);
    return this.serializePlan(row);
  }

  async createPlan(payload: {
    key: string;
    name: string;
    interval: BillingInterval;
    pretaxAmount: number;
    billingMonths: number;
    summaryTitle?: string;
    totalPeriodNote?: string;
    currency?: string;
    badge?: string;
    isFeatured?: boolean;
    sortOrder?: number;
    isActive?: boolean;
    features?: string[];
  }) {
    const key = payload.key.trim().toLowerCase();
    const existing = await this.prisma.subscriptionPlan.findUnique({ where: { key } });
    if (existing) {
      throw new ConflictException('Plan key is already in use');
    }
    const created = await this.prisma.subscriptionPlan.create({
      data: {
        key,
        name: payload.name.trim(),
        interval: payload.interval,
        pretaxAmount: new Prisma.Decimal(payload.pretaxAmount),
        billingMonths: payload.billingMonths,
        summaryTitle: payload.summaryTitle?.trim() ? payload.summaryTitle.trim() : null,
        totalPeriodNote: payload.totalPeriodNote?.trim() ? payload.totalPeriodNote.trim() : null,
        currency: payload.currency?.trim().toUpperCase() ?? 'ILS',
        badge: payload.badge?.trim() ? payload.badge.trim() : null,
        isFeatured: payload.isFeatured ?? false,
        sortOrder: payload.sortOrder ?? 0,
        isActive: payload.isActive ?? true,
        features: payload.features ?? [],
      },
    });
    return this.serializePlan(created);
  }

  async updatePlan(
    id: string,
    payload: {
      key?: string;
      name?: string;
      interval?: BillingInterval;
      pretaxAmount?: number;
      billingMonths?: number;
      summaryTitle?: string;
      totalPeriodNote?: string;
      currency?: string;
      badge?: string;
      isFeatured?: boolean;
      sortOrder?: number;
      isActive?: boolean;
      features?: string[];
    },
  ) {
    const existing = await this.getById(id);
    if (payload.key && payload.key !== existing.key) {
      const key = payload.key.trim().toLowerCase();
      const taken = await this.prisma.subscriptionPlan.findUnique({ where: { key } });
      if (taken && taken.id !== id) {
        throw new ConflictException('Plan key is already in use');
      }
    }
    const updated = await this.prisma.subscriptionPlan.update({
      where: { id },
      data: {
        key: payload.key?.trim().toLowerCase() ?? undefined,
        name: payload.name?.trim() ?? undefined,
        interval: payload.interval ?? undefined,
        pretaxAmount: payload.pretaxAmount === undefined ? undefined : new Prisma.Decimal(payload.pretaxAmount),
        billingMonths: payload.billingMonths ?? undefined,
        summaryTitle:
          payload.summaryTitle === undefined
            ? undefined
            : payload.summaryTitle.trim()
              ? payload.summaryTitle.trim()
              : null,
        totalPeriodNote:
          payload.totalPeriodNote === undefined
            ? undefined
            : payload.totalPeriodNote.trim()
              ? payload.totalPeriodNote.trim()
              : null,
        currency: payload.currency?.trim().toUpperCase() ?? undefined,
        badge: payload.badge === undefined ? undefined : payload.badge.trim() ? payload.badge.trim() : null,
        isFeatured: payload.isFeatured ?? undefined,
        sortOrder: payload.sortOrder ?? undefined,
        isActive: payload.isActive ?? undefined,
        features: payload.features ?? undefined,
      },
    });
    return this.serializePlan(updated);
  }

  async deletePlan(id: string) {
    const inUse = await this.prisma.supplierSubscription.count({ where: { planId: id } });
    if (inUse > 0) {
      throw new ConflictException('Cannot delete a plan that is linked to active subscriptions. Deactivate it instead.');
    }
    await this.prisma.subscriptionPlan.delete({ where: { id } });
    return { deleted: true, id };
  }
}
