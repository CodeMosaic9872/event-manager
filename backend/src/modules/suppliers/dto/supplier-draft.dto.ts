import { Type } from 'class-transformer';
import { IsInt, IsObject, IsOptional, IsString, Max, Min } from 'class-validator';

export class UpsertSupplierDraftDto {
  @IsString()
  supplierId!: string;

  @IsString()
  stepKey!: string;

  @Type(() => Number)
  @IsInt()
  @Min(0)
  @Max(100)
  completionPercent!: number;

  @IsObject()
  payloadJson!: Record<string, unknown>;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  version?: number;
}
