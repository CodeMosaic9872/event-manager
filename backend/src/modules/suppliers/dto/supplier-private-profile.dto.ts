import { Type } from 'class-transformer';
import { IsArray, IsBoolean, IsObject, IsOptional, IsString, IsUrl, MaxLength, ValidateNested } from 'class-validator';

export class AddSupplierMediaDto {
  @IsString()
  @MaxLength(64)
  mediaType!: string;

  @IsUrl()
  url!: string;

  @IsOptional()
  sortOrder?: number;

  @IsOptional()
  @IsObject()
  metadataJson?: Record<string, unknown>;
}

export class UpdateSupplierAttributesDto {
  @IsOptional()
  @IsBoolean()
  insurance?: boolean;

  @IsOptional()
  @IsBoolean()
  accessibility?: boolean;

  @IsOptional()
  kosherOptions?: unknown;

  @IsOptional()
  languagesJson?: unknown;

  @IsOptional()
  workingDaysJson?: unknown;

  @IsOptional()
  certificationsJson?: unknown;
}

export class ServiceAreaItemDto {
  @IsString()
  @MaxLength(32)
  regionCode!: string;

  @IsOptional()
  @IsString()
  @MaxLength(32)
  cityCode?: string;
}

export class UpdateSupplierServiceAreasDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ServiceAreaItemDto)
  serviceAreas!: ServiceAreaItemDto[];
}
