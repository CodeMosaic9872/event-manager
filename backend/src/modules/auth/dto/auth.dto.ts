import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsIn, IsNotEmpty, IsOptional, IsString, Matches, ValidateIf } from 'class-validator';

export class RegisterDto {
  @ApiProperty({ description: 'User email', example: 'user@example.com' })
  @IsEmail()
  email!: string;

  @ApiProperty({
    description: 'User phone/mobile number (Israeli mobile, e.g. 05XXXXXXXX or +9725XXXXXXXX). Must be OTP-verified before calling /auth/register.',
    example: '0501234567',
  })
  @IsString()
  @IsNotEmpty()
  phone!: string;

  @ApiPropertyOptional({
    description: 'Role to register/extend',
    enum: ['USER', 'SUPPLIER', 'ADMIN'],
    example: 'USER',
  })
  @IsOptional()
  @IsString()
  @IsIn(['USER', 'SUPPLIER', 'ADMIN'])
  role?: 'USER' | 'SUPPLIER' | 'ADMIN';
}

export class LoginDto {
  @ApiPropertyOptional({
    description: 'User email (provide either email OR phone, not both)',
    example: 'user@example.com',
  })
  @ValidateIf((o: LoginDto) => !o.phone)
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({
    description: 'User mobile phone (Israeli mobile). Provide either phone OR email, not both.',
    example: '0501234567',
  })
  @ValidateIf((o: LoginDto) => !o.email)
  @IsString()
  @IsNotEmpty()
  phone?: string;

  @ApiProperty({
    description: 'OTP code received via SMS/email (or fixed code when AUTH_FIXED_OTP_ENABLED=true)',
    example: '123456',
  })
  @IsString()
  @Matches(/^\d{4,8}$/, { message: 'code must be 4-8 digits' })
  code!: string;
}

export class RefreshDto {
  @ApiProperty({ description: 'Refresh token', example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' })
  @IsString()
  token!: string;
}

export class AnonymousSessionDto {
  @ApiPropertyOptional({ description: 'Client fingerprint hash', example: 'fp_2df8cb4a' })
  @IsOptional()
  @IsString()
  fingerprintHash?: string;

  @ApiPropertyOptional({ description: 'Client ip hash', example: 'ip_7f0a91c3' })
  @IsOptional()
  @IsString()
  ipHash?: string;
}

export class LinkAnonymousDto {
  @ApiProperty({ description: 'Anonymous token to link', example: 'anon_eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' })
  @IsString()
  anonymousToken!: string;
}

export class RequestOtpDto {
  @ApiPropertyOptional({
    description: 'Israeli mobile phone (provide either phone OR email)',
    example: '0501234567',
  })
  @ValidateIf((o: RequestOtpDto) => !o.email)
  @IsString()
  @IsNotEmpty()
  phone?: string;

  @ApiPropertyOptional({
    description: 'Email address (provide either email OR phone)',
    example: 'user@example.com',
  })
  @ValidateIf((o: RequestOtpDto) => !o.phone)
  @IsEmail()
  email?: string;

  @ApiProperty({
    description: 'OTP purpose - register or login',
    enum: ['register', 'login'],
    example: 'register',
  })
  @IsString()
  @IsIn(['register', 'login'])
  purpose!: 'register' | 'login';
}

export class VerifyOtpDto {
  @ApiPropertyOptional({
    description: 'Israeli mobile phone (provide either phone OR email)',
    example: '0501234567',
  })
  @ValidateIf((o: VerifyOtpDto) => !o.email)
  @IsString()
  @IsNotEmpty()
  phone?: string;

  @ApiPropertyOptional({
    description: 'Email address (provide either email OR phone)',
    example: 'user@example.com',
  })
  @ValidateIf((o: VerifyOtpDto) => !o.phone)
  @IsEmail()
  email?: string;

  @ApiProperty({
    description: '6-digit OTP code received via SMS',
    example: '123456',
  })
  @IsString()
  @Matches(/^\d{4,8}$/, { message: 'code must be 4-8 digits' })
  code!: string;

  @ApiProperty({
    description: 'OTP purpose - must match the purpose used in /auth/request-otp',
    enum: ['register', 'login'],
    example: 'register',
  })
  @IsString()
  @IsIn(['register', 'login'])
  purpose!: 'register' | 'login';
}
