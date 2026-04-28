import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { TaxonomyModule } from './modules/taxonomy/taxonomy.module';
import { SuppliersModule } from './modules/suppliers/suppliers.module';
import { AiPlanningModule } from './modules/ai-planning/ai-planning.module';
import { JobBoardModule } from './modules/job-board/job-board.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { ReferralsModule } from './modules/referrals/referrals.module';
import { AdminModule } from './modules/admin/admin.module';

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    TaxonomyModule,
    SuppliersModule,
    AiPlanningModule,
    JobBoardModule,
    NotificationsModule,
    ReferralsModule,
    AdminModule,
  ],
  controllers: [AppController],
})
export class AppModule {}
