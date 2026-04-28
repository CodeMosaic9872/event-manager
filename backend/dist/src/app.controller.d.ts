import { PrismaService } from './prisma/prisma.service';
export declare class AppController {
    private readonly prisma;
    constructor(prisma: PrismaService);
    health(): Promise<{
        ok: boolean;
        service: string;
        timestamp: string;
    }>;
    version(): {
        name: string;
        version: string;
        phase: string;
    };
}
