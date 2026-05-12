import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

class TaxonomyIdKeyNameDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  key!: string;

  @ApiProperty()
  name!: string;
}

export class EventTypeRowDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  key!: string;

  @ApiProperty()
  name!: string;

  @ApiPropertyOptional({ nullable: true })
  nameEn!: string | null;

  @ApiProperty()
  isActive!: boolean;

  @ApiProperty()
  createdAt!: Date;

  @ApiProperty()
  updatedAt!: Date;
}

export class CategoryRowDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  key!: string;

  @ApiProperty()
  name!: string;

  @ApiPropertyOptional({ nullable: true })
  nameEn!: string | null;

  @ApiProperty()
  isActive!: boolean;

  @ApiProperty()
  sortOrder!: number;

  @ApiProperty()
  createdAt!: Date;

  @ApiProperty()
  updatedAt!: Date;
}

export class SubcategoryRowDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  categoryId!: string;

  @ApiProperty()
  key!: string;

  @ApiProperty()
  name!: string;

  @ApiPropertyOptional({ nullable: true })
  nameEn!: string | null;

  @ApiProperty()
  isActive!: boolean;

  @ApiProperty()
  sortOrder!: number;

  @ApiProperty()
  createdAt!: Date;

  @ApiProperty()
  updatedAt!: Date;
}

export class FilterDefinitionRowDto {
  @ApiProperty()
  id!: string;

  @ApiProperty({ description: 'GLOBAL or CATEGORY' })
  scope!: string;

  @ApiPropertyOptional({ nullable: true })
  categoryId!: string | null;

  @ApiProperty()
  key!: string;

  @ApiProperty()
  label!: string;

  @ApiProperty()
  type!: string;

  @ApiPropertyOptional({
    nullable: true,
    type: Object,
    description: 'JSON-encoded options when the filter type warrants structured choices',
  })
  optionsJson!: Record<string, unknown> | null;

  @ApiProperty()
  isActive!: boolean;

  @ApiProperty()
  sortOrder!: number;

  @ApiProperty()
  createdAt!: Date;

  @ApiProperty()
  updatedAt!: Date;
}

export class PaginatedEventTypesResponseDto {
  @ApiProperty({ type: [EventTypeRowDto] })
  items!: EventTypeRowDto[];

  @ApiProperty()
  totalItems!: number;
}

export class PaginatedCategoriesResponseDto {
  @ApiProperty({ type: [CategoryRowDto] })
  items!: CategoryRowDto[];

  @ApiProperty()
  totalItems!: number;
}

export class PaginatedSubcategoriesResponseDto {
  @ApiProperty({ type: [SubcategoryRowDto] })
  items!: SubcategoryRowDto[];

  @ApiProperty()
  totalItems!: number;
}

export class PaginatedFilterDefinitionsResponseDto {
  @ApiProperty({ type: [FilterDefinitionRowDto] })
  items!: FilterDefinitionRowDto[];

  @ApiProperty()
  totalItems!: number;
}

export class TaxonomyMappingRowDto {
  @ApiProperty({ type: TaxonomyIdKeyNameDto })
  eventType!: TaxonomyIdKeyNameDto;

  @ApiProperty({ type: TaxonomyIdKeyNameDto })
  category!: TaxonomyIdKeyNameDto;

  @ApiProperty({ type: TaxonomyIdKeyNameDto })
  subcategory!: TaxonomyIdKeyNameDto;

  @ApiProperty()
  priority!: number;

  @ApiProperty()
  isDefault!: boolean;
}

export class TaxonomyMappingListResponseDto {
  @ApiProperty({
    example: { eventTypeId: null, categoryId: null },
    description: 'Echo of query filters applied to this response',
  })
  filters!: { eventTypeId: string | null; categoryId: string | null };

  @ApiProperty({ description: 'Number of mapping rows returned in this page (`items.length`)' })
  count!: number;

  @ApiProperty({ description: 'Total mappings matching the filter (across all pages)' })
  totalItems!: number;

  @ApiProperty({ type: [TaxonomyMappingRowDto] })
  items!: TaxonomyMappingRowDto[];
}
