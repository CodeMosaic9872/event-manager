import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { Observable } from 'rxjs';

@Injectable()
export class TraceIdInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest<{ traceId?: string }>();
    const response = context.switchToHttp().getResponse<{ setHeader(name: string, value: string): void }>();
    const traceId = randomUUID();

    request.traceId = traceId;
    response.setHeader('x-trace-id', traceId);
    return next.handle();
  }
}
