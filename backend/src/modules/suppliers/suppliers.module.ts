import { Module } from '@nestjs/common';
import { SuppliersController } from './suppliers.controller';
import { SuppliersService } from './suppliers.service';
import { MediaStorageService } from './media-storage.service';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [NotificationsModule],
  controllers: [SuppliersController],
  providers: [SuppliersService, MediaStorageService],
  exports: [SuppliersService],
})
export class SuppliersModule {}
