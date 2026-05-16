import { Controller, Get, Param } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { PlansService } from './plans.service';
import { SubscriptionPlanDto } from './dto/plan-response.dto';

@ApiTags('Plans')
@Controller('plans')
export class PlansController {
  constructor(private readonly plansService: PlansService) {}

  @Get()
  @ApiOperation({ summary: 'List active supplier subscription plans (public)' })
  @ApiOkResponse({ type: SubscriptionPlanDto, isArray: true })
  listActive() {
    return this.plansService.listActivePlans();
  }

  @Get(':key')
  @ApiOperation({ summary: 'Get active subscription plan by key (public)' })
  @ApiOkResponse({ type: SubscriptionPlanDto })
  getByKey(@Param('key') key: string) {
    return this.plansService.getByKey(key);
  }
}
