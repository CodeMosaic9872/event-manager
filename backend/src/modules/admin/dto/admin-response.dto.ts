import { ApiProperty } from '@nestjs/swagger';

export class AdminSupplierReviewDto {
  @ApiProperty({ example: 'sup_1' })
  id!: string;

  @ApiProperty({ example: 'Skyline Events DJ' })
  businessName!: string;

  @ApiProperty({ example: 'PENDING' })
  approvalStatus!: string;
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
