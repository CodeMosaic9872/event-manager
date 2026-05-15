import { Type } from 'class-transformer';
import { PaginationQueryDto } from '../../../common/dto/pagination-query.dto';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsInt, IsOptional, IsString, MaxLength, Min } from 'class-validator';

export class CreateJobDto {
  @ApiProperty({ description: 'Job title', example: 'Wedding DJ needed' })
  @IsString()
  @MaxLength(200)
  title!: string;

  @ApiProperty({ description: 'Detailed job description', example: 'Need a DJ for a wedding reception from 7pm to midnight.' })
  @IsString()
  @MaxLength(4000)
  description!: string;

  @ApiPropertyOptional({ description: 'Event date in ISO format', example: '2026-08-14' })
  @IsOptional()
  @IsString()
  eventDate?: string;

  @ApiPropertyOptional({ description: 'Event type id', example: 'evt_123' })
  @IsOptional()
  @IsString()
  eventTypeId?: string;

  @ApiPropertyOptional({ description: 'Supplier category id for this tender', example: 'cat_123' })
  @IsOptional()
  @IsString()
  categoryId?: string;

  @ApiPropertyOptional({ description: 'Subcategory id (must belong to categoryId)', example: 'sub_123' })
  @IsOptional()
  @IsString()
  subcategoryId?: string;

  @ApiPropertyOptional({ description: 'Event location text', example: 'Haifa, Israel' })
  @IsOptional()
  @IsString()
  locationText?: string;

  @ApiPropertyOptional({ description: 'Minimum budget', example: 5000 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  budgetMin?: number;

  @ApiPropertyOptional({ description: 'Maximum budget', example: 12000 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  budgetMax?: number;

  @ApiPropertyOptional({ description: 'Expected guest count', example: 180 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  guestCount?: number;
}

export class UpdateJobDto {
  @ApiPropertyOptional({ description: 'Updated title', example: 'Wedding DJ + MC needed' })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  title?: string;

  @ApiPropertyOptional({ description: 'Updated description', example: 'Need DJ and MC support for wedding reception.' })
  @IsOptional()
  @IsString()
  @MaxLength(4000)
  description?: string;

  @ApiPropertyOptional({ description: 'Updated event date in ISO format', example: '2026-08-15' })
  @IsOptional()
  @IsString()
  eventDate?: string;

  @ApiPropertyOptional({ description: 'Event type id' })
  @IsOptional()
  @IsString()
  eventTypeId?: string;

  @ApiPropertyOptional({ description: 'Supplier category id' })
  @IsOptional()
  @IsString()
  categoryId?: string;

  @ApiPropertyOptional({ description: 'Subcategory id (must match categoryId)' })
  @IsOptional()
  @IsString()
  subcategoryId?: string;
}

export class ApplyJobDto {
  @ApiPropertyOptional({ description: 'Supplier message attached with application', example: 'I have 8 years of wedding event experience.' })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  message?: string;
}

export class UpdateJobApplicationStatusDto {
  @ApiProperty({
    description: 'New application status',
    enum: ['SUBMITTED', 'SHORTLISTED', 'REJECTED', 'WITHDRAWN'],
    example: 'SHORTLISTED',
  })
  @IsString()
  @IsIn(['SUBMITTED', 'SHORTLISTED', 'REJECTED', 'WITHDRAWN'])
  status!: 'SUBMITTED' | 'SHORTLISTED' | 'REJECTED' | 'WITHDRAWN';
}

export class JobApplicationListQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({
    description: 'Filter applications by status',
    enum: ['SUBMITTED', 'SHORTLISTED', 'REJECTED', 'WITHDRAWN'],
    example: 'SUBMITTED',
  })
  @IsOptional()
  @IsString()
  @IsIn(['SUBMITTED', 'SHORTLISTED', 'REJECTED', 'WITHDRAWN'])
  status?: 'SUBMITTED' | 'SHORTLISTED' | 'REJECTED' | 'WITHDRAWN';
}

export class PublicJobsQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({ description: 'Filter by category id' })
  @IsOptional()
  @IsString()
  categoryId?: string;

  @ApiPropertyOptional({ description: 'Filter by subcategory id' })
  @IsOptional()
  @IsString()
  subcategoryId?: string;
}
