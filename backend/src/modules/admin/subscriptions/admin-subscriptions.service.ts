import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { BillingInterval, Prisma, SubscriptionStatus } from '@prisma/client';
import { PrismaService } from '../../../prisma/prisma.service';
import { PlansService } from '../../plans/plans.service';
import { toAdminPagination } from '../common/admin-pagination.util';

@Injectable()
export class AdminSubscriptionsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly plansService: PlansService,
  ) {}

  private maskCardcomToken(token: string): string {
    const trimmed = token.trim();
    if (trimmed.length <= 4) return '****';
    return `****${trimmed.slice(-4)}`;
  }

  private serializeAdminSubscription(
    row: {
      id: string;
      supplierId: string;
      planId: string | null;
      status: SubscriptionStatus;
      interval: BillingInterval;
      planKey: string | null;
      amount: Prisma.Decimal;
      currency: string;
      cardcomToken: string;
      tokenExpiresAt: Date | null;
      nextBillingAt: Date;
      lastRenewedAt: Date | null;
      consecutiveFailures: number;
      canceledAt: Date | null;
      createdAt: Date;
      updatedAt: Date;
      supplier?: { id: string; businessName: string; slug: string } | null;
      plan?: { id: string; key: string; name: string } | null;
    },
  ) {
    return {
      id: row.id,
      supplierId: row.supplierId,
      planId: row.planId,
      status: row.status,
      interval: row.interval,
      planKey: row.planKey,
      amount: String(row.amount),
      currency: row.currency,
      cardcomToken: this.maskCardcomToken(row.cardcomToken),
      tokenExpiresAt: row.tokenExpiresAt?.toISOString() ?? null,
      nextBillingAt: row.nextBillingAt.toISOString(),
      lastRenewedAt: row.lastRenewedAt?.toISOString() ?? null,
      consecutiveFailures: row.consecutiveFailures,
      canceledAt: row.canceledAt?.toISOString() ?? null,
      createdAt: row.createdAt.toISOString(),
      updatedAt: row.updatedAt.toISOString(),
      supplier: row.supplier
        ? { id: row.supplier.id, businessName: row.supplier.businessName, slug: row.supplier.slug }
        : null,
      plan: row.plan ? { id: row.plan.id, key: row.plan.key, name: row.plan.name } : null,
    };
  }

  private readonly subscriptionInclude = {
    supplier: { select: { id: true, businessName: true, slug: true } },
    plan: { select: { id: true, key: true, name: true } },
  } as const;

  private async resolveCreateFields(payload: {
    planId?: string;
    interval?: BillingInterval;
    amount?: number;
    currency?: string;
    planKey?: string;
  }) {
    if (payload.planId) {
      const plan = await this.plansService.getById(payload.planId);
      if (!plan.isActive) {
        throw new BadRequestException('Subscription plan is not active');
      }
      return {
        planId: plan.id,
        interval: plan.interval,
        amount: this.plansService.billingAmountFromPlan(plan),
        currency: payload.currency?.trim().toUpperCase() ?? plan.currency,
        planKey: plan.key,
      };
    }
    if (!payload.interval || payload.amount === undefined) {
      throw new BadRequestException('Provide planId or both interval and amount');
    }
    return {
      planId: null as string | null,
      interval: payload.interval,
      amount: new Prisma.Decimal(payload.amount),
      currency: payload.currency?.trim().toUpperCase() ?? 'ILS',
      planKey: payload.planKey?.trim() ? payload.planKey.trim() : null,
    };
  }

  async listSubscriptions(page?: number, limit?: number, supplierId?: string) {
    const pg = toAdminPagination(page, limit);
    const where: Prisma.SupplierSubscriptionWhereInput = supplierId ? { supplierId } : {};
    const [rows, totalItems] = await this.prisma.$transaction([
      this.prisma.supplierSubscription.findMany({
        where,
        include: this.subscriptionInclude,
        orderBy: { createdAt: 'desc' },
        skip: pg.skip,
        take: pg.take,
      }),
      this.prisma.supplierSubscription.count({ where }),
    ]);
    return { items: rows.map((row) => this.serializeAdminSubscription(row)), totalItems };
  }

  async getSubscription(id: string) {
    const row = await this.prisma.supplierSubscription.findUnique({
      where: { id },
      include: this.subscriptionInclude,
    });
    if (!row) {
      throw new NotFoundException('Subscription not found');
    }
    return this.serializeAdminSubscription(row);
  }

  async createSubscription(payload: {
    supplierId: string;
    planId?: string;
    interval?: BillingInterval;
    amount?: number;
    cardcomToken: string;
    nextBillingAt: string;
    status?: SubscriptionStatus;
    currency?: string;
    planKey?: string;
    tokenExpiresAt?: string;
  }) {
    const supplier = await this.prisma.supplier.findFirst({
      where: { id: payload.supplierId, deletedAt: null },
    });
    if (!supplier) {
      throw new NotFoundException('Supplier not found');
    }

    const existing = await this.prisma.supplierSubscription.findUnique({
      where: { supplierId: payload.supplierId },
    });
    if (existing) {
      throw new ConflictException('Supplier already has a subscription');
    }

    const resolved = await this.resolveCreateFields(payload);

    const created = await this.prisma.supplierSubscription.create({
      data: {
        supplierId: payload.supplierId,
        planId: resolved.planId,
        status: payload.status ?? 'ACTIVE',
        interval: resolved.interval,
        planKey: resolved.planKey,
        amount: resolved.amount,
        currency: resolved.currency,
        cardcomToken: payload.cardcomToken.trim(),
        tokenExpiresAt: payload.tokenExpiresAt ? new Date(payload.tokenExpiresAt) : null,
        nextBillingAt: new Date(payload.nextBillingAt),
        consecutiveFailures: 0,
      },
      include: this.subscriptionInclude,
    });
    return this.serializeAdminSubscription(created);
  }

  async updateSubscription(
    id: string,
    payload: {
      planId?: string;
      status?: SubscriptionStatus;
      interval?: BillingInterval;
      amount?: number;
      currency?: string;
      planKey?: string;
      cardcomToken?: string;
      nextBillingAt?: string;
      tokenExpiresAt?: string;
      lastRenewedAt?: string;
      consecutiveFailures?: number;
    },
  ) {
    const existing = await this.prisma.supplierSubscription.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException('Subscription not found');
    }

    let planPatch: {
      planId?: string | null;
      interval?: BillingInterval;
      amount?: Prisma.Decimal;
      planKey?: string | null;
      currency?: string;
    } = {};

    if (payload.planId) {
      const plan = await this.plansService.getById(payload.planId);
      planPatch = {
        planId: plan.id,
        interval: plan.interval,
        amount: this.plansService.billingAmountFromPlan(plan),
        planKey: plan.key,
        currency: plan.currency,
      };
    }

    const status = payload.status;
    const updated = await this.prisma.supplierSubscription.update({
      where: { id },
      data: {
        planId: planPatch.planId ?? undefined,
        status: status ?? undefined,
        interval: planPatch.interval ?? payload.interval ?? undefined,
        amount:
          planPatch.amount ??
          (payload.amount === undefined ? undefined : new Prisma.Decimal(payload.amount)),
        currency: payload.currency?.trim().toUpperCase() ?? planPatch.currency ?? undefined,
        planKey:
          planPatch.planKey ??
          (payload.planKey === undefined ? undefined : payload.planKey.trim() ? payload.planKey.trim() : null),
        cardcomToken: payload.cardcomToken?.trim() ? payload.cardcomToken.trim() : undefined,
        nextBillingAt: payload.nextBillingAt ? new Date(payload.nextBillingAt) : undefined,
        tokenExpiresAt:
          payload.tokenExpiresAt === undefined
            ? undefined
            : payload.tokenExpiresAt
              ? new Date(payload.tokenExpiresAt)
              : null,
        lastRenewedAt:
          payload.lastRenewedAt === undefined
            ? undefined
            : payload.lastRenewedAt
              ? new Date(payload.lastRenewedAt)
              : null,
        consecutiveFailures: payload.consecutiveFailures ?? undefined,
        canceledAt:
          status === 'CANCELED' && existing.status !== 'CANCELED' ? new Date() : status === 'ACTIVE' ? null : undefined,
      },
      include: this.subscriptionInclude,
    });
    return this.serializeAdminSubscription(updated);
  }

  async deleteSubscription(id: string) {
    const existing = await this.prisma.supplierSubscription.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException('Subscription not found');
    }
    const updated = await this.prisma.supplierSubscription.update({
      where: { id },
      data: { status: 'CANCELED', canceledAt: new Date() },
      include: this.subscriptionInclude,
    });
    return this.serializeAdminSubscription(updated);
  }
}
