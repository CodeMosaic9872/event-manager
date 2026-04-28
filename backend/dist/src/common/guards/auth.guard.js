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
exports.AuthGuard = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const jwt_util_1 = require("../utils/jwt.util");
let AuthGuard = class AuthGuard {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async canActivate(context) {
        const request = context.switchToHttp().getRequest();
        const authHeader = request.headers.authorization;
        const headerValue = Array.isArray(authHeader) ? authHeader[0] : authHeader;
        const token = headerValue?.startsWith('Bearer ') ? headerValue.slice(7) : undefined;
        if (!token) {
            throw new common_1.UnauthorizedException('Missing bearer token');
        }
        if (token.startsWith('anon_')) {
            const anonymousSession = await this.prisma.anonymousSession.findUnique({
                where: { token },
            });
            if (!anonymousSession) {
                throw new common_1.UnauthorizedException('Invalid anonymous token');
            }
            request.user = {
                id: `anonymous:${anonymousSession.id}`,
                roles: ['USER'],
                anonymousSessionId: anonymousSession.id,
            };
            return true;
        }
        let decoded;
        try {
            decoded = (0, jwt_util_1.verifyAccessToken)(token);
        }
        catch {
            throw new common_1.UnauthorizedException('Invalid user token');
        }
        const user = await this.prisma.user.findUnique({
            where: { id: decoded.sub },
            include: { roles: true },
        });
        if (!user) {
            throw new common_1.UnauthorizedException('Invalid user token');
        }
        request.user = {
            id: user.id,
            email: user.email ?? undefined,
            roles: decoded.roles,
        };
        return true;
    }
};
exports.AuthGuard = AuthGuard;
exports.AuthGuard = AuthGuard = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], AuthGuard);
//# sourceMappingURL=auth.guard.js.map