import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsNumber, IsOptional, IsString, Max, Min } from 'class-validator';

export class ListSuppliersQueryDto {
  @ApiPropertyOptional({
    description: 'Free-text supplier search',
    example: 'dj',
  })
  @IsOptional()
  @IsString()
  q?: string;

  @ApiPropertyOptional({
    description: 'Event type id for constrained mapping',
    example: 'evt_123',
  })
  @IsOptional()
  @IsString()
  eventTypeId?: string;

  @ApiPropertyOptional({
    description: 'Category id filter',
    example: 'cat_123',
  })
  @IsOptional()
  @IsString()
  categoryId?: string;

  @ApiPropertyOptional({
    description: 'Subcategory id filter',
    example: 'sub_123',
  })
  @IsOptional()
  @IsString()
  subcategoryId?: string;

  @ApiPropertyOptional({
    description: 'Region code filter for supplier service area',
    example: 'north',
  })
  @IsOptional()
  @IsString()
  locationRegionCode?: string;

  @ApiPropertyOptional({
    description: 'Minimum supplier rating',
    example: 4.2,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  minRating?: number;

  @ApiPropertyOptional({
    description: 'Page size',
    minimum: 1,
    maximum: 100,
    example: 20,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  take?: number;

  @ApiPropertyOptional({
    description: 'Cursor id for next page',
    example: 'sup_abc123',
  })
  @IsOptional()
  @IsString()
  cursor?: string;

  @ApiPropertyOptional({
    description: 'Comma-separated general attribute filters: mod,reservist,insurance,shabbat',
    example: 'insurance,reservist',
  })
  @IsOptional()
  @IsString()
  general?: string;

  @ApiPropertyOptional({
    description: 'Comma-separated niche filters: mehadrin,accessible,parking,disability,outdoor',
    example: 'accessible,parking',
  })
  @IsOptional()
  @IsString()
  niche?: string;

  @ApiPropertyOptional({
    description: 'Supplier must list this extra language code (e.g. en, ar, ru, am)',
    example: 'en',
  })
  @IsOptional()
  @IsString()
  lang?: string;
}
