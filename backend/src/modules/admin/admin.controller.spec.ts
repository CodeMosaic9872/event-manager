/// <reference types="jest" />

import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import * as request from 'supertest';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';

describe('AdminController (contract)', () => {
  let app: INestApplication;
  const adminServiceMock = {
    moderateJobApplication: jest.fn(),
  };

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [AdminController],
      providers: [{ provide: AdminService, useValue: adminServiceMock }],
    }).compile();

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
});
