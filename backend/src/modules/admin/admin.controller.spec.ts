/// <reference types="jest" />

import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { AuthGuard } from '../../common/guards/auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { AdminAutomationsController } from './automations/admin-automations.controller';
import { AdminAutomationsService } from './automations/admin-automations.service';
import { AdminJobsController } from './jobs/admin-jobs.controller';
import { AdminJobsService } from './jobs/admin-jobs.service';
import { AdminNotificationsController } from './notifications/admin-notifications.controller';
import { AdminNotificationsService } from './notifications/admin-notifications.service';
import { AdminUsersController } from './users/admin-users.controller';
import { AdminUsersService } from './users/admin-users.service';

describe('AdminController (contract)', () => {
  let app: INestApplication;
  const adminJobsServiceMock = {
    moderateJobApplication: jest.fn(),
  };
  const adminAutomationsServiceMock = {
    updateAutomationRule: jest.fn(),
    processAutomationRuns: jest.fn(),
  };
  const adminUsersServiceMock = {
    listUsers: jest.fn(),
  };
  const adminNotificationsServiceMock = {
    notificationProvidersHealth: jest.fn(),
  };

  beforeAll(async () => {
    const moduleBuilder = Test.createTestingModule({
      controllers: [
        AdminJobsController,
        AdminAutomationsController,
        AdminUsersController,
        AdminNotificationsController,
      ],
      providers: [
        { provide: AdminJobsService, useValue: adminJobsServiceMock },
        { provide: AdminAutomationsService, useValue: adminAutomationsServiceMock },
        { provide: AdminUsersService, useValue: adminUsersServiceMock },
        { provide: AdminNotificationsService, useValue: adminNotificationsServiceMock },
      ],
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
    adminJobsServiceMock.moderateJobApplication.mockResolvedValueOnce({
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
    expect(adminJobsServiceMock.moderateJobApplication).toHaveBeenCalledWith(
      'app_1',
      'REJECTED',
      'Missing required availability details',
    );
  });

  it('PATCH /v1/admin/automations/rules/:id updates automation rule config', async () => {
    adminAutomationsServiceMock.updateAutomationRule.mockResolvedValueOnce({
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

    expect(adminAutomationsServiceMock.updateAutomationRule).toHaveBeenCalledWith('tmpl_1', {
      isActive: false,
      config: { digest: 'daily' },
    });
  });

  it('POST /v1/admin/automations/runs/process forwards parsed limit', async () => {
    adminAutomationsServiceMock.processAutomationRuns.mockResolvedValueOnce({
      attempted: 3,
      sent: 2,
      failed: 1,
    });

    await request(app.getHttpServer())
      .post('/v1/admin/automations/runs/process')
      .query({ limit: '25' })
      .expect(201);

    expect(adminAutomationsServiceMock.processAutomationRuns).toHaveBeenCalledWith(25);
  });

  it('GET /v1/admin/users returns user list', async () => {
    adminUsersServiceMock.listUsers.mockResolvedValueOnce([
      { id: 'usr_1', email: 'planner@example.com', status: 'ACTIVE', roles: [{ role: 'USER' }] },
    ]);

    const response = await request(app.getHttpServer()).get('/v1/admin/users').expect(200);

    expect(response.body).toEqual(
      expect.arrayContaining([expect.objectContaining({ id: 'usr_1', email: 'planner@example.com' })]),
    );
    expect(adminUsersServiceMock.listUsers).toHaveBeenCalledTimes(1);
  });

  it('GET /v1/admin/notifications/providers/health returns channel provider health', async () => {
    adminNotificationsServiceMock.notificationProvidersHealth.mockResolvedValueOnce({
      email: { configured: true, mode: 'smtp' },
      push: { configured: true, mode: 'firebase' },
      sms: { configured: true, mode: 'twilio' },
    });

    const response = await request(app.getHttpServer()).get('/v1/admin/notifications/providers/health').expect(200);

    expect(response.body).toEqual(
      expect.objectContaining({
        email: expect.objectContaining({ mode: 'smtp' }),
        push: expect.objectContaining({ mode: 'firebase' }),
        sms: expect.objectContaining({ mode: 'twilio' }),
      }),
    );
    expect(adminNotificationsServiceMock.notificationProvidersHealth).toHaveBeenCalledTimes(1);
  });
});
