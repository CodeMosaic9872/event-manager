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
