import { Module } from '@nestjs/common';
import { NotificationsModule } from '../../notifications/notifications.module';
import { AdminAutomationsController } from './admin-automations.controller';
import { AdminAutomationsService } from './admin-automations.service';

@Module({
  imports: [NotificationsModule],
  controllers: [AdminAutomationsController],
  providers: [AdminAutomationsService],
})
export class AdminAutomationsModule {}
