import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable, tap } from 'rxjs';

@Injectable()
export class SuccessStatusInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    return next.handle().pipe(
      tap(() => {
        const response = context.switchToHttp().getResponse<{ statusCode?: number; status: (code: number) => unknown }>();
        if (response?.statusCode === 201) {
          response.status(200);
        }
      }),
    );
  }
}
