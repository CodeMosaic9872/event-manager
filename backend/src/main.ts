import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { TraceIdInterceptor } from './common/interceptors/trace-id.interceptor';
import { RequestLoggingInterceptor } from './common/interceptors/request-logging.interceptor';
import { RateLimitInterceptor } from './common/interceptors/rate-limit.interceptor';
import { PrismaService } from './prisma/prisma.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors();

  app.setGlobalPrefix('v1');
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidUnknownValues: false,
    }),
  );
  app.useGlobalFilters(new HttpExceptionFilter());
  app.useGlobalInterceptors(
    new TraceIdInterceptor(),
    new RateLimitInterceptor(),
    new RequestLoggingInterceptor(),
  );
  await app.get(PrismaService).enableShutdownHooks(app);

  await app.listen(process.env.PORT ? Number(process.env.PORT) : 3001);
}

void bootstrap();
