import {
  BadRequestException,
  ConflictException,
  Injectable,
  Optional,
  UnauthorizedException,
} from '@nestjs/common';
import { compare, hash } from 'bcryptjs';
import { randomBytes, randomUUID } from 'crypto';
import { PrismaService } from '../../prisma/prisma.service';
import { PlatformRole } from '../../common/constants/roles.constant';
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '../../common/utils/jwt.util';
import { AutomationService } from '../notifications/automation.service';
import { OtpService } from './otp.service';
import { SmsService } from '../sms/sms.service';
import { MediaStorageService } from '../storage/media-storage.service';
import { SuppliersService } from '../suppliers/suppliers.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly otpService: OtpService,
    private readonly smsService: SmsService,
    private readonly mediaStorage: MediaStorageService,
    private readonly suppliersService: SuppliersService,
    @Optional() private readonly automationService?: AutomationService,
  ) {}

  private ensureActiveStatus(status: 'ACTIVE' | 'INACTIVE' | 'BLOCKED') {
    if (status !== 'ACTIVE') {
      throw new UnauthorizedException('Your account is not active. Please contact support.');
    }
  }

  private toAuthUserSummary(user: {
    id: string;
    email?: string | null;
    avatarImageUrl?: string | null;
    coverImageUrl?: string | null;
    roles: { role: PlatformRole }[];
  }) {
    return {
      id: user.id,
      email: user.email ?? '',
      roles: user.roles.map((roleRow) => roleRow.role),
      avatarImageUrl: user.avatarImageUrl ?? null,
      coverImageUrl: user.coverImageUrl ?? null,
    };
  }

  private async toMeItem(
    user: {
      id: string;
      email?: string | null;
      avatarImageUrl?: string | null;
      coverImageUrl?: string | null;
      roles: { role: PlatformRole }[];
    },
  ) {
    const base = this.toAuthUserSummary(user);
    const isSupplier = user.roles.some((r) => r.role === 'SUPPLIER');
    if (!isSupplier) {
      return { ...base, businessName: null, supplier: null };
    }
    const supplier = await this.suppliersService.getSupplierFullForOwner(user.id);
    return {
      ...base,
      businessName: supplier?.businessName ?? null,
      supplier,
    };
  }

  private async issueTokenPair(user: {
    id: string;
    email?: string | null;
    roles: { role: PlatformRole }[];
    refreshTokenVersion: number;
  }) {
    const accessToken = signAccessToken({
      sub: user.id,
      email: user.email ?? undefined,
      roles: user.roles.map((roleRow) => roleRow.role),
    });
    const refreshToken = signRefreshToken({
      sub: user.id,
      ver: user.refreshTokenVersion,
      jti: randomUUID(),
    });
    const refreshTokenHash = await hash(refreshToken, 10);
    await this.prisma.user.update({
      where: { id: user.id },
      data: { refreshTokenHash },
    });
    return { accessToken, refreshToken };
  }

  async register(payload: { email: string; phone: string; role?: PlatformRole }) {
    const role = payload.role ?? 'USER';
    const phone = this.smsService.normalizeIsraeliMobile(payload.phone);

    await this.otpService.consumeVerifiedOtp({ phone, purpose: 'register' });

    const existingByEmail = await this.prisma.user.findUnique({ where: { email: payload.email } });
    const existingByPhone = await this.prisma.user.findUnique({ where: { phone } });

    if (existingByEmail && existingByPhone && existingByEmail.id !== existingByPhone.id) {
      throw new ConflictException('Email and phone belong to different accounts. Please use matching credentials.');
    }
    if (existingByEmail && existingByEmail.phone && existingByEmail.phone !== phone) {
      throw new ConflictException('This email is already linked to another phone number.');
    }
    if (existingByPhone && existingByPhone.email && existingByPhone.email !== payload.email) {
      throw new ConflictException('This phone number is already linked to another email.');
    }

    const existing = existingByEmail ?? existingByPhone;

    if (existing) {
      this.ensureActiveStatus(existing.status);

      if (!existing.phone || !existing.email) {
        await this.prisma.user.update({
          where: { id: existing.id },
          data: {
            phone: existing.phone ?? phone,
            email: existing.email ?? payload.email,
          },
        });
      }

      const hasRole = await this.prisma.userRole.findUnique({
        where: { userId_role: { userId: existing.id, role } },
      });
      if (!hasRole) {
        await this.prisma.userRole.create({ data: { userId: existing.id, role } });
      }
      const fullUser = await this.prisma.user.findUniqueOrThrow({
        where: { id: existing.id },
        include: { roles: true },
      });
      const { accessToken, refreshToken } = await this.issueTokenPair(fullUser);
      await this.automationService?.publish({
        eventId: `evt_user_registered_${existing.id}`,
        type: 'user.registered',
        payload: {
          userId: existing.id,
          email: fullUser.email,
          phone: fullUser.phone,
          role,
          isExistingAccount: true,
        },
      });
      return {
        accessToken,
        refreshToken,
        user: this.toAuthUserSummary(fullUser),
      };
    }

    const created = await this.prisma.user.create({
      data: {
        email: payload.email,
        phone,
        roles: { create: [{ role }] },
      },
      include: { roles: true },
    });
    const { accessToken, refreshToken } = await this.issueTokenPair(created);
    await this.automationService?.publish({
      eventId: `evt_user_registered_${created.id}`,
      type: 'user.registered',
      payload: {
        userId: created.id,
        email: created.email,
        phone: created.phone,
        role,
        isExistingAccount: false,
      },
    });
    return {
      accessToken,
      refreshToken,
      user: this.toAuthUserSummary(created),
    };
  }

  async login(payload: { email?: string; phone?: string; code: string }) {
    const hasEmail = Boolean(payload.email);
    const hasPhone = Boolean(payload.phone);
    if ((hasEmail && hasPhone) || (!hasEmail && !hasPhone)) {
      throw new BadRequestException('Provide either email or phone (exactly one).');
    }

    const normalizedEmail = payload.email?.trim().toLowerCase();
    const normalizedPhone = payload.phone ? this.smsService.normalizeIsraeliMobile(payload.phone) : undefined;

    const user = normalizedEmail
      ? await this.prisma.user.findUnique({
          where: { email: normalizedEmail },
          include: { roles: true },
        })
      : await this.prisma.user.findUnique({
          where: { phone: normalizedPhone! },
          include: { roles: true },
        });

    if (!user || !user.phone) {
      throw new UnauthorizedException('Invalid login details. Make sure email/phone is correct.');
    }

    await this.otpService.verifyAndConsumeOtp({
      email: normalizedEmail,
      phone: normalizedPhone,
      code: payload.code,
      purpose: 'login',
    });

    this.ensureActiveStatus(user.status);
    const { accessToken, refreshToken } = await this.issueTokenPair(user);
    return {
      accessToken,
      refreshToken,
      user: this.toAuthUserSummary(user),
    };
  }

  async createAnonymousSession(payload: { fingerprintHash?: string; ipHash?: string }) {
    const token = `anon_${randomBytes(16).toString('hex')}`;
    const session = await this.prisma.anonymousSession.create({
      data: {
        token,
        fingerprintHash: payload.fingerprintHash ?? null,
        ipHash: payload.ipHash ?? null,
      },
    });
    return { token, sessionId: session.id };
  }

  async refresh(token: string) {
    const decoded = verifyRefreshToken(token);
    const user = await this.prisma.user.findUnique({
      where: { id: decoded.sub },
      include: { roles: true },
    });
    if (!user) {
      throw new UnauthorizedException('Invalid refresh token.');
    }
    this.ensureActiveStatus(user.status);
    if (!user.refreshTokenHash) {
      throw new UnauthorizedException('Session expired. Please log in again.');
    }
    if (decoded.ver !== user.refreshTokenVersion) {
      throw new UnauthorizedException('Session expired. Please log in again.');
    }
    const isRefreshTokenValid = await compare(token, user.refreshTokenHash);
    if (!isRefreshTokenValid) {
      await this.prisma.user.update({
        where: { id: user.id },
        data: {
          refreshTokenHash: null,
          refreshTokenVersion: { increment: 1 },
          refreshTokenCompromisedAt: new Date(),
        },
      });
      throw new UnauthorizedException('Invalid refresh token');
    }
    const { accessToken, refreshToken } = await this.issueTokenPair(user);
    return {
      accessToken,
      refreshToken,
    };
  }

  async logout(userId: string) {
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        refreshTokenHash: null,
        refreshTokenVersion: { increment: 1 },
      },
    });
    return { success: true };
  }

  async me(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { roles: true },
    });
    if (!user) {
      throw new UnauthorizedException('Invalid access token.');
    }
    return this.toMeItem(user);
  }

  async updateProfile(userId: string, dto: { avatarImageUrl?: string; coverImageUrl?: string }) {
    const data: { avatarImageUrl?: string | null; coverImageUrl?: string | null } = {};
    if (dto.avatarImageUrl !== undefined) {
      data.avatarImageUrl = dto.avatarImageUrl.trim() ? dto.avatarImageUrl.trim() : null;
    }
    if (dto.coverImageUrl !== undefined) {
      data.coverImageUrl = dto.coverImageUrl.trim() ? dto.coverImageUrl.trim() : null;
    }
    if (Object.keys(data).length === 0) {
      return this.me(userId);
    }
    const user = await this.prisma.user.update({
      where: { id: userId },
      data,
      include: { roles: true },
    });
    return this.toMeItem(user);
  }

  createProfileMediaUploadUrl(userId: string, payload: { fileName: string; contentType: string }) {
    return this.mediaStorage.createUserUploadUrl({
      userId,
      fileName: payload.fileName,
      contentType: payload.contentType,
    });
  }

  verifyProfileMediaUpload(userId: string, payload: { key: string }) {
    return this.mediaStorage.verifyUserUpload({ userId, key: payload.key });
  }

  async completeProfileImageUpload(userId: string, payload: { key: string; imageKind: 'avatar' | 'cover' }) {
    const verified = await this.mediaStorage.verifyUserUpload({ userId, key: payload.key });
    if (payload.imageKind === 'avatar') {
      return this.updateProfile(userId, { avatarImageUrl: verified.publicUrl });
    }
    return this.updateProfile(userId, { coverImageUrl: verified.publicUrl });
  }

  createTestMediaUploadUrl(payload: { fileName: string; contentType: string }) {
    return this.mediaStorage.createTestUploadUrl(payload);
  }

  verifyTestMediaUpload(payload: { key: string }) {
    return this.mediaStorage.verifyTestUpload(payload);
  }

  uploadTestMediaFile(file: { buffer: Buffer; originalname: string; mimetype: string; size: number }) {
    if (!file?.buffer?.length) {
      throw new BadRequestException('Empty file');
    }
    const contentType = file.mimetype?.trim() ? file.mimetype.trim() : 'application/octet-stream';
    return this.mediaStorage.putTestObject({
      buffer: file.buffer,
      fileName: file.originalname || 'upload.bin',
      contentType,
    });
  }

  async uploadProfileImageFile(
    userId: string,
    file: { buffer: Buffer; originalname: string; mimetype: string; size: number },
    imageKind: 'avatar' | 'cover',
  ) {
    if (!file?.buffer?.length) {
      throw new BadRequestException('Empty file');
    }
    const contentType = file.mimetype?.trim() ? file.mimetype.trim() : 'application/octet-stream';
    const uploaded = await this.mediaStorage.putUserObject({
      userId,
      buffer: file.buffer,
      fileName: file.originalname || `${imageKind}.bin`,
      contentType,
    });
    if (imageKind === 'avatar') {
      return this.updateProfile(userId, { avatarImageUrl: uploaded.publicUrl });
    }
    return this.updateProfile(userId, { coverImageUrl: uploaded.publicUrl });
  }
}
