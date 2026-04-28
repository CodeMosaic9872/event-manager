import { Module } from '@nestjs/common';
import { SuppliersController } from './suppliers.controller';
import { SuppliersService } from './suppliers.service';
import { MediaStorageService } from './media-storage.service';

@Module({
  controllers: [SuppliersController],
  providers: [SuppliersService, MediaStorageService],
  exports: [SuppliersService],
})
export class SuppliersModule {}
