import { ApiProperty } from '@nestjs/swagger';
import { IsString, MaxLength } from 'class-validator';

export class VerifyMediaUploadDto {
  @ApiProperty({ example: 'suppliers/sup_123/uuid-cover-photo.jpg' })
  @IsString()
  @MaxLength(512)
  key!: string;
}
