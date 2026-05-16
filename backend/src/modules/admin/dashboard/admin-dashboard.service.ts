import { Injectable } from '@nestjs/common';
import { PaymentStatus, Prisma, SupplierApprovalStatus } from '@prisma/client';
import { PrismaService } from '../../../prisma/prisma.service';

export type AdminDashboardQuery = {
  year?: number;
  month?: number;
  supplierSearch?: string;
  pendingLimit?: number;
  growthMonths?: number;
};

type MonthRange = { start: Date; end: Date; year: number; month: number };

const PHONE_CLICK_CHANNELS = ['phone', 'tel', 'call', 'phone_click', 'phone-click'];

@Injectable()
export class AdminDashboardService {
  constructor(private readonly prisma: PrismaService) {}

  async getDashboard(query: AdminDashboardQuery = {}) {
    const now = new Date();
    const engagementPeriod = this.resolvePeriod(query.year, query.month, now);
    const kpiThisMonth = this.resolvePeriod(now.getUTCFullYear(), now.getUTCMonth() + 1, now);
    const kpiLastMonth = this.previousMonthRange(kpiThisMonth.year, kpiThisMonth.month);
    const pendingLimit = Math.min(50, Math.max(1, query.pendingLimit ?? 10));
    const growthMonths = Math.min(12, Math.max(1, query.growthMonths ?? 5));
    const supplierFilter = this.buildSupplierFilter(query.supplierSearch);

    const [
      kpis,
      supplierEngagement,
      platformGrowth,
      pendingApprovals,
    ] = await Promise.all([
      this.buildKpis(kpiThisMonth, kpiLastMonth),
      this.buildSupplierEngagement(engagementPeriod, supplierFilter),
      this.buildPlatformGrowth(growthMonths, now),
      this.listPendingApprovals(pendingLimit),
    ]);

    return {
      period: {
        year: engagementPeriod.year,
        month: engagementPeriod.month,
        label: this.monthLabel(engagementPeriod.year, engagementPeriod.month),
      },
      kpis,
      supplierEngagement,
      platformGrowth,
      pendingApprovals,
    };
  }

  private resolvePeriod(year?: number, month?: number, now = new Date()): MonthRange {
    const y = year && year >= 2000 && year <= 2100 ? year : now.getUTCFullYear();
    const m = month && month >= 1 && month <= 12 ? month : now.getUTCMonth() + 1;
    return { ...this.monthRange(y, m), year: y, month: m };
  }

  private monthRange(year: number, month: number): { start: Date; end: Date } {
    return {
      start: new Date(Date.UTC(year, month - 1, 1)),
      end: new Date(Date.UTC(year, month, 1)),
    };
  }

  private previousMonthRange(year: number, month: number): MonthRange {
    const d = new Date(Date.UTC(year, month - 1, 1));
    d.setUTCMonth(d.getUTCMonth() - 1);
    const py = d.getUTCFullYear();
    const pm = d.getUTCMonth() + 1;
    return { ...this.monthRange(py, pm), year: py, month: pm };
  }

  private monthLabel(year: number, month: number): string {
    return new Date(Date.UTC(year, month - 1, 1)).toLocaleString('en-US', {
      month: 'long',
      timeZone: 'UTC',
    });
  }

  private percentChange(current: number, previous: number): number {
    if (previous === 0) {
      return current > 0 ? 100 : 0;
    }
    return Number((((current - previous) / previous) * 100).toFixed(1));
  }

  private buildSupplierFilter(search?: string): Prisma.SupplierWhereInput | undefined {
    const q = search?.trim();
    if (!q) return undefined;
    return {
      deletedAt: null,
      OR: [
        { businessName: { contains: q, mode: 'insensitive' } },
        { slug: { contains: q, mode: 'insensitive' } },
      ],
    };
  }

  private async buildKpis(thisMonth: MonthRange, lastMonth: MonthRange) {
    const supplierBase: Prisma.SupplierWhereInput = { deletedAt: null };
    const userBase: Prisma.UserWhereInput = { deletedAt: null, status: 'ACTIVE' };
    const paidPaymentWhere = (range: MonthRange): Prisma.SupplierPaymentWhereInput => ({
      status: PaymentStatus.PAID,
      OR: [
        { paidAt: { gte: range.start, lt: range.end } },
        { paidAt: null, createdAt: { gte: range.start, lt: range.end } },
      ],
    });

    const [
      totalSuppliers,
      suppliersThisMonth,
      suppliersLastMonth,
      pendingApprovals,
      activeUsers,
      usersThisMonth,
      usersLastMonth,
      revenueAggThisMonth,
      revenueAggLastMonth,
    ] = await this.prisma.$transaction([
      this.prisma.supplier.count({ where: supplierBase }),
      this.prisma.supplier.count({
        where: { ...supplierBase, createdAt: { gte: thisMonth.start, lt: thisMonth.end } },
      }),
      this.prisma.supplier.count({
        where: { ...supplierBase, createdAt: { gte: lastMonth.start, lt: lastMonth.end } },
      }),
      this.prisma.supplier.count({
        where: { ...supplierBase, approvalStatus: SupplierApprovalStatus.PENDING },
      }),
      this.prisma.user.count({ where: userBase }),
      this.prisma.user.count({
        where: { ...userBase, createdAt: { gte: thisMonth.start, lt: thisMonth.end } },
      }),
      this.prisma.user.count({
        where: { ...userBase, createdAt: { gte: lastMonth.start, lt: lastMonth.end } },
      }),
      this.prisma.supplierPayment.aggregate({
        where: paidPaymentWhere(thisMonth),
        _sum: { amount: true },
      }),
      this.prisma.supplierPayment.aggregate({
        where: paidPaymentWhere(lastMonth),
        _sum: { amount: true },
      }),
    ]);

    const revenueThisMonth = Number(revenueAggThisMonth._sum.amount ?? 0);
    const revenueLastMonth = Number(revenueAggLastMonth._sum.amount ?? 0);
    const totalRevenueAgg = await this.prisma.supplierPayment.aggregate({
      where: { status: PaymentStatus.PAID },
      _sum: { amount: true },
    });
    const totalRevenue = Number(totalRevenueAgg._sum.amount ?? 0);

    return {
      totalSuppliers: {
        value: totalSuppliers,
        changePercent: this.percentChange(suppliersThisMonth, suppliersLastMonth),
        periodLabel: 'from last month',
      },
      totalRevenue: {
        value: totalRevenue,
        currency: 'ILS',
        changePercent: this.percentChange(revenueThisMonth, revenueLastMonth),
        periodLabel: 'from last month',
      },
      pendingApprovals: {
        value: pendingApprovals,
      },
      activeUsers: {
        value: activeUsers,
        changePercent: this.percentChange(usersThisMonth, usersLastMonth),
        periodLabel: 'from last month',
      },
    };
  }

  private phoneClickWhere(range: MonthRange, supplierFilter?: Prisma.SupplierWhereInput) {
    return {
      createdAt: { gte: range.start, lt: range.end },
      OR: PHONE_CLICK_CHANNELS.map((channel) => ({
        channel: { equals: channel, mode: 'insensitive' as const },
      })),
      ...(supplierFilter ? { supplier: supplierFilter } : {}),
    };
  }

  private async buildSupplierEngagement(
    period: MonthRange,
    supplierFilter?: Prisma.SupplierWhereInput,
  ) {
    const createdAt = { gte: period.start, lt: period.end };
    const supplierOnApplication = supplierFilter ? { supplier: supplierFilter } : {};
    const supplierOnJob = supplierFilter
      ? {
          applications: {
            some: {
              supplier: supplierFilter,
            },
          },
        }
      : {};

    const [
      phoneClicks,
      messagesSent,
      profileViews,
      closedJobs,
      closedJobRevenueAgg,
    ] = await this.prisma.$transaction([
      this.prisma.supplierShareEvent.count({
        where: this.phoneClickWhere(period, supplierFilter),
      }),
      this.prisma.jobApplication.count({
        where: { submittedAt: createdAt, ...supplierOnApplication },
      }),
      this.prisma.supplierShareEvent.count({
        where: {
          createdAt,
          ...(supplierFilter ? { supplier: supplierFilter } : {}),
        },
      }),
      this.prisma.jobPost.count({
        where: {
          status: 'CLOSED',
          updatedAt: createdAt,
          ...supplierOnJob,
        },
      }),
      this.prisma.supplierPayment.aggregate({
        where: {
          status: PaymentStatus.PAID,
          OR: [
            { paidAt: createdAt },
            { paidAt: null, createdAt },
          ],
          ...(supplierFilter ? { supplier: supplierFilter } : {}),
        },
        _sum: { amount: true },
      }),
    ]);

    return {
      phoneClicks,
      messagesSent,
      profileViews,
      closedJobOffers: {
        count: closedJobs,
        revenueAmount: Number(closedJobRevenueAgg._sum.amount ?? 0),
        currency: 'ILS',
      },
    };
  }

  private async buildPlatformGrowth(monthCount: number, anchor: Date) {
    const months: Array<{
      year: number;
      month: number;
      label: string;
      newSuppliers: number;
      newUsers: number;
      paidEvents: number;
    }> = [];

    let totalNewSuppliers = 0;
    let totalNewUsers = 0;
    let totalPaidEvents = 0;

    for (let offset = monthCount - 1; offset >= 0; offset -= 1) {
      const d = new Date(Date.UTC(anchor.getUTCFullYear(), anchor.getUTCMonth() - offset, 1));
      const year = d.getUTCFullYear();
      const month = d.getUTCMonth() + 1;
      const range = this.monthRange(year, month);

      const [newSuppliers, newUsers, paidEvents] = await this.prisma.$transaction([
        this.prisma.supplier.count({
          where: { deletedAt: null, createdAt: { gte: range.start, lt: range.end } },
        }),
        this.prisma.user.count({
          where: { deletedAt: null, createdAt: { gte: range.start, lt: range.end } },
        }),
        this.prisma.supplierPayment.count({
          where: {
            status: PaymentStatus.PAID,
            OR: [
              { paidAt: { gte: range.start, lt: range.end } },
              { paidAt: null, createdAt: { gte: range.start, lt: range.end } },
            ],
          },
        }),
      ]);

      totalNewSuppliers += newSuppliers;
      totalNewUsers += newUsers;
      totalPaidEvents += paidEvents;

      months.push({
        year,
        month,
        label: d.toLocaleString('en-US', { month: 'short', timeZone: 'UTC' }).toUpperCase(),
        newSuppliers,
        newUsers,
        paidEvents,
      });
    }

    return {
      months,
      totals: {
        newSuppliers: totalNewSuppliers,
        newUsers: totalNewUsers,
        paidEvents: totalPaidEvents,
      },
    };
  }

  private async listPendingApprovals(limit: number) {
    const where: Prisma.SupplierWhereInput = {
      deletedAt: null,
      approvalStatus: SupplierApprovalStatus.PENDING,
    };

    const [items, totalItems] = await this.prisma.$transaction([
      this.prisma.supplier.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: limit,
        select: {
          id: true,
          businessName: true,
          createdAt: true,
          categories: {
            take: 1,
            orderBy: { createdAt: 'asc' },
            select: {
              category: { select: { name: true, nameEn: true, key: true } },
              subcategory: { select: { name: true, nameEn: true, key: true } },
            },
          },
        },
      }),
      this.prisma.supplier.count({ where }),
    ]);

    return {
      items: items.map((row) => {
        const cat = row.categories[0];
        const categoryName =
          cat?.subcategory?.nameEn ??
          cat?.subcategory?.name ??
          cat?.category?.nameEn ??
          cat?.category?.name ??
          cat?.category?.key ??
          null;
        return {
          id: row.id,
          businessName: row.businessName,
          categoryName,
          joinedAt: row.createdAt.toISOString(),
        };
      }),
      totalItems,
    };
  }
}
