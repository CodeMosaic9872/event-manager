import { Module } from '@nestjs/common';
import { AiPlanningController } from './ai-planning.controller';
import { AiPlanningService } from './ai-planning.service';
import { AiProviderService } from './ai-provider.service';

@Module({
  controllers: [AiPlanningController],
  providers: [AiPlanningService, AiProviderService],
  exports: [AiPlanningService],
})
export class AiPlanningModule {}
