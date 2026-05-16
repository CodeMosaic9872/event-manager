import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiCreatedResponse, ApiOkResponse, ApiOperation } from '@nestjs/swagger';
import { AdminControllerAuth } from '../common/admin-controller.decorator';
import { PaginationQueryDto } from '../../../common/dto/pagination-query.dto';
import { CreateSubscriptionPlanDto, UpdateSubscriptionPlanDto } from '../../plans/dto/plan.dto';
import { SubscriptionPlanDto } from '../../plans/dto/plan-response.dto';
import { AdminPlansService } from './admin-plans.service';

@AdminControllerAuth()
@Controller('admin')
export class AdminPlansController {
  constructor(private readonly adminPlansService: AdminPlansService) {}

  @Get('plans')
  @ApiOperation({ summary: 'List subscription plans (admin)' })
  @ApiOkResponse({ type: SubscriptionPlanDto, isArray: true })
  listPlans(@Query() query: PaginationQueryDto, @Query('activeOnly') activeOnly?: string) {
    const filter =
      activeOnly === 'true' ? true : activeOnly === 'false' ? false : undefined;
    return this.adminPlansService.listPlans(query.page, query.limit, filter);
  }

  @Post('plans')
  @ApiOperation({ summary: 'Create subscription plan (admin)' })
  @ApiCreatedResponse({ type: SubscriptionPlanDto })
  createPlan(@Body() body: CreateSubscriptionPlanDto) {
    return this.adminPlansService.createPlan(body);
  }

  @Get('plans/:id')
  @ApiOperation({ summary: 'Get subscription plan by id (admin)' })
  @ApiOkResponse({ type: SubscriptionPlanDto })
  getPlan(@Param('id') id: string) {
    return this.adminPlansService.getPlan(id);
  }

  @Patch('plans/:id')
  @ApiOperation({ summary: 'Update subscription plan (admin)' })
  @ApiOkResponse({ type: SubscriptionPlanDto })
  updatePlan(@Param('id') id: string, @Body() body: UpdateSubscriptionPlanDto) {
    return this.adminPlansService.updatePlan(id, body);
  }

  @Delete('plans/:id')
  @ApiOperation({ summary: 'Delete subscription plan (admin)' })
  deletePlan(@Param('id') id: string) {
    return this.adminPlansService.deletePlan(id);
  }
}
