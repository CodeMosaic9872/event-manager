import { IsOptional, IsString } from 'class-validator';

export class TaxonomyMappingQueryDto {
  @IsOptional()
  @IsString()
  eventTypeId?: string;

  @IsOptional()
  @IsString()
  categoryId?: string;
}
