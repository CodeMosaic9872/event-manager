import { ApiProperty } from '@nestjs/swagger';

export class HealthResponseDto {
  @ApiProperty({ example: true })
  ok!: boolean;

  @ApiProperty({ example: 'event-marketplace-backend' })
  service!: string;

  @ApiProperty({ example: '2026-05-16T12:00:00.000Z' })
  timestamp!: string;
}

export class VersionResponseDto {
  @ApiProperty({ example: 'event-marketplace-backend' })
  name!: string;

  @ApiProperty({ example: '0.1.0' })
  version!: string;

  @ApiProperty({ example: 'phase-0-foundation' })
  phase!: string;
}
