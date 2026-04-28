import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ErrorResponseDto {
  @ApiProperty({ example: 'BAD_REQUEST' })
  code!: string;

  @ApiProperty({ example: 'Validation failed' })
  message!: string;

  @ApiPropertyOptional({ example: [{ field: 'email', message: 'email must be an email' }] })
  details?: unknown;

  @ApiProperty({ example: 'd5b4f6d2-01a4-41f5-91e3-fda8e7eb9084' })
  traceId!: string;
}
