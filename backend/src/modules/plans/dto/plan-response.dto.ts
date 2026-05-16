import { ApiProperty } from '@nestjs/swagger';

export class SubscriptionPlanDto {
  @ApiProperty({ example: 'plan_abc123' })
  id!: string;

  @ApiProperty({ example: 'annual' })
  key!: string;

  @ApiProperty({ example: 'A year - partners on the journey' })
  name!: string;

  @ApiProperty({ example: 'מנוי שנתי (Annual)', nullable: true })
  summaryTitle!: string | null;

  @ApiProperty({ example: 'לשנה אחת', nullable: true })
  totalPeriodNote!: string | null;

  @ApiProperty({ example: 'ANNUAL' })
  interval!: string;

  @ApiProperty({ example: '1390.00', description: 'Pretax amount' })
  pretaxAmount!: string;

  @ApiProperty({ example: '1626', description: 'Total including 17% VAT (computed)' })
  totalWithVat!: string;

  @ApiProperty({ example: '236', description: 'VAT amount (computed)' })
  vatAmount!: string;

  @ApiProperty({ example: 'ILS' })
  currency!: string;

  @ApiProperty({ example: 12 })
  billingMonths!: number;

  @ApiProperty({ example: 'THE MOST CHOSEN', nullable: true })
  badge!: string | null;

  @ApiProperty({ example: true })
  isFeatured!: boolean;

  @ApiProperty({ example: 1 })
  sortOrder!: number;

  @ApiProperty({ example: true })
  isActive!: boolean;

  @ApiProperty({ example: ['חשיפה בתוצאות החיפוש'] })
  features!: string[];

  @ApiProperty({ example: '2026-04-29T10:00:00.000Z' })
  createdAt!: string;

  @ApiProperty({ example: '2026-04-29T10:00:00.000Z' })
  updatedAt!: string;
}
