import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class SupplierReferralLinkResponseDto {
  @ApiProperty({ example: 'sup_123' })
  supplierId!: string;

  @ApiProperty({ example: 'REF-123ABC' })
  referralCode!: string;

  @ApiProperty({ example: 'https://app.example.com/r/REF-123ABC' })
  url!: string;
}

export class ReferralAttributionItemDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  referralLinkId!: string;

  @ApiPropertyOptional({ nullable: true })
  referredUserId!: string | null;

  @ApiPropertyOptional({ nullable: true })
  referredSupplierId!: string | null;

  @ApiProperty()
  status!: string;

  @ApiProperty()
  createdAt!: Date;

  @ApiProperty()
  updatedAt!: Date;

  @ApiPropertyOptional({ nullable: true })
  completedAt!: Date | null;
}

export class ReferralAttributionsListResponseDto {
  @ApiProperty()
  supplierId!: string;

  @ApiProperty({ type: [ReferralAttributionItemDto] })
  items!: ReferralAttributionItemDto[];

  @ApiProperty()
  totalItems!: number;
}

export class ReferralRewardItemDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  supplierId!: string;

  @ApiProperty()
  attributionId!: string;

  @ApiProperty()
  status!: string;

  @ApiPropertyOptional({ nullable: true })
  amountCents!: number | null;

  @ApiPropertyOptional({ nullable: true })
  currency!: string | null;

  @ApiPropertyOptional({ nullable: true })
  approvedAt!: Date | null;

  @ApiPropertyOptional({ nullable: true })
  paidAt!: Date | null;

  @ApiProperty()
  createdAt!: Date;

  @ApiProperty()
  updatedAt!: Date;

  @ApiProperty({ type: ReferralAttributionItemDto })
  attribution!: ReferralAttributionItemDto;
}

export class ReferralRewardsListResponseDto {
  @ApiProperty()
  supplierId!: string;

  @ApiProperty({ type: [ReferralRewardItemDto] })
  items!: ReferralRewardItemDto[];

  @ApiProperty()
  totalItems!: number;
}

export class ReferralLinkSummaryDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  supplierId!: string;

  @ApiProperty()
  code!: string;

  @ApiProperty()
  url!: string;
}

export class ReferralAttributionWithLinkDto extends ReferralAttributionItemDto {
  @ApiPropertyOptional({ type: ReferralLinkSummaryDto })
  referralLink?: ReferralLinkSummaryDto;
}

export class AdminReferralRewardItemDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  supplierId!: string;

  @ApiProperty()
  attributionId!: string;

  @ApiProperty()
  status!: string;

  @ApiPropertyOptional({ nullable: true })
  amountCents!: number | null;

  @ApiPropertyOptional({ nullable: true })
  currency!: string | null;

  @ApiPropertyOptional({ nullable: true })
  approvedAt!: Date | null;

  @ApiPropertyOptional({ nullable: true })
  paidAt!: Date | null;

  @ApiProperty()
  createdAt!: Date;

  @ApiProperty()
  updatedAt!: Date;

  @ApiProperty({
    type: Object,
    description: 'Full Supplier row from Prisma `include: { supplier: true }`',
  })
  supplier!: Record<string, unknown>;

  @ApiProperty({
    type: ReferralAttributionWithLinkDto,
    description: 'Attribution with nested `referralLink`',
  })
  attribution!: ReferralAttributionWithLinkDto;
}

export class AdminReferralRewardsListResponseDto {
  @ApiProperty({ type: [AdminReferralRewardItemDto] })
  items!: AdminReferralRewardItemDto[];

  @ApiProperty()
  totalItems!: number;
}

export class PatchReferralRewardResponseDto {
  @ApiProperty({ example: 'reward_1' })
  id!: string;

  @ApiProperty({ example: true })
  updated!: boolean;

  @ApiProperty({ example: { status: 'APPROVED' } })
  body!: Record<string, unknown>;
}
