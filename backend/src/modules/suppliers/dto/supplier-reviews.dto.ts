import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsString, Max, MaxLength, Min } from 'class-validator';

export class CreateSupplierReviewDto {
  @ApiProperty({ description: 'Star rating 1–5', minimum: 1, maximum: 5, example: 5 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(5)
  rating!: number;

  @ApiPropertyOptional({ example: 'Great experience' })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  title?: string;

  @ApiPropertyOptional({ example: 'Professional team, on time and flexible with changes.' })
  @IsOptional()
  @IsString()
  @MaxLength(4000)
  comment?: string;
}

export class UpdateSupplierReviewDto {
  @ApiPropertyOptional({ description: 'Star rating 1–5', minimum: 1, maximum: 5 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(5)
  rating?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(200)
  title?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(4000)
  comment?: string;
}

export class SupplierReviewAuthorDto {
  @ApiProperty()
  id!: string;
}

export class SupplierReviewResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  supplierId!: string;

  @ApiProperty()
  authorUserId!: string;

  @ApiProperty({ type: SupplierReviewAuthorDto, required: false, nullable: true })
  author?: SupplierReviewAuthorDto | null;

  @ApiProperty()
  rating!: number;

  @ApiPropertyOptional({ nullable: true })
  title!: string | null;

  @ApiPropertyOptional({ nullable: true })
  comment!: string | null;

  @ApiProperty()
  createdAt!: Date;

  @ApiProperty()
  updatedAt!: Date;
}

export class SupplierReviewListResponseDto {
  @ApiProperty({ type: [SupplierReviewResponseDto] })
  items!: SupplierReviewResponseDto[];

  @ApiProperty()
  totalItems!: number;
}
