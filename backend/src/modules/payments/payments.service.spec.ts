import { BadRequestException, ForbiddenException } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { CardcomClient } from './providers/cardcom.client';

describe('PaymentsService', () => {
  const supplier = { id: 'sup_1', ownerUserId: 'usr_1' };

  function makeService(overrides?: {
    prisma?: Record<string, jest.Mock>;
    cardcom?: Partial<CardcomClient>;
  }) {
    const supplierPayment = {
      create: jest.fn().mockResolvedValue({ id: 'pay_new' }),
      update: jest.fn().mockResolvedValue({}),
      findFirst: jest.fn(),
      findUnique: jest.fn(),
    };
    const prisma = {
      supplier: {
        findUnique: jest.fn().mockResolvedValue(supplier),
      },
      supplierPayment,
      $transaction: jest.fn().mockImplementation(async (fn: (tx: unknown) => unknown) =>
        fn({
          supplierPayment: {
            findUnique: jest.fn().mockResolvedValue({ id: 'pay_1', status: 'PENDING' }),
            update: jest.fn().mockResolvedValue({}),
          },
        }),
      ),
      ...(overrides?.prisma ?? {}),
    } as any;

    const cardcom = {
      createLowProfileDeal: jest.fn().mockResolvedValue({
        responseCode: 0,
        description: 'OK',
        lowProfileCode: 'lpc-1',
        lowProfileVersion: 1,
        baseUrl: 'https://secure.cardcom.solutions/',
        urlPath: 'LowProfile/Example',
      }),
      getLowProfileIndicator: jest.fn().mockResolvedValue({
        responseCode: 0,
        description: 'OK',
        indicator: {
          returnValue: 'pay_1',
          lowProfileCode: 'lpc-1',
          internalDealNumber: '99',
          token: 'tok-1',
          tokenExDate: null,
          prossesEndOK: 1,
          dealRespone: 0,
          isRevoked: false,
        },
      }),
      ...(overrides?.cardcom ?? {}),
    } as any;

    const plansService = {
      resolvePlanForCheckout: jest.fn().mockResolvedValue(null),
      billingAmountFromPlan: jest.fn(),
    };

    return {
      service: new PaymentsService(prisma, cardcom as CardcomClient, plansService as any),
      prisma,
      cardcom,
      supplierPayment,
      plansService,
    };
  }

  beforeEach(() => {
    process.env.CARDCOM_TERMINAL_NUMBER = '1000';
    process.env.CARDCOM_USERNAME = 'testuser';
    process.env.CARDCOM_PUBLIC_APP_BASE_URL = 'https://api.example.com';
    process.env.CARDCOM_SUCCESS_REDIRECT_URL = 'https://app.example.com/ok';
    process.env.CARDCOM_ERROR_REDIRECT_URL = 'https://app.example.com/err';
    process.env.CARDCOM_CANCEL_REDIRECT_URL = 'https://app.example.com/cancel';
    delete process.env.CARDCOM_WEBHOOK_SHARED_SECRET;
  });

  it('createCardcomSession creates payment and returns checkout URL', async () => {
    const { service, prisma, cardcom, supplierPayment } = makeService();
    supplierPayment.create.mockImplementation(async ({ data }: { data: { id?: string } }) => ({
      id: data.id ?? 'pay_new',
    }));

    const result = await service.createCardcomSession('usr_1', {
      amount: 10.5,
      currency: 'ILS',
      planKey: 'annual',
    } as any);

    expect(prisma.supplier.findUnique).toHaveBeenCalledWith({ where: { ownerUserId: 'usr_1' } });
    expect(cardcom.createLowProfileDeal).toHaveBeenCalled();
    expect(supplierPayment.update).toHaveBeenCalled();
    expect(result.lowProfileCode).toBe('lpc-1');
    expect(result.lowProfileUrl).toContain('LowProfile');
    expect(result.status).toBe('PENDING');
  });

  it('createCardcomSession fails when supplier missing', async () => {
    const { service, prisma } = makeService();
    prisma.supplier.findUnique.mockResolvedValue(null);
    await expect(service.createCardcomSession('usr_x', { amount: 1 } as any)).rejects.toBeInstanceOf(
      BadRequestException,
    );
  });

  it('handleCardcomIndicator rejects invalid shared secret', async () => {
    process.env.CARDCOM_WEBHOOK_SHARED_SECRET = 'abc';
    const { service } = makeService();
    await expect(service.handleCardcomIndicator({ s: 'wrong' }, {})).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('handleCardcomIndicator updates PAID when polled indicator approves', async () => {
    const { service, prisma, supplierPayment } = makeService();

    supplierPayment.findFirst.mockResolvedValueOnce({
      id: 'pay_1',
      cardcomLowProfileId: 'lpc-1',
      status: 'PENDING',
    });

    const txUpdate = jest.fn().mockResolvedValue({});
    prisma.$transaction.mockImplementation(async (fn: (tx: any) => unknown) =>
      fn({
        supplierPayment: {
          findUnique: jest.fn().mockResolvedValue({ id: 'pay_1', status: 'PENDING' }),
          update: txUpdate,
        },
      }),
    );

    await service.handleCardcomIndicator(
      {},
      {
        lowprofilecode: 'lpc-1',
        ReturnValue: 'pay_1',
      },
    );

    expect(txUpdate).toHaveBeenCalled();
    const updateArg = txUpdate.mock.calls[0][0];
    expect(updateArg.data.status).toBe('PAID');
  });
});
