import { Type, applyDecorators } from '@nestjs/common';
import { ApiCreatedResponse, ApiExtraModels, ApiOkResponse, getSchemaPath } from '@nestjs/swagger';
import { PaginationMetaDto } from './pagination-meta.dto';

const ENVELOPE_HINT =
  'GET responses are wrapped by PaginationResponseInterceptor as `{ success: true, data, pagination? }`. POST/PATCH/DELETE return the resource body directly (HTTP 200, not 201).';

/**
 * Documents a single resource (or object) in `data`.
 */
export function ApiOkEnvelopeData<TModel extends Type<unknown>>(
  dataType: TModel,
  options?: { description?: string },
) {
  return applyDecorators(
    ApiExtraModels(dataType, PaginationMetaDto),
    ApiOkResponse({
      description: options?.description ? `${options.description} ${ENVELOPE_HINT}` : ENVELOPE_HINT,
      schema: {
        type: 'object',
        required: ['success', 'data'],
        properties: {
          success: { type: 'boolean', example: true },
          data: { $ref: getSchemaPath(dataType) },
        },
      },
    }),
  );
}

/**
 * Documents `{ items: T[], totalItems }` in `data` (standard admin/list pattern).
 */
export function ApiOkEnvelopePaginatedItems<TModel extends Type<unknown>>(
  itemType: TModel,
  options?: { description?: string },
) {
  return applyDecorators(
    ApiExtraModels(itemType, PaginationMetaDto),
    ApiOkResponse({
      description: options?.description
        ? `${options.description} ${ENVELOPE_HINT}`
        : `Paginated list. ${ENVELOPE_HINT}`,
      schema: {
        type: 'object',
        required: ['success', 'data'],
        properties: {
          success: { type: 'boolean', example: true },
          data: {
            type: 'object',
            required: ['items', 'totalItems'],
            properties: {
              items: {
                type: 'array',
                items: { $ref: getSchemaPath(itemType) },
              },
              totalItems: { type: 'number', example: 0 },
            },
          },
          pagination: { $ref: getSchemaPath(PaginationMetaDto) },
        },
      },
    }),
  );
}

/**
 * Documents a paginated payload type that already defines `items` + `totalItems` (job board, taxonomy).
 */
export function ApiOkEnvelopePaginated<TModel extends Type<unknown>>(
  paginatedType: TModel,
  options?: { description?: string },
) {
  return applyDecorators(
    ApiExtraModels(paginatedType, PaginationMetaDto),
    ApiOkResponse({
      description: options?.description
        ? `${options.description} ${ENVELOPE_HINT}`
        : `Paginated list. ${ENVELOPE_HINT}`,
      schema: {
        type: 'object',
        required: ['success', 'data'],
        properties: {
          success: { type: 'boolean', example: true },
          data: { $ref: getSchemaPath(paginatedType) },
          pagination: { $ref: getSchemaPath(PaginationMetaDto) },
        },
      },
    }),
  );
}

/**
 * Documents a plain array in `data` (e.g. GET /plans).
 */
export function ApiOkEnvelopeArray<TModel extends Type<unknown>>(
  itemType: TModel,
  options?: { description?: string },
) {
  return applyDecorators(
    ApiExtraModels(itemType, PaginationMetaDto),
    ApiOkResponse({
      description: options?.description
        ? `${options.description} ${ENVELOPE_HINT}`
        : `Array in data. ${ENVELOPE_HINT}`,
      schema: {
        type: 'object',
        required: ['success', 'data'],
        properties: {
          success: { type: 'boolean', example: true },
          data: {
            type: 'array',
            items: { $ref: getSchemaPath(itemType) },
          },
          pagination: { $ref: getSchemaPath(PaginationMetaDto) },
        },
      },
    }),
  );
}

/** Same envelope as {@link ApiOkEnvelopeData}; documents create/update that return HTTP 200. */
export function ApiCreatedEnvelopeData<TModel extends Type<unknown>>(
  dataType: TModel,
  options?: { description?: string },
) {
  return applyDecorators(
    ApiExtraModels(dataType, PaginationMetaDto),
    ApiCreatedResponse({
      description: options?.description
        ? `${options.description} ${ENVELOPE_HINT}`
        : ENVELOPE_HINT,
      schema: {
        type: 'object',
        required: ['success', 'data'],
        properties: {
          success: { type: 'boolean', example: true },
          data: { $ref: getSchemaPath(dataType) },
        },
      },
    }),
  );
}
