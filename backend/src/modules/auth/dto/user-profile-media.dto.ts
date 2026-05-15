import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsString, MaxLength } from 'class-validator';

export class CreateUserProfileMediaUploadUrlDto {
  @ApiProperty({ example: 'avatar.jpg' })
  @IsString()
  @MaxLength(255)
  fileName!: string;

  @ApiProperty({ example: 'image/jpeg' })
  @IsString()
  @MaxLength(100)
  contentType!: string;
}

export class VerifyUserProfileMediaUploadDto {
  @ApiProperty({ example: 'users/clxyz/uuid-avatar.jpg' })
  @IsString()
  @MaxLength(512)
  key!: string;
}

export class CompleteUserProfileImageUploadDto {
  @ApiProperty({ example: 'users/clxyz/uuid-avatar.jpg' })
  @IsString()
  @MaxLength(512)
  key!: string;

  @ApiProperty({ enum: ['avatar', 'cover'], example: 'avatar' })
  @IsIn(['avatar', 'cover'])
  imageKind!: 'avatar' | 'cover';
}

export class CreateTestMediaUploadUrlDto {
  @ApiProperty({ example: 'test-image.jpg' })
  @IsString()
  @MaxLength(255)
  fileName!: string;

  @ApiProperty({ example: 'image/jpeg' })
  @IsString()
  @MaxLength(100)
  contentType!: string;
}

export class VerifyTestMediaUploadDto {
  @ApiProperty({ example: 'test-uploads/uuid-test-image.jpg' })
  @IsString()
  @MaxLength(512)
  key!: string;
}

export class UploadUserProfileImageFileDto {
  @ApiProperty({ enum: ['avatar', 'cover'], example: 'avatar' })
  @IsIn(['avatar', 'cover'])
  imageKind!: 'avatar' | 'cover';
}
