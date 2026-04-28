import { Body, Controller, Get, Post, UnauthorizedException, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiCreatedResponse, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { AuthGuard } from '../../common/guards/auth.guard';
import { AuthUser } from '../../common/interfaces/auth-user.interface';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { ApiAuthErrors } from '../../common/swagger/api-error-responses.decorator';
import { AnonymousSessionDto, LinkAnonymousDto, LoginDto, RefreshDto, RegisterDto } from './dto/auth.dto';
import { AuthTokensResponseDto, MeResponseDto, RefreshTokensResponseDto } from './dto/auth-response.dto';

@ApiTags('Auth')
@ApiAuthErrors()
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @ApiOperation({ summary: 'Register a new account or extend user role' })
  @ApiCreatedResponse({
    description: 'User registration/login payload',
    type: AuthTokensResponseDto,
  })
  register(@Body() body: RegisterDto) {
    return this.authService.register(body);
  }

  @Post('login')
  @ApiOperation({ summary: 'Login with email/password and receive JWT tokens' })
  @ApiOkResponse({
    description: 'Authenticated session tokens',
    type: AuthTokensResponseDto,
  })
  login(@Body() body: LoginDto) {
    return this.authService.login(body);
  }

  @Post('refresh')
  @ApiOperation({ summary: 'Rotate refresh token and issue a new token pair' })
  @ApiOkResponse({
    description: 'Rotated token pair',
    type: RefreshTokensResponseDto,
  })
  refresh(@Body() body: RefreshDto) {
    return this.authService.refresh(body.token);
  }

  @Post('logout')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Logout current user by revoking refresh token' })
  @UseGuards(AuthGuard)
  logout(@CurrentUser() user?: AuthUser) {
    const userId = user?.id;
    if (!userId || userId.startsWith('anonymous:')) {
      throw new UnauthorizedException('Only registered users can logout');
    }
    return this.authService.logout(userId);
  }

  @Post('anonymous-session')
  @ApiOperation({ summary: 'Issue anonymous token for unauthenticated flows' })
  anonymousSession(@Body() body: AnonymousSessionDto) {
    return this.authService.createAnonymousSession(body);
  }

  @Post('link-anonymous')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Link anonymous session data to authenticated user' })
  @UseGuards(AuthGuard)
  linkAnonymous(
    @CurrentUser() user: AuthUser | undefined,
    @Body() body: LinkAnonymousDto,
  ) {
    const userId = user?.id;
    if (!userId || userId.startsWith('anonymous:')) {
      throw new UnauthorizedException('Registered user required');
    }
    return { linked: true, anonymousToken: body.anonymousToken, userId };
  }

  @Get('me')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current authenticated user profile and roles' })
  @ApiOkResponse({
    description: 'Current user profile',
    type: MeResponseDto,
  })
  @UseGuards(AuthGuard)
  me(@CurrentUser() user?: AuthUser) {
    const userId = user?.id;
    if (!userId || userId.startsWith('anonymous:')) {
      throw new UnauthorizedException('Only registered users are supported on /me');
    }
    return this.authService.me(userId);
  }
}
