import { Body, Controller, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiCreatedResponse, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AdminService } from './admin.service';
import { ApiProtectedErrors } from '../../common/swagger/api-error-responses.decorator';
import { AuthGuard } from '../../common/guards/auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';
import {
  ApproveSupplierDto,
  CreateCategoryDto,
  CreateEventTypeDto,
  CreateFilterDefinitionDto,
  CreateSubcategoryDto,
  RejectSupplierDto,
  ModerateJobApplicationDto,
  UpdateAutomationRuleDto,
  UpdateCategoryDto,
  UpdateEventTypeDto,
  UpdateFilterDefinitionDto,
  UpdateSubcategoryDto,
} from './dto/admin.dto';
import {
  AdminApproveSupplierResponseDto,
  AdminEventTypeResponseDto,
  AdminNotificationProvidersHealthResponseDto,
  AdminSupplierReviewDto,
  AdminUserListItemDto,
} from './dto/admin-response.dto';

@ApiTags('Admin')
@ApiProtectedErrors()
@UseGuards(AuthGuard, RolesGuard)
@Roles('ADMIN')
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
  suppliers(@Query() query: PaginationQueryDto) {
    return this.adminService.listSuppliers(query.page, query.limit);
  }

  @Get('users')
  @ApiOperation({ summary: 'List all users including incomplete and unpaid' })
  @ApiOkResponse({
    description: 'User records for admin',
    type: AdminUserListItemDto,
    isArray: true,
  })
  users(@Query() query: PaginationQueryDto) {
    return this.adminService.listUsers(query.page, query.limit);
  }

  @Get('users/incomplete')
  @ApiOperation({ summary: 'List incomplete user registrations' })
  @ApiOkResponse({
    description: 'Incomplete user records',
    type: AdminUserListItemDto,
    isArray: true,
  })
  incompleteUsers(@Query() query: PaginationQueryDto) {
    return this.adminService.listIncompleteUsers(query.page, query.limit);
  }

  @Get('users/unpaid')
  @ApiOperation({ summary: 'List supplier users without a successful (PAID) CardCom registration payment' })
  @ApiOkResponse({
    description: 'Unpaid user records',
    type: AdminUserListItemDto,
    isArray: true,
  })
  unpaidUsers(@Query() query: PaginationQueryDto) {
    return this.adminService.listUnpaidUsers(query.page, query.limit);
  }

  @Get('suppliers/incomplete')
  @ApiOperation({ summary: 'List incomplete supplier onboarding records' })
  incompleteSuppliers(@Query() query: PaginationQueryDto) {
    return this.adminService.listIncompleteSuppliers(query.page, query.limit);
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
  aiUsage(@Query() query: PaginationQueryDto) {
    return this.adminService.aiUsage(query.page, query.limit);
  }

  @Get('ai/failures')
  @ApiOperation({ summary: 'Get AI failure summary for admin' })
  aiFailures() {
    return this.adminService.aiFailures();
  }

  @Get('ai/conversations')
  @ApiOperation({ summary: 'Get AI conversations snapshot for admin' })
  aiConversations(@Query() query: PaginationQueryDto) {
    return this.adminService.aiConversations(query.page, query.limit);
  }

  @Get('ai/recommendations/top')
  @ApiOperation({ summary: 'Get top recommended suppliers by AI logs' })
  aiTopRecommendations() {
    return this.adminService.aiTopRecommendations();
  }

  @Get('ai/recommendations/quality')
  @ApiOperation({ summary: 'Get AI recommendation quality metrics (CTR/acceptance)' })
  aiRecommendationQuality() {
    return this.adminService.aiRecommendationQuality();
  }

  @Get('ai/performance')
  @ApiOperation({ summary: 'Get AI retrieval performance metrics and hit-rate' })
  aiPerformance() {
    return this.adminService.aiPerformance();
  }

  @Get('notifications')
  @ApiOperation({ summary: 'List notifications and statuses for admin' })
  notifications(@Query() query: PaginationQueryDto) {
    return this.adminService.notifications(query.page, query.limit);
  }

  @Get('notifications/providers/health')
  @ApiOperation({ summary: 'Get delivery provider health per notification channel' })
  @ApiOkResponse({
    description: 'Provider health status for email, push, and sms channels',
    type: AdminNotificationProvidersHealthResponseDto,
  })
  notificationProvidersHealth() {
    return this.adminService.notificationProvidersHealth();
  }

  @Get('jobs')
  @ApiOperation({ summary: 'List all job posts for admin moderation' })
  jobs(@Query() query: PaginationQueryDto) {
    return this.adminService.listJobs(query.page, query.limit);
  }

  @Get('jobs/applications')
  @ApiOperation({ summary: 'List job applications for admin moderation' })
  jobApplications(@Query('jobId') jobId?: string, @Query() query?: PaginationQueryDto) {
    return this.adminService.listJobApplications(jobId, query?.page, query?.limit);
  }

  @Post('jobs/:id/archive')
  @ApiOperation({ summary: 'Archive a job post as admin' })
  archiveJob(@Param('id') id: string) {
    return this.adminService.archiveJob(id);
  }

  @Post('jobs/applications/:id/status')
  @ApiOperation({ summary: 'Moderate job application status with optional reason' })
  moderateJobApplication(@Param('id') id: string, @Body() body: ModerateJobApplicationDto) {
    return this.adminService.moderateJobApplication(id, body.status, body.reason);
  }

  @Post('notifications/retry/:id')
  @ApiOperation({ summary: 'Retry failed/pending notification by id' })
  retryNotification(@Param('id') id: string) {
    return this.adminService.retryNotification(id);
  }

  @Get('automations/rules')
  automationRules(@Query() query: PaginationQueryDto) {
    return this.adminService.automationRules(query.page, query.limit);
  }

  @Patch('automations/rules/:id')
  updateAutomationRule(@Param('id') id: string, @Body() body: UpdateAutomationRuleDto) {
    return this.adminService.updateAutomationRule(id, {
      isActive: body.isActive,
      config: body.config,
    });
  }

  @Get('automations/runs')
  automationRuns(@Query() query: PaginationQueryDto) {
    return this.adminService.automationRuns(query.page, query.limit);
  }

  @Post('automations/runs/process')
  @ApiOperation({ summary: 'Process pending automation notification runs' })
  processAutomationRuns(@Query('limit') limit?: string) {
    const parsed = Number(limit);
    return this.adminService.processAutomationRuns(Number.isFinite(parsed) && parsed > 0 ? parsed : 50);
  }

  @Get('automations/metrics')
  @ApiOperation({ summary: 'Get automation queue metrics' })
  automationMetrics() {
    return this.adminService.automationMetrics();
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
