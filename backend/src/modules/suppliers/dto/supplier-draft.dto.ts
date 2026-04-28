import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsObject, IsOptional, IsString, Max, Min } from 'class-validator';

export class UpsertSupplierDraftDto {
  @ApiProperty({ description: 'Onboarding step key', example: 'service_areas' })
  @IsString()
  stepKey!: string;

  @ApiProperty({
    description: 'Completion percentage for current draft',
    minimum: 0,
    maximum: 100,
    example: 45,
  })
  @Type(() => Number)
  @IsInt()
  @Min(0)
  @Max(100)
  completionPercent!: number;

  @ApiProperty({
    description: 'Draft payload for step',
    example: { serviceAreas: [{ regionCode: 'north' }] },
  })
  @IsObject()
  payloadJson!: Record<string, unknown>;

  @ApiPropertyOptional({
    description: 'Optimistic concurrency version',
    example: 2,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  version?: number;
}
