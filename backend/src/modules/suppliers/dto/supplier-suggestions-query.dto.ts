import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsOptional, IsString, Length, Max, Min } from 'class-validator';

export class SupplierSuggestionsQueryDto {
  @ApiPropertyOptional({
    description: 'Suggestion search text',
    example: 'wed',
  })
  @IsOptional()
  @IsString()
  @Length(0, 120)
  q?: string;

  @ApiPropertyOptional({
    description: 'Maximum suggestions to return',
    minimum: 1,
    maximum: 20,
    example: 10,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(20)
  take?: number;
}
