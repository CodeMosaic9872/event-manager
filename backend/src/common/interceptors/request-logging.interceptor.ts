import { CallHandler, ExecutionContext, Injectable, Logger, NestInterceptor } from '@nestjs/common';
import { Observable, tap } from 'rxjs';

@Injectable()
export class RequestLoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger(RequestLoggingInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const startedAt = Date.now();
    const request = context.switchToHttp().getRequest<{
      method: string;
      url: string;
      traceId?: string;
    }>();

    return next.handle().pipe(
      tap(() => {
        const durationMs = Date.now() - startedAt;
        this.logger.log(
          JSON.stringify({
            method: request.method,
            url: request.url,
            traceId: request.traceId ?? null,
            durationMs,
          }),
        );
      }),
    );
  }
}
