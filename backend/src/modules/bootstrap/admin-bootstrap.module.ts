import { Module } from '@nestjs/common';
import { AdminAdminsModule } from '../admin/admins/admin-admins.module';
import { AdminBootstrapController } from './admin-bootstrap.controller';

@Module({
  imports: [AdminAdminsModule],
  controllers: [AdminBootstrapController],
})
export class AdminBootstrapModule {}
