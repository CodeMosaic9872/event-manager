import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class AuthUserSummaryDto {
  @ApiProperty({ example: 'usr_123' })
  id!: string;

  @ApiProperty({ example: 'user@example.com' })
  email!: string;

  @ApiProperty({ example: ['USER', 'SUPPLIER'], type: [String] })
  roles!: string[];

  @ApiPropertyOptional({ example: 'https://cdn.example.com/users/usr_123/avatar.jpg', nullable: true })
  avatarImageUrl!: string | null;

  @ApiPropertyOptional({ example: 'https://cdn.example.com/users/usr_123/cover.jpg', nullable: true })
  coverImageUrl!: string | null;
}

/** `/auth/me` and `/auth/me` PATCH response item: user summary plus supplier bundle when role is SUPPLIER. */
export class AuthMeItemDto extends AuthUserSummaryDto {
  @ApiPropertyOptional({
    description:
      'When `roles` includes `SUPPLIER`, mirrors `supplier.businessName` for convenience. `null` if not a supplier or supplier profile not created yet.',
    example: 'Skyline Events DJ',
    nullable: true,
  })
  businessName?: string | null;

  @ApiPropertyOptional({
    description:
      'Present when `roles` includes `SUPPLIER`: supplier profile, media, categories, service areas, attributes, onboarding draft, subscription summary (no CardCom token), recent approval history, and counts. `null` if the supplier row has not been created yet.',
    nullable: true,
    type: Object,
  })
  supplier?: Record<string, unknown> | null;
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
  @ApiProperty({ type: [AuthMeItemDto] })
  items!: AuthMeItemDto[];

  @ApiProperty({ example: 1 })
  totalItems!: number;
}

export class RequestOtpResponseDto {
  @ApiProperty({ example: true })
  sent!: boolean;

  @ApiProperty({ example: 'OTP sent successfully.' })
  message!: string;

  @ApiProperty({ example: 'fixed', enum: ['fixed', 'live'] })
  mode!: 'fixed' | 'live';

  @ApiProperty({ example: '2026-05-07T22:35:00.000Z', type: String })
  expiresAt!: Date;
}

export class VerifyOtpResponseDto {
  @ApiProperty({ example: true })
  verified!: true;

  @ApiProperty({ example: 'OTP verified successfully.' })
  message!: string;
}
