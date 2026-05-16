import { ApiProperty } from '@nestjs/swagger';

/** Top-level `pagination` on GET responses when the collection spans more than one page. */
export class PaginationMetaDto {
  @ApiProperty({ example: 1 })
  page!: number;

  @ApiProperty({ example: 20 })
  limit!: number;

  @ApiProperty({ example: 42 })
  totalItems!: number;

  @ApiProperty({ example: 3 })
  totalPages!: number;
}
