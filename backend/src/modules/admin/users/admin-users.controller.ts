import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { ApiConflictResponse, ApiCreatedResponse, ApiOperation } from '@nestjs/swagger';
import { ApiOkEnvelopePaginatedItems } from '../../../common/swagger/api-response.decorators';
import { AdminControllerAuth } from '../common/admin-controller.decorator';
import { PaginationQueryDto } from '../../../common/dto/pagination-query.dto';
import { CreateAdminSupplierUserDto } from '../dto/admin.dto';
import { AdminSupplierUserCreatedDto, AdminUserRecordDto } from '../dto/admin-swagger-responses.dto';
import { AdminUsersService } from './admin-users.service';

@AdminControllerAuth()
@Controller('admin')
export class AdminUsersController {
  constructor(private readonly adminUsersService: AdminUsersService) {}

  @Post('users/supplier')
  @ApiOperation({
    summary: 'Provision a supplier login user (admin, no OTP)',
    description:
      'Creates an **ACTIVE** user with the **SUPPLIER** role so an admin can attach a supplier profile via `POST /v1/admin/suppliers`.\n\n' +
      'The supplier signs in later using the normal OTP flow (`POST /v1/auth/request-otp` → `POST /v1/auth/login`) with this email or phone.\n\n' +
      'Returns **409 Conflict** if a user already exists with the same email **or** phone.',
  })
  @ApiCreatedResponse({
    description: 'Created supplier user',
    type: AdminSupplierUserCreatedDto,
  })
  @ApiConflictResponse({ description: 'User already exists (email or phone)' })
  createSupplierUser(@Body() body: CreateAdminSupplierUserDto) {
    return this.adminUsersService.createSupplierUser(body);
  }

  @Get('users')
  @ApiOperation({ summary: 'List all users including incomplete and unpaid' })
  @ApiOkEnvelopePaginatedItems(AdminUserRecordDto, { description: 'User records for admin' })
  users(@Query() query: PaginationQueryDto) {
    return this.adminUsersService.listUsers(query.page, query.limit);
  }

  @Get('users/incomplete')
  @ApiOperation({ summary: 'List incomplete user registrations' })
  @ApiOkEnvelopePaginatedItems(AdminUserRecordDto, { description: 'Incomplete user records' })
  incompleteUsers(@Query() query: PaginationQueryDto) {
    return this.adminUsersService.listIncompleteUsers(query.page, query.limit);
  }

  @Get('users/unpaid')
  @ApiOperation({ summary: 'List supplier users without a successful (PAID) CardCom registration payment' })
  @ApiOkEnvelopePaginatedItems(AdminUserRecordDto, { description: 'Unpaid user records' })
  unpaidUsers(@Query() query: PaginationQueryDto) {
    return this.adminUsersService.listUnpaidUsers(query.page, query.limit);
  }
}
