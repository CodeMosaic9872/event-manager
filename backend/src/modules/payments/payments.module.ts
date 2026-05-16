import { Module } from '@nestjs/common';
import { CardcomWebhookController } from './cardcom-webhook.controller';
import { CardcomClient } from './providers/cardcom.client';
import { PaymentsController } from './payments.controller';
import { PaymentsRenewalWorker } from './payments-renewal.worker';
import { PaymentsService } from './payments.service';
import { PlansModule } from '../plans/plans.module';

@Module({
  imports: [PlansModule],
  controllers: [PaymentsController, CardcomWebhookController],
  providers: [PaymentsService, CardcomClient, PaymentsRenewalWorker],
  exports: [PaymentsService, CardcomClient],
})
export class PaymentsModule {}
