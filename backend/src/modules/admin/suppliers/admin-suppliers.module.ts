import { Module } from '@nestjs/common';
import { NotificationsModule } from '../../notifications/notifications.module';
import { SmsModule } from '../../sms/sms.module';
import { SuppliersModule } from '../../suppliers/suppliers.module';
import { AdminSuppliersController } from './admin-suppliers.controller';
import { AdminSuppliersService } from './admin-suppliers.service';

@Module({
  imports: [SmsModule, NotificationsModule, SuppliersModule],
  controllers: [AdminSuppliersController],
  providers: [AdminSuppliersService],
})
export class AdminSuppliersModule {}
