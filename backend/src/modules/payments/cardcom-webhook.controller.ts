import { All, Controller, HttpCode, HttpStatus, Req } from '@nestjs/common';
import { ApiExcludeController } from '@nestjs/swagger';
import type { Request } from 'express';
import { PaymentsService } from './payments.service';

/**
 * Public CardCom IndicatorUrl target. CardCom may POST or GET; body is often urlencoded.
 */
@ApiExcludeController()
@Controller('webhooks')
export class CardcomWebhookController {
  constructor(private readonly payments: PaymentsService) {}

  @All('cardcom/indicator')
  @HttpCode(HttpStatus.OK)
  indicator(@Req() req: Request) {
    return this.payments.handleCardcomIndicator(req.query as Record<string, unknown>, req.body);
  }
}
