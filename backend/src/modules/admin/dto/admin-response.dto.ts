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
