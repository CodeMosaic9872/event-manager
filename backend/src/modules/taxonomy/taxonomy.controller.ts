import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { TaxonomyService } from './taxonomy.service';
import { TaxonomyMappingQueryDto } from './dto/taxonomy-mapping-query.dto';
import { ApiPublicErrors } from '../../common/swagger/api-error-responses.decorator';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';

@ApiTags('Taxonomy')
@ApiPublicErrors()
@Controller('taxonomy')
export class TaxonomyController {
  constructor(private readonly taxonomyService: TaxonomyService) {}

  @Get('event-types')
  @ApiOperation({ summary: 'List active event types' })
  eventTypes(@Query() query: PaginationQueryDto) {
    return this.taxonomyService.getEventTypes(query.page, query.limit);
  }

  @Get('categories')
  @ApiOperation({ summary: 'List active marketplace categories' })
  categories(@Query() query: PaginationQueryDto) {
    return this.taxonomyService.getCategories(query.page, query.limit);
  }

  @Get('categories/:id/subcategories')
  @ApiOperation({ summary: 'List active subcategories for category' })
  subcategories(@Param('id') categoryId: string, @Query() query: PaginationQueryDto) {
    return this.taxonomyService.getSubcategories(categoryId, query.page, query.limit);
  }

  @Get('filter-definitions')
  @ApiOperation({ summary: 'List active global/category filter definitions' })
  filterDefinitions(@Query('categoryId') categoryId?: string, @Query() query?: PaginationQueryDto) {
    return this.taxonomyService.getFilterDefinitions(categoryId, query?.page, query?.limit);
  }

  @Get('mapping')
  @ApiOperation({ summary: 'Get eventType-category-subcategory mapping data' })
  mapping(@Query() query: TaxonomyMappingQueryDto & PaginationQueryDto) {
    return this.taxonomyService.getMapping(query, query.page, query.limit);
  }
}
