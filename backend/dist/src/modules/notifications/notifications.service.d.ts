import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
export declare class NotificationsService {
    private readonly prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    enqueueEmail(payload: {
        recipientUserId?: string;
        recipientSupplierId?: string;
        templateKey: string;
        data: Record<string, unknown>;
    }): Promise<{
        id: string;
        createdAt: Date;
        status: import(".prisma/client").$Enums.NotificationStatus;
        payloadJson: Prisma.JsonValue;
        recipientUserId: string | null;
        recipientSupplierId: string | null;
        channel: import(".prisma/client").$Enums.NotificationChannel;
        templateKey: string;
        providerMessageId: string | null;
        errorCode: string | null;
        scheduledAt: Date | null;
        sentAt: Date | null;
    }>;
}
