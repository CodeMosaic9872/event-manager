import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { AdminService } from './admin.service';

@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('suppliers')
  suppliers() {
    return this.adminService.listSuppliers();
  }

  @Get('suppliers/incomplete')
  incompleteSuppliers() {
    return this.adminService.listIncompleteSuppliers();
  }

  @Post('suppliers/:id/approve')
  approve(@Param('id') id: string, @Body() body: { adminUserId?: string }) {
    return this.adminService.approveSupplier(id, body.adminUserId);
  }

  @Post('suppliers/:id/reject')
  reject(@Param('id') id: string, @Body() body: { reason?: string; adminUserId?: string }) {
    return this.adminService.rejectSupplier(id, body.reason, body.adminUserId);
  }

  @Post('suppliers/:id/feature')
  feature(@Param('id') id: string) {
    return { id, featured: true };
  }

  @Get('ai/usage')
  aiUsage() {
    return this.adminService.aiUsage();
  }

  @Get('ai/failures')
  aiFailures() {
    return this.adminService.aiFailures();
  }

  @Get('ai/conversations')
  aiConversations() {
    return this.adminService.aiConversations();
  }

  @Get('notifications')
  notifications() {
    return this.adminService.notifications();
  }

  @Post('notifications/retry/:id')
  retryNotification(@Param('id') id: string) {
    return this.adminService.retryNotification(id);
  }

  @Get('automations/rules')
  automationRules() {
    return this.adminService.automationRules();
  }

  @Patch('automations/rules/:id')
  updateAutomationRule(@Param('id') id: string, @Body() body: Record<string, unknown>) {
    return { id, updated: true, body };
  }

  @Get('automations/runs')
  automationRuns() {
    return this.adminService.automationRuns();
  }

  @Post('taxonomy/event-types')
  createEventType(@Body() body: Record<string, unknown>) {
    return this.adminService.createEventType({
      key: String(body.key),
      name: String(body.name),
      isActive: body.isActive === undefined ? true : Boolean(body.isActive),
    });
  }

  @Patch('taxonomy/event-types/:id')
  updateEventType(@Param('id') id: string, @Body() body: Record<string, unknown>) {
    return this.adminService.updateEventType(id, {
      key: body.key ? String(body.key) : undefined,
      name: body.name ? String(body.name) : undefined,
      isActive: body.isActive === undefined ? undefined : Boolean(body.isActive),
    });
  }

  @Post('taxonomy/event-types/:id/delete')
  deleteEventType(@Param('id') id: string) {
    return this.adminService.deleteEventType(id);
  }

  @Post('taxonomy/categories')
  createCategory(@Body() body: Record<string, unknown>) {
    return this.adminService.createCategory({
      key: String(body.key),
      name: String(body.name),
      sortOrder: body.sortOrder === undefined ? 0 : Number(body.sortOrder),
      isActive: body.isActive === undefined ? true : Boolean(body.isActive),
    });
  }

  @Patch('taxonomy/categories/:id')
  updateCategory(@Param('id') id: string, @Body() body: Record<string, unknown>) {
    return this.adminService.updateCategory(id, {
      key: body.key ? String(body.key) : undefined,
      name: body.name ? String(body.name) : undefined,
      sortOrder: body.sortOrder === undefined ? undefined : Number(body.sortOrder),
      isActive: body.isActive === undefined ? undefined : Boolean(body.isActive),
    });
  }

  @Post('taxonomy/categories/:id/delete')
  deleteCategory(@Param('id') id: string) {
    return this.adminService.deleteCategory(id);
  }

  @Post('taxonomy/subcategories')
  createSubcategory(@Body() body: Record<string, unknown>) {
    return this.adminService.createSubcategory({
      categoryId: String(body.categoryId),
      key: String(body.key),
      name: String(body.name),
      sortOrder: body.sortOrder === undefined ? 0 : Number(body.sortOrder),
      isActive: body.isActive === undefined ? true : Boolean(body.isActive),
    });
  }

  @Patch('taxonomy/subcategories/:id')
  updateSubcategory(@Param('id') id: string, @Body() body: Record<string, unknown>) {
    return this.adminService.updateSubcategory(id, {
      categoryId: body.categoryId ? String(body.categoryId) : undefined,
      key: body.key ? String(body.key) : undefined,
      name: body.name ? String(body.name) : undefined,
      sortOrder: body.sortOrder === undefined ? undefined : Number(body.sortOrder),
      isActive: body.isActive === undefined ? undefined : Boolean(body.isActive),
    });
  }

  @Post('taxonomy/subcategories/:id/delete')
  deleteSubcategory(@Param('id') id: string) {
    return this.adminService.deleteSubcategory(id);
  }

  @Post('taxonomy/filter-definitions')
  createFilterDefinition(@Body() body: Record<string, unknown>) {
    return this.adminService.createFilterDefinition({
      scope: String(body.scope),
      categoryId: body.categoryId ? String(body.categoryId) : undefined,
      key: String(body.key),
      label: String(body.label),
      type: String(body.type),
      optionsJson: body.optionsJson,
      sortOrder: body.sortOrder === undefined ? 0 : Number(body.sortOrder),
      isActive: body.isActive === undefined ? true : Boolean(body.isActive),
    });
  }

  @Patch('taxonomy/filter-definitions/:id')
  updateFilterDefinition(@Param('id') id: string, @Body() body: Record<string, unknown>) {
    return this.adminService.updateFilterDefinition(id, {
      scope: body.scope ? String(body.scope) : undefined,
      categoryId: body.categoryId === undefined ? undefined : body.categoryId === null ? null : String(body.categoryId),
      key: body.key ? String(body.key) : undefined,
      label: body.label ? String(body.label) : undefined,
      type: body.type ? String(body.type) : undefined,
      optionsJson: body.optionsJson,
      sortOrder: body.sortOrder === undefined ? undefined : Number(body.sortOrder),
      isActive: body.isActive === undefined ? undefined : Boolean(body.isActive),
    });
  }

  @Post('taxonomy/filter-definitions/:id/delete')
  deleteFilterDefinition(@Param('id') id: string) {
    return this.adminService.deleteFilterDefinition(id);
  }
}
