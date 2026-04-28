import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { AuthUser } from '../../../common/interfaces/auth-user.interface';

@Injectable()
export class SupplierOnlyGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<{ user?: AuthUser }>();
    if (!request.user || !request.user.roles.includes('SUPPLIER')) {
      throw new ForbiddenException('Supplier account required');
    }
    return true;
  }
}
