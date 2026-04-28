import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsIn, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class RegisterDto {
  @ApiProperty({ description: 'User email', example: 'user@example.com' })
  @IsEmail()
  email!: string;

  @ApiPropertyOptional({ description: 'Password for local auth', minLength: 8, example: 'StrongPass123!' })
  @IsOptional()
  @IsString()
  @MinLength(8)
  @MaxLength(128)
  password?: string;

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

  @ApiPropertyOptional({ description: 'Password for local auth', minLength: 8, example: 'StrongPass123!' })
  @IsOptional()
  @IsString()
  @MinLength(8)
  @MaxLength(128)
  password?: string;
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
