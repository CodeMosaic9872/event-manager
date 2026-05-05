import { Injectable, Optional, UnauthorizedException } from '@nestjs/common';
import { compare, hash } from 'bcryptjs';
import { randomBytes, randomUUID } from 'crypto';
import { PrismaService } from '../../prisma/prisma.service';
import { PlatformRole } from '../../common/constants/roles.constant';
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '../../common/utils/jwt.util';
import { AutomationService } from '../notifications/automation.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    @Optional() private readonly automationService?: AutomationService,
  ) {}

  private ensureActiveStatus(status: 'ACTIVE' | 'INACTIVE' | 'BLOCKED') {
    if (status !== 'ACTIVE') {
      throw new UnauthorizedException('User account is not active');
    }
  }

  private toAuthUserSummary(user: { id: string; email?: string | null; roles: { role: PlatformRole }[] }) {
    return {
      id: user.id,
      email: user.email ?? '',
      roles: user.roles.map((roleRow) => roleRow.role),
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

  async register(payload: { email: string; password?: string; role?: PlatformRole }) {
    const role = payload.role ?? 'USER';
    const existing = await this.prisma.user.findUnique({ where: { email: payload.email } });
    if (existing) {
      this.ensureActiveStatus(existing.status);
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
      if (payload.password && !existing.passwordHash) {
        await this.prisma.user.update({
          where: { id: existing.id },
          data: { passwordHash: await hash(payload.password, 10) },
        });
      }
      const { accessToken, refreshToken } = await this.issueTokenPair(fullUser);
      await this.automationService?.publish({
        eventId: `evt_user_registered_${existing.id}`,
        type: 'user.registered',
        payload: {
          userId: existing.id,
          email: existing.email,
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
        passwordHash: payload.password ? await hash(payload.password, 10) : null,
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

  async login(payload: { email: string; password?: string }) {
    const user = await this.prisma.user.findUnique({
      where: { email: payload.email },
      include: { roles: true },
    });
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }
    this.ensureActiveStatus(user.status);
    if (!user.passwordHash || !payload.password) {
      throw new UnauthorizedException('Invalid credentials');
    }
    const isPasswordValid = await compare(payload.password, user.passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }
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
      throw new UnauthorizedException('Invalid refresh token');
    }
    this.ensureActiveStatus(user.status);
    if (!user.refreshTokenHash) {
      throw new UnauthorizedException('Refresh token was revoked');
    }
    if (decoded.ver !== user.refreshTokenVersion) {
      throw new UnauthorizedException('Refresh token was revoked');
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
      throw new UnauthorizedException('Invalid token');
    }
    return {
      items: [this.toAuthUserSummary(user)],
      totalItems: 1,
    };
  }
}
