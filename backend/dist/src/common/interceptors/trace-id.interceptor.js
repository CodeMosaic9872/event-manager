"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TraceIdInterceptor = void 0;
const common_1 = require("@nestjs/common");
const crypto_1 = require("crypto");
let TraceIdInterceptor = class TraceIdInterceptor {
    intercept(context, next) {
        const request = context.switchToHttp().getRequest();
        const response = context.switchToHttp().getResponse();
        const traceId = (0, crypto_1.randomUUID)();
        request.traceId = traceId;
        response.setHeader('x-trace-id', traceId);
        return next.handle();
    }
};
exports.TraceIdInterceptor = TraceIdInterceptor;
exports.TraceIdInterceptor = TraceIdInterceptor = __decorate([
    (0, common_1.Injectable)()
], TraceIdInterceptor);
//# sourceMappingURL=trace-id.interceptor.js.map