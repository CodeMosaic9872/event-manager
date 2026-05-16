import { Controller, Get, Query } from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';
import {
  ApiOkEnvelopeArray,
  ApiOkEnvelopeData,
} from '../../../common/swagger/api-response.decorators';
import { AdminControllerAuth } from '../common/admin-controller.decorator';
import { PaginationQueryDto } from '../../../common/dto/pagination-query.dto';
import {
  AdminAiFailureGroupDto,
  AdminAiPerformanceDto,
  AdminAiRecommendationQualityDto,
  AdminAiTopRecommendationGroupDto,
  AdminAiConversationRowDto,
  AdminAiUsageCounterDto,
} from '../dto/admin-swagger-responses.dto';
import { AdminAiService } from './admin-ai.service';

@AdminControllerAuth()
@Controller('admin')
export class AdminAiController {
  constructor(private readonly adminAiService: AdminAiService) {}

  @Get('ai/usage')
  @ApiOperation({ summary: 'Get AI usage telemetry for admin' })
  @ApiOkEnvelopeArray(AdminAiUsageCounterDto, { description: 'AI usage counters' })
  aiUsage(@Query() query: PaginationQueryDto) {
    return this.adminAiService.aiUsage(query.page, query.limit);
  }

  @Get('ai/failures')
  @ApiOperation({ summary: 'Get AI failure summary for admin' })
  @ApiOkEnvelopeArray(AdminAiFailureGroupDto, { description: 'Failure tag aggregates' })
  aiFailures() {
    return this.adminAiService.aiFailures();
  }

  @Get('ai/conversations')
  @ApiOperation({ summary: 'Get AI conversations snapshot for admin' })
  @ApiOkEnvelopeArray(AdminAiConversationRowDto, { description: 'AI conversations with messages' })
  aiConversations(@Query() query: PaginationQueryDto) {
    return this.adminAiService.aiConversations(query.page, query.limit);
  }

  @Get('ai/recommendations/top')
  @ApiOperation({ summary: 'Get top recommended suppliers by AI logs' })
  @ApiOkEnvelopeArray(AdminAiTopRecommendationGroupDto, {
    description: 'Top suppliers by recommendation count',
  })
  aiTopRecommendations() {
    return this.adminAiService.aiTopRecommendations();
  }

  @Get('ai/recommendations/quality')
  @ApiOperation({ summary: 'Get AI recommendation quality metrics (CTR/acceptance)' })
  @ApiOkEnvelopeData(AdminAiRecommendationQualityDto)
  aiRecommendationQuality() {
    return this.adminAiService.aiRecommendationQuality();
  }

  @Get('ai/performance')
  @ApiOperation({ summary: 'Get AI retrieval performance metrics and hit-rate' })
  @ApiOkEnvelopeData(AdminAiPerformanceDto)
  aiPerformance() {
    return this.adminAiService.aiPerformance();
  }
}
