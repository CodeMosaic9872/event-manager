import { NotFoundException } from '@nestjs/common';
import { AdminJobsService } from './admin-jobs.service';

describe('AdminJobsService', () => {
  it('moderateJobApplication forwards to job board service', async () => {
    const jobBoard = {
      moderateApplicationStatus: jest.fn().mockResolvedValue({ id: 'app_1', status: 'REJECTED' }),
    } as any;
    const prisma = {} as any;

    const service = new AdminJobsService(prisma, jobBoard);
    await service.moderateJobApplication('app_1', 'REJECTED', 'Incomplete documents', 'usr_admin_1');

    expect(jobBoard.moderateApplicationStatus).toHaveBeenCalledWith(
      'app_1',
      'REJECTED',
      'Incomplete documents',
      'usr_admin_1',
    );
  });

  it('moderateJobApplication throws when application not found', async () => {
    const jobBoard = {
      moderateApplicationStatus: jest.fn().mockRejectedValue(new NotFoundException()),
    } as any;
    const prisma = {} as any;
    const service = new AdminJobsService(prisma, jobBoard);

    await expect(service.moderateJobApplication('missing', 'REJECTED')).rejects.toBeInstanceOf(NotFoundException);
  });
});
