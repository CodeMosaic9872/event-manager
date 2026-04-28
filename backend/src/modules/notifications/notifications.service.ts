import { Injectable, Logger } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(private readonly prisma: PrismaService) {}

  async enqueueEmail(payload: {
    recipientUserId?: string;
    recipientSupplierId?: string;
    templateKey: string;
    data: Record<string, unknown>;
  }) {
    const notification = await this.prisma.notification.create({
      data: {
        recipientUserId: payload.recipientUserId ?? null,
        recipientSupplierId: payload.recipientSupplierId ?? null,
        channel: 'EMAIL',
        templateKey: payload.templateKey,
        payloadJson: payload.data as Prisma.InputJsonValue,
      },
    });
    this.logger.log(`notification.queued ${notification.id}`);
    return notification;
  }
}
