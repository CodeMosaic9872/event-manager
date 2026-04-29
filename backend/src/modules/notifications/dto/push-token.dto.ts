import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength } from 'class-validator';

export class RegisterPushTokenDto {
  @ApiProperty({ example: 'fcm_device_token_here' })
  @IsString()
  @MaxLength(4096)
  token!: string;

  @ApiPropertyOptional({ example: 'android' })
  @IsOptional()
  @IsString()
  @MaxLength(32)
  platform?: string;
}
