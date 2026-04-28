import { PrismaService } from '../../prisma/prisma.service';
import { PlatformRole } from '../../common/constants/roles.constant';
export declare class AuthService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    private issueTokenPair;
    register(payload: {
        email: string;
        password?: string;
        role?: PlatformRole;
    }): Promise<{
        accessToken: string;
        refreshToken: string;
        userId: string;
        role: "USER" | "SUPPLIER" | "ADMIN";
    }>;
    login(payload: {
        email: string;
        password?: string;
    }): Promise<{
        accessToken: string;
        refreshToken: string;
        userId: string;
    }>;
    createAnonymousSession(payload: {
        fingerprintHash?: string;
        ipHash?: string;
    }): Promise<{
        token: string;
        sessionId: string;
    }>;
    refresh(token: string): Promise<{
        accessToken: string;
        refreshToken: string;
    }>;
    logout(userId: string): Promise<{
        success: boolean;
    }>;
    me(userId: string): Promise<{
        roles: {
            id: string;
            createdAt: Date;
            userId: string;
            role: import(".prisma/client").$Enums.PlatformRole;
        }[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        email: string | null;
        phone: string | null;
        passwordHash: string | null;
        refreshTokenHash: string | null;
        status: import(".prisma/client").$Enums.UserStatus;
        deletedAt: Date | null;
    }>;
}
