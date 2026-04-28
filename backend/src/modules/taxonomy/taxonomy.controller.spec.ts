/// <reference types="jest" />

import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import * as request from 'supertest';
import { TaxonomyController } from './taxonomy.controller';
import { TaxonomyService } from './taxonomy.service';

describe('TaxonomyController (contract)', () => {
  let app: INestApplication;
  const taxonomyServiceMock = {
    getEventTypes: jest.fn(),
    getCategories: jest.fn(),
    getSubcategories: jest.fn(),
    getFilterDefinitions: jest.fn(),
    getMapping: jest.fn(),
  };

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [TaxonomyController],
      providers: [{ provide: TaxonomyService, useValue: taxonomyServiceMock }],
    }).compile();

    app = moduleRef.createNestApplication();
    app.setGlobalPrefix('v1');
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('GET /v1/taxonomy/mapping returns mapping contract', async () => {
    taxonomyServiceMock.getMapping.mockResolvedValueOnce({
      filters: { eventTypeId: 'evt_1', categoryId: 'cat_1' },
      count: 1,
      items: [
        {
          eventType: { id: 'evt_1', key: 'wedding', name: 'Wedding' },
          category: { id: 'cat_1', key: 'music', name: 'Music' },
          subcategory: { id: 'sub_1', key: 'dj', name: 'DJ' },
          priority: 1,
          isDefault: true,
        },
      ],
    });

    const response = await request(app.getHttpServer())
      .get('/v1/taxonomy/mapping')
      .query({ eventTypeId: 'evt_1', categoryId: 'cat_1' })
      .expect(200);

    expect(response.body.count).toBe(1);
    expect(response.body.items[0]).toEqual(
      expect.objectContaining({
        priority: 1,
        isDefault: true,
      }),
    );
    expect(taxonomyServiceMock.getMapping).toHaveBeenCalledWith(
      expect.objectContaining({ eventTypeId: 'evt_1', categoryId: 'cat_1' }),
    );
  });
});
