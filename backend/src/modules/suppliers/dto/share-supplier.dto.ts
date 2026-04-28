import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength, IsIn } from 'class-validator';

export class ShareSupplierDto {
  @ApiPropertyOptional({
    description: 'Share channel used by actor',
    enum: ['copy_link', 'whatsapp', 'telegram', 'email', 'other'],
    example: 'copy_link',
  })
  @IsOptional()
  @IsString()
  @IsIn(['copy_link', 'whatsapp', 'telegram', 'email', 'other'])
  channel?: string;

  @ApiPropertyOptional({
    description: 'Optional context where share action happened',
    example: 'supplier_profile_header',
  })
  @IsOptional()
  @IsString()
  @MaxLength(128)
  context?: string;
}
