import { ApiProperty } from '@nestjs/swagger';

class SupplierListItemDto {
  @ApiProperty({ example: 'sup_1' })
  id!: string;

  @ApiProperty({ example: 'Skyline Events DJ' })
  businessName!: string;

  @ApiProperty({ example: 4.8 })
  ratingAvg!: number;
}

export class SuppliersListResponseDto {
  @ApiProperty({ type: [SupplierListItemDto] })
  items!: SupplierListItemDto[];

  @ApiProperty({ example: 'sup_1', nullable: true })
  nextCursor!: string | null;

  @ApiProperty({ example: { categories: [{ id: 'cat_1', name: 'Music', count: 12 }] } })
  facets!: Record<string, unknown>;
}

export class SupplierProfileResponseDto {
  @ApiProperty({ example: 'sup_1' })
  id!: string;

  @ApiProperty({ example: 'skyline-events-dj' })
  slug!: string;

  @ApiProperty({ example: 'Skyline Events DJ' })
  businessName!: string;

  @ApiProperty({ example: 'Wedding and private event DJ services' })
  description!: string;
}

export class ShareTrackResponseDto {
  @ApiProperty({ example: 'share_123' })
  id!: string;

  @ApiProperty({ example: 'sup_1' })
  supplierId!: string;

  @ApiProperty({ example: 'copy_link' })
  channel!: string;

  @ApiProperty({ example: 'supplier_profile_header' })
  context!: string;
}
