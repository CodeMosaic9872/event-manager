import { Module } from '@nestjs/common';
import { AutomationService } from './automation.service';
import { NotificationsController } from './notifications.controller';
import { NotificationsService } from './notifications.service';

@Module({
  controllers: [NotificationsController],
  providers: [NotificationsService, AutomationService],
  exports: [NotificationsService, AutomationService],
})
export class NotificationsModule {}
