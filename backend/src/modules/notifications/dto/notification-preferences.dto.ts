import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsBoolean, IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateNotificationPreferencesDto {
  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  emailEnabled?: boolean;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  pushEnabled?: boolean;

  @ApiPropertyOptional({ example: ['job.matching.published'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @MaxLength(128, { each: true })
  mutedTemplates?: string[];
}

export class NotificationPreferencesResponseDto {
  @ApiProperty({ example: 'usr_1' })
  userId!: string;

  @ApiProperty({ example: true })
  emailEnabled!: boolean;

  @ApiProperty({ example: true })
  pushEnabled!: boolean;

  @ApiProperty({ example: ['job.matching.published'] })
  mutedTemplates!: string[];
}
