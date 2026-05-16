import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiCreatedResponse, ApiOkResponse, ApiOperation } from '@nestjs/swagger';
import {
  ApiOkEnvelopeData,
  ApiOkEnvelopePaginatedItems,
} from '../../../common/swagger/api-response.decorators';
import { AdminControllerAuth } from '../common/admin-controller.decorator';
import {
  AdminSubscriptionListQueryDto,
  CreateAdminSubscriptionDto,
  UpdateAdminSubscriptionDto,
} from '../dto/admin.dto';
import { AdminSubscriptionCrudDto } from '../dto/admin-response.dto';
import { AdminSubscriptionsService } from './admin-subscriptions.service';

@AdminControllerAuth()
@Controller('admin')
export class AdminSubscriptionsController {
  constructor(private readonly adminSubscriptionsService: AdminSubscriptionsService) {}

  @Get('subscriptions')
  @ApiOperation({ summary: 'List supplier subscriptions (admin)' })
  @ApiOkEnvelopePaginatedItems(AdminSubscriptionCrudDto)
  subscriptions(@Query() query: AdminSubscriptionListQueryDto) {
    return this.adminSubscriptionsService.listSubscriptions(query.page, query.limit, query.supplierId);
  }

  @Post('subscriptions')
  @ApiOperation({ summary: 'Create supplier subscription (admin)' })
  @ApiCreatedResponse({ type: AdminSubscriptionCrudDto })
  createSubscription(@Body() body: CreateAdminSubscriptionDto) {
    return this.adminSubscriptionsService.createSubscription(body);
  }

  @Get('subscriptions/:id')
  @ApiOperation({ summary: 'Get subscription by id (admin)' })
  @ApiOkEnvelopeData(AdminSubscriptionCrudDto)
  getSubscription(@Param('id') id: string) {
    return this.adminSubscriptionsService.getSubscription(id);
  }

  @Patch('subscriptions/:id')
  @ApiOperation({ summary: 'Update subscription by id (admin)' })
  @ApiOkResponse({ type: AdminSubscriptionCrudDto })
  updateSubscription(@Param('id') id: string, @Body() body: UpdateAdminSubscriptionDto) {
    return this.adminSubscriptionsService.updateSubscription(id, body);
  }

  @Delete('subscriptions/:id')
  @ApiOperation({ summary: 'Cancel subscription (sets status CANCELED)' })
  @ApiOkResponse({ type: AdminSubscriptionCrudDto })
  deleteSubscription(@Param('id') id: string) {
    return this.adminSubscriptionsService.deleteSubscription(id);
  }
}
