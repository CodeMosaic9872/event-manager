import { applyDecorators } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiForbiddenResponse,
  ApiInternalServerErrorResponse,
  ApiNotFoundResponse,
  ApiTooManyRequestsResponse,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { ErrorResponseDto } from './error-response.dto';

type ErrorOptions = {
  unauthorized?: boolean;
  forbidden?: boolean;
  notFound?: boolean;
  rateLimited?: boolean;
};

export function ApiErrorResponses(options?: ErrorOptions) {
  return applyDecorators(
    ApiBadRequestResponse({ description: 'Bad request', type: ErrorResponseDto }),
    ...(options?.unauthorized
      ? [ApiUnauthorizedResponse({ description: 'Unauthorized', type: ErrorResponseDto })]
      : []),
    ...(options?.forbidden ? [ApiForbiddenResponse({ description: 'Forbidden', type: ErrorResponseDto })] : []),
    ...(options?.notFound ? [ApiNotFoundResponse({ description: 'Not found', type: ErrorResponseDto })] : []),
    ...(options?.rateLimited
      ? [ApiTooManyRequestsResponse({ description: 'Too many requests', type: ErrorResponseDto })]
      : []),
    ApiInternalServerErrorResponse({
      description: 'Internal server error',
      type: ErrorResponseDto,
    }),
  );
}

export function ApiPublicErrors() {
  return ApiErrorResponses({ notFound: true, rateLimited: true });
}

export function ApiAuthErrors() {
  return ApiErrorResponses({ unauthorized: true, notFound: true, rateLimited: true });
}

export function ApiProtectedErrors() {
  return ApiErrorResponses({ unauthorized: true, forbidden: true, notFound: true, rateLimited: true });
}
