"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RateLimitInterceptor = void 0;
const common_1 = require("@nestjs/common");
const WINDOW_MS = 60_000;
const MAX_REQUESTS = 120;
const buckets = new Map();
let RateLimitInterceptor = class RateLimitInterceptor {
    intercept(context, next) {
        const request = context.switchToHttp().getRequest();
        const key = request.ip ?? request.headers['x-forwarded-for'] ?? 'unknown';
        const now = Date.now();
        const current = buckets.get(key);
        if (!current || current.resetAt <= now) {
            buckets.set(key, { count: 1, resetAt: now + WINDOW_MS });
            return next.handle();
        }
        if (current.count >= MAX_REQUESTS) {
            throw new common_1.HttpException('Rate limit exceeded', common_1.HttpStatus.TOO_MANY_REQUESTS);
        }
        current.count += 1;
        buckets.set(key, current);
        return next.handle();
    }
};
exports.RateLimitInterceptor = RateLimitInterceptor;
exports.RateLimitInterceptor = RateLimitInterceptor = __decorate([
    (0, common_1.Injectable)()
], RateLimitInterceptor);
//# sourceMappingURL=rate-limit.interceptor.js.map