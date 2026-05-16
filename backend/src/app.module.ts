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
import { AdminBootstrapModule } from './modules/bootstrap/admin-bootstrap.module';
import { ConceptsModule } from './modules/concepts/concepts.module';
import { PaymentsModule } from './modules/payments/payments.module';
import { PlansModule } from './modules/plans/plans.module';

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    PlansModule,
    TaxonomyModule,
    SuppliersModule,
    ConceptsModule,
    AiPlanningModule,
    JobBoardModule,
    NotificationsModule,
    ReferralsModule,
    AdminModule,
    AdminBootstrapModule,
    PaymentsModule,
  ],
  controllers: [AppController],
})
export class AppModule {}
