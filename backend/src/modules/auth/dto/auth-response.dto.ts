import { ApiProperty } from '@nestjs/swagger';

export class AuthUserSummaryDto {
  @ApiProperty({ example: 'usr_123' })
  id!: string;

  @ApiProperty({ example: 'user@example.com' })
  email!: string;

  @ApiProperty({ example: ['USER', 'SUPPLIER'], type: [String] })
  roles!: string[];
}

export class AuthTokensResponseDto {
  @ApiProperty({ example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' })
  accessToken!: string;

  @ApiProperty({ example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' })
  refreshToken!: string;

  @ApiProperty({ type: AuthUserSummaryDto })
  user!: AuthUserSummaryDto;
}

export class RefreshTokensResponseDto {
  @ApiProperty({ example: 'new_access_token' })
  accessToken!: string;

  @ApiProperty({ example: 'new_refresh_token' })
  refreshToken!: string;
}

export class MeResponseDto {
  @ApiProperty({ type: [AuthUserSummaryDto] })
  items!: AuthUserSummaryDto[];

  @ApiProperty({ example: 1 })
  totalItems!: number;
}

export class RequestOtpResponseDto {
  @ApiProperty({ example: true })
  sent!: boolean;

  @ApiProperty({ example: 'fixed', enum: ['fixed', 'live'] })
  mode!: 'fixed' | 'live';

  @ApiProperty({ example: '2026-05-07T22:35:00.000Z', type: String })
  expiresAt!: Date;
}

export class VerifyOtpResponseDto {
  @ApiProperty({ example: true })
  verified!: true;
}
