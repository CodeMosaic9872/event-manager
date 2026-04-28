import { Module } from '@nestjs/common';
import { AutomationService } from './automation.service';
import { NotificationsService } from './notifications.service';

@Module({
  providers: [NotificationsService, AutomationService],
  exports: [NotificationsService, AutomationService],
})
export class NotificationsModule {}
