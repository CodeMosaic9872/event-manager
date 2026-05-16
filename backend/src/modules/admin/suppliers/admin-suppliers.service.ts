import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { BillingInterval, Prisma, SubscriptionStatus, SupplierApprovalStatus } from '@prisma/client';
import { randomBytes } from 'crypto';
import { PrismaService } from '../../../prisma/prisma.service';
import { AutomationService } from '../../notifications/automation.service';
import { SmsService } from '../../sms/sms.service';
import { toAdminPagination } from '../common/admin-pagination.util';
import type { AdminListSuppliersQueryDto } from '../dto/admin.dto';

const SERVICE_AREA_LABELS: Record<string, string> = {
  north: 'North',
  south: 'South',
  center: 'Center',
  jerusalem: 'Jerusalem',
  sharon: 'Sharon',
  hashfela: 'Shfela',
};

const SUPPLIER_LIST_INCLUDE = {
  owner: { select: { id: true, email: true, phone: true, status: true } },
  subscription: {
    select: {
      id: true,
      status: true,
      interval: true,
      amount: true,
      currency: true,
      nextBillingAt: true,
      plan: { select: { isFeatured: true, name: true } },
    },
  },
  socialLinks: { orderBy: { platform: 'asc' as const } },
  attributes: true,
  categories: {
    orderBy: { createdAt: 'asc' as const },
    include: {
      category: { select: { id: true, key: true, name: true, nameEn: true } },
      subcategory: { select: { id: true, key: true, name: true, nameEn: true } },
    },
  },
} satisfies Prisma.SupplierInclude;

type AdminSupplierListRow = Prisma.SupplierGetPayload<{ include: typeof SUPPLIER_LIST_INCLUDE }>;

@Injectable()
export class AdminSuppliersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly automationService: AutomationService,
    private readonly smsService: SmsService,
  ) {}

  private normalizeServiceAreaStrings(values: string[]): string[] {
    const out: string[] = [];
    const seen = new Set<string>();
    for (const v of values) {
      const s = v.trim().toLowerCase();
      if (!s || seen.has(s)) continue;
      seen.add(s);
      out.push(s);
    }
    return out;
  }

  private serializeAdminSupplier(
    row: {
      id: string;
      ownerUserId: string;
      businessName: string;
      slug: string;
      description: string | null;
      approvalStatus: SupplierApprovalStatus;
      isActive: boolean;
      isVerified: boolean;
      contactEmail: string | null;
      publicPhone: string | null;
      serviceAreas: string[];
      createdAt: Date;
      updatedAt: Date;
      deletedAt: Date | null;
      owner?: { id: string; email: string | null; phone: string | null; status: string } | null;
      subscription?: {
        id: string;
        status: SubscriptionStatus;
        interval: BillingInterval;
        amount: Prisma.Decimal;
        currency: string;
        nextBillingAt: Date;
      } | null;
    },
  ) {
    return {
      id: row.id,
      ownerUserId: row.ownerUserId,
      businessName: row.businessName,
      slug: row.slug,
      description: row.description,
      approvalStatus: row.approvalStatus,
      isActive: row.isActive,
      isVerified: row.isVerified,
      contactEmail: row.contactEmail,
      publicPhone: row.publicPhone,
      serviceAreas: row.serviceAreas,
      createdAt: row.createdAt.toISOString(),
      updatedAt: row.updatedAt.toISOString(),
      deletedAt: row.deletedAt?.toISOString() ?? null,
      owner: row.owner
        ? {
            id: row.owner.id,
            email: row.owner.email,
            phone: row.owner.phone,
            status: row.owner.status,
          }
        : null,
      subscription: row.subscription
        ? {
            id: row.subscription.id,
            status: row.subscription.status,
            interval: row.subscription.interval,
            amount: String(row.subscription.amount),
            currency: row.subscription.currency,
            nextBillingAt: row.subscription.nextBillingAt.toISOString(),
          }
        : null,
    };
  }

  private readonly supplierAdminInclude = {
    owner: { select: { id: true, email: true, phone: true, status: true } },
    subscription: {
      select: {
        id: true,
        status: true,
        interval: true,
        amount: true,
        currency: true,
        nextBillingAt: true,
        plan: { select: { isFeatured: true, name: true } },
      },
    },
  } as const;

  private readonly supplierListInclude = SUPPLIER_LIST_INCLUDE;

  private jsonStringArray(value: unknown): string[] {
    if (!Array.isArray(value)) return [];
    return value.filter((v): v is string => typeof v === 'string' && v.trim().length > 0);
  }

  private deriveCity(address: string | null, serviceAreas: string[]): string | null {
    if (address?.trim()) {
      const parts = address.split(',').map((p) => p.trim()).filter(Boolean);
      if (parts.length > 0) {
        return parts[parts.length - 1];
      }
    }
    const first = serviceAreas[0];
    if (!first) return null;
    return SERVICE_AREA_LABELS[first.toLowerCase()] ?? first;
  }

  private buildLabels(row: AdminSupplierListRow): string[] {
    const labels = new Set<string>();
    if (row.kosher?.trim()) labels.add('Kosher');
    if (row.attributes?.insurance) labels.add('Insurance');
    if (row.attributes?.accessibility) labels.add('Accessible');
    for (const label of this.jsonStringArray(row.attributes?.labelsRulesJson)) {
      labels.add(label);
    }
    for (const label of this.jsonStringArray(row.attributes?.labelsNicheJson)) {
      labels.add(label);
    }
    if (row.subscription?.status === 'ACTIVE' && row.subscription.plan?.isFeatured) {
      labels.add('Premium');
    } else if (row.subscription?.status === 'ACTIVE') {
      labels.add('Subscribed');
    }
    return [...labels];
  }

  private serializeAdminSupplierListItem(row: AdminSupplierListRow) {
    const base = this.serializeAdminSupplier(row);
    return {
      ...base,
      city: this.deriveCity(row.address, row.serviceAreas),
      address: row.address,
      websiteUrl: row.websiteUrl,
      whatsappUrl: row.whatsappUrl,
      categories: row.categories.map((sc) => ({
        id: sc.category.id,
        key: sc.category.key,
        name: sc.category.name,
        nameEn: sc.category.nameEn,
        subcategoryId: sc.subcategory?.id ?? null,
        subcategoryKey: sc.subcategory?.key ?? null,
        subcategoryName: sc.subcategory?.name ?? null,
      })),
      socialLinks: row.socialLinks.map((link) => ({
        platform: link.platform,
        url: link.url,
      })),
      labels: this.buildLabels(row),
    };
  }

  private buildListWhere(filters: AdminListSuppliersQueryDto): Prisma.SupplierWhereInput {
    const where: Prisma.SupplierWhereInput = { deletedAt: null };

    const status = filters.status ?? 'all';
    if (status === 'approved') {
      where.approvalStatus = 'APPROVED';
    } else if (status === 'rejected') {
      where.approvalStatus = 'REJECTED';
    } else if (status === 'pending') {
      where.approvalStatus = 'PENDING';
    } else if (status === 'draft') {
      where.approvalStatus = 'DRAFT';
    } else if (status === 'waiting') {
      where.approvalStatus = { in: ['PENDING', 'DRAFT'] };
    }

    const q = filters.q?.trim();
    if (q) {
      where.OR = [
        { businessName: { contains: q, mode: 'insensitive' } },
        { slug: { contains: q, mode: 'insensitive' } },
        { description: { contains: q, mode: 'insensitive' } },
        { address: { contains: q, mode: 'insensitive' } },
        { contactEmail: { contains: q, mode: 'insensitive' } },
        { publicPhone: { contains: q, mode: 'insensitive' } },
        { owner: { email: { contains: q, mode: 'insensitive' } } },
        { owner: { phone: { contains: q, mode: 'insensitive' } } },
      ];
    }

    if (filters.categoryId) {
      where.categories = { some: { categoryId: filters.categoryId } };
    } else if (filters.categoryKey?.trim()) {
      where.categories = {
        some: { category: { key: filters.categoryKey.trim().toLowerCase() } },
      };
    }

    const area = filters.serviceArea?.trim().toLowerCase();
    if (area) {
      where.serviceAreas = { has: area };
    }

    return where;
  }

  async listSuppliers(filters: AdminListSuppliersQueryDto = {}) {
    const pg = toAdminPagination(filters.page, filters.limit);
    const where = this.buildListWhere(filters);
    const [rows, totalItems] = await this.prisma.$transaction([
      this.prisma.supplier.findMany({
        where,
        include: this.supplierListInclude,
        orderBy: { createdAt: 'desc' },
        skip: pg.skip,
        take: pg.take,
      }),
      this.prisma.supplier.count({ where }),
    ]);
    return {
      items: rows.map((row) => this.serializeAdminSupplierListItem(row)),
      totalItems,
    };
  }

  async getSupplierStats() {
    const base: Prisma.SupplierWhereInput = { deletedAt: null };
    const [activeSuppliers, pendingApproval, totalSuppliers] = await this.prisma.$transaction([
      this.prisma.supplier.count({
        where: { ...base, approvalStatus: 'APPROVED', isActive: true },
      }),
      this.prisma.supplier.count({
        where: { ...base, approvalStatus: 'PENDING' },
      }),
      this.prisma.supplier.count({ where: base }),
    ]);
    return { activeSuppliers, pendingApproval, totalSuppliers };
  }

  async getFilterOptions() {
    const [categories, serviceAreaRows] = await this.prisma.$transaction([
      this.prisma.category.findMany({
        where: { isActive: true },
        orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
        select: { id: true, key: true, name: true, nameEn: true },
      }),
      this.prisma.supplier.findMany({
        where: { deletedAt: null },
        select: { serviceAreas: true },
      }),
    ]);

    const areaSet = new Set<string>();
    for (const row of serviceAreaRows) {
      for (const area of row.serviceAreas) {
        const normalized = area.trim().toLowerCase();
        if (normalized) areaSet.add(normalized);
      }
    }

    return {
      categories,
      serviceAreas: [...areaSet].sort((a, b) => a.localeCompare(b)),
    };
  }

  async exportSuppliersCsv(filters: AdminListSuppliersQueryDto = {}) {
    const where = this.buildListWhere(filters);
    const rows = await this.prisma.supplier.findMany({
      where,
      include: this.supplierListInclude,
      orderBy: { createdAt: 'desc' },
      take: 5000,
    });
    const items = rows.map((row) => this.serializeAdminSupplierListItem(row));
    const header = [
      'id',
      'businessName',
      'city',
      'approvalStatus',
      'categories',
      'serviceAreas',
      'contactEmail',
      'publicPhone',
      'address',
      'websiteUrl',
      'labels',
      'createdAt',
    ];
    const escape = (value: string) => `"${value.replace(/"/g, '""')}"`;
    const lines = items.map((row) =>
      [
        row.id,
        row.businessName,
        row.city ?? '',
        row.approvalStatus,
        row.categories.map((c) => c.nameEn ?? c.name).join('; '),
        row.serviceAreas.join('; '),
        row.contactEmail ?? '',
        row.publicPhone ?? '',
        row.address ?? '',
        row.websiteUrl ?? row.socialLinks.find((l) => l.platform === 'website')?.url ?? '',
        row.labels.join('; '),
        row.createdAt,
      ]
        .map((cell) => escape(String(cell)))
        .join(','),
    );
    const csv = `\uFEFF${header.join(',')}\n${lines.join('\n')}`;
    return {
      filename: `suppliers-export-${new Date().toISOString().slice(0, 10)}.csv`,
      contentType: 'text/csv; charset=utf-8',
      csv,
      rowCount: items.length,
    };
  }

  async getSupplier(id: string) {
    const row = await this.prisma.supplier.findFirst({
      where: { id, deletedAt: null },
      include: this.supplierListInclude,
    });
    if (!row) {
      throw new NotFoundException('Supplier not found');
    }
    return this.serializeAdminSupplierListItem(row);
  }

  async createSupplier(payload: {
    ownerUserId: string;
    businessName: string;
    slug: string;
    description?: string;
    approvalStatus?: SupplierApprovalStatus;
    isActive?: boolean;
    isVerified?: boolean;
    contactEmail?: string;
    publicPhone?: string;
    serviceAreas?: string[];
  }) {
    const owner = await this.prisma.user.findUnique({ where: { id: payload.ownerUserId } });
    if (!owner) {
      throw new NotFoundException('Owner user not found');
    }
    if (owner.status !== 'ACTIVE') {
      throw new BadRequestException('Owner user must be ACTIVE');
    }

    const existingOwnerSupplier = await this.prisma.supplier.findUnique({
      where: { ownerUserId: payload.ownerUserId },
    });
    if (existingOwnerSupplier && !existingOwnerSupplier.deletedAt) {
      throw new ConflictException('This user already owns a supplier profile');
    }

    const slugTaken = await this.prisma.supplier.findUnique({ where: { slug: payload.slug } });
    if (slugTaken && slugTaken.deletedAt == null && slugTaken.ownerUserId !== payload.ownerUserId) {
      throw new ConflictException('Slug is already in use');
    }

    if (existingOwnerSupplier?.deletedAt) {
      const restored = await this.prisma.$transaction(async (tx) => {
        const hasSupplierRole = await tx.userRole.findUnique({
          where: { userId_role: { userId: payload.ownerUserId, role: 'SUPPLIER' } },
        });
        if (!hasSupplierRole) {
          await tx.userRole.create({ data: { userId: payload.ownerUserId, role: 'SUPPLIER' } });
        }
        return tx.supplier.update({
          where: { id: existingOwnerSupplier.id },
          data: {
            deletedAt: null,
            businessName: payload.businessName.trim(),
            slug: payload.slug,
            description: payload.description?.trim() ? payload.description.trim() : null,
            approvalStatus: payload.approvalStatus ?? 'DRAFT',
            isActive: payload.isActive ?? true,
            isVerified: payload.isVerified ?? false,
            contactEmail: payload.contactEmail?.trim() ? payload.contactEmail.trim() : null,
            publicPhone: payload.publicPhone?.trim()
              ? this.smsService.normalizeIsraeliMobile(payload.publicPhone)
              : null,
            serviceAreas: payload.serviceAreas ? this.normalizeServiceAreaStrings(payload.serviceAreas) : [],
          },
          include: this.supplierAdminInclude,
        });
      });
      return this.serializeAdminSupplier(restored);
    }

    const created = await this.prisma.$transaction(async (tx) => {
      const hasSupplierRole = await tx.userRole.findUnique({
        where: { userId_role: { userId: payload.ownerUserId, role: 'SUPPLIER' } },
      });
      if (!hasSupplierRole) {
        await tx.userRole.create({ data: { userId: payload.ownerUserId, role: 'SUPPLIER' } });
      }

      const supplier = await tx.supplier.create({
        data: {
          ownerUserId: payload.ownerUserId,
          businessName: payload.businessName.trim(),
          slug: payload.slug,
          description: payload.description?.trim() ? payload.description.trim() : null,
          approvalStatus: payload.approvalStatus ?? 'DRAFT',
          isActive: payload.isActive ?? true,
          isVerified: payload.isVerified ?? false,
          contactEmail: payload.contactEmail?.trim() ? payload.contactEmail.trim() : null,
          publicPhone: payload.publicPhone?.trim()
            ? this.smsService.normalizeIsraeliMobile(payload.publicPhone)
            : null,
          serviceAreas: payload.serviceAreas ? this.normalizeServiceAreaStrings(payload.serviceAreas) : [],
        },
        include: this.supplierAdminInclude,
      });

      const code = `REF-${randomBytes(4).toString('hex').toUpperCase()}`;
      const baseUrl = process.env.REFERRAL_BASE_URL ?? 'https://event-marketplace.example/ref';
      await tx.referralLink.create({
        data: { supplierId: supplier.id, code, url: `${baseUrl}/${code}` },
      });

      return supplier;
    });

    return this.serializeAdminSupplier(created);
  }

  async updateSupplier(
    id: string,
    payload: {
      businessName?: string;
      slug?: string;
      description?: string;
      approvalStatus?: SupplierApprovalStatus;
      isActive?: boolean;
      isVerified?: boolean;
      contactEmail?: string;
      publicPhone?: string;
      whatsappUrl?: string;
      websiteUrl?: string;
      address?: string;
      serviceAreas?: string[];
    },
  ) {
    const existing = await this.prisma.supplier.findFirst({ where: { id, deletedAt: null } });
    if (!existing) {
      throw new NotFoundException('Supplier not found');
    }

    if (payload.slug && payload.slug !== existing.slug) {
      const slugTaken = await this.prisma.supplier.findUnique({ where: { slug: payload.slug } });
      if (slugTaken && slugTaken.id !== id && slugTaken.deletedAt == null) {
        throw new ConflictException('Slug is already in use');
      }
    }

    const updated = await this.prisma.supplier.update({
      where: { id },
      data: {
        businessName: payload.businessName?.trim() ?? undefined,
        slug: payload.slug ?? undefined,
        description:
          payload.description === undefined
            ? undefined
            : payload.description.trim()
              ? payload.description.trim()
              : null,
        approvalStatus: payload.approvalStatus ?? undefined,
        isActive: payload.isActive ?? undefined,
        isVerified: payload.isVerified ?? undefined,
        contactEmail:
          payload.contactEmail === undefined
            ? undefined
            : payload.contactEmail.trim()
              ? payload.contactEmail.trim()
              : null,
        publicPhone:
          payload.publicPhone === undefined
            ? undefined
            : payload.publicPhone.trim()
              ? this.smsService.normalizeIsraeliMobile(payload.publicPhone)
              : null,
        whatsappUrl:
          payload.whatsappUrl === undefined
            ? undefined
            : payload.whatsappUrl.trim()
              ? payload.whatsappUrl.trim()
              : null,
        websiteUrl:
          payload.websiteUrl === undefined
            ? undefined
            : payload.websiteUrl.trim()
              ? payload.websiteUrl.trim()
              : null,
        address:
          payload.address === undefined ? undefined : payload.address.trim() ? payload.address.trim() : null,
        serviceAreas:
          payload.serviceAreas === undefined
            ? undefined
            : this.normalizeServiceAreaStrings(payload.serviceAreas),
      },
      include: this.supplierAdminInclude,
    });

    return this.serializeAdminSupplier(updated);
  }

  async deleteSupplier(id: string) {
    const existing = await this.prisma.supplier.findFirst({ where: { id, deletedAt: null } });
    if (!existing) {
      throw new NotFoundException('Supplier not found');
    }
    const updated = await this.prisma.supplier.update({
      where: { id },
      data: { deletedAt: new Date(), isActive: false },
      include: this.supplierAdminInclude,
    });
    return this.serializeAdminSupplier(updated);
  }

  async listIncompleteSuppliers(page?: number, limit?: number) {
    const pg = toAdminPagination(page, limit);
    const where = { completionPercent: { lt: 100 } } as const;
    const [items, totalItems] = await this.prisma.$transaction([
      this.prisma.supplierDraft.findMany({
        where,
        include: { supplier: true },
        orderBy: { lastAutosaveAt: 'desc' },
        skip: pg.skip,
        take: pg.take,
      }),
      this.prisma.supplierDraft.count({ where }),
    ]);
    return { items, totalItems };
  }

  async approveSupplier(id: string, actorAdminId?: string) {
    const updated = await this.prisma.$transaction(async (tx) => {
      const existing = await tx.supplier.findUniqueOrThrow({ where: { id } });
      const next = await tx.supplier.update({
        where: { id },
        data: { approvalStatus: 'APPROVED' },
      });
      await tx.supplierApprovalHistory.create({
        data: {
          supplierId: id,
          fromStatus: existing.approvalStatus,
          toStatus: 'APPROVED',
          actorAdminId: actorAdminId ?? null,
        },
      });
      return next;
    });
    await this.automationService.publish({
      eventId: `supplier_approved_${id}_${updated.updatedAt.getTime()}`,
      type: 'supplier.approved',
      payload: {
        supplierId: id,
        ownerUserId: updated.ownerUserId,
        businessName: updated.businessName,
      },
    });
    return updated;
  }

  async rejectSupplier(id: string, reason?: string, actorAdminId?: string) {
    const updated = await this.prisma.$transaction(async (tx) => {
      const existing = await tx.supplier.findUniqueOrThrow({ where: { id } });
      const next = await tx.supplier.update({
        where: { id },
        data: { approvalStatus: 'REJECTED' },
      });
      await tx.supplierApprovalHistory.create({
        data: {
          supplierId: id,
          fromStatus: existing.approvalStatus,
          toStatus: 'REJECTED',
          reason: reason ?? null,
          actorAdminId: actorAdminId ?? null,
        },
      });
      return next;
    });
    await this.automationService.publish({
      eventId: `supplier_rejected_${id}_${updated.updatedAt.getTime()}`,
      type: 'supplier.rejected',
      payload: {
        supplierId: id,
        ownerUserId: updated.ownerUserId,
        businessName: updated.businessName,
        reason: reason ?? '',
      },
    });
    return updated;
  }
}
