import { ApiProperty } from '@nestjs/swagger';

export class SendTestEmailResponseDto {
  @ApiProperty({ example: true })
  ok!: true;

  @ApiProperty()
  messageId!: string;

  @ApiProperty()
  to!: string;
}

export class PushDeviceTokenResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty({ nullable: true })
  userId!: string | null;

  @ApiProperty({ nullable: true })
  supplierId!: string | null;

  @ApiProperty()
  token!: string;

  @ApiProperty({ nullable: true })
  platform!: string | null;

  @ApiProperty()
  isActive!: boolean;

  @ApiProperty()
  createdAt!: Date;

  @ApiProperty()
  updatedAt!: Date;

  @ApiProperty()
  lastSeenAt!: Date;
}

export class PushTokenDeactivateResponseDto {
  @ApiProperty({ description: 'Number of rows updated (0 or 1 for a valid owned token)' })
  count!: number;
}
