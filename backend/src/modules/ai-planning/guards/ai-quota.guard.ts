import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { AuthUser } from '../../../common/interfaces/auth-user.interface';

@Injectable()
export class AiQuotaGuard implements CanActivate {
  constructor(private readonly prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<{
      headers: Record<string, string | string[] | undefined>;
      body?: { anonymousToken?: string };
      user?: AuthUser;
    }>();

    const body = request.body ?? {};
    const userId = request.user?.id;
    const anonymousToken = body.anonymousToken ?? null;

    if (userId && !userId.startsWith('anonymous:')) {
      return true;
    }
    if (!anonymousToken) {
      throw new ForbiddenException('Anonymous token required');
    }

    const session = await this.prisma.anonymousSession.findUnique({
      where: { token: anonymousToken },
    });
    if (!session) {
      throw new ForbiddenException('Invalid anonymous session');
    }

    const usage = await this.prisma.aiUsageCounter.findUnique({
      where: { anonymousSessionId: session.id },
    });

    if ((usage?.messageCount ?? 0) >= 10) {
      throw new ForbiddenException('Registration required to continue AI planning');
    }

    return true;
  }
}
