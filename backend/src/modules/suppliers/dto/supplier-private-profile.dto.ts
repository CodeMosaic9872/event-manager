import { Transform } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsBoolean, IsObject, IsOptional, IsString, IsUrl, MaxLength } from 'class-validator';

export class AddSupplierMediaDto {
  @ApiProperty({ description: 'Media type', example: 'image' })
  @IsString()
  @MaxLength(64)
  mediaType!: string;

  @ApiProperty({ description: 'Public media URL', example: 'https://cdn.example.com/supplier/image-1.jpg' })
  @IsUrl()
  url!: string;

  @ApiPropertyOptional({ description: 'Sort order in gallery', example: 1 })
  @IsOptional()
  sortOrder?: number;

  @ApiPropertyOptional({ description: 'Optional media metadata object' })
  @IsOptional()
  @IsObject()
  metadataJson?: Record<string, unknown>;
}

export class UpdateSupplierAttributesDto {
  @ApiPropertyOptional({ description: 'Supplier has business insurance', example: true })
  @IsOptional()
  @IsBoolean()
  insurance?: boolean;

  @ApiPropertyOptional({ description: 'Supplier supports accessibility requirements', example: true })
  @IsOptional()
  @IsBoolean()
  accessibility?: boolean;

  @ApiPropertyOptional({ description: 'Kosher options payload' })
  @IsOptional()
  kosherOptions?: unknown;

  @ApiPropertyOptional({ description: 'Languages payload' })
  @IsOptional()
  languagesJson?: unknown;

  @ApiPropertyOptional({ description: 'Working days payload' })
  @IsOptional()
  workingDaysJson?: unknown;

  @ApiPropertyOptional({ description: 'Certifications payload' })
  @IsOptional()
  certificationsJson?: unknown;
}

export class UpdateSupplierServiceAreasDto {
  @ApiProperty({
    description: 'Complete replacement of supplier service area tokens (stored lowercase, e.g. `north`, `jerusalem`).',
    example: ['north', 'jerusalem'],
    type: [String],
  })
  @IsArray()
  @IsString({ each: true })
  @MaxLength(120, { each: true })
  serviceAreas!: string[];
}

export class UploadSupplierMediaFileDto {
  @ApiPropertyOptional({
    description: 'Supplier id — required when the request is not authenticated (onboarding / draft upload)',
  })
  @IsOptional()
  @IsString()
  @MaxLength(64)
  supplierId?: string;

  @ApiPropertyOptional({ description: 'Media type', example: 'image', default: 'image' })
  @IsOptional()
  @IsString()
  @MaxLength(64)
  mediaType?: string;

  @ApiPropertyOptional({ description: 'Sort order in gallery', example: '1' })
  @IsOptional()
  @IsString()
  @MaxLength(16)
  sortOrder?: string;

  @ApiPropertyOptional({
    description: 'If true, also stores the uploaded file URL on supplier.kosher',
  })
  @IsOptional()
  @Transform(({ value }) => value === true || value === 'true' || value === '1')
  @IsBoolean()
  attachKosher?: boolean;

  @ApiPropertyOptional({
    description: 'If true, also stores the uploaded file URL on supplier.form_3010',
  })
  @IsOptional()
  @Transform(({ value }) => value === true || value === 'true' || value === '1')
  @IsBoolean()
  attachForm3010?: boolean;
}

/** Multipart text fields for `POST /supplier/media/upload-files` (field `files` is binary). */
export class UploadSupplierMediaFilesFormDto {
  @ApiPropertyOptional({
    description: 'Supplier id — required when the request is not authenticated (onboarding / draft upload)',
  })
  @IsOptional()
  @IsString()
  @MaxLength(64)
  supplierId?: string;

  @ApiPropertyOptional({ description: 'Media type applied to every file', example: 'image', default: 'image' })
  @IsOptional()
  @IsString()
  @MaxLength(64)
  mediaType?: string;

  @ApiPropertyOptional({ description: 'Starting sort order for the first file; each next file +1', example: '0' })
  @IsOptional()
  @IsString()
  @MaxLength(16)
  sortOrder?: string;
}
