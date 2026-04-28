import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { AiPlanningService } from './ai-planning.service';
import { AiQuotaGuard } from './guards/ai-quota.guard';
import { AuthGuard } from '../../common/guards/auth.guard';
import { AuthUser } from '../../common/interfaces/auth-user.interface';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@Controller('ai/conversations')
export class AiPlanningController {
  constructor(private readonly aiPlanningService: AiPlanningService) {}

  @Post()
  createConversation(
    @CurrentUser() user: AuthUser | undefined,
    @Body() body: { anonymousToken?: string; context?: Record<string, unknown> },
  ) {
    const userId = user && !user.id.startsWith('anonymous:') ? user.id : undefined;
    return this.aiPlanningService.createConversation({ ...body, userId });
  }

  @Get(':id')
  getConversation(@Param('id') id: string) {
    return this.aiPlanningService.getConversation(id);
  }

  @Post(':id/messages')
  @UseGuards(AuthGuard, AiQuotaGuard)
  sendMessage(
    @CurrentUser() user: AuthUser | undefined,
    @Param('id') id: string,
    @Body()
    body: {
      message: string;
      anonymousToken?: string;
      eventType?: string;
      budget?: number;
      location?: string;
    },
  ) {
    const userId = user && !user.id.startsWith('anonymous:') ? user.id : undefined;
    return this.aiPlanningService.sendMessage({
      conversationId: id,
      userId,
      ...body,
    });
  }
}
