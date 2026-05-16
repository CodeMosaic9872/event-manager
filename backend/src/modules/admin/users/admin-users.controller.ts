import { Controller, Get, Query } from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';
import { ApiOkEnvelopePaginatedItems } from '../../../common/swagger/api-response.decorators';
import { AdminControllerAuth } from '../common/admin-controller.decorator';
import { PaginationQueryDto } from '../../../common/dto/pagination-query.dto';
import { AdminUsersService } from './admin-users.service';
import { AdminUserRecordDto } from '../dto/admin-swagger-responses.dto';

@AdminControllerAuth()
@Controller('admin')
export class AdminUsersController {
  constructor(private readonly adminUsersService: AdminUsersService) {}

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
