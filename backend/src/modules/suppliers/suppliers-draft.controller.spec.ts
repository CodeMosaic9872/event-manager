/// <reference types="jest" />

import { CanActivate, ExecutionContext, INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import * as request from 'supertest';
import { SuppliersController } from './suppliers.controller';
import { SuppliersService } from './suppliers.service';
import { PrismaService } from '../../prisma/prisma.service';
import { AuthGuard } from '../../common/guards/auth.guard';
import { SupplierOnlyGuard } from '../job-board/guards/supplier-only.guard';

class AllowGuard implements CanActivate {
  canActivate(_context: ExecutionContext): boolean {
    return true;
  }
}

describe('Suppliers draft endpoints (contract)', () => {
  let app: INestApplication;
  const suppliersServiceMock = {
    upsertDraftForUser: jest.fn(),
    getDraftForUser: jest.fn(),
  };
  const prismaServiceMock = {
    anonymousSession: { findUnique: jest.fn() },
  };

  beforeAll(async () => {
    const moduleBuilder = Test.createTestingModule({
      controllers: [SuppliersController],
      providers: [
        { provide: SuppliersService, useValue: suppliersServiceMock },
        { provide: PrismaService, useValue: prismaServiceMock },
      ],
    });
    moduleBuilder.overrideGuard(AuthGuard).useClass(AllowGuard);
    moduleBuilder.overrideGuard(SupplierOnlyGuard).useClass(AllowGuard);
    const moduleRef = await moduleBuilder.compile();

    app = moduleRef.createNestApplication();
    app.use((req: any, _res: any, next: () => void) => {
      const userId = typeof req.headers['x-user-id'] === 'string' ? req.headers['x-user-id'] : 'usr_supplier_1';
      req.user = { id: userId, roles: ['SUPPLIER'] };
      next();
    });
    app.setGlobalPrefix('v1');
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('POST /v1/supplier/draft uses current user and upserts', async () => {
    suppliersServiceMock.upsertDraftForUser.mockResolvedValueOnce({
      id: 'draft_1',
      supplierId: 'sup_1',
      stepKey: 'service_areas',
      completionPercent: 30,
      payloadJson: { serviceAreas: [{ regionCode: 'north' }] },
      version: 2,
    });

    const response = await request(app.getHttpServer())
      .post('/v1/supplier/draft')
      .set('x-user-id', 'usr_supplier_123')
      .send({
        stepKey: 'service_areas',
        completionPercent: 30,
        payloadJson: { serviceAreas: [{ regionCode: 'north' }] },
        version: 1,
      })
      .expect(201);

    expect(response.body).toEqual(expect.objectContaining({ id: 'draft_1', version: 2 }));
    expect(suppliersServiceMock.upsertDraftForUser).toHaveBeenCalledWith(
      'usr_supplier_123',
      expect.objectContaining({ stepKey: 'service_areas', version: 1 }),
    );
  });

  it('GET /v1/supplier/draft/me resolves through current user', async () => {
    suppliersServiceMock.getDraftForUser.mockResolvedValueOnce({
      id: 'draft_1',
      supplierId: 'sup_1',
      stepKey: 'service_areas',
      completionPercent: 30,
      payloadJson: { serviceAreas: [{ regionCode: 'north' }] },
      version: 2,
    });

    await request(app.getHttpServer())
      .get('/v1/supplier/draft/me')
      .set('x-user-id', 'usr_supplier_abc')
      .expect(200);

    expect(suppliersServiceMock.getDraftForUser).toHaveBeenCalledWith('usr_supplier_abc');
  });
});
