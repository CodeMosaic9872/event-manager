import { PlatformRole } from '../constants/roles.constant';
export interface AuthUser {
    id: string;
    email?: string;
    roles: PlatformRole[];
    anonymousSessionId?: string;
}
