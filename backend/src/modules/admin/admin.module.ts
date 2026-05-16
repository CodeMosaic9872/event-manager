import { Module } from '@nestjs/common';
import { AdminAdminsModule } from './admins/admin-admins.module';
import { AdminAiModule } from './ai/admin-ai.module';
import { AdminAutomationsModule } from './automations/admin-automations.module';
import { AdminJobsModule } from './jobs/admin-jobs.module';
import { AdminNotificationsModule } from './notifications/admin-notifications.module';
import { AdminSubscriptionsModule } from './subscriptions/admin-subscriptions.module';
import { AdminSuppliersModule } from './suppliers/admin-suppliers.module';
import { AdminTaxonomyModule } from './taxonomy/admin-taxonomy.module';
import { AdminUsersModule } from './users/admin-users.module';
import { AdminPlansModule } from './plans/admin-plans.module';

@Module({
  imports: [
    AdminAdminsModule,
    AdminUsersModule,
    AdminPlansModule,
    AdminSuppliersModule,
    AdminSubscriptionsModule,
    AdminJobsModule,
    AdminAiModule,
    AdminNotificationsModule,
    AdminAutomationsModule,
    AdminTaxonomyModule,
  ],
})
export class AdminModule {}
