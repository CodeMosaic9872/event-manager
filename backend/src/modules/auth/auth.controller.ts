import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpCode,
  Patch,
  Post,
  UnauthorizedException,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { memoryStorage } from 'multer';
import { AuthService } from './auth.service';
import { OtpService } from './otp.service';
import { AuthGuard } from '../../common/guards/auth.guard';
import { AuthUser } from '../../common/interfaces/auth-user.interface';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { ApiAuthErrors } from '../../common/swagger/api-error-responses.decorator';
import { ApiOkEnvelopeData } from '../../common/swagger/api-response.decorators';
import {
  AnonymousSessionDto,
  LinkAnonymousDto,
  LoginDto,
  RefreshDto,
  RegisterDto,
  RequestOtpDto,
  UpdateUserProfileDto,
  VerifyOtpDto,
} from './dto/auth.dto';
import {
  CompleteUserProfileImageUploadDto,
  CreateUserProfileMediaUploadUrlDto,
  CreateTestMediaUploadUrlDto,
  UploadUserProfileImageFileDto,
  VerifyTestMediaUploadDto,
  VerifyUserProfileMediaUploadDto,
} from './dto/user-profile-media.dto';
import {
  AnonymousSessionResponseDto,
  AuthMeItemDto,
  AuthTokensResponseDto,
  LinkAnonymousResponseDto,
  LogoutResponseDto,
  MediaPresignUploadResponseDto,
  MediaVerifyUploadResponseDto,
  RefreshTokensResponseDto,
  RequestOtpResponseDto,
  TestMediaUploadObjectResponseDto,
  VerifyOtpResponseDto,
} from './dto/auth-response.dto';

@ApiTags('Auth')
@ApiAuthErrors()
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly otpService: OtpService,
  ) {}

  @Post('request-otp')
  @HttpCode(200)
  @ApiOperation({
    summary: 'Send an OTP code to phone or email for register/login',
    description:
      'Generates a 6-digit OTP and sends it to exactly one target: phone (via 019sms) or email (via SMTP). In fixed mode (AUTH_FIXED_OTP_ENABLED=true), OTP delivery is bypassed and AUTH_FIXED_OTP_CODE is accepted for verification.',
  })
  @ApiOkResponse({
    description: 'OTP request accepted',
    type: RequestOtpResponseDto,
  })
  requestOtp(@Body() body: RequestOtpDto) {
    return this.otpService.requestOtp(body);
  }

  @Post('verify-otp')
  @HttpCode(200)
  @ApiOperation({
    summary: 'Verify an OTP code previously sent to phone or email',
    description:
      'Marks the (phone/email, purpose) pair as OTP-verified for a short window. The verified OTP is then consumed when calling /auth/register or /auth/login with the same identifier and purpose.',
  })
  @ApiOkResponse({
    description: 'OTP verified',
    type: VerifyOtpResponseDto,
  })
  verifyOtp(@Body() body: VerifyOtpDto) {
    return this.otpService.verifyOtp(body);
  }

  @Post('register')
  @HttpCode(200)
  @ApiOperation({
    summary: 'Register a new account or extend user role (requires OTP-verified phone)',
    description:
      'Creates a new user with email and phone, or extends an existing user with the supplied role. The phone number must have been OTP-verified via /auth/request-otp + /auth/verify-otp with purpose=register prior to this call. HTTP status is **200** (not 201): a global interceptor normalizes success responses.',
  })
  @ApiOkResponse({
    description: 'Access and refresh tokens plus user summary',
    type: AuthTokensResponseDto,
  })
  register(@Body() body: RegisterDto) {
    return this.authService.register(body);
  }

  @Post('login')
  @HttpCode(200)
  @ApiOperation({
    summary: 'Login with OTP (email OR phone)',
    description:
      'Authenticates a user using an OTP code. Provide either email or phone (exactly one) along with the OTP code. This endpoint verifies and consumes the OTP internally, so you do not need to call /auth/verify-otp as a separate step.',
  })
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
  @HttpCode(200)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Logout current user by revoking refresh token' })
  @ApiOkResponse({ type: LogoutResponseDto })
  @UseGuards(AuthGuard)
  logout(@CurrentUser() user?: AuthUser) {
    const userId = user?.id;
    if (!userId || userId.startsWith('anonymous:')) {
      throw new UnauthorizedException('Only registered users can logout');
    }
    return this.authService.logout(userId);
  }

  @Post('anonymous-session')
  @HttpCode(200)
  @ApiOperation({ summary: 'Issue anonymous token for unauthenticated flows' })
  @ApiOkResponse({ type: AnonymousSessionResponseDto })
  anonymousSession(@Body() body: AnonymousSessionDto) {
    return this.authService.createAnonymousSession(body);
  }

  @Post('link-anonymous')
  @HttpCode(200)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Link anonymous session data to authenticated user' })
  @ApiOkResponse({ type: LinkAnonymousResponseDto })
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
  @ApiOperation({
    summary: 'Get current authenticated user profile and roles',
    description:
      'When `roles` includes `SUPPLIER`, `businessName` mirrors the supplier display name and `supplier` contains the full supplier record (profile, media, categories, service areas, attributes, draft, subscription summary without payment token, approval history, counts). Otherwise `businessName` and `supplier` are `null`. Response body is `{ success, data }` with **no** `pagination` field.',
  })
  @ApiOkEnvelopeData(AuthMeItemDto, {
    description: 'Current user profile (single object in `data`, no pagination)',
  })
  @UseGuards(AuthGuard)
  me(@CurrentUser() user?: AuthUser) {
    const userId = user?.id;
    if (!userId || userId.startsWith('anonymous:')) {
      throw new UnauthorizedException('Only registered users are supported on /me');
    }
    return this.authService.me(userId);
  }

  @Patch('me')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update current user profile (avatar and cover image URLs)' })
  @ApiBody({ type: UpdateUserProfileDto })
  @ApiOkResponse({
    description: 'Updated user profile (same shape as GET /auth/me)',
    type: AuthMeItemDto,
  })
  @UseGuards(AuthGuard)
  patchMe(@CurrentUser() user: AuthUser | undefined, @Body() body: UpdateUserProfileDto) {
    const userId = user?.id;
    if (!userId || userId.startsWith('anonymous:')) {
      throw new UnauthorizedException('Only registered users are supported on /me');
    }
    return this.authService.updateProfile(userId, body);
  }

  @Post('me/media/upload-url')
  @HttpCode(200)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get presigned upload URL for user profile images (DigitalOcean Spaces)' })
  @ApiBody({ type: CreateUserProfileMediaUploadUrlDto })
  @ApiOkResponse({ type: MediaPresignUploadResponseDto })
  @UseGuards(AuthGuard)
  createProfileMediaUploadUrl(
    @CurrentUser() user: AuthUser | undefined,
    @Body() body: CreateUserProfileMediaUploadUrlDto,
  ) {
    const userId = user?.id;
    if (!userId || userId.startsWith('anonymous:')) {
      throw new UnauthorizedException('Only registered users are supported');
    }
    return this.authService.createProfileMediaUploadUrl(userId, body);
  }

  @Post('me/media/verify-upload')
  @HttpCode(200)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Verify uploaded user media object exists in DigitalOcean Spaces' })
  @ApiBody({ type: VerifyUserProfileMediaUploadDto })
  @ApiOkResponse({ type: MediaVerifyUploadResponseDto })
  @UseGuards(AuthGuard)
  verifyProfileMediaUpload(@CurrentUser() user: AuthUser | undefined, @Body() body: VerifyUserProfileMediaUploadDto) {
    const userId = user?.id;
    if (!userId || userId.startsWith('anonymous:')) {
      throw new UnauthorizedException('Only registered users are supported');
    }
    return this.authService.verifyProfileMediaUpload(userId, body);
  }

  @Post('me/media/complete-profile-image')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Verify uploaded object and set avatar or cover image URL on the current user',
  })
  @ApiOkResponse({
    description: 'Updated user profile (same shape as GET /auth/me)',
    type: AuthMeItemDto,
  })
  @UseGuards(AuthGuard)
  completeProfileImageUpload(
    @CurrentUser() user: AuthUser | undefined,
    @Body() body: CompleteUserProfileImageUploadDto,
  ) {
    const userId = user?.id;
    if (!userId || userId.startsWith('anonymous:')) {
      throw new UnauthorizedException('Only registered users are supported');
    }
    return this.authService.completeProfileImageUpload(userId, body);
  }

  @Post('me/media/upload-file')
  @ApiBearerAuth()
  @ApiConsumes('multipart/form-data')
  @ApiOperation({
    summary: 'Upload avatar/cover file directly and update current user profile image URL',
  })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['file', 'imageKind'],
      properties: {
        file: { type: 'string', format: 'binary' },
        imageKind: { type: 'string', enum: ['avatar', 'cover','kosher','form3010','gallery'] },
      },
    },
  })
  @ApiOkResponse({
    description: 'Updated user profile (same shape as GET /auth/me)',
    type: AuthMeItemDto,
  })
  @UseGuards(AuthGuard)
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
      limits: { fileSize: 15 * 1024 * 1024 },
    }),
  )
  uploadProfileImageFile(
    @CurrentUser() user: AuthUser | undefined,
    @UploadedFile() file: Express.Multer.File | undefined,
    @Body() body: UploadUserProfileImageFileDto,
  ) {
    const userId = user?.id;
    if (!userId || userId.startsWith('anonymous:')) {
      throw new UnauthorizedException('Only registered users are supported');
    }
    if (!file) {
      throw new BadRequestException('Missing multipart field "file"');
    }
    return this.authService.uploadProfileImageFile(userId, file, body.imageKind);
  }

  @Post('test/media/upload')
  @HttpCode(200)
  @ApiConsumes('multipart/form-data')
  @ApiOperation({
    summary: '[Testing only] Upload a file directly (Postman form-data field: file)',
    description: 'No auth. Multipart body with a single part named "file". Max size 15 MB.',
  })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['file'],
      properties: {
        file: { type: 'string', format: 'binary' },
      },
    },
  })
  @ApiOkResponse({ type: TestMediaUploadObjectResponseDto })
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
      limits: { fileSize: 15 * 1024 * 1024 },
    }),
  )
  uploadTestMediaFile(@UploadedFile() file?: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('Missing multipart field "file" (use form-data in Postman)');
    }
    return this.authService.uploadTestMediaFile(file);
  }

  @Post('test/media/upload-url')
  @HttpCode(200)
  @ApiOperation({
    summary: '[Testing only] Get presigned upload URL without authentication',
    description: 'Use only for manual QA/Postman. Returns upload URL under test-uploads/ prefix.',
  })
  @ApiBody({ type: CreateTestMediaUploadUrlDto })
  @ApiOkResponse({ type: MediaPresignUploadResponseDto })
  createTestMediaUploadUrl(@Body() body: CreateTestMediaUploadUrlDto) {
    return this.authService.createTestMediaUploadUrl(body);
  }

  @Post('test/media/verify-upload')
  @HttpCode(200)
  @ApiOperation({
    summary: '[Testing only] Verify uploaded object for unauthenticated test flow',
  })
  @ApiBody({ type: VerifyTestMediaUploadDto })
  @ApiOkResponse({ type: MediaVerifyUploadResponseDto })
  verifyTestMediaUpload(@Body() body: VerifyTestMediaUploadDto) {
    return this.authService.verifyTestMediaUpload(body);
  }
}
