import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class PaymentSessionResponseDto {
  @ApiProperty()
  sessionId!: string;

  @ApiProperty({ description: 'Same as ReturnValue sent to CardCom (payment row id)' })
  returnValue!: string;

  @ApiPropertyOptional({ description: 'Hosted checkout URL from CardCom' })
  lowProfileUrl?: string | null;

  @ApiPropertyOptional()
  lowProfileCode!: string | null;

  @ApiProperty()
  status!: string;

  @ApiProperty()
  amount!: string;

  @ApiProperty()
  currency!: string;
}
