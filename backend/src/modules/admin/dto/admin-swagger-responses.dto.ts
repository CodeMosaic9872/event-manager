import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { JobDetailResponseDto } from '../../job-board/dto/job-board-response.dto';

export class AdminUserRoleRowDto {
  @ApiProperty({ example: 'USER' })
  role!: string;
}

export class AdminUserSupplierNestedDto {
  @ApiProperty({ example: 'sup_123' })
  id!: string;

  @ApiProperty({ example: 'APPROVED' })
  approvalStatus!: string;

  @ApiProperty({ example: true })
  isActive!: boolean;
}

/** Actual Prisma user row returned by admin user list endpoints. */
export class AdminUserRecordDto {
  @ApiProperty({ example: 'usr_123' })
  id!: string;

  @ApiProperty({ example: 'planner@example.com', nullable: true })
  email!: string | null;

  @ApiProperty({ example: '+972501234567', nullable: true })
  phone!: string | null;

  @ApiProperty({ example: 'ACTIVE' })
  status!: string;

  @ApiProperty({ type: [AdminUserRoleRowDto] })
  roles!: AdminUserRoleRowDto[];

  @ApiProperty({ type: AdminUserSupplierNestedDto, nullable: true })
  supplier!: AdminUserSupplierNestedDto | null;

  @ApiProperty()
  createdAt!: Date;

  @ApiProperty()
  updatedAt!: Date;
}

export class PrismaGroupCountDto {
  @ApiProperty({ example: 12 })
  _all!: number;
}

export class AdminAiFailureGroupDto {
  @ApiProperty({ example: 'timeout', nullable: true })
  failureTag!: string | null;

  @ApiProperty({ type: PrismaGroupCountDto })
  _count!: PrismaGroupCountDto;

  @ApiProperty({ example: { latencyMs: 450 } })
  _avg!: { latencyMs: number | null };
}

export class AdminAiTopRecommendationGroupDto {
  @ApiProperty({ example: 'sup_1', nullable: true })
  supplierId!: string | null;

  @ApiProperty({ type: PrismaGroupCountDto })
  _count!: PrismaGroupCountDto;

  @ApiProperty({ example: { score: 0.82 } })
  _avg!: { score: number | null };
}

export class AdminAiUsageCounterDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  key!: string;

  @ApiProperty()
  count!: number;

  @ApiProperty()
  updatedAt!: Date;
}

export class AdminAiConversationRowDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  createdAt!: Date;

  @ApiProperty({ type: 'array', items: { type: 'object' } })
  messages!: Record<string, unknown>[];
}

export class AdminNotificationRowDto {
  @ApiProperty()
  id!: string;

  @ApiProperty({ example: 'EMAIL' })
  channel!: string;

  @ApiProperty({ example: 'PENDING' })
  status!: string;

  @ApiProperty()
  templateKey!: string;

  @ApiProperty()
  createdAt!: Date;
}

export class AdminAiRecommendationQualityDto {
  @ApiProperty({ example: 1000 })
  totalRecommendations!: number;

  @ApiProperty({ example: 120 })
  clickedRecommendations!: number;

  @ApiProperty({ example: 45 })
  acceptedRecommendations!: number;

  @ApiProperty({ example: 0.12 })
  clickThroughRate!: number;

  @ApiProperty({ example: 0.045 })
  acceptanceRate!: number;
}

export class AdminAiPerformanceDto {
  @ApiProperty({ example: 5000 })
  totalLogs!: number;

  @ApiProperty({ example: 200 })
  failedLogs!: number;

  @ApiProperty({ example: 0.96 })
  retrievalHitRate!: number;

  @ApiProperty({ example: 320 })
  avgLatencyMs!: number;

  @ApiProperty({ example: 4.2 })
  averageRecommendationsPerConversation!: number;
}

export class AdminAutomationRuleItemDto {
  @ApiProperty({ example: 'user.registered' })
  templateKey!: string;

  @ApiProperty({ example: 'static' })
  source!: string;

  @ApiProperty()
  note!: string;
}

export class AdminAutomationMetricsDto {
  @ApiProperty({ example: 3 })
  pending!: number;

  @ApiProperty({ example: 100 })
  sent!: number;

  @ApiProperty({ example: 2 })
  failed!: number;

  @ApiProperty({ example: 105 })
  total!: number;
}

export class AdminProcessAutomationRunsResponseDto {
  @ApiProperty({ example: 10 })
  attempted!: number;

  @ApiProperty({ example: 8 })
  sent!: number;

  @ApiProperty({ example: 2 })
  failed!: number;

  @ApiProperty({ example: false, required: false })
  deferred?: boolean;
}

export class AdminFeatureSupplierResponseDto {
  @ApiProperty({ example: 'sup_1' })
  id!: string;

  @ApiProperty({ example: true })
  featured!: boolean;
}

export class AdminDeletePlanResponseDto {
  @ApiProperty({ example: true })
  deleted!: boolean;

  @ApiProperty({ example: 'plan_123' })
  id!: string;
}

export class PaginatedAdminJobPostsDataDto {
  @ApiProperty({ type: [JobDetailResponseDto] })
  items!: JobDetailResponseDto[];

  @ApiProperty()
  totalItems!: number;
}

export class AdminSupplierDraftIncompleteItemDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  supplierId!: string;

  @ApiProperty()
  stepKey!: string;

  @ApiProperty()
  completionPercent!: number;

  @ApiProperty({ type: Object })
  supplier!: Record<string, unknown>;
}
