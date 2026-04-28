import { AuthService } from './auth.service';
import { AuthUser } from '../../common/interfaces/auth-user.interface';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    register(body: {
        email: string;
        password?: string;
        role?: 'USER' | 'SUPPLIER' | 'ADMIN';
    }): Promise<{
        accessToken: string;
        refreshToken: string;
        userId: string;
        role: "USER" | "SUPPLIER" | "ADMIN";
    }>;
    login(body: {
        email: string;
        password?: string;
    }): Promise<{
        accessToken: string;
        refreshToken: string;
        userId: string;
    }>;
    refresh(body: {
        token: string;
    }): Promise<{
        accessToken: string;
        refreshToken: string;
    }>;
    logout(user?: AuthUser): Promise<{
        success: boolean;
    }>;
    anonymousSession(body: {
        fingerprintHash?: string;
        ipHash?: string;
    }): Promise<{
        token: string;
        sessionId: string;
    }>;
    linkAnonymous(user: AuthUser | undefined, body: {
        anonymousToken: string;
    }): {
        linked: boolean;
        anonymousToken: string;
        userId: string;
    };
    me(user?: AuthUser): Promise<{
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
