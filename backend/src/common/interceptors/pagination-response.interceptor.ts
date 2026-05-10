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

    return next.handle().pipe(map((data) => this.toUnifiedSuccessResponse(data, page, limit)));
  }

  private toUnifiedSuccessResponse(data: unknown, page: number, limit: number) {
    if (data && typeof data === 'object' && (data as Record<string, unknown>).success === true) {
      return data;
    }

    const pagination = this.extractPagination(data, page, limit);
    const response: Record<string, unknown> = {
      success: true,
      data,
    };

    if (pagination) {
      response.pagination = pagination;
    }

    return response;
  }

  /**
   * Only list-shaped GET bodies get envelope `pagination`. Single resources (one job, one supplier, …)
   * omit it; list endpoints use `{ items, totalItems? }`, raw arrays, or a full `pagination` object.
   */
  private extractPagination(data: unknown, page: number, limit: number): PaginationMeta | null {
    if (data === null || data === undefined) {
      return null;
    }
    if (Array.isArray(data)) {
      return this.toMeta(page, limit, data.length);
    }
    if (typeof data === 'object') {
      const record = data as Record<string, unknown>;
      if ('pagination' in record && record.pagination && typeof record.pagination === 'object') {
        const p = record.pagination as Record<string, unknown>;
        if (
          typeof p.page === 'number' &&
          typeof p.limit === 'number' &&
          typeof p.totalItems === 'number' &&
          typeof p.totalPages === 'number'
        ) {
          return p as PaginationMeta;
        }
      }
      if (Array.isArray(record.items)) {
        // Single resource + nested paginated list (e.g. AI conversation + messages): keep paging inside `data` only.
        if ('conversation' in record) {
          return null;
        }
        const totalItems = typeof record.totalItems === 'number' ? record.totalItems : record.items.length;
        return this.toMeta(page, limit, totalItems);
      }
      return null;
    }
    return null;
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
