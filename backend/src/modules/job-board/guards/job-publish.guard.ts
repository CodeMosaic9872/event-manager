import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { AuthUser } from '../../../common/interfaces/auth-user.interface';

@Injectable()
export class JobPublishGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<{ user?: AuthUser }>();
    if (!request.user || request.user.id.startsWith('anonymous:')) {
      throw new ForbiddenException('Account is required to publish a job');
    }
    return true;
  }
}
