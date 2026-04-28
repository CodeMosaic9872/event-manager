import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { ApiCreatedResponse, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AdminService } from './admin.service';
import { ApiProtectedErrors } from '../../common/swagger/api-error-responses.decorator';
import {
  ApproveSupplierDto,
  CreateCategoryDto,
  CreateEventTypeDto,
  CreateFilterDefinitionDto,
  CreateSubcategoryDto,
  RejectSupplierDto,
  UpdateAutomationRuleDto,
  UpdateCategoryDto,
  UpdateEventTypeDto,
  UpdateFilterDefinitionDto,
  UpdateSubcategoryDto,
} from './dto/admin.dto';
import {
  AdminApproveSupplierResponseDto,
  AdminEventTypeResponseDto,
  AdminSupplierReviewDto,
} from './dto/admin-response.dto';

@ApiTags('Admin')
@ApiProtectedErrors()
@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('suppliers')
  @ApiOperation({ summary: 'List suppliers for admin review' })
  @ApiOkResponse({
    description: 'Supplier records for moderation',
    type: AdminSupplierReviewDto,
    isArray: true,
  })
  suppliers() {
    return this.adminService.listSuppliers();
  }

  @Get('suppliers/incomplete')
  @ApiOperation({ summary: 'List incomplete supplier onboarding records' })
  incompleteSuppliers() {
    return this.adminService.listIncompleteSuppliers();
  }

  @Post('suppliers/:id/approve')
  @ApiOperation({ summary: 'Approve supplier profile' })
  @ApiOkResponse({
    description: 'Approved supplier',
    type: AdminApproveSupplierResponseDto,
  })
  approve(@Param('id') id: string, @Body() body: ApproveSupplierDto) {
    return this.adminService.approveSupplier(id, body.adminUserId);
  }

  @Post('suppliers/:id/reject')
  @ApiOperation({ summary: 'Reject supplier profile with optional reason' })
  reject(@Param('id') id: string, @Body() body: RejectSupplierDto) {
    return this.adminService.rejectSupplier(id, body.reason, body.adminUserId);
  }

  @Post('suppliers/:id/feature')
  feature(@Param('id') id: string) {
    return { id, featured: true };
  }

  @Get('ai/usage')
  @ApiOperation({ summary: 'Get AI usage telemetry for admin' })
  aiUsage() {
    return this.adminService.aiUsage();
  }

  @Get('ai/failures')
  @ApiOperation({ summary: 'Get AI failure summary for admin' })
  aiFailures() {
    return this.adminService.aiFailures();
  }

  @Get('ai/conversations')
  @ApiOperation({ summary: 'Get AI conversations snapshot for admin' })
  aiConversations() {
    return this.adminService.aiConversations();
  }

  @Get('notifications')
  @ApiOperation({ summary: 'List notifications and statuses for admin' })
  notifications() {
    return this.adminService.notifications();
  }

  @Post('notifications/retry/:id')
  @ApiOperation({ summary: 'Retry failed/pending notification by id' })
  retryNotification(@Param('id') id: string) {
    return this.adminService.retryNotification(id);
  }

  @Get('automations/rules')
  automationRules() {
    return this.adminService.automationRules();
  }

  @Patch('automations/rules/:id')
  updateAutomationRule(@Param('id') id: string, @Body() body: UpdateAutomationRuleDto) {
    return { id, updated: true, body };
  }

  @Get('automations/runs')
  automationRuns() {
    return this.adminService.automationRuns();
  }

  @Post('taxonomy/event-types')
  @ApiCreatedResponse({
    description: 'Created event type',
    type: AdminEventTypeResponseDto,
  })
  createEventType(@Body() body: CreateEventTypeDto) {
    return this.adminService.createEventType({
      key: body.key,
      name: body.name,
      isActive: body.isActive,
    });
  }

  @Patch('taxonomy/event-types/:id')
  updateEventType(@Param('id') id: string, @Body() body: UpdateEventTypeDto) {
    return this.adminService.updateEventType(id, {
      key: body.key,
      name: body.name,
      isActive: body.isActive,
    });
  }

  @Post('taxonomy/event-types/:id/delete')
  deleteEventType(@Param('id') id: string) {
    return this.adminService.deleteEventType(id);
  }

  @Post('taxonomy/categories')
  createCategory(@Body() body: CreateCategoryDto) {
    return this.adminService.createCategory({
      key: body.key,
      name: body.name,
      sortOrder: body.sortOrder,
      isActive: body.isActive,
    });
  }

  @Patch('taxonomy/categories/:id')
  updateCategory(@Param('id') id: string, @Body() body: UpdateCategoryDto) {
    return this.adminService.updateCategory(id, {
      key: body.key,
      name: body.name,
      sortOrder: body.sortOrder,
      isActive: body.isActive,
    });
  }

  @Post('taxonomy/categories/:id/delete')
  deleteCategory(@Param('id') id: string) {
    return this.adminService.deleteCategory(id);
  }

  @Post('taxonomy/subcategories')
  createSubcategory(@Body() body: CreateSubcategoryDto) {
    return this.adminService.createSubcategory({
      categoryId: body.categoryId,
      key: body.key,
      name: body.name,
      sortOrder: body.sortOrder,
      isActive: body.isActive,
    });
  }

  @Patch('taxonomy/subcategories/:id')
  updateSubcategory(@Param('id') id: string, @Body() body: UpdateSubcategoryDto) {
    return this.adminService.updateSubcategory(id, {
      categoryId: body.categoryId,
      key: body.key,
      name: body.name,
      sortOrder: body.sortOrder,
      isActive: body.isActive,
    });
  }

  @Post('taxonomy/subcategories/:id/delete')
  deleteSubcategory(@Param('id') id: string) {
    return this.adminService.deleteSubcategory(id);
  }

  @Post('taxonomy/filter-definitions')
  createFilterDefinition(@Body() body: CreateFilterDefinitionDto) {
    return this.adminService.createFilterDefinition({
      scope: body.scope,
      categoryId: body.categoryId,
      key: body.key,
      label: body.label,
      type: body.type,
      optionsJson: body.optionsJson,
      sortOrder: body.sortOrder,
      isActive: body.isActive,
    });
  }

  @Patch('taxonomy/filter-definitions/:id')
  updateFilterDefinition(@Param('id') id: string, @Body() body: UpdateFilterDefinitionDto) {
    return this.adminService.updateFilterDefinition(id, {
      scope: body.scope,
      categoryId: body.categoryId,
      key: body.key,
      label: body.label,
      type: body.type,
      optionsJson: body.optionsJson,
      sortOrder: body.sortOrder,
      isActive: body.isActive,
    });
  }

  @Post('taxonomy/filter-definitions/:id/delete')
  deleteFilterDefinition(@Param('id') id: string) {
    return this.adminService.deleteFilterDefinition(id);
  }
}
