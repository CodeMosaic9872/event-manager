/// <reference types="jest" />

import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { NotificationsController } from './notifications.controller';
import { NotificationsService } from './notifications.service';
import { AuthGuard } from '../../common/guards/auth.guard';

describe('NotificationsController (contract)', () => {
  let app: INestApplication;
  const notificationsServiceMock = {
    registerPushTokenForUser: jest.fn(),
    deactivatePushTokenForUser: jest.fn(),
    getNotificationPreferences: jest.fn(),
    updateNotificationPreferences: jest.fn(),
  };

  beforeAll(async () => {
    const moduleBuilder = Test.createTestingModule({
      controllers: [NotificationsController],
      providers: [{ provide: NotificationsService, useValue: notificationsServiceMock }],
    });
    moduleBuilder.overrideGuard(AuthGuard).useValue({ canActivate: () => true });
    const moduleRef = await moduleBuilder.compile();

    app = moduleRef.createNestApplication();
    app.use((req: any, _res: any, next: () => void) => {
      const userId = typeof req.headers['x-user-id'] === 'string' ? req.headers['x-user-id'] : 'usr_1';
      req.user = { id: userId, roles: ['USER'] };
      next();
    });
    app.setGlobalPrefix('v1');
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('POST /v1/notifications/push-tokens registers token for current user', async () => {
    notificationsServiceMock.registerPushTokenForUser.mockResolvedValueOnce({ id: 'pt_1' });
    await request(app.getHttpServer())
      .post('/v1/notifications/push-tokens')
      .set('x-user-id', 'usr_123')
      .send({ token: 'fcm_abc', platform: 'android' })
      .expect(201);

    expect(notificationsServiceMock.registerPushTokenForUser).toHaveBeenCalledWith('usr_123', 'fcm_abc', 'android');
  });

  it('GET /v1/notifications/preferences returns current user preferences', async () => {
    notificationsServiceMock.getNotificationPreferences.mockResolvedValueOnce({
      items: [
        {
          userId: 'usr_123',
          emailEnabled: true,
          pushEnabled: false,
          mutedTemplates: ['job.matching.published'],
        },
      ],
      totalItems: 1,
    });

    await request(app.getHttpServer())
      .get('/v1/notifications/preferences')
      .set('x-user-id', 'usr_123')
      .expect(200);

    expect(notificationsServiceMock.getNotificationPreferences).toHaveBeenCalledWith('usr_123');
  });

  it('PUT /v1/notifications/preferences updates preferences', async () => {
    notificationsServiceMock.updateNotificationPreferences.mockResolvedValueOnce({
      items: [
        {
          userId: 'usr_123',
          emailEnabled: false,
          pushEnabled: true,
          mutedTemplates: [],
        },
      ],
      totalItems: 1,
    });

    await request(app.getHttpServer())
      .put('/v1/notifications/preferences')
      .set('x-user-id', 'usr_123')
      .send({ emailEnabled: false })
      .expect(200);

    expect(notificationsServiceMock.updateNotificationPreferences).toHaveBeenCalledWith('usr_123', {
      emailEnabled: false,
    });
  });
});
