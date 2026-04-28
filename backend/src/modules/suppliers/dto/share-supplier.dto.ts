import { IsOptional, IsString, MaxLength, IsIn } from 'class-validator';

export class ShareSupplierDto {
  @IsOptional()
  @IsString()
  @IsIn(['copy_link', 'whatsapp', 'telegram', 'email', 'other'])
  channel?: string;

  @IsOptional()
  @IsString()
  @MaxLength(128)
  context?: string;
}
