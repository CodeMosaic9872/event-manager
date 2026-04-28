"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const common_1 = require("@nestjs/common");
const app_module_1 = require("./app.module");
const http_exception_filter_1 = require("./common/filters/http-exception.filter");
const trace_id_interceptor_1 = require("./common/interceptors/trace-id.interceptor");
const request_logging_interceptor_1 = require("./common/interceptors/request-logging.interceptor");
const rate_limit_interceptor_1 = require("./common/interceptors/rate-limit.interceptor");
const prisma_service_1 = require("./prisma/prisma.service");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    app.enableCors();
    app.setGlobalPrefix('v1');
    app.useGlobalPipes(new common_1.ValidationPipe({
        whitelist: true,
        transform: true,
        forbidUnknownValues: false,
    }));
    app.useGlobalFilters(new http_exception_filter_1.HttpExceptionFilter());
    app.useGlobalInterceptors(new trace_id_interceptor_1.TraceIdInterceptor(), new rate_limit_interceptor_1.RateLimitInterceptor(), new request_logging_interceptor_1.RequestLoggingInterceptor());
    await app.get(prisma_service_1.PrismaService).enableShutdownHooks(app);
    await app.listen(process.env.PORT ? Number(process.env.PORT) : 3001);
}
void bootstrap();
//# sourceMappingURL=main.js.map