import { Body, Controller, Get, HttpCode, Param, Post, Query, UseGuards } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AiPlanningService } from './ai-planning.service';
import { AiQuotaGuard } from './guards/ai-quota.guard';
import { OptionalAuthGuard } from '../../common/guards/optional-auth.guard';
import { AuthUser } from '../../common/interfaces/auth-user.interface';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { ApiAuthErrors } from '../../common/swagger/api-error-responses.decorator';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';
import { CreateConversationDto, SendMessageDto } from './dto/ai-planning.dto';
import {
  AiRecommendationLogResponseDto,
  ConversationResponseDto,
  CreateConversationResponseDto,
  SendMessageResponseDto,
} from './dto/ai-planning-response.dto';

@ApiTags('AI Planning')
@ApiAuthErrors()
@Controller('ai/conversations')
export class AiPlanningController {
  constructor(private readonly aiPlanningService: AiPlanningService) {}

  @Post()
  @HttpCode(200)
  @ApiOperation({
    summary: 'Create AI planning conversation for user or anonymous actor',
    description:
      'HTTP status is 200 (not 201) because a global interceptor normalizes success responses to 200.',
  })
  @ApiOkResponse({
    description: 'Created conversation',
    type: CreateConversationResponseDto,
  })
  @UseGuards(OptionalAuthGuard)
  createConversation(
    @CurrentUser() user: AuthUser | undefined,
    @Body() body: CreateConversationDto,
  ) {
    const userId = user && !user.id.startsWith('anonymous:') ? user.id : undefined;
    return this.aiPlanningService.createConversation({ ...body, userId });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get AI conversation metadata with paginated messages (page/limit apply to messages)' })
  @ApiOkResponse({
    description: 'Conversation metadata plus paginated messages',
    type: ConversationResponseDto,
  })
  getConversation(@Param('id') id: string, @Query() query: PaginationQueryDto) {
    return this.aiPlanningService.getConversation(id, query.page, query.limit);
  }

  @Post(':id/messages')
  @HttpCode(200)
  @ApiOperation({
    summary: 'Send AI message with quota gate enforcement',
    description:
      'HTTP status is 200 (not 201) because a global interceptor normalizes success responses to 200.',
  })
  @ApiOkResponse({
    description: 'Assistant reply and planning payload',
    type: SendMessageResponseDto,
  })
  @UseGuards(OptionalAuthGuard, AiQuotaGuard)
  sendMessage(
    @CurrentUser() user: AuthUser | undefined,
    @Param('id') id: string,
    @Body() body: SendMessageDto,
  ) {
    const userId = user && !user.id.startsWith('anonymous:') ? user.id : undefined;
    return this.aiPlanningService.sendMessage({
      conversationId: id,
      userId,
      ...body,
    });
  }

  @Post(':id/recommendations/:supplierId/click')
  @HttpCode(200)
  @ApiOperation({ summary: 'Track recommendation click-through signal' })
  @ApiOkResponse({
    description: 'Updated recommendation log row',
    type: AiRecommendationLogResponseDto,
  })
  @UseGuards(OptionalAuthGuard)
  trackRecommendationClick(@Param('id') id: string, @Param('supplierId') supplierId: string) {
    return this.aiPlanningService.trackRecommendationClick(id, supplierId);
  }

  @Post(':id/recommendations/:supplierId/accept')
  @HttpCode(200)
  @ApiOperation({ summary: 'Track recommendation acceptance signal' })
  @ApiOkResponse({
    description: 'Updated recommendation log row',
    type: AiRecommendationLogResponseDto,
  })
  @UseGuards(OptionalAuthGuard)
  trackRecommendationAccept(@Param('id') id: string, @Param('supplierId') supplierId: string) {
    return this.aiPlanningService.trackRecommendationAccept(id, supplierId);
  }
}
