import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, Length, Matches } from 'class-validator';

export class UpsertSupplierProfileDto {
  @ApiProperty({
    description: 'Supplier business display name',
    example: 'Skyline Events DJ',
  })
  @IsString()
  @Length(2, 120)
  businessName!: string;

  @ApiProperty({
    description: 'SEO slug for supplier profile',
    example: 'skyline-events-dj',
  })
  @IsString()
  @Matches(/^[a-z0-9-]+$/, {
    message: 'slug must contain lowercase letters, numbers, and hyphens only',
  })
  @Length(3, 120)
  slug!: string;

  @ApiPropertyOptional({
    description: 'Supplier bio or introduction',
    example: 'Premium DJ and MC services for weddings and private events.',
  })
  @IsOptional()
  @IsString()
  @Length(0, 1000)
  description?: string;
}
