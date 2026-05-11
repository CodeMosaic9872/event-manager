import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, Length, Matches, MaxLength } from 'class-validator';

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

  @ApiPropertyOptional({
    description: 'Public URL for supplier avatar/logo image',
    example: 'https://cdn.example.com/suppliers/sup_1/avatar.jpg',
  })
  @IsOptional()
  @IsString()
  @MaxLength(2048)
  avatarImageUrl?: string;

  @ApiPropertyOptional({
    description: 'Public URL for supplier cover/banner image',
    example: 'https://cdn.example.com/suppliers/sup_1/cover.jpg',
  })
  @IsOptional()
  @IsString()
  @MaxLength(2048)
  coverImageUrl?: string;
}
