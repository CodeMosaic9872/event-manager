import { BadRequestException, ConflictException, Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { SmsService } from '../../sms/sms.service';

@Injectable()
export class AdminAdminsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly smsService: SmsService,
  ) {}

  async bootstrapFirstAdmin(payload: { email: string; phone: string }) {
    const adminCount = await this.prisma.userRole.count({ where: { role: 'ADMIN' } });
    if (adminCount > 0) {
      throw new ConflictException(
        'Bootstrap is disabled because an admin already exists. Sign in as an admin and use POST /v1/admin/admins.',
      );
    }
    return this.createAdmin(payload);
  }

  async createAdmin(payload: { email: string; phone: string }) {
    const email = payload.email.trim().toLowerCase();
    const phone = this.smsService.normalizeIsraeliMobile(payload.phone);

    const existingByEmail = await this.prisma.user.findUnique({ where: { email }, include: { roles: true } });
    const existingByPhone = await this.prisma.user.findUnique({ where: { phone }, include: { roles: true } });

    if (existingByEmail && existingByPhone && existingByEmail.id !== existingByPhone.id) {
      throw new ConflictException('Email and phone belong to different accounts.');
    }
    if (existingByEmail && existingByEmail.phone && existingByEmail.phone !== phone) {
      throw new ConflictException('This email is already linked to another phone number.');
    }
    if (existingByPhone && existingByPhone.email && existingByPhone.email !== email) {
      throw new ConflictException('This phone number is already linked to another email.');
    }

    const existing = existingByEmail ?? existingByPhone;

    if (existing) {
      if (existing.status !== 'ACTIVE') {
        throw new BadRequestException('User account is not active; cannot grant admin access.');
      }
      if (existing.roles.some((r) => r.role === 'ADMIN')) {
        throw new ConflictException('This user already has admin access.');
      }

      await this.prisma.user.update({
        where: { id: existing.id },
        data: {
          email: existing.email ?? email,
          phone: existing.phone ?? phone,
        },
      });
      await this.prisma.userRole.create({ data: { userId: existing.id, role: 'ADMIN' } });
      const updated = await this.prisma.user.findUniqueOrThrow({
        where: { id: existing.id },
        include: { roles: true },
      });
      return {
        id: updated.id,
        email: updated.email,
        phone: updated.phone,
        status: updated.status,
        roles: updated.roles.map((r) => r.role),
        createdAt: updated.createdAt.toISOString(),
      };
    }

    const created = await this.prisma.user.create({
      data: {
        email,
        phone,
        status: 'ACTIVE',
        roles: { create: [{ role: 'ADMIN' }] },
      },
      include: { roles: true },
    });
    return {
      id: created.id,
      email: created.email,
      phone: created.phone,
      status: created.status,
      roles: created.roles.map((r) => r.role),
      createdAt: created.createdAt.toISOString(),
    };
  }
}
