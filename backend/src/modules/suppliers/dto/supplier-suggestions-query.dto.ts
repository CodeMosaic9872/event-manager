import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsString, Length, Max, Min } from 'class-validator';

export class SupplierSuggestionsQueryDto {
  @IsOptional()
  @IsString()
  @Length(0, 120)
  q?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(20)
  take?: number;
}
