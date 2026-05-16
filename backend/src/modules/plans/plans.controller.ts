import { Controller, Get, Param } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ApiOkEnvelopeArray, ApiOkEnvelopeData } from '../../common/swagger/api-response.decorators';
import { PlansService } from './plans.service';
import { SubscriptionPlanDto } from './dto/plan-response.dto';

@ApiTags('Plans')
@Controller('plans')
export class PlansController {
  constructor(private readonly plansService: PlansService) {}

  @Get()
  @ApiOperation({ summary: 'List active supplier subscription plans (public)' })
  @ApiOkEnvelopeArray(SubscriptionPlanDto, { description: 'Active subscription plans' })
  listActive() {
    return this.plansService.listActivePlans();
  }

  @Get(':key')
  @ApiOperation({ summary: 'Get active subscription plan by key (public)' })
  @ApiOkEnvelopeData(SubscriptionPlanDto)
  getByKey(@Param('key') key: string) {
    return this.plansService.getByKey(key);
  }
}
