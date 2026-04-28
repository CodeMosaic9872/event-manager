import {
  CallHandler,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';

const WINDOW_MS = 60_000;
const MAX_REQUESTS = 120;
const buckets = new Map<string, { count: number; resetAt: number }>();

@Injectable()
export class RateLimitInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest<{ ip?: string; headers: Record<string, string | undefined> }>();
    const key = request.ip ?? request.headers['x-forwarded-for'] ?? 'unknown';
    const now = Date.now();
    const current = buckets.get(key);

    if (!current || current.resetAt <= now) {
      buckets.set(key, { count: 1, resetAt: now + WINDOW_MS });
      return next.handle();
    }

    if (current.count >= MAX_REQUESTS) {
      throw new HttpException('Rate limit exceeded', HttpStatus.TOO_MANY_REQUESTS);
    }

    current.count += 1;
    buckets.set(key, current);
    return next.handle();
  }
}
