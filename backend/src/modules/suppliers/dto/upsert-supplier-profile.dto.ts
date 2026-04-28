import { IsOptional, IsString, Length, Matches } from 'class-validator';

export class UpsertSupplierProfileDto {
  @IsString()
  @Length(2, 120)
  businessName!: string;

  @IsString()
  @Matches(/^[a-z0-9-]+$/, {
    message: 'slug must contain lowercase letters, numbers, and hyphens only',
  })
  @Length(3, 120)
  slug!: string;

  @IsOptional()
  @IsString()
  @Length(0, 1000)
  description?: string;
}
