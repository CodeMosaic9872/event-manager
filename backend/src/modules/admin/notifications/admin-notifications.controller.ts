import { Controller, Get, Param, Post, Query } from '@nestjs/common';
import { ApiOkResponse, ApiOperation } from '@nestjs/swagger';
import { AdminControllerAuth } from '../common/admin-controller.decorator';
import { PaginationQueryDto } from '../../../common/dto/pagination-query.dto';
import { AdminNotificationProvidersHealthResponseDto } from '../dto/admin-response.dto';
import { AdminNotificationsService } from './admin-notifications.service';

@AdminControllerAuth()
@Controller('admin')
export class AdminNotificationsController {
  constructor(private readonly adminNotificationsService: AdminNotificationsService) {}

  @Get('notifications')
  @ApiOperation({ summary: 'List notifications and statuses for admin' })
  notifications(@Query() query: PaginationQueryDto) {
    return this.adminNotificationsService.notifications(query.page, query.limit);
  }

  @Get('notifications/providers/health')
  @ApiOperation({ summary: 'Get delivery provider health per notification channel' })
  @ApiOkResponse({
    description: 'Provider health status for email, push, and sms channels',
    type: AdminNotificationProvidersHealthResponseDto,
  })
  notificationProvidersHealth() {
    return this.adminNotificationsService.notificationProvidersHealth();
  }

  @Post('notifications/retry/:id')
  @ApiOperation({ summary: 'Retry failed/pending notification by id' })
  retryNotification(@Param('id') id: string) {
    return this.adminNotificationsService.retryNotification(id);
  }
}
