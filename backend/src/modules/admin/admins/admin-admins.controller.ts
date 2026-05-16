import { Body, Controller, Post } from '@nestjs/common';
import { ApiCreatedResponse, ApiOperation } from '@nestjs/swagger';
import { AdminControllerAuth } from '../common/admin-controller.decorator';
import { AdminAdminsService } from './admin-admins.service';
import { CreateAdminDto } from '../dto/admin.dto';
import { CreateAdminUserResponseDto } from '../dto/admin-response.dto';

@AdminControllerAuth()
@Controller('admin')
export class AdminAdminsController {
  constructor(private readonly adminAdminsService: AdminAdminsService) {}

  @Post('admins')
  @ApiOperation({
    summary: 'Create a new admin user or grant ADMIN to an existing account',
    description:
      'Creates an ACTIVE user with the ADMIN role, or adds ADMIN to an existing user matched by email or phone. Phone is required so the account can complete /auth/login (OTP) with the current auth rules.',
  })
  @ApiCreatedResponse({
    description: 'Created or updated admin user',
    type: CreateAdminUserResponseDto,
  })
  createAdmin(@Body() body: CreateAdminDto) {
    return this.adminAdminsService.createAdmin({ email: body.email, phone: body.phone });
  }
}
