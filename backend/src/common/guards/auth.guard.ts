import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { AuthUser } from '../interfaces/auth-user.interface';
import { verifyAccessToken } from '../utils/jwt.util';

@Injectable()
export class AuthGuard implements CanActivate {
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
      throw new UnauthorizedException('Missing bearer token');
    }

    if (token.startsWith('anon_')) {
      const anonymousSession = await this.prisma.anonymousSession.findUnique({
        where: { token },
      });

      if (!anonymousSession) {
        throw new UnauthorizedException('Invalid anonymous token');
      }

      request.user = {
        id: `anonymous:${anonymousSession.id}`,
        roles: ['USER'],
        anonymousSessionId: anonymousSession.id,
      };
      return true;
    }

    let decoded: ReturnType<typeof verifyAccessToken>;
    try {
      decoded = verifyAccessToken(token);
    } catch {
      throw new UnauthorizedException('Invalid user token');
    }

    const user = await this.prisma.user.findUnique({
      where: { id: decoded.sub },
      include: { roles: true },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid user token');
    }

    request.user = {
      id: user.id,
      email: user.email ?? undefined,
      roles: decoded.roles,
    };
    return true;
  }
}
