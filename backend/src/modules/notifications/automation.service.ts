import { Injectable, Logger } from '@nestjs/common';
import { NotificationsService } from './notifications.service';

type DomainEvent = {
  eventId: string;
  type: string;
  payload: Record<string, unknown>;
};

@Injectable()
export class AutomationService {
  private readonly logger = new Logger(AutomationService.name);

  constructor(private readonly notificationsService: NotificationsService) {}

  async publish(event: DomainEvent) {
    this.logger.log(`automation.event ${event.type} ${event.eventId}`);

    if (event.type === 'job.application.submitted') {
      await this.notificationsService.enqueueEmail({
        recipientUserId: typeof event.payload.ownerUserId === 'string' ? event.payload.ownerUserId : undefined,
        templateKey: 'job.application.submitted',
        data: event.payload,
      });
    }
  }
}
