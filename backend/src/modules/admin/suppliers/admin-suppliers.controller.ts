import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiCreatedResponse, ApiOkResponse, ApiOperation } from '@nestjs/swagger';
import { AdminControllerAuth } from '../common/admin-controller.decorator';
import { PaginationQueryDto } from '../../../common/dto/pagination-query.dto';
import {
  ApproveSupplierDto,
  CreateAdminSupplierDto,
  RejectSupplierDto,
  UpdateAdminSupplierDto,
} from '../dto/admin.dto';
import { AdminApproveSupplierResponseDto, AdminSupplierCrudDto } from '../dto/admin-response.dto';
import { AdminSuppliersService } from './admin-suppliers.service';

@AdminControllerAuth()
@Controller('admin')
export class AdminSuppliersController {
  constructor(private readonly adminSuppliersService: AdminSuppliersService) {}

  @Get('suppliers')
  @ApiOperation({ summary: 'List suppliers (admin CRUD)' })
  @ApiOkResponse({
    description: 'Paginated supplier records with owner and subscription summary',
    type: AdminSupplierCrudDto,
    isArray: true,
  })
  suppliers(@Query() query: PaginationQueryDto) {
    return this.adminSuppliersService.listSuppliers(query.page, query.limit);
  }

  @Get('suppliers/incomplete')
  @ApiOperation({ summary: 'List incomplete supplier onboarding records' })
  incompleteSuppliers(@Query() query: PaginationQueryDto) {
    return this.adminSuppliersService.listIncompleteSuppliers(query.page, query.limit);
  }

  @Post('suppliers')
  @ApiOperation({ summary: 'Create a supplier for an existing user (admin)' })
  @ApiCreatedResponse({ type: AdminSupplierCrudDto })
  createSupplier(@Body() body: CreateAdminSupplierDto) {
    return this.adminSuppliersService.createSupplier(body);
  }

  @Get('suppliers/:id')
  @ApiOperation({ summary: 'Get supplier by id (admin)' })
  @ApiOkResponse({ type: AdminSupplierCrudDto })
  getSupplier(@Param('id') id: string) {
    return this.adminSuppliersService.getSupplier(id);
  }

  @Patch('suppliers/:id')
  @ApiOperation({ summary: 'Update supplier by id (admin)' })
  @ApiOkResponse({ type: AdminSupplierCrudDto })
  updateSupplier(@Param('id') id: string, @Body() body: UpdateAdminSupplierDto) {
    return this.adminSuppliersService.updateSupplier(id, body);
  }

  @Delete('suppliers/:id')
  @ApiOperation({ summary: 'Soft-delete supplier by id (admin)' })
  @ApiOkResponse({ type: AdminSupplierCrudDto })
  deleteSupplier(@Param('id') id: string) {
    return this.adminSuppliersService.deleteSupplier(id);
  }

  @Post('suppliers/:id/approve')
  @ApiOperation({ summary: 'Approve supplier profile' })
  @ApiOkResponse({
    description: 'Approved supplier',
    type: AdminApproveSupplierResponseDto,
  })
  approve(@Param('id') id: string, @Body() body: ApproveSupplierDto) {
    return this.adminSuppliersService.approveSupplier(id, body.adminUserId);
  }

  @Post('suppliers/:id/reject')
  @ApiOperation({ summary: 'Reject supplier profile with optional reason' })
  reject(@Param('id') id: string, @Body() body: RejectSupplierDto) {
    return this.adminSuppliersService.rejectSupplier(id, body.reason, body.adminUserId);
  }

  @Post('suppliers/:id/feature')
  feature(@Param('id') id: string) {
    return { id, featured: true };
  }
}
