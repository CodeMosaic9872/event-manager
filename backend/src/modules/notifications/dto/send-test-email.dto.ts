import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsOptional } from 'class-validator';

export class SendTestEmailDto {
  @ApiPropertyOptional({
    description: 'Recipient address (defaults to the project test inbox when omitted)',
    example: 'arora.aashish3988@gmail.com',
  })
  @IsOptional()
  @IsEmail()
  to?: string;
}
