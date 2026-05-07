import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsIn, IsNotEmpty, IsOptional, IsString, Matches } from 'class-validator';

export class RegisterDto {
  @ApiProperty({ description: 'User email', example: 'user@example.com' })
  @IsEmail()
  email!: string;

  @ApiProperty({
    description: 'User mobile phone (Israeli mobile, e.g. 05XXXXXXXX or +9725XXXXXXXX). Must be OTP-verified before calling /auth/register.',
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
  @ApiProperty({ description: 'User email', example: 'user@example.com' })
  @IsEmail()
  email!: string;

  @ApiProperty({
    description: 'User mobile phone (Israeli mobile, e.g. 05XXXXXXXX or +9725XXXXXXXX). Must be OTP-verified before calling /auth/login.',
    example: '0501234567',
  })
  @IsString()
  @IsNotEmpty()
  phone!: string;
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
  @ApiProperty({
    description: 'Israeli mobile phone (e.g. 05XXXXXXXX or +9725XXXXXXXX)',
    example: '0501234567',
  })
  @IsString()
  @IsNotEmpty()
  phone!: string;

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
  @ApiProperty({
    description: 'Israeli mobile phone (e.g. 05XXXXXXXX or +9725XXXXXXXX)',
    example: '0501234567',
  })
  @IsString()
  @IsNotEmpty()
  phone!: string;

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
