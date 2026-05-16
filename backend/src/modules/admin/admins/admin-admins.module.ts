import { Module } from '@nestjs/common';
import { AdminAdminsController } from './admin-admins.controller';
import { AdminAdminsService } from './admin-admins.service';
import { SmsModule } from '../../sms/sms.module';

@Module({
  imports: [SmsModule],
  controllers: [AdminAdminsController],
  providers: [AdminAdminsService],
  exports: [AdminAdminsService],
})
export class AdminAdminsModule {}
