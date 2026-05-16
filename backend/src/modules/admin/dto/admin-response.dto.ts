import { ApiProperty } from '@nestjs/swagger';

export class AdminSupplierOwnerSummaryDto {
  @ApiProperty({ example: 'usr_123' })
  id!: string;

  @ApiProperty({ example: 'owner@example.com', nullable: true })
  email!: string | null;

  @ApiProperty({ example: '+972501234567', nullable: true })
  phone!: string | null;

  @ApiProperty({ example: 'ACTIVE' })
  status!: string;
}

export class AdminSupplierSubscriptionSummaryDto {
  @ApiProperty({ example: 'sub_123' })
  id!: string;

  @ApiProperty({ example: 'ACTIVE' })
  status!: string;

  @ApiProperty({ example: 'MONTHLY' })
  interval!: string;

  @ApiProperty({ example: '199.00' })
  amount!: string;

  @ApiProperty({ example: 'ILS' })
  currency!: string;

  @ApiProperty({ example: '2026-06-01T00:00:00.000Z' })
  nextBillingAt!: string;
}

export class AdminSupplierCrudDto {
  @ApiProperty({ example: 'sup_1' })
  id!: string;

  @ApiProperty({ example: 'usr_owner' })
  ownerUserId!: string;

  @ApiProperty({ example: 'Skyline Events DJ' })
  businessName!: string;

  @ApiProperty({ example: 'skyline-events-dj' })
  slug!: string;

  @ApiProperty({ example: 'PENDING' })
  approvalStatus!: string;

  @ApiProperty({ example: true })
  isActive!: boolean;

  @ApiProperty({ example: false })
  isVerified!: boolean;

  @ApiProperty({ example: 'Premium DJ services.', nullable: true })
  description!: string | null;

  @ApiProperty({ example: 'hello@skylineevents.co.il', nullable: true })
  contactEmail!: string | null;

  @ApiProperty({ example: '0501234567', nullable: true })
  publicPhone!: string | null;

  @ApiProperty({ example: ['north'] })
  serviceAreas!: string[];

  @ApiProperty({ example: '2026-04-29T10:00:00.000Z' })
  createdAt!: string;

  @ApiProperty({ example: '2026-04-29T10:00:00.000Z' })
  updatedAt!: string;

  @ApiProperty({ example: null, nullable: true })
  deletedAt!: string | null;

  @ApiProperty({ type: AdminSupplierOwnerSummaryDto, nullable: true })
  owner?: AdminSupplierOwnerSummaryDto | null;

  @ApiProperty({ type: AdminSupplierSubscriptionSummaryDto, nullable: true })
  subscription?: AdminSupplierSubscriptionSummaryDto | null;
}

export class AdminSupplierReviewDto {
  @ApiProperty({ example: 'sup_1' })
  id!: string;

  @ApiProperty({ example: 'Skyline Events DJ' })
  businessName!: string;

  @ApiProperty({ example: 'PENDING' })
  approvalStatus!: string;
}

export class AdminSubscriptionSupplierSummaryDto {
  @ApiProperty({ example: 'sup_1' })
  id!: string;

  @ApiProperty({ example: 'Skyline Events DJ' })
  businessName!: string;

  @ApiProperty({ example: 'skyline-events-dj' })
  slug!: string;
}

export class AdminSubscriptionPlanSummaryDto {
  @ApiProperty({ example: 'plan_123' })
  id!: string;

  @ApiProperty({ example: 'annual' })
  key!: string;

  @ApiProperty({ example: 'A year - partners on the journey' })
  name!: string;
}

export class AdminSubscriptionCrudDto {
  @ApiProperty({ example: 'sub_123' })
  id!: string;

  @ApiProperty({ example: 'sup_1' })
  supplierId!: string;

  @ApiProperty({ example: 'plan_123', nullable: true })
  planId!: string | null;

  @ApiProperty({ example: 'ACTIVE' })
  status!: string;

  @ApiProperty({ example: 'MONTHLY' })
  interval!: string;

  @ApiProperty({ example: 'supplier_monthly', nullable: true })
  planKey!: string | null;

  @ApiProperty({ example: '199.00' })
  amount!: string;

  @ApiProperty({ example: 'ILS' })
  currency!: string;

  @ApiProperty({ example: '****c123', description: 'Masked CardCom token' })
  cardcomToken!: string;

  @ApiProperty({ example: '2026-06-01T00:00:00.000Z' })
  nextBillingAt!: string;

  @ApiProperty({ example: null, nullable: true })
  tokenExpiresAt!: string | null;

  @ApiProperty({ example: null, nullable: true })
  lastRenewedAt!: string | null;

  @ApiProperty({ example: 0 })
  consecutiveFailures!: number;

  @ApiProperty({ example: null, nullable: true })
  canceledAt!: string | null;

  @ApiProperty({ example: '2026-04-29T10:00:00.000Z' })
  createdAt!: string;

  @ApiProperty({ example: '2026-04-29T10:00:00.000Z' })
  updatedAt!: string;

  @ApiProperty({ type: AdminSubscriptionSupplierSummaryDto, nullable: true })
  supplier?: AdminSubscriptionSupplierSummaryDto | null;

  @ApiProperty({ type: AdminSubscriptionPlanSummaryDto, nullable: true })
  plan?: AdminSubscriptionPlanSummaryDto | null;
}

export class AdminApproveSupplierResponseDto {
  @ApiProperty({ example: 'sup_1' })
  id!: string;

  @ApiProperty({ example: 'APPROVED' })
  approvalStatus!: string;
}

export class AdminEventTypeResponseDto {
  @ApiProperty({ example: 'evt_123' })
  id!: string;

  @ApiProperty({ example: 'wedding' })
  key!: string;

  @ApiProperty({ example: 'Wedding' })
  name!: string;

  @ApiProperty({ example: true })
  isActive!: boolean;
}

export class CreateAdminUserResponseDto {
  @ApiProperty({ example: 'usr_123' })
  id!: string;

  @ApiProperty({ example: 'ops@example.com', nullable: true })
  email!: string | null;

  @ApiProperty({ example: '+972501234567', nullable: true })
  phone!: string | null;

  @ApiProperty({ example: 'ACTIVE' })
  status!: string;

  @ApiProperty({ example: ['ADMIN'] })
  roles!: string[];

  @ApiProperty({ example: '2026-04-29T10:00:00.000Z' })
  createdAt!: string;
}

export class AdminUserListItemDto {
  @ApiProperty({ example: 'usr_123' })
  id!: string;

  @ApiProperty({ example: 'planner@example.com', nullable: true })
  email!: string | null;

  @ApiProperty({ example: '+972501234567', nullable: true })
  phone!: string | null;

  @ApiProperty({ example: 'ACTIVE' })
  status!: string;

  @ApiProperty({ example: ['USER'] })
  roles!: string[];

  @ApiProperty({ example: 'sup_123', nullable: true })
  supplierId!: string | null;

  @ApiProperty({ example: 'DRAFT', nullable: true })
  supplierApprovalStatus!: string | null;

  @ApiProperty({ example: '2026-04-29T10:00:00.000Z' })
  createdAt!: string;
}

export class AdminNotificationProviderHealthDto {
  @ApiProperty({ example: true })
  configured!: boolean;

  @ApiProperty({ example: 'smtp' })
  mode!: string;
}

export class AdminNotificationProvidersHealthResponseDto {
  @ApiProperty({
    type: AdminNotificationProviderHealthDto,
  })
  email!: AdminNotificationProviderHealthDto;

  @ApiProperty({
    type: AdminNotificationProviderHealthDto,
  })
  push!: AdminNotificationProviderHealthDto;

  @ApiProperty({
    type: AdminNotificationProviderHealthDto,
  })
  sms!: AdminNotificationProviderHealthDto;
}
