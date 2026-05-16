import { Body, Controller, Param, Patch, Post } from '@nestjs/common';
import { ApiCreatedResponse } from '@nestjs/swagger';
import { AdminControllerAuth } from '../common/admin-controller.decorator';
import {
  CreateCategoryDto,
  CreateEventTypeDto,
  CreateFilterDefinitionDto,
  CreateSubcategoryDto,
  UpdateCategoryDto,
  UpdateEventTypeDto,
  UpdateFilterDefinitionDto,
  UpdateSubcategoryDto,
} from '../dto/admin.dto';
import { AdminEventTypeResponseDto } from '../dto/admin-response.dto';
import { AdminTaxonomyService } from './admin-taxonomy.service';

@AdminControllerAuth()
@Controller('admin')
export class AdminTaxonomyController {
  constructor(private readonly adminTaxonomyService: AdminTaxonomyService) {}

  @Post('taxonomy/event-types')
  @ApiCreatedResponse({
    description: 'Created event type',
    type: AdminEventTypeResponseDto,
  })
  createEventType(@Body() body: CreateEventTypeDto) {
    return this.adminTaxonomyService.createEventType({
      key: body.key,
      name: body.name,
      isActive: body.isActive,
    });
  }

  @Patch('taxonomy/event-types/:id')
  updateEventType(@Param('id') id: string, @Body() body: UpdateEventTypeDto) {
    return this.adminTaxonomyService.updateEventType(id, {
      key: body.key,
      name: body.name,
      isActive: body.isActive,
    });
  }

  @Post('taxonomy/event-types/:id/delete')
  deleteEventType(@Param('id') id: string) {
    return this.adminTaxonomyService.deleteEventType(id);
  }

  @Post('taxonomy/categories')
  createCategory(@Body() body: CreateCategoryDto) {
    return this.adminTaxonomyService.createCategory({
      key: body.key,
      name: body.name,
      sortOrder: body.sortOrder,
      isActive: body.isActive,
    });
  }

  @Patch('taxonomy/categories/:id')
  updateCategory(@Param('id') id: string, @Body() body: UpdateCategoryDto) {
    return this.adminTaxonomyService.updateCategory(id, {
      key: body.key,
      name: body.name,
      sortOrder: body.sortOrder,
      isActive: body.isActive,
    });
  }

  @Post('taxonomy/categories/:id/delete')
  deleteCategory(@Param('id') id: string) {
    return this.adminTaxonomyService.deleteCategory(id);
  }

  @Post('taxonomy/subcategories')
  createSubcategory(@Body() body: CreateSubcategoryDto) {
    return this.adminTaxonomyService.createSubcategory({
      categoryId: body.categoryId,
      key: body.key,
      name: body.name,
      sortOrder: body.sortOrder,
      isActive: body.isActive,
    });
  }

  @Patch('taxonomy/subcategories/:id')
  updateSubcategory(@Param('id') id: string, @Body() body: UpdateSubcategoryDto) {
    return this.adminTaxonomyService.updateSubcategory(id, {
      categoryId: body.categoryId,
      key: body.key,
      name: body.name,
      sortOrder: body.sortOrder,
      isActive: body.isActive,
    });
  }

  @Post('taxonomy/subcategories/:id/delete')
  deleteSubcategory(@Param('id') id: string) {
    return this.adminTaxonomyService.deleteSubcategory(id);
  }

  @Post('taxonomy/filter-definitions')
  createFilterDefinition(@Body() body: CreateFilterDefinitionDto) {
    return this.adminTaxonomyService.createFilterDefinition({
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
    return this.adminTaxonomyService.updateFilterDefinition(id, {
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
    return this.adminTaxonomyService.deleteFilterDefinition(id);
  }
}
