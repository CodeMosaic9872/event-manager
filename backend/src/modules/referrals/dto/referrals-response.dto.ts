import { ApiProperty } from '@nestjs/swagger';

export class SupplierReferralLinkResponseDto {
  @ApiProperty({ example: 'sup_123' })
  supplierId!: string;

  @ApiProperty({ example: 'REF-123ABC' })
  referralCode!: string;

  @ApiProperty({ example: 'https://app.example.com/r/REF-123ABC' })
  url!: string;
}

export class ReferralAttributionResponseDto {
  @ApiProperty({ example: 'attr_1' })
  id!: string;

  @ApiProperty({ example: 'sup_123' })
  supplierId!: string;

  @ApiProperty({ example: 'usr_456' })
  referredUserId!: string;

  @ApiProperty({ example: 'ATTRIBUTED' })
  status!: string;
}

export class PatchReferralRewardResponseDto {
  @ApiProperty({ example: 'reward_1' })
  id!: string;

  @ApiProperty({ example: true })
  updated!: boolean;

  @ApiProperty({ example: { status: 'APPROVED' } })
  body!: Record<string, unknown>;
}
