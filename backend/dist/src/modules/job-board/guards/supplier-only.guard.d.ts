import { CanActivate, ExecutionContext } from '@nestjs/common';
export declare class SupplierOnlyGuard implements CanActivate {
    canActivate(context: ExecutionContext): boolean;
}
