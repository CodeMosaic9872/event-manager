import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNumber, IsOptional, IsString, IsUrl, MaxLength, Min, MinLength } from 'class-validator';

export class CreateCardcomSessionDto {
  @ApiPropertyOptional({ description: 'Charge amount (major currency units, e.g. ILS)', example: 499 })
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0.01)
  amount!: number;

  @ApiPropertyOptional({ default: 'ILS' })
  @IsOptional()
  @IsString()
  @MinLength(3)
  @MaxLength(3)
  currency?: string;

  @ApiPropertyOptional({ description: 'Plan or product key for reporting' })
  @IsOptional()
  @IsString()
  @MaxLength(120)
  planKey?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  @ApiPropertyOptional({ description: 'Override success redirect (must be allowed HTTPS URL)' })
  @IsOptional()
  @IsUrl({ require_tld: false })
  successRedirectUrl?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUrl({ require_tld: false })
  errorRedirectUrl?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUrl({ require_tld: false })
  cancelUrl?: string;

  @ApiPropertyOptional({ description: 'Customer email for optional invoice head' })
  @IsOptional()
  @IsString()
  @MaxLength(320)
  invoiceEmail?: string;

  @ApiPropertyOptional({ description: 'Customer display name for optional invoice head' })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  invoiceCustName?: string;
}
