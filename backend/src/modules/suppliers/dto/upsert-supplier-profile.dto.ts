import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsOptional, IsString, IsUrl, Length, Matches, MaxLength, ValidateNested } from 'class-validator';

export class SupplierSocialLinkInputDto {
  @ApiProperty({ description: 'Platform key', example: 'instagram' })
  @IsString()
  @MaxLength(64)
  platform!: string;

  @ApiProperty({ example: 'https://instagram.com/yourbusiness' })
  @IsString()
  @IsUrl({ require_tld: false })
  @MaxLength(2048)
  url!: string;
}

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

  @ApiPropertyOptional({
    description:
      'When set, replaces all social links for this supplier (empty array removes every link). Omit to leave links unchanged.',
    type: [SupplierSocialLinkInputDto],
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SupplierSocialLinkInputDto)
  socialLinks?: SupplierSocialLinkInputDto[];
}
