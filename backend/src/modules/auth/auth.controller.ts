import { Body, Controller, Get, Post, UnauthorizedException, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthGuard } from '../../common/guards/auth.guard';
import { AuthUser } from '../../common/interfaces/auth-user.interface';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  register(@Body() body: { email: string; password?: string; role?: 'USER' | 'SUPPLIER' | 'ADMIN' }) {
    return this.authService.register(body);
  }

  @Post('login')
  login(@Body() body: { email: string; password?: string }) {
    return this.authService.login(body);
  }

  @Post('refresh')
  refresh(@Body() body: { token: string }) {
    return this.authService.refresh(body.token);
  }

  @Post('logout')
  @UseGuards(AuthGuard)
  logout(@CurrentUser() user?: AuthUser) {
    const userId = user?.id;
    if (!userId || userId.startsWith('anonymous:')) {
      throw new UnauthorizedException('Only registered users can logout');
    }
    return this.authService.logout(userId);
  }

  @Post('anonymous-session')
  anonymousSession(@Body() body: { fingerprintHash?: string; ipHash?: string }) {
    return this.authService.createAnonymousSession(body);
  }

  @Post('link-anonymous')
  @UseGuards(AuthGuard)
  linkAnonymous(
    @CurrentUser() user: AuthUser | undefined,
    @Body() body: { anonymousToken: string },
  ) {
    const userId = user?.id;
    if (!userId || userId.startsWith('anonymous:')) {
      throw new UnauthorizedException('Registered user required');
    }
    return { linked: true, anonymousToken: body.anonymousToken, userId };
  }

  @Get('me')
  @UseGuards(AuthGuard)
  me(@CurrentUser() user?: AuthUser) {
    const userId = user?.id;
    if (!userId || userId.startsWith('anonymous:')) {
      throw new UnauthorizedException('Only registered users are supported on /me');
    }
    return this.authService.me(userId);
  }
}
