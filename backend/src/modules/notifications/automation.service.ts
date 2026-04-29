import { Injectable, Logger } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { PrismaService } from '../../prisma/prisma.service';

type DomainEvent = {
  eventId: string;
  type: string;
  payload: Record<string, unknown>;
};

@Injectable()
export class AutomationService {
  private readonly logger = new Logger(AutomationService.name);

  constructor(
    private readonly notificationsService: NotificationsService,
    private readonly prisma: PrismaService,
  ) {}

  async publish(event: DomainEvent) {
    const isDuplicate = await this.hasProcessedEvent(event.eventId);
    if (isDuplicate) {
      this.logger.warn(`automation.event.duplicate ${event.type} ${event.eventId}`);
      return;
    }
    this.logger.log(`automation.event ${event.type} ${event.eventId}`);

    if (event.type === 'job.application.submitted') {
      await this.notificationsService.enqueueEmail({
        recipientUserId: typeof event.payload.ownerUserId === 'string' ? event.payload.ownerUserId : undefined,
        templateKey: 'job.application.submitted',
        data: { ...event.payload, eventId: event.eventId, eventType: event.type },
      });
      await this.notificationsService.enqueuePush({
        recipientUserId: typeof event.payload.ownerUserId === 'string' ? event.payload.ownerUserId : undefined,
        templateKey: 'job.application.submitted',
        data: { ...event.payload, eventId: event.eventId, eventType: event.type },
      });
    }

    if (event.type === 'job.material.updated') {
      const supplierIds = Array.isArray(event.payload.supplierIds)
        ? event.payload.supplierIds.filter((id): id is string => typeof id === 'string')
        : [];
      await Promise.all(
        supplierIds.map((supplierId) =>
          this.notificationsService.enqueueEmail({
            recipientSupplierId: supplierId,
            templateKey: 'job.material.updated',
            data: { ...event.payload, eventId: event.eventId, eventType: event.type },
          }),
        ),
      );
      await Promise.all(
        supplierIds.map((supplierId) =>
          this.notificationsService.enqueuePush({
            recipientSupplierId: supplierId,
            templateKey: 'job.material.updated',
            data: { ...event.payload, eventId: event.eventId, eventType: event.type },
          }),
        ),
      );
    }

    if (event.type === 'job.matching.published') {
      const supplierIds = Array.isArray(event.payload.supplierIds)
        ? event.payload.supplierIds.filter((id): id is string => typeof id === 'string')
        : [];
      await Promise.all(
        supplierIds.map((supplierId) =>
          this.notificationsService.enqueueEmail({
            recipientSupplierId: supplierId,
            templateKey: 'job.matching.published',
            data: { ...event.payload, eventId: event.eventId, eventType: event.type },
          }),
        ),
      );
      await Promise.all(
        supplierIds.map((supplierId) =>
          this.notificationsService.enqueuePush({
            recipientSupplierId: supplierId,
            templateKey: 'job.matching.published',
            data: { ...event.payload, eventId: event.eventId, eventType: event.type },
          }),
        ),
      );
    }
  }

  private async hasProcessedEvent(eventId: string) {
    const existing = await this.prisma.notification.findFirst({
      where: {
        payloadJson: {
          path: ['eventId'],
          equals: eventId,
        },
      } as never,
      select: { id: true },
    });
    return Boolean(existing);
  }
}
