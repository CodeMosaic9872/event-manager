import { PlatformRole } from '../constants/roles.constant';
export declare const ROLES_KEY = "roles";
export declare const Roles: (...roles: PlatformRole[]) => import("@nestjs/common").CustomDecorator<string>;
