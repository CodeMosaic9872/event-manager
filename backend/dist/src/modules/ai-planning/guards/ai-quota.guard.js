"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AiQuotaGuard = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../prisma/prisma.service");
let AiQuotaGuard = class AiQuotaGuard {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async canActivate(context) {
        const request = context.switchToHttp().getRequest();
        const body = request.body ?? {};
        const userId = request.user?.id;
        const anonymousToken = body.anonymousToken ?? null;
        if (userId && !userId.startsWith('anonymous:')) {
            return true;
        }
        if (!anonymousToken) {
            throw new common_1.ForbiddenException('Anonymous token required');
        }
        const session = await this.prisma.anonymousSession.findUnique({
            where: { token: anonymousToken },
        });
        if (!session) {
            throw new common_1.ForbiddenException('Invalid anonymous session');
        }
        const usage = await this.prisma.aiUsageCounter.findUnique({
            where: { anonymousSessionId: session.id },
        });
        if ((usage?.messageCount ?? 0) >= 10) {
            throw new common_1.ForbiddenException('Registration required to continue AI planning');
        }
        return true;
    }
};
exports.AiQuotaGuard = AiQuotaGuard;
exports.AiQuotaGuard = AiQuotaGuard = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], AiQuotaGuard);
//# sourceMappingURL=ai-quota.guard.js.map