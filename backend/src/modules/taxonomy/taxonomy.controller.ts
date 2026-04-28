import { Controller, Get, Param, Query } from '@nestjs/common';
import { TaxonomyService } from './taxonomy.service';
import { TaxonomyMappingQueryDto } from './dto/taxonomy-mapping-query.dto';

@Controller('taxonomy')
export class TaxonomyController {
  constructor(private readonly taxonomyService: TaxonomyService) {}

  @Get('event-types')
  eventTypes() {
    return this.taxonomyService.getEventTypes();
  }

  @Get('categories')
  categories() {
    return this.taxonomyService.getCategories();
  }

  @Get('categories/:id/subcategories')
  subcategories(@Param('id') categoryId: string) {
    return this.taxonomyService.getSubcategories(categoryId);
  }

  @Get('filter-definitions')
  filterDefinitions(@Query('categoryId') categoryId?: string) {
    return this.taxonomyService.getFilterDefinitions(categoryId);
  }

  @Get('mapping')
  mapping(@Query() query: TaxonomyMappingQueryDto) {
    return this.taxonomyService.getMapping(query);
  }
}
