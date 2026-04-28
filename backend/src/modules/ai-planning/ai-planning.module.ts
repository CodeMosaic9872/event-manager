import { Module } from '@nestjs/common';
import { AiPlanningController } from './ai-planning.controller';
import { AiPlanningService } from './ai-planning.service';

@Module({
  controllers: [AiPlanningController],
  providers: [AiPlanningService],
  exports: [AiPlanningService],
})
export class AiPlanningModule {}
