import { NotificationsService } from './notifications.service';

describe('NotificationsService', () => {
  const originalMaxAttempts = process.env.NOTIFICATION_MAX_ATTEMPTS;

  beforeEach(() => {
    process.env.NOTIFICATION_MAX_ATTEMPTS = '1';
  });

  afterEach(() => {
    process.env.NOTIFICATION_MAX_ATTEMPTS = originalMaxAttempts;
  });

  it('dispatchPendingEmails marks notification as SENT for active template', async () => {
    const prisma = {
      notification: {
        findMany: jest
          .fn()
          .mockResolvedValue([{ id: 'n1', templateKey: 'job.application.submitted', channel: 'EMAIL' }]),
        update: jest.fn().mockResolvedValue({ id: 'n1', status: 'SENT' }),
      },
      notificationTemplate: {
        findUnique: jest
          .fn()
          .mockResolvedValue({ key: 'job.application.submitted', isActive: true, subjectTemplate: 'Hello', bodyTemplate: 'Body' }),
      },
    } as any;
    const service = new NotificationsService(prisma);

    const result = await service.dispatchPendingEmails(10);

    expect(prisma.notification.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'n1' },
        data: expect.objectContaining({ status: 'SENT' }),
      }),
    );
    expect(result).toEqual({ attempted: 1, sent: 1, failed: 0 });
  });

  it('dispatchPendingEmails marks notification FAILED when template is missing', async () => {
    const prisma = {
      notification: {
        findMany: jest.fn().mockResolvedValue([{ id: 'n2', templateKey: 'missing.template', channel: 'EMAIL' }]),
        update: jest.fn().mockResolvedValue({ id: 'n2', status: 'FAILED' }),
      },
      notificationTemplate: {
        findUnique: jest.fn().mockResolvedValue(null),
      },
    } as any;
    const service = new NotificationsService(prisma);

    const result = await service.dispatchPendingEmails(10);

    expect(prisma.notification.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'n2' },
        data: expect.objectContaining({ status: 'FAILED', errorCode: 'TEMPLATE_NOT_FOUND' }),
      }),
    );
    expect(result).toEqual({ attempted: 1, sent: 0, failed: 1 });
  });

  it('dispatchPendingEmails marks notification FAILED when dispatch throws', async () => {
    const prisma = {
      notification: {
        findMany: jest
          .fn()
          .mockResolvedValue([{ id: 'n3', templateKey: 'job.matching.published', channel: 'EMAIL' }]),
        update: jest
          .fn()
          .mockRejectedValueOnce(new Error('db write failed'))
          .mockResolvedValueOnce({ id: 'n3', status: 'FAILED' }),
      },
      notificationTemplate: {
        findUnique: jest
          .fn()
          .mockResolvedValue({ key: 'job.matching.published', isActive: true, subjectTemplate: 'Hi', bodyTemplate: 'Body' }),
      },
    } as any;
    const service = new NotificationsService(prisma);

    const result = await service.dispatchPendingEmails(10);

    expect(prisma.notification.update).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({
        where: { id: 'n3' },
        data: expect.objectContaining({ status: 'FAILED', errorCode: 'DISPATCH_EXCEPTION' }),
      }),
    );
    expect(result).toEqual({ attempted: 1, sent: 0, failed: 1 });
  });

  it('registerPushTokenForUser upserts active token', async () => {
    const prisma = {
      supplier: {
        findUnique: jest.fn().mockResolvedValue({ id: 'sup_1' }),
      },
      pushDeviceToken: {
        upsert: jest.fn().mockResolvedValue({ id: 'pt_1', token: 'tok_1', isActive: true }),
      },
    } as any;
    const service = new NotificationsService(prisma);

    await service.registerPushTokenForUser('usr_1', 'tok_1', 'android');

    expect(prisma.pushDeviceToken.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { token: 'tok_1' },
        create: expect.objectContaining({ userId: 'usr_1', supplierId: 'sup_1' }),
      }),
    );
  });

  it('enqueuePush skips when user preferences disable push', async () => {
    const prisma = {
      notificationPreference: {
        findUnique: jest.fn().mockResolvedValue({ pushEnabled: false, emailEnabled: true, mutedTemplatesJson: null }),
      },
      notification: {
        create: jest.fn(),
      },
    } as any;
    const service = new NotificationsService(prisma);

    const result = await service.enqueuePush({
      recipientUserId: 'usr_1',
      templateKey: 'job.matching.published',
      data: {},
    });

    expect(result).toEqual(expect.objectContaining({ skipped: true, channel: 'PUSH' }));
    expect(prisma.notification.create).not.toHaveBeenCalled();
  });
});
