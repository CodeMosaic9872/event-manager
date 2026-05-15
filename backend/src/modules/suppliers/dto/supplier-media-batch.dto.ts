import { ApiProperty } from '@nestjs/swagger';
import { ArrayMaxSize, ArrayMinSize, IsArray, IsString, MaxLength } from 'class-validator';

export class DeleteSupplierMediaBatchDto {
  @ApiProperty({
    description: '`SupplierMedia` ids to delete (must belong to the authenticated supplier). Unknown ids are ignored.',
    example: ['smed_abc123', 'smed_def456'],
    type: [String],
  })
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(100)
  @IsString({ each: true })
  @MaxLength(64, { each: true })
  ids!: string[];
}
