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

export class AdminDashboardKpiMetricDto {
  @ApiProperty({ example: 1240 })
  value!: number;

  @ApiPropertyOptional({ example: 5.2, description: 'Percent change vs prior month' })
  changePercent?: number;

  @ApiPropertyOptional({ example: 'from last month' })
  periodLabel?: string;

  @ApiPropertyOptional({ example: 'ILS' })
  currency?: string;
}

export class AdminDashboardKpisDto {
  @ApiProperty({ type: AdminDashboardKpiMetricDto })
  totalSuppliers!: AdminDashboardKpiMetricDto;

  @ApiProperty({ type: AdminDashboardKpiMetricDto })
  totalRevenue!: AdminDashboardKpiMetricDto;

  @ApiProperty({ type: AdminDashboardKpiMetricDto })
  pendingApprovals!: AdminDashboardKpiMetricDto;

  @ApiProperty({ type: AdminDashboardKpiMetricDto })
  activeUsers!: AdminDashboardKpiMetricDto;
}

export class AdminDashboardPeriodDto {
  @ApiProperty({ example: 2026 })
  year!: number;

  @ApiProperty({ example: 6 })
  month!: number;

  @ApiProperty({ example: 'June' })
  label!: string;
}

export class AdminDashboardClosedJobOffersDto {
  @ApiProperty({ example: 21 })
  count!: number;

  @ApiProperty({ example: 12000 })
  revenueAmount!: number;

  @ApiProperty({ example: 'ILS' })
  currency!: string;
}

export class AdminDashboardSupplierEngagementDto {
  @ApiProperty({ example: 124 })
  phoneClicks!: number;

  @ApiProperty({ example: 56 })
  messagesSent!: number;

  @ApiProperty({ example: 456 })
  profileViews!: number;

  @ApiProperty({ type: AdminDashboardClosedJobOffersDto })
  closedJobOffers!: AdminDashboardClosedJobOffersDto;
}

export class AdminDashboardGrowthMonthDto {
  @ApiProperty({ example: 2026 })
  year!: number;

  @ApiProperty({ example: 5 })
  month!: number;

  @ApiProperty({ example: 'MAY' })
  label!: string;

  @ApiProperty({ example: 45 })
  newSuppliers!: number;

  @ApiProperty({ example: 1240 })
  newUsers!: number;

  @ApiProperty({ example: 892, description: 'Successful supplier payments in the month' })
  paidEvents!: number;
}

export class AdminDashboardGrowthTotalsDto {
  @ApiProperty({ example: 45 })
  newSuppliers!: number;

  @ApiProperty({ example: 1240 })
  newUsers!: number;

  @ApiProperty({ example: 892 })
  paidEvents!: number;
}

export class AdminDashboardPlatformGrowthDto {
  @ApiProperty({ type: [AdminDashboardGrowthMonthDto] })
  months!: AdminDashboardGrowthMonthDto[];

  @ApiProperty({ type: AdminDashboardGrowthTotalsDto })
  totals!: AdminDashboardGrowthTotalsDto;
}

export class AdminDashboardPendingApprovalItemDto {
  @ApiProperty({ example: 'sup_1' })
  id!: string;

  @ApiProperty({ example: 'Roy Levy Event Photography' })
  businessName!: string;

  @ApiProperty({ example: 'Photography', nullable: true })
  categoryName!: string | null;

  @ApiProperty({ example: '2023-10-12T00:00:00.000Z' })
  joinedAt!: string;
}

export class AdminDashboardPendingApprovalsDto {
  @ApiProperty({ type: [AdminDashboardPendingApprovalItemDto] })
  items!: AdminDashboardPendingApprovalItemDto[];

  @ApiProperty({ example: 12 })
  totalItems!: number;
}

export class AdminSupplierStatsDto {
  @ApiProperty({ example: 128, description: 'Approved and active suppliers' })
  activeSuppliers!: number;

  @ApiProperty({ example: 12, description: 'Suppliers awaiting admin approval (PENDING)' })
  pendingApproval!: number;

  @ApiProperty({ example: 140, description: 'All non-deleted suppliers' })
  totalSuppliers!: number;
}

export class AdminSupplierFilterCategoryOptionDto {
  @ApiProperty({ example: 'cat_1' })
  id!: string;

  @ApiProperty({ example: 'catering' })
  key!: string;

  @ApiProperty({ example: 'קייטרינג' })
  name!: string;

  @ApiProperty({ example: 'Catering', nullable: true })
  nameEn!: string | null;
}

export class AdminSupplierFilterOptionsDto {
  @ApiProperty({ type: [AdminSupplierFilterCategoryOptionDto] })
  categories!: AdminSupplierFilterCategoryOptionDto[];

  @ApiProperty({
    example: ['north', 'center', 'jerusalem'],
    description: 'Distinct service area tokens used by suppliers',
  })
  serviceAreas!: string[];
}

export class AdminSupplierExportDto {
  @ApiProperty({ example: 'suppliers-export.csv' })
  filename!: string;

  @ApiProperty({ example: 'text/csv; charset=utf-8' })
  contentType!: string;

  @ApiProperty({ description: 'UTF-8 CSV with BOM for Excel', example: 'id,businessName,...' })
  csv!: string;

  @ApiProperty({ example: 42 })
  rowCount!: number;
}

export class AdminDashboardResponseDto {
  @ApiProperty({ type: AdminDashboardPeriodDto })
  period!: AdminDashboardPeriodDto;

  @ApiProperty({ type: AdminDashboardKpisDto })
  kpis!: AdminDashboardKpisDto;

  @ApiProperty({ type: AdminDashboardSupplierEngagementDto })
  supplierEngagement!: AdminDashboardSupplierEngagementDto;

  @ApiProperty({ type: AdminDashboardPlatformGrowthDto })
  platformGrowth!: AdminDashboardPlatformGrowthDto;

  @ApiProperty({ type: AdminDashboardPendingApprovalsDto })
  pendingApprovals!: AdminDashboardPendingApprovalsDto;
}
