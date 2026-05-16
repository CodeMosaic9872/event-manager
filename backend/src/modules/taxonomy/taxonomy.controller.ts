import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { ApiOkEnvelopePaginated } from '../../common/swagger/api-response.decorators';
import { TaxonomyService } from './taxonomy.service';
import { TaxonomyMappingQueryDto } from './dto/taxonomy-mapping-query.dto';
import {
  PaginatedCategoriesResponseDto,
  PaginatedEventTypesResponseDto,
  PaginatedFilterDefinitionsResponseDto,
  PaginatedSubcategoriesResponseDto,
  TaxonomyMappingListResponseDto,
} from './dto/taxonomy-response.dto';
import { ApiPublicErrors } from '../../common/swagger/api-error-responses.decorator';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';

@ApiTags('Taxonomy')
@ApiPublicErrors()
@Controller('taxonomy')
export class TaxonomyController {
  constructor(private readonly taxonomyService: TaxonomyService) {}

  @Get('event-types')
  @ApiOperation({ summary: 'List active event types' })
  @ApiOkEnvelopePaginated(PaginatedEventTypesResponseDto)
  eventTypes(@Query() query: PaginationQueryDto) {
    return this.taxonomyService.getEventTypes(query.page, query.limit);
  }

  @Get('categories')
  @ApiOperation({ summary: 'List active marketplace categories' })
  @ApiOkEnvelopePaginated(PaginatedCategoriesResponseDto)
  categories(@Query() query: PaginationQueryDto) {
    return this.taxonomyService.getCategories(query.page, query.limit);
  }

  @Get('categories/:id/subcategories')
  @ApiOperation({ summary: 'List active subcategories for category' })
  @ApiOkEnvelopePaginated(PaginatedSubcategoriesResponseDto)
  subcategories(@Param('id') categoryId: string, @Query() query: PaginationQueryDto) {
    return this.taxonomyService.getSubcategories(categoryId, query.page, query.limit);
  }

  @Get('filter-definitions')
  @ApiOperation({ summary: 'List active global/category filter definitions' })
  @ApiQuery({
    name: 'categoryId',
    required: false,
    description: 'When set, includes CATEGORY-scoped definitions for this category plus GLOBAL scope',
  })
  @ApiOkEnvelopePaginated(PaginatedFilterDefinitionsResponseDto)
  filterDefinitions(
    @Query('categoryId') categoryId: string | undefined,
    @Query() pagination: PaginationQueryDto,
  ) {
    return this.taxonomyService.getFilterDefinitions(categoryId, pagination.page, pagination.limit);
  }

  @Get('mapping')
  @ApiOperation({ summary: 'Get eventType-category-subcategory mapping data' })
  @ApiOkEnvelopePaginated(TaxonomyMappingListResponseDto)
  mapping(@Query() query: TaxonomyMappingQueryDto & PaginationQueryDto) {
    return this.taxonomyService.getMapping(query, query.page, query.limit);
  }
}
