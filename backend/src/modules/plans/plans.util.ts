import { Prisma } from '@prisma/client';

const DEFAULT_VAT_RATE = 0.17;

export function computeVatFromPretax(pretaxShekels: number, vatRate = DEFAULT_VAT_RATE) {
  const pretax = Number(pretaxShekels);
  const vat = Math.round(pretax * vatRate);
  return { pretax, vat, total: pretax + vat };
}

export function pretaxToDecimalTotal(pretax: Prisma.Decimal | number): Prisma.Decimal {
  const pretaxNum = typeof pretax === 'number' ? pretax : Number(pretax);
  const { total } = computeVatFromPretax(pretaxNum);
  return new Prisma.Decimal(total);
}
