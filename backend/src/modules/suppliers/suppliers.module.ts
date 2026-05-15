import { Module } from '@nestjs/common';
import { SuppliersController } from './suppliers.controller';
import { SuppliersService } from './suppliers.service';
import { StorageModule } from '../storage/storage.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { OptionalAuthGuard } from '../../common/guards/optional-auth.guard';

@Module({
  imports: [NotificationsModule, StorageModule],
  controllers: [SuppliersController],
  providers: [SuppliersService, OptionalAuthGuard],
  exports: [SuppliersService],
})
export class SuppliersModule {}
