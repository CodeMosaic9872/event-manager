import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class CreateSavedConceptDto {
  @ApiPropertyOptional({ example: 'Garden wedding — rustic theme' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  title?: string;

  @ApiProperty({
    example: 'Outdoor ceremony with live acoustic set, farm tables, and warm lighting…',
  })
  @IsString()
  @MinLength(1)
  @MaxLength(20000)
  content!: string;

  @ApiPropertyOptional({ description: 'Optional AI conversation this concept came from' })
  @IsOptional()
  @IsString()
  @MaxLength(64)
  sourceConversationId?: string;
}

export class SavedConceptResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  userId!: string;

  @ApiPropertyOptional({ nullable: true })
  title!: string | null;

  @ApiProperty()
  content!: string;

  @ApiPropertyOptional({ nullable: true })
  sourceConversationId!: string | null;

  @ApiProperty()
  createdAt!: Date;

  @ApiProperty()
  updatedAt!: Date;
}

export class SavedConceptListResponseDto {
  @ApiProperty({ type: [SavedConceptResponseDto] })
  items!: SavedConceptResponseDto[];

  @ApiProperty()
  totalItems!: number;
}

export class DeleteConceptResponseDto {
  @ApiProperty({ example: true })
  deleted!: true;
}
