import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class EventTypeSummaryDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  key!: string;

  @ApiProperty()
  name!: string;

  @ApiPropertyOptional({ nullable: true })
  nameEn!: string | null;
}

export class CategorySummaryDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  key!: string;

  @ApiProperty()
  name!: string;

  @ApiPropertyOptional({ nullable: true })
  nameEn!: string | null;
}

export class SubcategorySummaryDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  categoryId!: string;

  @ApiProperty()
  key!: string;

  @ApiProperty()
  name!: string;

  @ApiPropertyOptional({ nullable: true })
  nameEn!: string | null;
}

export class JobSummaryResponseDto {
  @ApiProperty({ example: 'job_1' })
  id!: string;

  @ApiProperty({ example: 'Wedding DJ needed' })
  title!: string;

  @ApiProperty({ example: 'PUBLISHED' })
  status!: string;

  @ApiProperty({ example: 5000, required: false, nullable: true })
  budgetMin!: number | null;

  @ApiProperty({ example: 12000, required: false, nullable: true })
  budgetMax!: number | null;

  @ApiPropertyOptional({ type: EventTypeSummaryDto, nullable: true })
  eventType!: EventTypeSummaryDto | null;

  @ApiPropertyOptional({ type: CategorySummaryDto, nullable: true })
  category!: CategorySummaryDto | null;

  @ApiPropertyOptional({ type: SubcategorySummaryDto, nullable: true })
  subcategory!: SubcategorySummaryDto | null;
}

export class JobDetailResponseDto extends JobSummaryResponseDto {
  @ApiProperty()
  ownerUserId!: string;

  @ApiPropertyOptional({ nullable: true })
  eventTypeId!: string | null;

  @ApiPropertyOptional({ nullable: true })
  categoryId!: string | null;

  @ApiPropertyOptional({ nullable: true })
  subcategoryId!: string | null;

  @ApiProperty()
  description!: string;

  @ApiPropertyOptional({ nullable: true })
  eventDate!: Date | null;

  @ApiPropertyOptional({ nullable: true })
  locationText!: string | null;

  @ApiPropertyOptional({ nullable: true })
  guestCount!: number | null;

  @ApiProperty()
  createdAt!: Date;

  @ApiProperty()
  updatedAt!: Date;

  @ApiPropertyOptional({ nullable: true })
  publishedAt!: Date | null;
}

export class CreatedJobResponseDto {
  @ApiProperty({ example: 'job_1' })
  id!: string;

  @ApiProperty({ example: 'usr_123' })
  ownerUserId!: string;

  @ApiProperty({ example: 'Wedding DJ needed' })
  title!: string;

  @ApiProperty({ example: 'DRAFT' })
  status!: string;

  @ApiPropertyOptional({ type: EventTypeSummaryDto, nullable: true })
  eventType!: EventTypeSummaryDto | null;

  @ApiPropertyOptional({ type: CategorySummaryDto, nullable: true })
  category!: CategorySummaryDto | null;

  @ApiPropertyOptional({ type: SubcategorySummaryDto, nullable: true })
  subcategory!: SubcategorySummaryDto | null;
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

  @ApiPropertyOptional({ type: EventTypeSummaryDto, nullable: true })
  eventType!: EventTypeSummaryDto | null;

  @ApiPropertyOptional({ type: CategorySummaryDto, nullable: true })
  category!: CategorySummaryDto | null;

  @ApiPropertyOptional({ type: SubcategorySummaryDto, nullable: true })
  subcategory!: SubcategorySummaryDto | null;
}

export class JobApplicationsCountResponseDto {
  @ApiProperty({ example: 3, description: 'Applications matching the status filter for this job' })
  count!: number;

  @ApiProperty({
    example: ['SUBMITTED'],
    isArray: true,
    description: 'Statuses included in the count',
  })
  statuses!: string[];
}

export class UserMeStatsResponseDto {
  @ApiProperty({
    description: 'Job applications awaiting review (default: SUBMITTED only) across all jobs you own',
  })
  pendingApplicationsTotal!: number;

  @ApiProperty()
  favoriteSuppliersCount!: number;

  @ApiProperty()
  savedConceptsCount!: number;

  @ApiProperty()
  jobsPublishedCount!: number;

  @ApiProperty()
  jobsDraftCount!: number;

  @ApiProperty()
  jobsClosedCount!: number;

  @ApiProperty()
  jobsArchivedCount!: number;
}
