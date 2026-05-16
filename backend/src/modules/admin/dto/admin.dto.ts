import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsBoolean,
  IsDateString,
  IsEmail,
  IsIn,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  Length,
  Matches,
  Max,
  MaxLength,
  Min,
} from 'class-validator';
import { PaginationQueryDto } from '../../../common/dto/pagination-query.dto';

export class CreateAdminDto {
  @ApiProperty({ description: 'Admin login email (OTP via email is supported)', example: 'ops@example.com' })
  @IsEmail()
  email!: string;

  @ApiProperty({
    description:
      'Israeli mobile for SMS OTP. Required because /auth/login validates the user record has a phone number.',
    example: '0501234567',
  })
  @IsString()
  @IsNotEmpty()
  phone!: string;
}

export class ApproveSupplierDto {
  @ApiPropertyOptional({ description: 'Admin user id performing approval', example: 'usr_admin_123' })
  @IsOptional()
  @IsString()
  adminUserId?: string;
}

export class RejectSupplierDto {
  @ApiPropertyOptional({ description: 'Rejection reason', example: 'Incomplete compliance documents' })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  reason?: string;

  @ApiPropertyOptional({ description: 'Admin user id performing rejection', example: 'usr_admin_123' })
  @IsOptional()
  @IsString()
  adminUserId?: string;
}

export class UpdateAutomationRuleDto {
  @ApiPropertyOptional({ description: 'Rule enabled state', example: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({ description: 'Rule config payload' })
  @IsOptional()
  @IsObject()
  config?: Record<string, unknown>;
}

export class CreateEventTypeDto {
  @ApiProperty({ description: 'Event type key', example: 'wedding' })
  @IsString()
  key!: string;

  @ApiProperty({ description: 'Event type label', example: 'Wedding' })
  @IsString()
  name!: string;

  @ApiPropertyOptional({ description: 'Event type active state', example: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class UpdateEventTypeDto {
  @ApiPropertyOptional({ description: 'Event type key', example: 'corporate' })
  @IsOptional()
  @IsString()
  key?: string;

  @ApiPropertyOptional({ description: 'Event type label', example: 'Corporate Event' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ description: 'Event type active state', example: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class CreateCategoryDto {
  @ApiProperty({ description: 'Category key', example: 'music' })
  @IsString()
  key!: string;

  @ApiProperty({ description: 'Category label', example: 'Music' })
  @IsString()
  name!: string;

  @ApiPropertyOptional({ description: 'Category ordering index', example: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  sortOrder?: number;

  @ApiPropertyOptional({ description: 'Category active state', example: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class UpdateCategoryDto {
  @ApiPropertyOptional({ description: 'Category key', example: 'photo' })
  @IsOptional()
  @IsString()
  key?: string;

  @ApiPropertyOptional({ description: 'Category label', example: 'Photography' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ description: 'Category ordering index', example: 2 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  sortOrder?: number;

  @ApiPropertyOptional({ description: 'Category active state', example: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class CreateSubcategoryDto {
  @ApiProperty({ description: 'Parent category id', example: 'cat_123' })
  @IsString()
  categoryId!: string;

  @ApiProperty({ description: 'Subcategory key', example: 'dj' })
  @IsString()
  key!: string;

  @ApiProperty({ description: 'Subcategory label', example: 'DJ' })
  @IsString()
  name!: string;

  @ApiPropertyOptional({ description: 'Subcategory ordering index', example: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  sortOrder?: number;

  @ApiPropertyOptional({ description: 'Subcategory active state', example: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class UpdateSubcategoryDto {
  @ApiPropertyOptional({ description: 'Parent category id', example: 'cat_234' })
  @IsOptional()
  @IsString()
  categoryId?: string;

  @ApiPropertyOptional({ description: 'Subcategory key', example: 'live-band' })
  @IsOptional()
  @IsString()
  key?: string;

  @ApiPropertyOptional({ description: 'Subcategory label', example: 'Live Band' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ description: 'Subcategory ordering index', example: 3 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  sortOrder?: number;

  @ApiPropertyOptional({ description: 'Subcategory active state', example: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class CreateFilterDefinitionDto {
  @ApiProperty({ description: 'Filter scope', enum: ['GLOBAL', 'CATEGORY'], example: 'CATEGORY' })
  @IsString()
  @IsIn(['GLOBAL', 'CATEGORY'])
  scope!: string;

  @ApiPropertyOptional({ description: 'Optional category id for category-scoped filter', example: 'cat_123' })
  @IsOptional()
  @IsString()
  categoryId?: string;

  @ApiProperty({ description: 'Filter key', example: 'price_range' })
  @IsString()
  key!: string;

  @ApiProperty({ description: 'Filter display label', example: 'Price Range' })
  @IsString()
  label!: string;

  @ApiProperty({ description: 'Filter value type', example: 'select' })
  @IsString()
  type!: string;

  @ApiPropertyOptional({ description: 'Optional filter options JSON' })
  @IsOptional()
  optionsJson?: unknown;

  @ApiPropertyOptional({ description: 'Filter ordering index', example: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  sortOrder?: number;

  @ApiPropertyOptional({ description: 'Filter active state', example: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class UpdateFilterDefinitionDto {
  @ApiPropertyOptional({ description: 'Filter scope', enum: ['GLOBAL', 'CATEGORY'], example: 'GLOBAL' })
  @IsOptional()
  @IsString()
  @IsIn(['GLOBAL', 'CATEGORY'])
  scope?: string;

  @ApiPropertyOptional({ description: 'Category id, null to unset', nullable: true, example: null })
  @IsOptional()
  categoryId?: string | null;

  @ApiPropertyOptional({ description: 'Filter key', example: 'guest_count' })
  @IsOptional()
  @IsString()
  key?: string;

  @ApiPropertyOptional({ description: 'Filter display label', example: 'Guest Count' })
  @IsOptional()
  @IsString()
  label?: string;

  @ApiPropertyOptional({ description: 'Filter value type', example: 'number' })
  @IsOptional()
  @IsString()
  type?: string;

  @ApiPropertyOptional({ description: 'Filter options JSON, null to clear' })
  @IsOptional()
  optionsJson?: unknown;

  @ApiPropertyOptional({ description: 'Filter ordering index', example: 2 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  sortOrder?: number;

  @ApiPropertyOptional({ description: 'Filter active state', example: false })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

const SUPPLIER_APPROVAL_STATUSES = ['DRAFT', 'PENDING', 'APPROVED', 'REJECTED'] as const;
const SUBSCRIPTION_STATUSES = ['ACTIVE', 'PAST_DUE', 'CANCELED'] as const;
const BILLING_INTERVALS = ['MONTHLY', 'SEMI_ANNUAL', 'ANNUAL', 'BIENNIAL'] as const;

export class AdminSubscriptionListQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({ description: 'Filter subscriptions by supplier id' })
  @IsOptional()
  @IsString()
  supplierId?: string;
}

export class CreateAdminSupplierDto {
  @ApiProperty({ description: 'Owner user id (must exist)', example: 'usr_abc123' })
  @IsString()
  @IsNotEmpty()
  ownerUserId!: string;

  @ApiProperty({ example: 'Skyline Events DJ' })
  @IsString()
  @Length(2, 120)
  businessName!: string;

  @ApiProperty({ example: 'skyline-events-dj' })
  @IsString()
  @Matches(/^[a-z0-9-]+$/, {
    message: 'slug must contain lowercase letters, numbers, and hyphens only',
  })
  @Length(3, 120)
  slug!: string;

  @ApiPropertyOptional({ example: 'Premium DJ services for weddings.' })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  description?: string;

  @ApiPropertyOptional({ enum: SUPPLIER_APPROVAL_STATUSES, example: 'DRAFT' })
  @IsOptional()
  @IsIn([...SUPPLIER_APPROVAL_STATUSES])
  approvalStatus?: (typeof SUPPLIER_APPROVAL_STATUSES)[number];

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({ example: false })
  @IsOptional()
  @IsBoolean()
  isVerified?: boolean;

  @ApiPropertyOptional({ example: 'hello@skylineevents.co.il' })
  @IsOptional()
  @IsEmail()
  contactEmail?: string;

  @ApiPropertyOptional({ example: '0501234567' })
  @IsOptional()
  @IsString()
  @MaxLength(32)
  publicPhone?: string;

  @ApiPropertyOptional({ example: ['north', 'tel-aviv'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  serviceAreas?: string[];
}

export class UpdateAdminSupplierDto {
  @ApiPropertyOptional({ example: 'Skyline Events DJ' })
  @IsOptional()
  @IsString()
  @Length(2, 120)
  businessName?: string;

  @ApiPropertyOptional({ example: 'skyline-events-dj' })
  @IsOptional()
  @IsString()
  @Matches(/^[a-z0-9-]+$/, {
    message: 'slug must contain lowercase letters, numbers, and hyphens only',
  })
  @Length(3, 120)
  slug?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  description?: string;

  @ApiPropertyOptional({ enum: SUPPLIER_APPROVAL_STATUSES })
  @IsOptional()
  @IsIn([...SUPPLIER_APPROVAL_STATUSES])
  approvalStatus?: (typeof SUPPLIER_APPROVAL_STATUSES)[number];

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isVerified?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsEmail()
  contactEmail?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(32)
  publicPhone?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(2048)
  whatsappUrl?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(2048)
  websiteUrl?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(500)
  address?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  serviceAreas?: string[];
}

export class CreateAdminSubscriptionDto {
  @ApiProperty({ description: 'Supplier id (one subscription per supplier)', example: 'sup_abc123' })
  @IsString()
  @IsNotEmpty()
  supplierId!: string;

  @ApiPropertyOptional({
    description: 'Subscription plan id; when set, interval/amount/planKey are taken from the plan',
    example: 'plan_annual',
  })
  @IsOptional()
  @IsString()
  planId?: string;

  @ApiPropertyOptional({ enum: BILLING_INTERVALS, example: 'ANNUAL' })
  @IsOptional()
  @IsIn([...BILLING_INTERVALS])
  interval?: (typeof BILLING_INTERVALS)[number];

  @ApiPropertyOptional({ example: 1626, description: 'Total charge amount (with VAT). Required if planId is omitted.' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  amount?: number;

  @ApiProperty({ description: 'CardCom stored payment token', example: 'tok_abc123' })
  @IsString()
  @IsNotEmpty()
  cardcomToken!: string;

  @ApiProperty({ description: 'Next billing date (ISO 8601)', example: '2026-06-01T00:00:00.000Z' })
  @IsDateString()
  nextBillingAt!: string;

  @ApiPropertyOptional({ enum: SUBSCRIPTION_STATUSES, example: 'ACTIVE' })
  @IsOptional()
  @IsIn([...SUBSCRIPTION_STATUSES])
  status?: (typeof SUBSCRIPTION_STATUSES)[number];

  @ApiPropertyOptional({ example: 'ILS' })
  @IsOptional()
  @IsString()
  @Length(3, 3)
  currency?: string;

  @ApiPropertyOptional({ example: 'supplier_monthly' })
  @IsOptional()
  @IsString()
  @MaxLength(64)
  planKey?: string;

  @ApiPropertyOptional({ description: 'CardCom token expiry (ISO 8601)' })
  @IsOptional()
  @IsDateString()
  tokenExpiresAt?: string;
}

export class UpdateAdminSubscriptionDto {
  @ApiPropertyOptional({ description: 'Link or change subscription plan' })
  @IsOptional()
  @IsString()
  planId?: string;

  @ApiPropertyOptional({ enum: SUBSCRIPTION_STATUSES })
  @IsOptional()
  @IsIn([...SUBSCRIPTION_STATUSES])
  status?: (typeof SUBSCRIPTION_STATUSES)[number];

  @ApiPropertyOptional({ enum: BILLING_INTERVALS })
  @IsOptional()
  @IsIn([...BILLING_INTERVALS])
  interval?: (typeof BILLING_INTERVALS)[number];

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  amount?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @Length(3, 3)
  currency?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(64)
  planKey?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  cardcomToken?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  nextBillingAt?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  tokenExpiresAt?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  lastRenewedAt?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  consecutiveFailures?: number;
}

export class ModerateJobApplicationDto {
  @ApiProperty({
    description: 'New application status set by admin',
    enum: ['SUBMITTED', 'SHORTLISTED', 'REJECTED', 'WITHDRAWN'],
    example: 'SHORTLISTED',
  })
  @IsString()
  @IsIn(['SUBMITTED', 'SHORTLISTED', 'REJECTED', 'WITHDRAWN'])
  status!: 'SUBMITTED' | 'SHORTLISTED' | 'REJECTED' | 'WITHDRAWN';

  @ApiPropertyOptional({ description: 'Optional moderation reason', example: 'Missing required availability details' })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  reason?: string;
}

export class AdminDashboardQueryDto {
  @ApiPropertyOptional({ description: 'Calendar year for supplier engagement metrics (UTC)', example: 2026 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(2000)
  @Max(2100)
  year?: number;

  @ApiPropertyOptional({ description: 'Calendar month 1–12 for supplier engagement metrics (UTC)', example: 6 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(12)
  month?: number;

  @ApiPropertyOptional({
    description: 'Filter supplier engagement metrics by business name or slug (case-insensitive)',
    example: 'roy',
  })
  @IsOptional()
  @IsString()
  @MaxLength(120)
  supplierSearch?: string;

  @ApiPropertyOptional({ description: 'Max pending approval rows to return', example: 10, default: 10 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(50)
  pendingLimit?: number;

  @ApiPropertyOptional({ description: 'Months of platform growth history (max 12)', example: 5, default: 5 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(12)
  growthMonths?: number;
}

/** Query params for `GET /admin/suppliers` (supplier management table). */
export class AdminListSuppliersQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({ description: 'Search business name, slug, email, phone, or address', example: 'taam' })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  q?: string;

  @ApiPropertyOptional({
    description: 'Approval filter',
    enum: ['all', 'approved', 'pending', 'waiting', 'rejected', 'draft'],
    example: 'all',
  })
  @IsOptional()
  @IsString()
  @IsIn(['all', 'approved', 'pending', 'waiting', 'rejected', 'draft'])
  status?: 'all' | 'approved' | 'pending' | 'waiting' | 'rejected' | 'draft';

  @ApiPropertyOptional({ description: 'Filter by category id', example: 'cat_123' })
  @IsOptional()
  @IsString()
  categoryId?: string;

  @ApiPropertyOptional({ description: 'Filter by category key', example: 'catering' })
  @IsOptional()
  @IsString()
  @MaxLength(80)
  categoryKey?: string;

  @ApiPropertyOptional({
    description: 'Filter by service area / region token (stored lowercase on supplier)',
    example: 'north',
  })
  @IsOptional()
  @IsString()
  @MaxLength(80)
  serviceArea?: string;
}
