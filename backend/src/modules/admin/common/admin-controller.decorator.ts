import { applyDecorators, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ApiProtectedErrors } from '../../../common/swagger/api-error-responses.decorator';
import { AuthGuard } from '../../../common/guards/auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';

/** Shared guards and Swagger metadata for all `admin/*` controllers. */
export function AdminControllerAuth() {
  return applyDecorators(
    ApiTags('Admin'),
    ApiProtectedErrors(),
    UseGuards(AuthGuard, RolesGuard),
    Roles('ADMIN'),
  );
}
