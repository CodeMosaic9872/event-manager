import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiBody, ApiCreatedResponse, ApiNotFoundResponse, ApiOkResponse, ApiOperation, ApiParam } from '@nestjs/swagger';
import { ApiOkEnvelopeData, ApiOkEnvelopePaginatedItems } from '../../../common/swagger/api-response.decorators';
import { AdminControllerAuth } from '../common/admin-controller.decorator';
import { PaginationQueryDto } from '../../../common/dto/pagination-query.dto';
import {
  ApproveSupplierDto,
  AdminListSuppliersQueryDto,
  CreateAdminSupplierDto,
  RejectSupplierDto,
  UpdateAdminSupplierDto,
} from '../dto/admin.dto';
import {
  AdminApproveSupplierResponseDto,
  AdminSupplierCrudDto,
  AdminSupplierListItemDto,
} from '../dto/admin-response.dto';
import {
  AdminFeatureSupplierResponseDto,
  AdminSupplierDraftIncompleteItemDto,
  AdminSupplierExportDto,
  AdminSupplierFilterOptionsDto,
  AdminSupplierStatsDto,
} from '../dto/admin-swagger-responses.dto';
import { UpsertSupplierProfileDto } from '../../suppliers/dto/upsert-supplier-profile.dto';
import { SupplierProfileResponseDto } from '../../suppliers/dto/suppliers-response.dto';
import { AdminSuppliersService } from './admin-suppliers.service';

@AdminControllerAuth()
@Controller('admin')
export class AdminSuppliersController {
  constructor(private readonly adminSuppliersService: AdminSuppliersService) {}

  @Get('suppliers')
  @ApiOperation({
    summary: 'List suppliers for admin management (search, status, category, region filters)',
  })
  @ApiOkEnvelopePaginatedItems(AdminSupplierListItemDto, {
    description: 'Paginated supplier rows with categories, contact, labels, and social links',
  })
  suppliers(@Query() query: AdminListSuppliersQueryDto) {
    return this.adminSuppliersService.listSuppliers(query);
  }

  @Get('suppliers/stats')
  @ApiOperation({ summary: 'Summary counts for supplier management header cards' })
  @ApiOkEnvelopeData(AdminSupplierStatsDto)
  supplierStats() {
    return this.adminSuppliersService.getSupplierStats();
  }

  @Get('suppliers/filter-options')
  @ApiOperation({ summary: 'Category and service-area options for supplier management filters' })
  @ApiOkEnvelopeData(AdminSupplierFilterOptionsDto)
  supplierFilterOptions() {
    return this.adminSuppliersService.getFilterOptions();
  }

  @Get('suppliers/export')
  @ApiOperation({ summary: 'Export filtered suppliers as CSV (UTF-8 with BOM for Excel)' })
  @ApiOkEnvelopeData(AdminSupplierExportDto)
  exportSuppliers(@Query() query: AdminListSuppliersQueryDto) {
    return this.adminSuppliersService.exportSuppliersCsv(query);
  }

  @Get('suppliers/incomplete')
  @ApiOperation({ summary: 'List incomplete supplier onboarding records' })
  @ApiOkEnvelopePaginatedItems(AdminSupplierDraftIncompleteItemDto, {
    description: 'Incomplete supplier onboarding drafts',
  })
  incompleteSuppliers(@Query() query: PaginationQueryDto) {
    return this.adminSuppliersService.listIncompleteSuppliers(query.page, query.limit);
  }

  @Post('suppliers')
  @ApiOperation({
    summary: 'Create a supplier row for an existing user (admin)',
    description:
      'Creates (or restores) the supplier profile for `ownerUserId` from `POST /v1/admin/users/supplier` or an existing user.\n\n' +
      'Use `PATCH /v1/admin/suppliers/{id}/profile` afterward for categories, labels, social links, and gallery URLs.',
  })
  @ApiCreatedResponse({ type: AdminSupplierCrudDto })
  createSupplier(@Body() body: CreateAdminSupplierDto) {
    return this.adminSuppliersService.createSupplier(body);
  }

  @Get('suppliers/:id')
  @ApiOperation({ summary: 'Get supplier by id (admin, full management row)' })
  @ApiOkEnvelopeData(AdminSupplierListItemDto)
  getSupplier(@Param('id') id: string) {
    return this.adminSuppliersService.getSupplier(id);
  }

  @Patch('suppliers/:id/profile')
  @ApiOperation({
    summary: 'Update supplier marketplace profile (admin)',
    description:
      'Admin path to the same profile fields as `PATCH /v1/supplier/profile`: categories, service areas, social links, labels, address, gallery URLs, etc.\n\n' +
      'Call after `POST /v1/admin/suppliers` once the supplier row exists.',
  })
  @ApiParam({ name: 'id', description: 'Supplier id', example: 'sup_abc123' })
  @ApiBody({ type: UpsertSupplierProfileDto })
  @ApiOkResponse({
    description: 'Updated public supplier profile aggregate',
    type: SupplierProfileResponseDto,
  })
  @ApiNotFoundResponse({ description: 'Supplier not found' })
  updateSupplierProfile(@Param('id') id: string, @Body() body: UpsertSupplierProfileDto) {
    return this.adminSuppliersService.updateSupplierProfile(id, body);
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
  @ApiOkResponse({ type: AdminApproveSupplierResponseDto })
  approve(@Param('id') id: string, @Body() body: ApproveSupplierDto) {
    return this.adminSuppliersService.approveSupplier(id, body.adminUserId);
  }

  @Post('suppliers/:id/reject')
  @ApiOperation({ summary: 'Reject supplier profile with optional reason' })
  @ApiOkResponse({ type: AdminApproveSupplierResponseDto })
  reject(@Param('id') id: string, @Body() body: RejectSupplierDto) {
    return this.adminSuppliersService.rejectSupplier(id, body.reason, body.adminUserId);
  }

  @Post('suppliers/:id/feature')
  @ApiOperation({ summary: 'Mark supplier as featured (stub)' })
  @ApiOkResponse({ type: AdminFeatureSupplierResponseDto })
  feature(@Param('id') id: string) {
    return { id, featured: true };
  }
}
