import { createHash, timingSafeEqual } from 'crypto';
import { Body, Controller, Headers, NotFoundException, Post, UnauthorizedException } from '@nestjs/common';
import { ApiBody, ApiCreatedResponse, ApiHeader, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AdminAdminsService } from '../admin/admins/admin-admins.service';
import { CreateAdminDto } from '../admin/dto/admin.dto';
import { CreateAdminUserResponseDto } from '../admin/dto/admin-response.dto';

function bootstrapSecretsMatch(provided: string, expected: string): boolean {
  const a = createHash('sha256').update(provided, 'utf8').digest();
  const b = createHash('sha256').update(expected, 'utf8').digest();
  return timingSafeEqual(a, b);
}

@ApiTags('Auth')
@Controller('auth')
export class AdminBootstrapController {
  constructor(private readonly adminAdminsService: AdminAdminsService) {}

  @Post('bootstrap-admin')
  @ApiOperation({
    summary: 'Bootstrap the first admin (no JWT)',
    description:
      'Disabled unless ADMIN_BOOTSTRAP_SECRET is set in the environment. Requires header X-Admin-Bootstrap-Secret matching that value. Succeeds only while no user has the ADMIN role; afterward use POST /v1/admin/admins.',
  })
  @ApiHeader({
    name: 'X-Admin-Bootstrap-Secret',
    description: 'Must match the ADMIN_BOOTSTRAP_SECRET environment variable',
    required: true,
  })
  @ApiBody({ type: CreateAdminDto })
  @ApiCreatedResponse({
    description: 'First admin created or existing user promoted',
    type: CreateAdminUserResponseDto,
  })
  bootstrapAdmin(
    @Headers('x-admin-bootstrap-secret') secretHeader: string | string[] | undefined,
    @Body() body: CreateAdminDto,
  ) {
    const expected = process.env.ADMIN_BOOTSTRAP_SECRET?.trim();
    if (!expected) {
      throw new NotFoundException();
    }

    const raw = Array.isArray(secretHeader) ? secretHeader[0] : secretHeader;
    if (!raw || !bootstrapSecretsMatch(raw, expected)) {
      throw new UnauthorizedException('Invalid bootstrap credentials');
    }

    return this.adminAdminsService.bootstrapFirstAdmin({ email: body.email, phone: body.phone });
  }
}
