import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsIn, IsInt, IsObject, IsOptional, IsString, MaxLength, Min } from 'class-validator';

export class ApproveSupplierDto {
  @ApiPropertyOptional({ description: 'Admin user id performing approval', example: 'usr_admin_123' })
  @IsOptional()
  @IsString()
  adminUserId?: string;
}

export class RejectSupplierDto {
  @ApiPropertyOptional({ description: 'Rejection reason', example: 'Incomplete compliance documents' })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  reason?: string;

  @ApiPropertyOptional({ description: 'Admin user id performing rejection', example: 'usr_admin_123' })
  @IsOptional()
  @IsString()
  adminUserId?: string;
}

export class UpdateAutomationRuleDto {
  @ApiPropertyOptional({ description: 'Rule enabled state', example: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({ description: 'Rule config payload' })
  @IsOptional()
  @IsObject()
  config?: Record<string, unknown>;
}

export class CreateEventTypeDto {
  @ApiProperty({ description: 'Event type key', example: 'wedding' })
  @IsString()
  key!: string;

  @ApiProperty({ description: 'Event type label', example: 'Wedding' })
  @IsString()
  name!: string;

  @ApiPropertyOptional({ description: 'Event type active state', example: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class UpdateEventTypeDto {
  @ApiPropertyOptional({ description: 'Event type key', example: 'corporate' })
  @IsOptional()
  @IsString()
  key?: string;

  @ApiPropertyOptional({ description: 'Event type label', example: 'Corporate Event' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ description: 'Event type active state', example: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class CreateCategoryDto {
  @ApiProperty({ description: 'Category key', example: 'music' })
  @IsString()
  key!: string;

  @ApiProperty({ description: 'Category label', example: 'Music' })
  @IsString()
  name!: string;

  @ApiPropertyOptional({ description: 'Category ordering index', example: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  sortOrder?: number;

  @ApiPropertyOptional({ description: 'Category active state', example: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class UpdateCategoryDto {
  @ApiPropertyOptional({ description: 'Category key', example: 'photo' })
  @IsOptional()
  @IsString()
  key?: string;

  @ApiPropertyOptional({ description: 'Category label', example: 'Photography' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ description: 'Category ordering index', example: 2 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  sortOrder?: number;

  @ApiPropertyOptional({ description: 'Category active state', example: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class CreateSubcategoryDto {
  @ApiProperty({ description: 'Parent category id', example: 'cat_123' })
  @IsString()
  categoryId!: string;

  @ApiProperty({ description: 'Subcategory key', example: 'dj' })
  @IsString()
  key!: string;

  @ApiProperty({ description: 'Subcategory label', example: 'DJ' })
  @IsString()
  name!: string;

  @ApiPropertyOptional({ description: 'Subcategory ordering index', example: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  sortOrder?: number;

  @ApiPropertyOptional({ description: 'Subcategory active state', example: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class UpdateSubcategoryDto {
  @ApiPropertyOptional({ description: 'Parent category id', example: 'cat_234' })
  @IsOptional()
  @IsString()
  categoryId?: string;

  @ApiPropertyOptional({ description: 'Subcategory key', example: 'live-band' })
  @IsOptional()
  @IsString()
  key?: string;

  @ApiPropertyOptional({ description: 'Subcategory label', example: 'Live Band' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ description: 'Subcategory ordering index', example: 3 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  sortOrder?: number;

  @ApiPropertyOptional({ description: 'Subcategory active state', example: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class CreateFilterDefinitionDto {
  @ApiProperty({ description: 'Filter scope', enum: ['GLOBAL', 'CATEGORY'], example: 'CATEGORY' })
  @IsString()
  @IsIn(['GLOBAL', 'CATEGORY'])
  scope!: string;

  @ApiPropertyOptional({ description: 'Optional category id for category-scoped filter', example: 'cat_123' })
  @IsOptional()
  @IsString()
  categoryId?: string;

  @ApiProperty({ description: 'Filter key', example: 'price_range' })
  @IsString()
  key!: string;

  @ApiProperty({ description: 'Filter display label', example: 'Price Range' })
  @IsString()
  label!: string;

  @ApiProperty({ description: 'Filter value type', example: 'select' })
  @IsString()
  type!: string;

  @ApiPropertyOptional({ description: 'Optional filter options JSON' })
  @IsOptional()
  optionsJson?: unknown;

  @ApiPropertyOptional({ description: 'Filter ordering index', example: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  sortOrder?: number;

  @ApiPropertyOptional({ description: 'Filter active state', example: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class UpdateFilterDefinitionDto {
  @ApiPropertyOptional({ description: 'Filter scope', enum: ['GLOBAL', 'CATEGORY'], example: 'GLOBAL' })
  @IsOptional()
  @IsString()
  @IsIn(['GLOBAL', 'CATEGORY'])
  scope?: string;

  @ApiPropertyOptional({ description: 'Category id, null to unset', nullable: true, example: null })
  @IsOptional()
  categoryId?: string | null;

  @ApiPropertyOptional({ description: 'Filter key', example: 'guest_count' })
  @IsOptional()
  @IsString()
  key?: string;

  @ApiPropertyOptional({ description: 'Filter display label', example: 'Guest Count' })
  @IsOptional()
  @IsString()
  label?: string;

  @ApiPropertyOptional({ description: 'Filter value type', example: 'number' })
  @IsOptional()
  @IsString()
  type?: string;

  @ApiPropertyOptional({ description: 'Filter options JSON, null to clear' })
  @IsOptional()
  optionsJson?: unknown;

  @ApiPropertyOptional({ description: 'Filter ordering index', example: 2 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  sortOrder?: number;

  @ApiPropertyOptional({ description: 'Filter active state', example: false })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
