import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { PaymentsService } from './payments.service';

@Injectable()
export class PaymentsRenewalWorker implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PaymentsRenewalWorker.name);
  private timer: NodeJS.Timeout | null = null;
  private isRunning = false;

  constructor(private readonly paymentsService: PaymentsService) {}

  onModuleInit() {
    const enabled = process.env.PAYMENT_RENEWAL_WORKER_ENABLED === 'true';
    if (!enabled) return;
    const intervalMs = this.getIntervalMs();
    this.timer = setInterval(() => {
      void this.tick().catch((error: unknown) => {
        this.logger.error('payments.renewal.tick.failed', error as Error);
      });
    }, intervalMs);
    this.logger.log(`payments.renewal.worker.started intervalMs=${intervalMs}`);
  }

  onModuleDestroy() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }

  private getIntervalMs(): number {
    const raw = process.env.PAYMENT_RENEWAL_WORKER_INTERVAL_MS;
    const n = raw ? Number.parseInt(raw, 10) : 10 * 60 * 1000;
    return Number.isFinite(n) && n >= 30000 ? n : 10 * 60 * 1000;
  }

  private async tick() {
    if (this.isRunning) return;
    this.isRunning = true;
    try {
      const res = await this.paymentsService.processDueRenewals(25);
      if (res.processed > 0) {
        this.logger.log(`payments.renewal.processed count=${res.processed}`);
      }
    } finally {
      this.isRunning = false;
    }
  }
}

