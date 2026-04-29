import { NotFoundException } from '@nestjs/common';
import { AdminService } from './admin.service';

describe('AdminService', () => {
  it('moderateJobApplication records reason in application history', async () => {
    const notifications = { dispatchPendingEmails: jest.fn() } as any;
    const tx = {
      jobApplication: {
        update: jest.fn().mockResolvedValue({ id: 'app_1', status: 'REJECTED' }),
      },
      jobApplicationHistory: {
        create: jest.fn().mockResolvedValue({ id: 'hist_1' }),
      },
    };
    const prisma = {
      jobApplication: {
        findUnique: jest.fn().mockResolvedValue({ id: 'app_1', status: 'SUBMITTED' }),
      },
      $transaction: jest.fn().mockImplementation(async (fn: (client: typeof tx) => unknown) => fn(tx)),
    } as any;

    const service = new AdminService(prisma, notifications);
    await service.moderateJobApplication('app_1', 'REJECTED', 'Incomplete documents', 'usr_admin_1');

    expect(tx.jobApplication.update).toHaveBeenCalledWith({
      where: { id: 'app_1' },
      data: { status: 'REJECTED' },
    });
    expect(tx.jobApplicationHistory.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        jobApplicationId: 'app_1',
        fromStatus: 'SUBMITTED',
        toStatus: 'REJECTED',
        reason: 'Incomplete documents',
        actorType: 'ADMIN',
        actorId: 'usr_admin_1',
      }),
    });
  });

  it('moderateJobApplication throws when application not found', async () => {
    const notifications = { dispatchPendingEmails: jest.fn() } as any;
    const prisma = {
      jobApplication: {
        findUnique: jest.fn().mockResolvedValue(null),
      },
    } as any;
    const service = new AdminService(prisma, notifications);

    await expect(service.moderateJobApplication('missing', 'REJECTED')).rejects.toBeInstanceOf(NotFoundException);
  });
});
