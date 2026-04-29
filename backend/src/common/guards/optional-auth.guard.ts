import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { AuthUser } from '../interfaces/auth-user.interface';
import { verifyAccessToken } from '../utils/jwt.util';

@Injectable()
export class OptionalAuthGuard implements CanActivate {
  constructor(private readonly prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<{
      headers: Record<string, string | string[] | undefined>;
      user?: AuthUser;
    }>();

    const authHeader = request.headers.authorization;
    const headerValue = Array.isArray(authHeader) ? authHeader[0] : authHeader;
    const token = headerValue?.startsWith('Bearer ') ? headerValue.slice(7) : undefined;

    if (!token) {
      return true;
    }

    if (token.startsWith('anon_')) {
      const anonymousSession = await this.prisma.anonymousSession.findUnique({
        where: { token },
      });
      if (anonymousSession) {
        request.user = {
          id: `anonymous:${anonymousSession.id}`,
          roles: ['USER'],
          anonymousSessionId: anonymousSession.id,
        };
      }
      return true;
    }

    try {
      const decoded = verifyAccessToken(token);
      const user = await this.prisma.user.findUnique({
        where: { id: decoded.sub },
        include: { roles: true },
      });
      if (user && user.status === 'ACTIVE') {
        request.user = {
          id: user.id,
          email: user.email ?? undefined,
          roles: user.roles.map((roleRow) => roleRow.role),
        };
      }
    } catch {
      // Intentionally ignore invalid optional token.
    }

    return true;
  }
}
