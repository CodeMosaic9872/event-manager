import { ConflictException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { AdminUsersService } from './admin-users.service';
import { PrismaService } from '../../../prisma/prisma.service';
import { SmsService } from '../../sms/sms.service';

describe('AdminUsersService', () => {
  let service: AdminUsersService;
  const prisma = {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
  };
  const smsService = {
    normalizeIsraeliMobile: jest.fn((p: string) => `+972${p.replace(/\D/g, '').slice(-9)}`),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module = await Test.createTestingModule({
      providers: [
        AdminUsersService,
        { provide: PrismaService, useValue: prisma },
        { provide: SmsService, useValue: smsService },
      ],
    }).compile();
    service = module.get(AdminUsersService);
  });

  it('createSupplierUser throws Conflict when email exists', async () => {
    prisma.user.findUnique.mockResolvedValueOnce({ id: 'u1' }).mockResolvedValueOnce(null);
    await expect(
      service.createSupplierUser({ email: 'a@b.com', phone: '0501234567' }),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it('createSupplierUser creates ACTIVE supplier user', async () => {
    prisma.user.findUnique.mockResolvedValue(null);
    prisma.user.create.mockResolvedValue({
      id: 'usr_new',
      email: 'new@b.com',
      phone: '+972501234567',
      status: 'ACTIVE',
      roles: [{ role: 'SUPPLIER' }],
      createdAt: new Date('2026-01-01'),
    });
    const result = await service.createSupplierUser({ email: 'new@b.com', phone: '0501234567' });
    expect(result.id).toBe('usr_new');
    expect(result.roles).toEqual(['SUPPLIER']);
  });
});
