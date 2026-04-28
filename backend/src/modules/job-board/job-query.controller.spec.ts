/// <reference types="jest" />

import { CanActivate, ExecutionContext, INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import * as request from 'supertest';
import { JobBoardService } from './job-board.service';
import { JobQueryController } from './job-board.controller';
import { AuthGuard } from '../../common/guards/auth.guard';
import { SupplierOnlyGuard } from './guards/supplier-only.guard';

class AllowGuard implements CanActivate {
  canActivate(_context: ExecutionContext): boolean {
    return true;
  }
}

describe('JobQueryController (contract)', () => {
  let app: INestApplication;
  const jobBoardServiceMock = {
    listRecommendedJobsForUser: jest.fn(),
  };

  beforeAll(async () => {
    const moduleBuilder = Test.createTestingModule({
      controllers: [JobQueryController],
      providers: [{ provide: JobBoardService, useValue: jobBoardServiceMock }],
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

  it('GET /v1/supplier/jobs/recommended resolves supplier via authenticated user', async () => {
    jobBoardServiceMock.listRecommendedJobsForUser.mockResolvedValueOnce([
      { id: 'job_1', title: 'Wedding DJ needed', matchScore: 0.9, matchReasons: ['category_match'] },
    ]);

    const response = await request(app.getHttpServer())
      .get('/v1/supplier/jobs/recommended')
      .set('x-user-id', 'usr_supplier_123')
      .expect(200);

    expect(response.body[0]).toEqual(
      expect.objectContaining({
        id: 'job_1',
        matchScore: 0.9,
      }),
    );
    expect(jobBoardServiceMock.listRecommendedJobsForUser).toHaveBeenCalledWith('usr_supplier_123');
  });

  it('GET /v1/supplier/jobs/recommended rejects anonymous-style user ids', async () => {
    await request(app.getHttpServer())
      .get('/v1/supplier/jobs/recommended')
      .set('x-user-id', 'anonymous:test')
      .expect(401);
  });
});
