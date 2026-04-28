import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { TaxonomyService } from './taxonomy.service';
import { TaxonomyMappingQueryDto } from './dto/taxonomy-mapping-query.dto';
import { ApiPublicErrors } from '../../common/swagger/api-error-responses.decorator';

@ApiTags('Taxonomy')
@ApiPublicErrors()
@Controller('taxonomy')
export class TaxonomyController {
  constructor(private readonly taxonomyService: TaxonomyService) {}

  @Get('event-types')
  @ApiOperation({ summary: 'List active event types' })
  eventTypes() {
    return this.taxonomyService.getEventTypes();
  }

  @Get('categories')
  @ApiOperation({ summary: 'List active marketplace categories' })
  categories() {
    return this.taxonomyService.getCategories();
  }

  @Get('categories/:id/subcategories')
  @ApiOperation({ summary: 'List active subcategories for category' })
  subcategories(@Param('id') categoryId: string) {
    return this.taxonomyService.getSubcategories(categoryId);
  }

  @Get('filter-definitions')
  @ApiOperation({ summary: 'List active global/category filter definitions' })
  filterDefinitions(@Query('categoryId') categoryId?: string) {
    return this.taxonomyService.getFilterDefinitions(categoryId);
  }

  @Get('mapping')
  @ApiOperation({ summary: 'Get eventType-category-subcategory mapping data' })
  mapping(@Query() query: TaxonomyMappingQueryDto) {
    return this.taxonomyService.getMapping(query);
  }
}
