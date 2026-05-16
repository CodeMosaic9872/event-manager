import { Controller, Get, Query } from '@nestjs/common';
import { ApiOkResponse, ApiOperation } from '@nestjs/swagger';
import { AdminControllerAuth } from '../common/admin-controller.decorator';
import { PaginationQueryDto } from '../../../common/dto/pagination-query.dto';
import { AdminUsersService } from './admin-users.service';
import { AdminUserListItemDto } from '../dto/admin-response.dto';

@AdminControllerAuth()
@Controller('admin')
export class AdminUsersController {
  constructor(private readonly adminUsersService: AdminUsersService) {}

  @Get('users')
  @ApiOperation({ summary: 'List all users including incomplete and unpaid' })
  @ApiOkResponse({
    description: 'User records for admin',
    type: AdminUserListItemDto,
    isArray: true,
  })
  users(@Query() query: PaginationQueryDto) {
    return this.adminUsersService.listUsers(query.page, query.limit);
  }

  @Get('users/incomplete')
  @ApiOperation({ summary: 'List incomplete user registrations' })
  @ApiOkResponse({
    description: 'Incomplete user records',
    type: AdminUserListItemDto,
    isArray: true,
  })
  incompleteUsers(@Query() query: PaginationQueryDto) {
    return this.adminUsersService.listIncompleteUsers(query.page, query.limit);
  }

  @Get('users/unpaid')
  @ApiOperation({ summary: 'List supplier users without a successful (PAID) CardCom registration payment' })
  @ApiOkResponse({
    description: 'Unpaid user records',
    type: AdminUserListItemDto,
    isArray: true,
  })
  unpaidUsers(@Query() query: PaginationQueryDto) {
    return this.adminUsersService.listUnpaidUsers(query.page, query.limit);
  }
}
