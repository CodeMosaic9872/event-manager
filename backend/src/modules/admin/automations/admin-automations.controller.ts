import { Body, Controller, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiOkResponse, ApiOperation } from '@nestjs/swagger';
import {
  ApiOkEnvelopeData,
  ApiOkEnvelopePaginatedItems,
} from '../../../common/swagger/api-response.decorators';
import { AdminControllerAuth } from '../common/admin-controller.decorator';
import { PaginationQueryDto } from '../../../common/dto/pagination-query.dto';
import { UpdateAutomationRuleDto } from '../dto/admin.dto';
import {
  AdminAutomationMetricsDto,
  AdminAutomationRuleItemDto,
  AdminNotificationRowDto,
  AdminProcessAutomationRunsResponseDto,
} from '../dto/admin-swagger-responses.dto';
import { AdminAutomationsService } from './admin-automations.service';

@AdminControllerAuth()
@Controller('admin')
export class AdminAutomationsController {
  constructor(private readonly adminAutomationsService: AdminAutomationsService) {}

  @Get('automations/rules')
  @ApiOperation({ summary: 'List static notification automation rules' })
  @ApiOkEnvelopePaginatedItems(AdminAutomationRuleItemDto)
  automationRules(@Query() query: PaginationQueryDto) {
    return this.adminAutomationsService.automationRules(query.page, query.limit);
  }

  @Patch('automations/rules/:id')
  updateAutomationRule(@Param('id') id: string, @Body() body: UpdateAutomationRuleDto) {
    return this.adminAutomationsService.updateAutomationRule(id, {
      isActive: body.isActive,
      config: body.config,
    });
  }

  @Get('automations/runs')
  @ApiOperation({ summary: 'List notification delivery runs' })
  @ApiOkEnvelopePaginatedItems(AdminNotificationRowDto)
  automationRuns(@Query() query: PaginationQueryDto) {
    return this.adminAutomationsService.automationRuns(query.page, query.limit);
  }

  @Post('automations/runs/process')
  @ApiOperation({ summary: 'Process pending automation notification runs' })
  @ApiOkResponse({ type: AdminProcessAutomationRunsResponseDto })
  processAutomationRuns(@Query('limit') limit?: string) {
    const parsed = Number(limit);
    return this.adminAutomationsService.processAutomationRuns(Number.isFinite(parsed) && parsed > 0 ? parsed : 50);
  }

  @Get('automations/metrics')
  @ApiOperation({ summary: 'Get automation queue metrics' })
  @ApiOkEnvelopeData(AdminAutomationMetricsDto)
  automationMetrics() {
    return this.adminAutomationsService.automationMetrics();
  }
}
