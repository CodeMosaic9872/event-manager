import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsOptional, IsString } from 'class-validator';

export class SupplierIdQueryDto {
  @ApiProperty({ description: 'Supplier id', example: 'sup_123' })
  @IsString()
  supplierId!: string;
}

export class PatchReferralRewardDto {
  @ApiPropertyOptional({
    description: 'Updated reward status',
    enum: ['PENDING', 'APPROVED', 'REJECTED', 'PAID'],
    example: 'APPROVED',
  })
  @IsOptional()
  @IsString()
  @IsIn(['PENDING', 'APPROVED', 'REJECTED', 'PAID'])
  status?: 'PENDING' | 'APPROVED' | 'REJECTED' | 'PAID';
}
