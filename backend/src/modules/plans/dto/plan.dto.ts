import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsIn,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Length,
  Matches,
  MaxLength,
  Min,
} from 'class-validator';

const BILLING_INTERVALS = ['MONTHLY', 'SEMI_ANNUAL', 'ANNUAL', 'BIENNIAL'] as const;

export class CreateSubscriptionPlanDto {
  @ApiProperty({ example: 'annual', description: 'Stable plan key (used in checkout and planKey on payments)' })
  @IsString()
  @Matches(/^[a-z0-9_]+$/, { message: 'key must be lowercase letters, numbers, and underscores only' })
  @Length(2, 64)
  key!: string;

  @ApiProperty({ example: 'A year - partners on the journey' })
  @IsString()
  @Length(2, 200)
  name!: string;

  @ApiProperty({ enum: BILLING_INTERVALS, example: 'ANNUAL' })
  @IsIn([...BILLING_INTERVALS])
  interval!: (typeof BILLING_INTERVALS)[number];

  @ApiProperty({ example: 1390, description: 'Pretax amount in major currency units (ILS)' })
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  pretaxAmount!: number;

  @ApiProperty({ example: 12, description: 'Billing period length in months (for display)' })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  billingMonths!: number;

  @ApiPropertyOptional({ example: 'מנוי שנתי (Annual)' })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  summaryTitle?: string;

  @ApiPropertyOptional({ example: 'לשנה אחת' })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  totalPeriodNote?: string;

  @ApiPropertyOptional({ example: 'ILS' })
  @IsOptional()
  @IsString()
  @Length(3, 3)
  currency?: string;

  @ApiPropertyOptional({ example: 'THE MOST CHOSEN' })
  @IsOptional()
  @IsString()
  @MaxLength(120)
  badge?: string;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  isFeatured?: boolean;

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  sortOrder?: number;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({
    example: ['חשיפה בתוצאות החיפוש'],
    description: 'Marketing feature bullets shown on pricing cards',
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  features?: string[];
}

export class UpdateSubscriptionPlanDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @Matches(/^[a-z0-9_]+$/)
  @Length(2, 64)
  key?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @Length(2, 200)
  name?: string;

  @ApiPropertyOptional({ enum: BILLING_INTERVALS })
  @IsOptional()
  @IsIn([...BILLING_INTERVALS])
  interval?: (typeof BILLING_INTERVALS)[number];

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  pretaxAmount?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  billingMonths?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(200)
  summaryTitle?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(200)
  totalPeriodNote?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @Length(3, 3)
  currency?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(120)
  badge?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isFeatured?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  sortOrder?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  features?: string[];
}
