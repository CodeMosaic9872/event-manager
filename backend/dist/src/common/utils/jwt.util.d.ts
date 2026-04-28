import { PlatformRole } from '../constants/roles.constant';
type AccessTokenPayload = {
    sub: string;
    email?: string;
    roles: PlatformRole[];
    tokenType: 'access';
};
type RefreshTokenPayload = {
    sub: string;
    tokenType: 'refresh';
};
export declare function signAccessToken(payload: Omit<AccessTokenPayload, 'tokenType'>): string;
export declare function signRefreshToken(payload: Omit<RefreshTokenPayload, 'tokenType'>): string;
export declare function verifyAccessToken(token: string): AccessTokenPayload;
export declare function verifyRefreshToken(token: string): RefreshTokenPayload;
export {};
