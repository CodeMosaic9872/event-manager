import { ConflictException } from '@nestjs/common';
import { AdminAdminsService } from './admin-admins.service';

describe('AdminAdminsService', () => {
  it('bootstrapFirstAdmin rejects when an admin already exists', async () => {
    const sms = { normalizeIsraeliMobile: jest.fn((p: string) => p) } as any;
    const prisma = {
      userRole: {
        count: jest.fn().mockResolvedValue(1),
      },
    } as any;
    const service = new AdminAdminsService(prisma, sms);

    await expect(service.bootstrapFirstAdmin({ email: 'ops@example.com', phone: '0501234567' })).rejects.toBeInstanceOf(
      ConflictException,
    );
  });
});
