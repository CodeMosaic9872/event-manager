import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { BillingInterval, Prisma, SubscriptionStatus, SupplierApprovalStatus } from '@prisma/client';
import { randomBytes } from 'crypto';
import { PrismaService } from '../../../prisma/prisma.service';
import { AutomationService } from '../../notifications/automation.service';
import { SmsService } from '../../sms/sms.service';
import { toAdminPagination } from '../common/admin-pagination.util';

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
      },
    },
  } as const;

  async listSuppliers(page?: number, limit?: number) {
    const pg = toAdminPagination(page, limit);
    const where: Prisma.SupplierWhereInput = { deletedAt: null };
    const [rows, totalItems] = await this.prisma.$transaction([
      this.prisma.supplier.findMany({
        where,
        include: this.supplierAdminInclude,
        orderBy: { createdAt: 'desc' },
        skip: pg.skip,
        take: pg.take,
      }),
      this.prisma.supplier.count({ where }),
    ]);
    return { items: rows.map((row) => this.serializeAdminSupplier(row)), totalItems };
  }

  async getSupplier(id: string) {
    const row = await this.prisma.supplier.findFirst({
      where: { id, deletedAt: null },
      include: this.supplierAdminInclude,
    });
    if (!row) {
      throw new NotFoundException('Supplier not found');
    }
    return this.serializeAdminSupplier(row);
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
