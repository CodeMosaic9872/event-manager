import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsObject, IsOptional, IsString, MaxLength } from 'class-validator';

export class CompleteMediaUploadDto {
  @ApiProperty({ example: 'suppliers/sup_123/uuid-cover-photo.jpg' })
  @IsString()
  @MaxLength(512)
  key!: string;

  @ApiProperty({ example: 'image' })
  @IsString()
  @MaxLength(64)
  mediaType!: string;

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  sortOrder?: number;

  @ApiPropertyOptional({ description: 'Optional media metadata object' })
  @IsOptional()
  @IsObject()
  metadataJson?: Record<string, unknown>;
}
