import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class TaxonomyMappingQueryDto {
  @ApiPropertyOptional({
    description: 'Filter mappings by event type id',
    example: 'evt_123',
  })
  @IsOptional()
  @IsString()
  eventTypeId?: string;

  @ApiPropertyOptional({
    description: 'Filter mappings by category id',
    example: 'cat_123',
  })
  @IsOptional()
  @IsString()
  categoryId?: string;
}
