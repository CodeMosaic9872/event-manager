import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { CardcomClient, isCardcomSoapOk } from './providers/cardcom.client';
import type { CardcomIndicatorParsed } from './providers/cardcom.types';
import {
  buildPublicIndicatorUrl,
  cardcomBillGoldUserId,
  cardcomTerminalNumber,
  defaultRedirectUrls,
  optionalEnv,
  requireEnv,
} from './cardcom.config';
import type { CreateCardcomSessionDto } from './dto/create-cardcom-session.dto';

function flattenParams(query: Record<string, unknown>, body: unknown): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [k, v] of Object.entries(query)) {
    if (v === undefined || v === null) continue;
    if (Array.isArray(v)) {
      out[k] = String(v[0]);
    } else {
      out[k] = String(v);
    }
  }
  if (body && typeof body === 'object' && !Buffer.isBuffer(body)) {
    for (const [k, v] of Object.entries(body as Record<string, unknown>)) {
      if (v === undefined || v === null) continue;
      out[k] = typeof v === 'string' ? v : String(v);
    }
  }
  return out;
}

function pickCaseInsensitive(flat: Record<string, string>, keys: string[]): string | undefined {
  const lowerMap = new Map<string, string>();
  for (const [k, v] of Object.entries(flat)) {
    lowerMap.set(k.toLowerCase(), v);
  }
  for (const k of keys) {
    const v = flat[k] ?? lowerMap.get(k.toLowerCase());
    if (v !== undefined && v !== '') return v;
  }
  return undefined;
}

function parseTokenExDate(raw: string | null | undefined): Date | null {
  if (!raw) return null;
  const t = Date.parse(raw);
  if (!Number.isNaN(t)) return new Date(t);
  const m = raw.trim().match(/^(\d{1,2})\.(\d{1,2})\.(\d{4})/);
  if (m) {
    const d = Number.parseInt(m[1], 10);
    const mo = Number.parseInt(m[2], 10) - 1;
    const y = Number.parseInt(m[3], 10);
    const dt = new Date(Date.UTC(y, mo, d));
    return Number.isNaN(dt.getTime()) ? null : dt;
  }
  return null;
}

function buildCheckoutUrl(baseUrl: string | null, urlPath: string | null): string | null {
  if (urlPath && /^https?:\/\//i.test(urlPath)) return urlPath;
  if (baseUrl && urlPath) {
    return `${baseUrl.replace(/\/$/, '')}/${urlPath.replace(/^\//, '')}`;
  }
  return urlPath || baseUrl;
}

function resolvePaymentStatus(ind: CardcomIndicatorParsed): 'PAID' | 'FAILED' | 'CANCELLED' | 'PENDING' | null {
  if (ind.isRevoked === true) return 'CANCELLED';
  if (ind.prossesEndOK === 1 && ind.dealRespone === 0) return 'PAID';
  if (ind.prossesEndOK === 1 && ind.dealRespone !== null && ind.dealRespone !== 0) return 'FAILED';
  return null;
}

function intervalToMonths(interval: 'MONTHLY' | 'SEMI_ANNUAL' | 'ANNUAL' | 'BIENNIAL'): number {
  switch (interval) {
    case 'MONTHLY':
      return 1;
    case 'SEMI_ANNUAL':
      return 6;
    case 'ANNUAL':
      return 12;
    case 'BIENNIAL':
      return 24;
  }
}

function addMonths(from: Date, months: number): Date {
  const d = new Date(from);
  d.setUTCMonth(d.getUTCMonth() + months);
  return d;
}

function inferIntervalFromPlanKey(planKey: string | null | undefined): 'MONTHLY' | 'SEMI_ANNUAL' | 'ANNUAL' | 'BIENNIAL' {
  const v = (planKey ?? '').toLowerCase();
  if (v.includes('month') || v.includes('monthly')) return 'MONTHLY';
  if (v.includes('six') || v.includes('semi')) return 'SEMI_ANNUAL';
  if (v.includes('two') || v.includes('bi') || v.includes('bienn')) return 'BIENNIAL';
  return 'ANNUAL';
}

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly cardcom: CardcomClient,
  ) {}

  async createCardcomSession(userId: string, dto: CreateCardcomSessionDto) {
    const supplier = await this.prisma.supplier.findUnique({
      where: { ownerUserId: userId },
    });
    if (!supplier) {
      throw new BadRequestException('Supplier profile is required before starting payment');
    }

    const terminalNumber = cardcomTerminalNumber();
    const username = requireEnv('CARDCOM_USERNAME');
    const defaults = defaultRedirectUrls();
    const indicatorUrl = buildPublicIndicatorUrl();

    const successRedirectUrl = dto.successRedirectUrl ?? defaults.success;
    const errorRedirectUrl = dto.errorRedirectUrl ?? defaults.error;
    const cancelUrl = dto.cancelUrl ?? defaults.cancel;

    const amountDecimal = new Prisma.Decimal(dto.amount);
    const currency = (dto.currency ?? 'ILS').toUpperCase();

    const paymentId = randomUUID();
    const payment = await this.prisma.supplierPayment.create({
      data: {
        id: paymentId,
        supplierId: supplier.id,
        userId,
        amount: amountDecimal,
        currency,
        planKey: dto.planKey ?? null,
        description: dto.description ?? null,
        returnValue: paymentId,
        status: 'PENDING',
      },
    });

    const sumToBill = dto.amount.toFixed(2);
    const language = optionalEnv('CARDCOM_CHECKOUT_LANGUAGE') ?? 'he';

    try {
      const soap = await this.cardcom.createLowProfileDeal({
        terminalNumber,
        username,
        billGoldUserId: cardcomBillGoldUserId(),
        operation: 'BillAndCreateToken',
        returnValue: payment.id,
        sumToBill,
        language,
        successRedirectUrl,
        errorRedirectUrl,
        indicatorUrl,
        cancelUrl,
        isCreateInvoice: false,
        productName: dto.description ?? dto.planKey ?? 'Supplier registration',
        invoiceEmail: dto.invoiceEmail,
        invoiceCustName: dto.invoiceCustName,
      });

      const snapshot = {
        responseCode: soap.responseCode,
        description: soap.description,
        lowProfileCode: soap.lowProfileCode,
      };

      if (!isCardcomSoapOk(soap.responseCode) || !soap.lowProfileCode) {
        await this.prisma.supplierPayment.update({
          where: { id: payment.id },
          data: {
            status: 'FAILED',
            statusReason: soap.description ?? `CardCom ResponseCode=${soap.responseCode}`,
            requestSnapshot: snapshot as object,
          },
        });
        throw new BadRequestException(soap.description ?? 'CardCom CreateLowProfileDeal failed');
      }

      const checkoutUrl = buildCheckoutUrl(soap.baseUrl, soap.urlPath);

      await this.prisma.supplierPayment.update({
        where: { id: payment.id },
        data: {
          cardcomLowProfileId: soap.lowProfileCode,
          cardcomLowProfileVersion: soap.lowProfileVersion ?? null,
          requestSnapshot: {
            ...snapshot,
            baseUrl: soap.baseUrl,
            urlPath: soap.urlPath,
            checkoutUrl,
          } as object,
        },
      });

      return {
        sessionId: payment.id,
        returnValue: payment.id,
        lowProfileUrl: checkoutUrl,
        lowProfileCode: soap.lowProfileCode,
        status: 'PENDING',
        amount: amountDecimal.toString(),
        currency,
      };
    } catch (err) {
      if (err instanceof BadRequestException) throw err;
      this.logger.error(`CardCom create session failed for payment ${payment.id}`, err as Error);
      await this.prisma.supplierPayment.update({
        where: { id: payment.id },
        data: {
          status: 'FAILED',
          statusReason: (err as Error).message ?? 'CardCom error',
        },
      });
      throw err;
    }
  }

  async getSessionForUser(userId: string, sessionId: string) {
    const payment = await this.prisma.supplierPayment.findFirst({
      where: { id: sessionId, supplier: { ownerUserId: userId } },
    });
    if (!payment) {
      throw new NotFoundException('Payment session not found');
    }
    const snap = payment.requestSnapshot as { checkoutUrl?: string } | null;
    const lowProfileUrl = typeof snap?.checkoutUrl === 'string' ? snap.checkoutUrl : null;
    return {
      sessionId: payment.id,
      returnValue: payment.returnValue,
      lowProfileUrl,
      lowProfileCode: payment.cardcomLowProfileId,
      status: payment.status,
      amount: payment.amount.toString(),
      currency: payment.currency,
      paidAt: payment.paidAt,
      statusReason: payment.statusReason,
      planKey: payment.planKey,
    };
  }

  async handleCardcomIndicator(query: Record<string, unknown>, body: unknown): Promise<{ received: boolean }> {
    const flat = flattenParams(query, body);
    const secret = optionalEnv('CARDCOM_WEBHOOK_SHARED_SECRET');
    if (secret) {
      const provided = pickCaseInsensitive(flat, ['s', 'secret', 'token']);
      if (provided !== secret) {
        this.logger.warn('CardCom indicator rejected: invalid or missing shared secret');
        throw new ForbiddenException();
      }
    }

    const lowProfileCode =
      pickCaseInsensitive(flat, ['lowprofilecode', 'LowProfileCode', 'LowProfileID']) ?? undefined;
    const returnValue = pickCaseInsensitive(flat, ['ReturnValue', 'returnValue', 'returnvalue']) ?? undefined;

    const payment = await this.resolvePaymentFromIndicator(lowProfileCode, returnValue);
    if (!payment) {
      this.logger.warn('CardCom indicator: no matching SupplierPayment', { lowProfileCode, returnValue });
      return { received: true };
    }

    const terminalNumber = cardcomTerminalNumber();
    const username = requireEnv('CARDCOM_USERNAME');

    let indicatorPayload: object = flat;

    try {
      const code = payment.cardcomLowProfileId ?? lowProfileCode;
      if (!code) {
        await this.mergeIndicatorPayload(payment.id, flat);
        return { received: true };
      }

      const polled = await this.cardcom.getLowProfileIndicator(terminalNumber, username, code);
      indicatorPayload = {
        webhook: flat,
        polled: {
          responseCode: polled.responseCode,
          description: polled.description,
          indicator: polled.indicator,
        },
      };

      if (!isCardcomSoapOk(polled.responseCode) || !polled.indicator) {
        await this.mergeIndicatorPayload(payment.id, indicatorPayload);
        return { received: true };
      }

      const next = resolvePaymentStatus(polled.indicator);
      await this.applyIndicatorUpdate(payment.id, polled.indicator, next, indicatorPayload);
    } catch (err) {
      this.logger.error(`CardCom indicator processing failed for payment ${payment.id}`, err as Error);
      await this.mergeIndicatorPayload(payment.id, { ...flat, error: (err as Error).message });
    }

    return { received: true };
  }

  async processDueRenewals(limit = 25): Promise<{ processed: number }> {
    const due = await this.prisma.supplierSubscription.findMany({
      where: {
        status: { in: ['ACTIVE', 'PAST_DUE'] },
        nextBillingAt: { lte: new Date() },
        OR: [{ tokenExpiresAt: null }, { tokenExpiresAt: { gt: new Date() } }],
      },
      orderBy: { nextBillingAt: 'asc' },
      take: limit,
    });

    for (const sub of due) {
      await this.renewSubscription(sub.id);
    }
    return { processed: due.length };
  }

  async renewSubscription(subscriptionId: string): Promise<void> {
    const subscription = await this.prisma.supplierSubscription.findUnique({
      where: { id: subscriptionId },
    });
    if (!subscription || subscription.status === 'CANCELED') {
      return;
    }

    const paymentId = randomUUID();
    const amount = Number(subscription.amount);
    const terminalNumber = cardcomTerminalNumber();
    const username = requireEnv('CARDCOM_USERNAME');
    const defaults = defaultRedirectUrls();
    const indicatorUrl = buildPublicIndicatorUrl();
    const language = optionalEnv('CARDCOM_CHECKOUT_LANGUAGE') ?? 'he';

    await this.prisma.supplierPayment.create({
      data: {
        id: paymentId,
        supplierId: subscription.supplierId,
        userId: null,
        subscriptionId: subscription.id,
        provider: 'CARDCOM',
        status: 'PENDING',
        amount: subscription.amount,
        currency: subscription.currency,
        planKey: subscription.planKey ?? null,
        description: 'Subscription renewal',
        returnValue: paymentId,
      },
    });

    try {
      const created = await this.cardcom.createLowProfileDeal({
        terminalNumber,
        username,
        billGoldUserId: cardcomBillGoldUserId(),
        operation: 'BillOnly',
        returnValue: paymentId,
        sumToBill: amount.toFixed(2),
        language,
        successRedirectUrl: defaults.success,
        errorRedirectUrl: defaults.error,
        indicatorUrl,
        cancelUrl: defaults.cancel,
        isCreateInvoice: false,
        productName: `Supplier renewal ${subscription.planKey ?? ''}`.trim(),
        token: subscription.cardcomToken,
      });

      if (!isCardcomSoapOk(created.responseCode) || !created.lowProfileCode) {
        await this.prisma.supplierPayment.update({
          where: { id: paymentId },
          data: {
            status: 'FAILED',
            statusReason: created.description ?? `CardCom ResponseCode=${created.responseCode}`,
            requestSnapshot: created as unknown as Prisma.InputJsonValue,
          },
        });
        await this.bumpSubscriptionFailure(subscription.id, created.description ?? null);
        return;
      }

      await this.prisma.supplierPayment.update({
        where: { id: paymentId },
        data: {
          cardcomLowProfileId: created.lowProfileCode,
          cardcomLowProfileVersion: created.lowProfileVersion ?? null,
          requestSnapshot: created as unknown as Prisma.InputJsonValue,
        },
      });

      const polled = await this.cardcom.getLowProfileIndicator(terminalNumber, username, created.lowProfileCode);
      if (isCardcomSoapOk(polled.responseCode) && polled.indicator) {
        const next = resolvePaymentStatus(polled.indicator);
        await this.applyIndicatorUpdate(paymentId, polled.indicator, next, {
          renewal: true,
          polled,
        });
      }
    } catch (error) {
      await this.prisma.supplierPayment.update({
        where: { id: paymentId },
        data: { status: 'FAILED', statusReason: (error as Error).message ?? 'Renewal charge failed' },
      });
      await this.bumpSubscriptionFailure(subscription.id, (error as Error).message ?? null);
      this.logger.error(`Renewal failed for subscription ${subscription.id}`, error as Error);
    }
  }

  private async bumpSubscriptionFailure(subscriptionId: string, reason: string | null) {
    const sub = await this.prisma.supplierSubscription.findUnique({ where: { id: subscriptionId } });
    if (!sub) return;
    const nextFailures = sub.consecutiveFailures + 1;
    await this.prisma.supplierSubscription.update({
      where: { id: subscriptionId },
      data: {
        status: 'PAST_DUE',
        consecutiveFailures: nextFailures,
        nextBillingAt: addMonths(new Date(), 1),
        updatedAt: new Date(),
      },
    });
    if (reason) {
      this.logger.warn(`Subscription ${subscriptionId} marked PAST_DUE: ${reason}`);
    }
  }

  private async syncSubscriptionFromPaidPayment(paymentId: string) {
    const payment = await this.prisma.supplierPayment.findUnique({ where: { id: paymentId } });
    if (!payment || payment.status !== 'PAID' || !payment.cardcomToken) {
      return;
    }
    const interval = inferIntervalFromPlanKey(payment.planKey);
    const months = intervalToMonths(interval);
    const nextBillingAt = addMonths(payment.paidAt ?? new Date(), months);

    const existing = await this.prisma.supplierSubscription.findUnique({
      where: { supplierId: payment.supplierId },
    });
    if (!existing) {
      const created = await this.prisma.supplierSubscription.create({
        data: {
          supplierId: payment.supplierId,
          status: 'ACTIVE',
          interval,
          planKey: payment.planKey ?? null,
          amount: payment.amount,
          currency: payment.currency,
          cardcomToken: payment.cardcomToken,
          tokenExpiresAt: payment.tokenExpiresAt,
          nextBillingAt,
          lastRenewedAt: payment.paidAt ?? new Date(),
          consecutiveFailures: 0,
        },
      });
      await this.prisma.supplierPayment.update({
        where: { id: payment.id },
        data: { subscriptionId: created.id },
      });
      return;
    }

    await this.prisma.supplierSubscription.update({
      where: { id: existing.id },
      data: {
        status: 'ACTIVE',
        planKey: payment.planKey ?? existing.planKey,
        amount: payment.amount,
        currency: payment.currency,
        cardcomToken: payment.cardcomToken,
        tokenExpiresAt: payment.tokenExpiresAt ?? existing.tokenExpiresAt,
        nextBillingAt,
        lastRenewedAt: payment.paidAt ?? new Date(),
        consecutiveFailures: 0,
        canceledAt: null,
      },
    });
    if (payment.subscriptionId !== existing.id) {
      await this.prisma.supplierPayment.update({
        where: { id: payment.id },
        data: { subscriptionId: existing.id },
      });
    }
  }

  private async resolvePaymentFromIndicator(lowProfileCode?: string, returnValue?: string) {
    if (lowProfileCode) {
      const byCode = await this.prisma.supplierPayment.findFirst({
        where: { cardcomLowProfileId: lowProfileCode },
      });
      if (byCode) return byCode;
    }
    if (returnValue) {
      return this.prisma.supplierPayment.findFirst({
        where: { OR: [{ returnValue }, { id: returnValue }] },
      });
    }
    return null;
  }

  private async mergeIndicatorPayload(paymentId: string, payload: object) {
    const existing = await this.prisma.supplierPayment.findUnique({ where: { id: paymentId } });
    const prev = (existing?.indicatorPayload as object | null) ?? {};
    await this.prisma.supplierPayment.update({
      where: { id: paymentId },
      data: { indicatorPayload: { ...prev, ...payload } as object },
    });
  }

  private async applyIndicatorUpdate(
    paymentId: string,
    ind: CardcomIndicatorParsed,
    next: 'PAID' | 'FAILED' | 'CANCELLED' | 'PENDING' | null,
    indicatorPayload: object,
  ) {
    const tokenEx = parseTokenExDate(ind.tokenExDate ?? undefined);
    const internalDeal = ind.internalDealNumber ?? undefined;

    let shouldSyncSubscription = false;
    await this.prisma.$transaction(async (tx) => {
      const current = await tx.supplierPayment.findUnique({ where: { id: paymentId } });
      if (!current) return;

      if (current.status === 'PAID') {
        await tx.supplierPayment.update({
          where: { id: paymentId },
          data: {
            indicatorPayload: indicatorPayload as object,
            cardcomInternalDealNumber: internalDeal ?? current.cardcomInternalDealNumber,
            cardcomToken: ind.token ?? current.cardcomToken,
            tokenExpiresAt: tokenEx ?? current.tokenExpiresAt,
          },
        });
        return;
      }

      if (next === null) {
        await tx.supplierPayment.update({
          where: { id: paymentId },
          data: {
            indicatorPayload: indicatorPayload as object,
            cardcomInternalDealNumber: internalDeal ?? undefined,
            cardcomToken: ind.token ?? undefined,
            tokenExpiresAt: tokenEx ?? undefined,
          },
        });
        return;
      }

      const data: Prisma.SupplierPaymentUpdateInput = {
        indicatorPayload: indicatorPayload as object,
        cardcomInternalDealNumber: internalDeal ?? null,
        cardcomToken: ind.token ?? null,
        tokenExpiresAt: tokenEx,
      };

      if (next === 'PAID') {
        data.status = 'PAID';
        data.paidAt = new Date();
        data.statusReason = null;
        shouldSyncSubscription = true;
      } else if (next === 'FAILED') {
        data.status = 'FAILED';
        data.statusReason =
          ind.dealRespone !== null ? `Card deal response code ${ind.dealRespone}` : 'Card payment failed';
      } else if (next === 'CANCELLED') {
        data.status = 'CANCELLED';
        data.statusReason = 'Revoked or cancelled';
      }

      await tx.supplierPayment.update({
        where: { id: paymentId },
        data,
      });
    });
    if (shouldSyncSubscription) {
      await this.syncSubscriptionFromPaidPayment(paymentId);
    }
  }
}
