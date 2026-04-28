/// <reference types="jest" />

import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import * as request from 'supertest';
import { SuppliersController } from './suppliers.controller';
import { SuppliersService } from './suppliers.service';
import { PrismaService } from '../../prisma/prisma.service';

describe('SuppliersController (contract)', () => {
  let app: INestApplication;
  const suppliersServiceMock = {
    list: jest.fn(),
    trackShare: jest.fn(),
  };
  const prismaServiceMock = {
    supplier: { findMany: jest.fn() },
    anonymousSession: { findUnique: jest.fn() },
  };

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [SuppliersController],
      providers: [
        { provide: SuppliersService, useValue: suppliersServiceMock },
        { provide: PrismaService, useValue: prismaServiceMock },
      ],
    }).compile();

    app = moduleRef.createNestApplication();
    app.setGlobalPrefix('v1');
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('GET /v1/suppliers returns paginated contract', async () => {
    suppliersServiceMock.list.mockResolvedValueOnce({
      items: [{ id: 'sup_1' }],
      pageInfo: { hasNextPage: true, nextCursor: 'sup_1', take: 1 },
      relaxationHints: [],
      searchMeta: { latencyMs: 12, constrainedByEventType: false },
    });

    const response = await request(app.getHttpServer())
      .get('/v1/suppliers')
      .query({ q: 'dj', take: 1 })
      .expect(200);

    expect(response.body).toEqual({
      items: [{ id: 'sup_1' }],
      pageInfo: { hasNextPage: true, nextCursor: 'sup_1', take: 1 },
      relaxationHints: [],
      searchMeta: { latencyMs: 12, constrainedByEventType: false },
    });
    expect(suppliersServiceMock.list).toHaveBeenCalledWith(
      expect.objectContaining({ q: 'dj', take: '1' }),
    );
  });

  it('POST /v1/suppliers/:id/share forwards share metadata', async () => {
    suppliersServiceMock.trackShare.mockResolvedValueOnce({
      tracked: true,
      supplierId: 'sup_1',
      actor: { userId: null, anonymousSessionId: null },
      channel: 'copy_link',
      context: 'details_page',
    });

    const response = await request(app.getHttpServer())
      .post('/v1/suppliers/sup_1/share')
      .send({ channel: 'copy_link', context: 'details_page' })
      .expect(201);

    expect(response.body.tracked).toBe(true);
    expect(suppliersServiceMock.trackShare).toHaveBeenCalledWith(
      null,
      null,
      'sup_1',
      expect.objectContaining({ channel: 'copy_link', context: 'details_page' }),
    );
  });
});
