import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable, map } from 'rxjs';

type PaginationMeta = {
  page: number;
  limit: number;
  totalItems: number;
  totalPages: number;
};

@Injectable()
export class PaginationResponseInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest<{ method?: string; query?: Record<string, unknown> }>();
    if (request?.method !== 'GET') {
      return next.handle();
    }

    const page = this.parsePositiveInt(request.query?.page, 1);
    const limit = this.parsePositiveInt(request.query?.limit, 20);

    return next.handle().pipe(map((data) => this.toUnifiedSuccessResponse(data, request?.method === 'GET', page, limit)));
  }

  private toUnifiedSuccessResponse(data: unknown, isGetRequest: boolean, page: number, limit: number) {
    if (data && typeof data === 'object' && (data as Record<string, unknown>).success === true) {
      return data;
    }

    const pagination = isGetRequest ? this.extractPagination(data, page, limit) : null;
    const base = {
      success: true,
      data,
    } as Record<string, unknown>;

    if (pagination) {
      base.pagination = pagination;
    }

    // Compatibility: preserve previous top-level response fields while adding unified envelope.
    if (data && typeof data === 'object' && !Array.isArray(data)) {
      return {
        ...base,
        ...(data as Record<string, unknown>),
      };
    }

    // Compatibility for list endpoints that previously returned arrays.
    if (Array.isArray(data)) {
      return {
        ...base,
        items: data,
      };
    }

    return base;
  }

  private extractPagination(data: unknown, page: number, limit: number): PaginationMeta | null {
    if (data === null || data === undefined) {
      return this.toMeta(page, limit, 0);
    }
    if (Array.isArray(data)) {
      return this.toMeta(page, limit, data.length);
    }
    if (typeof data === 'object') {
      const record = data as Record<string, unknown>;
      if ('pagination' in record && record.pagination && typeof record.pagination === 'object') {
        return record.pagination as PaginationMeta;
      }
      if (Array.isArray(record.items)) {
        const totalItems = typeof record.totalItems === 'number' ? record.totalItems : record.items.length;
        return this.toMeta(page, limit, totalItems);
      }
      return this.toMeta(page, limit, 1);
    }
    return this.toMeta(page, limit, 1);
  }

  private parsePositiveInt(value: unknown, fallback: number) {
    const parsed = Number(value);
    if (!Number.isFinite(parsed) || parsed < 1) {
      return fallback;
    }
    return Math.floor(parsed);
  }

  private toMeta(page: number, limit: number, totalItems: number): PaginationMeta {
    const safeTotalItems = Math.max(0, totalItems);
    const totalPages = Math.max(1, Math.ceil(safeTotalItems / Math.max(1, limit)));
    return {
      page,
      limit,
      totalItems: safeTotalItems,
      totalPages,
    };
  }
}
