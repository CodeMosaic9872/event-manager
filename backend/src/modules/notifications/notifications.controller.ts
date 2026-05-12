import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  Headers,
  Param,
  Post,
  Put,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiHeader, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '../../common/guards/auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { AuthUser } from '../../common/interfaces/auth-user.interface';
import { NotificationsService } from './notifications.service';
import { RegisterPushTokenDto } from './dto/push-token.dto';
import {
  NotificationPreferencesResponseDto,
  UpdateNotificationPreferencesDto,
} from './dto/notification-preferences.dto';
import { SendTestEmailDto } from './dto/send-test-email.dto';

const DEFAULT_TEST_EMAIL_TO = 'arora.aashish3988@gmail.com';

@ApiTags('Notifications')
@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Post('test-email')
  @ApiOperation({
    summary: 'Send a test email via configured SMTP',
    description:
      'Requires EMAIL_TEST_SECRET and header X-Email-Test-Secret. Omit body `to` to send to the default test address.',
  })
  @ApiHeader({ name: 'X-Email-Test-Secret', description: 'Must match EMAIL_TEST_SECRET', required: true })
  sendTestEmail(@Headers('x-email-test-secret') secret: string | undefined, @Body() body: SendTestEmailDto) {
    const expected = process.env.EMAIL_TEST_SECRET;
    if (!expected?.trim()) {
      throw new ForbiddenException('EMAIL_TEST_SECRET is not set; add it to .env to enable this endpoint.');
    }
    if (secret !== expected) {
      throw new UnauthorizedException('Invalid or missing X-Email-Test-Secret header.');
    }
    const to = body.to?.trim() || DEFAULT_TEST_EMAIL_TO;
    return this.notificationsService.sendTestEmail(to);
  }

  @Post('push-tokens')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Register or refresh FCM push token for current user' })
  @UseGuards(AuthGuard)
  registerPushToken(@CurrentUser() user: AuthUser | undefined, @Body() body: RegisterPushTokenDto) {
    const userId = user?.id;
    if (!userId || userId.startsWith('anonymous:')) {
      throw new UnauthorizedException('Registered user required');
    }
    return this.notificationsService.registerPushTokenForUser(userId, body.token, body.platform);
  }

  @Delete('push-tokens/:token')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Deactivate push token for current user' })
  @UseGuards(AuthGuard)
  removePushToken(@CurrentUser() user: AuthUser | undefined, @Param('token') token: string) {
    const userId = user?.id;
    if (!userId || userId.startsWith('anonymous:')) {
      throw new UnauthorizedException('Registered user required');
    }
    return this.notificationsService.deactivatePushTokenForUser(userId, token);
  }

  @Get('preferences')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user notification preferences' })
  @ApiOkResponse({ type: NotificationPreferencesResponseDto })
  @UseGuards(AuthGuard)
  getPreferences(@CurrentUser() user: AuthUser | undefined) {
    const userId = user?.id;
    if (!userId || userId.startsWith('anonymous:')) {
      throw new UnauthorizedException('Registered user required');
    }
    return this.notificationsService.getNotificationPreferences(userId);
  }

  @Put('preferences')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update current user notification preferences' })
  @ApiOkResponse({ type: NotificationPreferencesResponseDto })
  @UseGuards(AuthGuard)
  updatePreferences(@CurrentUser() user: AuthUser | undefined, @Body() body: UpdateNotificationPreferencesDto) {
    const userId = user?.id;
    if (!userId || userId.startsWith('anonymous:')) {
      throw new UnauthorizedException('Registered user required');
    }
    return this.notificationsService.updateNotificationPreferences(userId, body);
  }
}
