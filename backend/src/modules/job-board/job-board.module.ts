import { Module } from '@nestjs/common';
import { JobApplicationController, JobBoardController, JobQueryController } from './job-board.controller';
import { JobBoardService } from './job-board.service';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [NotificationsModule],
  controllers: [JobBoardController, JobApplicationController, JobQueryController],
  providers: [JobBoardService],
  exports: [JobBoardService],
})
export class JobBoardModule {}
