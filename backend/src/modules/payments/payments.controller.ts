import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiCreatedResponse, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '../../common/guards/auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { AuthUser } from '../../common/interfaces/auth-user.interface';
import { ApiProtectedErrors } from '../../common/swagger/api-error-responses.decorator';
import { SupplierOnlyGuard } from '../job-board/guards/supplier-only.guard';
import { CreateCardcomSessionDto } from './dto/create-cardcom-session.dto';
import { PaymentSessionResponseDto } from './dto/payment-session-response.dto';
import { PaymentsService } from './payments.service';

@ApiTags('Payments')
@ApiProtectedErrors()
@ApiBearerAuth()
@UseGuards(AuthGuard, SupplierOnlyGuard)
@Controller('payments')
export class PaymentsController {
  constructor(private readonly payments: PaymentsService) {}

  @Post('cardcom/sessions')
  @ApiOperation({ summary: 'Create CardCom hosted checkout session (BillAndCreateToken)' })
  @ApiCreatedResponse({ type: PaymentSessionResponseDto })
  createCardcomSession(@CurrentUser() user: AuthUser, @Body() body: CreateCardcomSessionDto) {
    return this.payments.createCardcomSession(user.id, body);
  }

  @Get('sessions/:sessionId')
  @ApiOperation({ summary: 'Get payment session status for current supplier' })
  @ApiOkResponse({ description: 'Payment session', type: PaymentSessionResponseDto })
  getSession(@CurrentUser() user: AuthUser, @Param('sessionId') sessionId: string) {
    return this.payments.getSessionForUser(user.id, sessionId);
  }
}
