/// <reference types="jest" />

import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import * as request from 'supertest';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { AuthGuard } from '../../common/guards/auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';

describe('AdminController (contract)', () => {
  let app: INestApplication;
  const adminServiceMock = {
    moderateJobApplication: jest.fn(),
    updateAutomationRule: jest.fn(),
    processAutomationRuns: jest.fn(),
  };

  beforeAll(async () => {
    const moduleBuilder = Test.createTestingModule({
      controllers: [AdminController],
      providers: [{ provide: AdminService, useValue: adminServiceMock }],
    });
    moduleBuilder.overrideGuard(AuthGuard).useValue({ canActivate: () => true });
    moduleBuilder.overrideGuard(RolesGuard).useValue({ canActivate: () => true });
    const moduleRef = await moduleBuilder.compile();

    app = moduleRef.createNestApplication();
    app.setGlobalPrefix('v1');
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('POST /v1/admin/jobs/applications/:id/status forwards status and reason', async () => {
    adminServiceMock.moderateJobApplication.mockResolvedValueOnce({
      id: 'app_1',
      status: 'REJECTED',
    });

    const response = await request(app.getHttpServer())
      .post('/v1/admin/jobs/applications/app_1/status')
      .send({
        status: 'REJECTED',
        reason: 'Missing required availability details',
      })
      .expect(201);

    expect(response.body).toEqual(
      expect.objectContaining({
        id: 'app_1',
        status: 'REJECTED',
      }),
    );
    expect(adminServiceMock.moderateJobApplication).toHaveBeenCalledWith(
      'app_1',
      'REJECTED',
      'Missing required availability details',
    );
  });

  it('PATCH /v1/admin/automations/rules/:id updates automation rule config', async () => {
    adminServiceMock.updateAutomationRule.mockResolvedValueOnce({
      id: 'tmpl_1',
      isActive: false,
    });

    await request(app.getHttpServer())
      .patch('/v1/admin/automations/rules/tmpl_1')
      .send({
        isActive: false,
        config: { digest: 'daily' },
      })
      .expect(200);

    expect(adminServiceMock.updateAutomationRule).toHaveBeenCalledWith('tmpl_1', {
      isActive: false,
      config: { digest: 'daily' },
    });
  });

  it('POST /v1/admin/automations/runs/process forwards parsed limit', async () => {
    adminServiceMock.processAutomationRuns.mockResolvedValueOnce({
      attempted: 3,
      sent: 2,
      failed: 1,
    });

    await request(app.getHttpServer())
      .post('/v1/admin/automations/runs/process')
      .query({ limit: '25' })
      .expect(201);

    expect(adminServiceMock.processAutomationRuns).toHaveBeenCalledWith(25);
  });
});
