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
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const bcryptjs_1 = require("bcryptjs");
const crypto_1 = require("crypto");
const prisma_service_1 = require("../../prisma/prisma.service");
const jwt_util_1 = require("../../common/utils/jwt.util");
let AuthService = class AuthService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async issueTokenPair(user) {
        const accessToken = (0, jwt_util_1.signAccessToken)({
            sub: user.id,
            email: user.email ?? undefined,
            roles: user.roles.map((roleRow) => roleRow.role),
        });
        const refreshToken = (0, jwt_util_1.signRefreshToken)({ sub: user.id });
        const refreshTokenHash = await (0, bcryptjs_1.hash)(refreshToken, 10);
        await this.prisma.user.update({
            where: { id: user.id },
            data: { refreshTokenHash },
        });
        return { accessToken, refreshToken };
    }
    async register(payload) {
        const role = payload.role ?? 'USER';
        const existing = await this.prisma.user.findUnique({ where: { email: payload.email } });
        if (existing) {
            const hasRole = await this.prisma.userRole.findUnique({
                where: { userId_role: { userId: existing.id, role } },
            });
            if (!hasRole) {
                await this.prisma.userRole.create({ data: { userId: existing.id, role } });
            }
            const fullUser = await this.prisma.user.findUniqueOrThrow({
                where: { id: existing.id },
                include: { roles: true },
            });
            if (payload.password && !existing.passwordHash) {
                await this.prisma.user.update({
                    where: { id: existing.id },
                    data: { passwordHash: await (0, bcryptjs_1.hash)(payload.password, 10) },
                });
            }
            const { accessToken, refreshToken } = await this.issueTokenPair(fullUser);
            return { accessToken, refreshToken, userId: existing.id, role };
        }
        const created = await this.prisma.user.create({
            data: {
                email: payload.email,
                passwordHash: payload.password ? await (0, bcryptjs_1.hash)(payload.password, 10) : null,
                roles: { create: [{ role }] },
            },
            include: { roles: true },
        });
        const { accessToken, refreshToken } = await this.issueTokenPair(created);
        return { accessToken, refreshToken, userId: created.id, role };
    }
    async login(payload) {
        const user = await this.prisma.user.findUnique({
            where: { email: payload.email },
            include: { roles: true },
        });
        if (!user) {
            throw new common_1.UnauthorizedException('Invalid credentials');
        }
        if (!user.passwordHash || !payload.password) {
            throw new common_1.UnauthorizedException('Invalid credentials');
        }
        const isPasswordValid = await (0, bcryptjs_1.compare)(payload.password, user.passwordHash);
        if (!isPasswordValid) {
            throw new common_1.UnauthorizedException('Invalid credentials');
        }
        const { accessToken, refreshToken } = await this.issueTokenPair(user);
        return { accessToken, refreshToken, userId: user.id };
    }
    async createAnonymousSession(payload) {
        const token = `anon_${(0, crypto_1.randomBytes)(16).toString('hex')}`;
        const session = await this.prisma.anonymousSession.create({
            data: {
                token,
                fingerprintHash: payload.fingerprintHash ?? null,
                ipHash: payload.ipHash ?? null,
            },
        });
        return { token, sessionId: session.id };
    }
    async refresh(token) {
        const decoded = (0, jwt_util_1.verifyRefreshToken)(token);
        const user = await this.prisma.user.findUnique({
            where: { id: decoded.sub },
            include: { roles: true },
        });
        if (!user) {
            throw new common_1.UnauthorizedException('Invalid refresh token');
        }
        if (!user.refreshTokenHash) {
            throw new common_1.UnauthorizedException('Refresh token was revoked');
        }
        const isRefreshTokenValid = await (0, bcryptjs_1.compare)(token, user.refreshTokenHash);
        if (!isRefreshTokenValid) {
            throw new common_1.UnauthorizedException('Invalid refresh token');
        }
        const { accessToken, refreshToken } = await this.issueTokenPair(user);
        return {
            accessToken,
            refreshToken,
        };
    }
    async logout(userId) {
        await this.prisma.user.update({
            where: { id: userId },
            data: { refreshTokenHash: null },
        });
        return { success: true };
    }
    async me(userId) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            include: { roles: true },
        });
        if (!user) {
            throw new common_1.UnauthorizedException('Invalid token');
        }
        return user;
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], AuthService);
//# sourceMappingURL=auth.service.js.map