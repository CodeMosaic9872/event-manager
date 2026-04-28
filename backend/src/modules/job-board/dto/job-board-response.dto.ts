import { ApiProperty } from '@nestjs/swagger';

export class JobSummaryResponseDto {
  @ApiProperty({ example: 'job_1' })
  id!: string;

  @ApiProperty({ example: 'Wedding DJ needed' })
  title!: string;

  @ApiProperty({ example: 'PUBLISHED' })
  status!: string;

  @ApiProperty({ example: 5000 })
  budgetMin!: number;

  @ApiProperty({ example: 12000 })
  budgetMax!: number;
}

export class CreatedJobResponseDto {
  @ApiProperty({ example: 'job_1' })
  id!: string;

  @ApiProperty({ example: 'usr_123' })
  userId!: string;

  @ApiProperty({ example: 'Wedding DJ needed' })
  title!: string;

  @ApiProperty({ example: 'DRAFT' })
  status!: string;
}

export class JobApplicationResponseDto {
  @ApiProperty({ example: 'app_1' })
  id!: string;

  @ApiProperty({ example: 'job_1' })
  jobPostId!: string;

  @ApiProperty({ example: 'sup_1' })
  supplierId!: string;

  @ApiProperty({ example: 'SUBMITTED' })
  status!: string;
}

export class RecommendedJobResponseDto {
  @ApiProperty({ example: 'job_1' })
  id!: string;

  @ApiProperty({ example: 'Wedding DJ needed' })
  title!: string;

  @ApiProperty({ example: 'PUBLISHED' })
  status!: string;

  @ApiProperty({ example: 0.84 })
  matchScore!: number;

  @ApiProperty({
    example: ['category_match', 'location_match', 'working_day_match', 'budget_specified'],
    isArray: true,
  })
  matchReasons!: string[];

  @ApiProperty({ example: 'Haifa, Israel', required: false, nullable: true })
  locationText!: string | null;

  @ApiProperty({ example: '2026-08-14T00:00:00.000Z', required: false, nullable: true })
  eventDate!: Date | null;

  @ApiProperty({ example: 5000, required: false, nullable: true })
  budgetMin!: number | null;

  @ApiProperty({ example: 12000, required: false, nullable: true })
  budgetMax!: number | null;
}
