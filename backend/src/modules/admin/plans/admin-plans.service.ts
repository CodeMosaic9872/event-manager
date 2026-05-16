import { Injectable } from '@nestjs/common';
import { BillingInterval } from '@prisma/client';
import { PlansService } from '../../plans/plans.service';

@Injectable()
export class AdminPlansService {
  constructor(private readonly plansService: PlansService) {}

  listPlans(page?: number, limit?: number, activeOnly?: boolean) {
    return this.plansService.listPlans(page, limit, activeOnly);
  }

  getPlan(id: string) {
    return this.plansService.getPlan(id);
  }

  createPlan(payload: {
    key: string;
    name: string;
    interval: BillingInterval;
    pretaxAmount: number;
    billingMonths: number;
    summaryTitle?: string;
    totalPeriodNote?: string;
    currency?: string;
    badge?: string;
    isFeatured?: boolean;
    sortOrder?: number;
    isActive?: boolean;
    features?: string[];
  }) {
    return this.plansService.createPlan(payload);
  }

  updatePlan(
    id: string,
    payload: {
      key?: string;
      name?: string;
      interval?: BillingInterval;
      pretaxAmount?: number;
      billingMonths?: number;
      summaryTitle?: string;
      totalPeriodNote?: string;
      currency?: string;
      badge?: string;
      isFeatured?: boolean;
      sortOrder?: number;
      isActive?: boolean;
      features?: string[];
    },
  ) {
    return this.plansService.updatePlan(id, payload);
  }

  deletePlan(id: string) {
    return this.plansService.deletePlan(id);
  }
}
