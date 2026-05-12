import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  IsArray,
  IsEmail,
  IsOptional,
  IsString,
  IsUrl,
  Length,
  Matches,
  MaxLength,
  ValidateNested,
} from 'class-validator';
import { ServiceAreaItemDto } from './supplier-private-profile.dto';

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

export class SupplierCategoryAssignmentDto {
  @ApiProperty({ description: 'Taxonomy category id' })
  @IsString()
  @MaxLength(64)
  categoryId!: string;

  @ApiPropertyOptional({
    nullable: true,
    description: 'Optional subcategory id (must belong to categoryId)',
  })
  @IsOptional()
  @IsString()
  @MaxLength(64)
  subcategoryId?: string | null;
}

export class UpsertSupplierProfileDto {
  @ApiPropertyOptional({
    description:
      'Supplier business display name. Omit on create to derive a readable default from `slug`; omit on update to leave unchanged.',
    example: 'Skyline Events DJ',
  })
  @IsOptional()
  @IsString()
  @Length(2, 120)
  businessName?: string;

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
    description: 'Public URL for kosher-related uploaded document',
    example: 'https://cdn.example.com/suppliers/sup_1/kosher-cert.pdf',
  })
  @IsOptional()
  @IsString()
  @MaxLength(2048)
  kosher?: string;

  @ApiPropertyOptional({
    description: 'Public URL for Israeli tax form 3010 (or set via media upload with attachForm3010)',
    example: 'https://cdn.example.com/suppliers/sup_1/form-3010.pdf',
  })
  @IsOptional()
  @IsString()
  @MaxLength(2048)
  form3010?: string;

  @ApiPropertyOptional({
    description: 'Public contact email shown on the profile (not necessarily the login email)',
    example: 'hello@skylineevents.co.il',
  })
  @IsOptional()
  @Transform(({ value }) => (typeof value === 'string' && value.trim() === '' ? undefined : value))
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({ example: '0501234567' })
  @IsOptional()
  @IsString()
  @MaxLength(32)
  phone?: string;

  @ApiPropertyOptional({ example: 'https://wa.me/972501234567' })
  @IsOptional()
  @IsString()
  @IsUrl({ require_tld: false })
  @MaxLength(2048)
  whatsapp?: string;

  @ApiPropertyOptional({ example: 'https://skylineevents.co.il' })
  @IsOptional()
  @IsString()
  @IsUrl({ require_tld: false })
  @MaxLength(2048)
  website?: string;

  @ApiPropertyOptional({ example: 'https://instagram.com/skylineevents' })
  @IsOptional()
  @IsString()
  @IsUrl({ require_tld: false })
  @MaxLength(2048)
  instagram?: string;

  @ApiPropertyOptional({ example: 'https://facebook.com/skylineevents' })
  @IsOptional()
  @IsString()
  @IsUrl({ require_tld: false })
  @MaxLength(2048)
  facebook?: string;

  @ApiPropertyOptional({ example: 'Dizengoff 123, Tel Aviv' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  address?: string;

  @ApiPropertyOptional({ example: 'English' })
  @IsOptional()
  @IsString()
  @MaxLength(120)
  extraLanguage?: string;

  @ApiPropertyOptional({
    description:
      'When set, replaces all social links for this supplier (empty array removes every link). Omit to leave links unchanged unless `instagram` / `facebook` / `whatsapp` are provided (those patch individual platforms).',
    type: [SupplierSocialLinkInputDto],
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SupplierSocialLinkInputDto)
  socialLinks?: SupplierSocialLinkInputDto[];

  @ApiPropertyOptional({
    description:
      'When set, replaces all marketplace category rows for this supplier. Use primary row first for `category` / `subcategory` display strings on the public profile.',
    type: [SupplierCategoryAssignmentDto],
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SupplierCategoryAssignmentDto)
  categories?: SupplierCategoryAssignmentDto[];

  @ApiPropertyOptional({
    description:
      'When set, replaces all service areas (same shape as `PATCH /supplier/service-areas`). Omit to leave unchanged.',
    type: [ServiceAreaItemDto],
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ServiceAreaItemDto)
  serviceAreas?: ServiceAreaItemDto[];

  @ApiPropertyOptional({
    description:
      'When set, replaces gallery media rows (`SupplierMedia` with `mediaType` `gallery`) in order. Omit to leave gallery unchanged.',
    example: [
      'https://cdn.example.com/suppliers/sup_1/gallery/1.jpg',
      'https://cdn.example.com/suppliers/sup_1/gallery/2.jpg',
    ],
    isArray: true,
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @IsUrl({ require_tld: false }, { each: true })
  gallery?: string[];

  @ApiPropertyOptional({
    description: 'Display / compliance labels (e.g. ministry supplier flags)',
    example: ['Reserved', 'Ministry of Defense Supplier'],
    isArray: true,
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @MaxLength(120, { each: true })
  labelsRules?: string[];

  @ApiPropertyOptional({
    description: 'Niche / positioning tags',
    example: ['vegan', 'Meat catering'],
    isArray: true,
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @MaxLength(80, { each: true })
  labelsNiche?: string[];
}
