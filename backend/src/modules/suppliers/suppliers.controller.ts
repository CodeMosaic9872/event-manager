import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  Headers,
  HttpCode,
  Param,
  Patch,
  Post,
  Query,
  UploadedFile,
  UploadedFiles,
  UnauthorizedException,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiBody,
  ApiBearerAuth,
  ApiConsumes,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { PrismaService } from '../../prisma/prisma.service';
import { SuppliersService } from './suppliers.service';
import { verifyAccessToken } from '../../common/utils/jwt.util';
import { AuthGuard } from '../../common/guards/auth.guard';
import { OptionalAuthGuard } from '../../common/guards/optional-auth.guard';
import { AuthUser } from '../../common/interfaces/auth-user.interface';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';
import { SupplierOnlyGuard } from '../job-board/guards/supplier-only.guard';
import { ApiProtectedErrors } from '../../common/swagger/api-error-responses.decorator';
import {
  ApiOkEnvelopeData,
  ApiOkEnvelopePaginated,
} from '../../common/swagger/api-response.decorators';
import { ListSuppliersQueryDto } from './dto/list-suppliers-query.dto';
import { SupplierSuggestionsQueryDto } from './dto/supplier-suggestions-query.dto';
import { UpsertSupplierProfileDto } from './dto/upsert-supplier-profile.dto';
import { UpsertSupplierDraftDto } from './dto/supplier-draft.dto';
import { ShareSupplierDto } from './dto/share-supplier.dto';
import { CreateMediaUploadUrlDto } from './dto/create-media-upload-url.dto';
import { VerifyMediaUploadDto } from './dto/verify-media-upload.dto';
import { CompleteMediaUploadDto } from './dto/complete-media-upload.dto';
import {
  AddSupplierMediaDto,
  UploadSupplierMediaFileDto,
  UploadSupplierMediaFilesFormDto,
  UpdateSupplierAttributesDto,
  UpdateSupplierServiceAreasDto,
} from './dto/supplier-private-profile.dto';
import { DeleteSupplierMediaBatchDto } from './dto/supplier-media-batch.dto';
import { SupplierMediaUploadFileMultipartDto } from './dto/supplier-media-upload.swagger.dto';
import { SupplierMediaUploadFilesMultipartDto } from './dto/supplier-media-upload-files.swagger.dto';
import {
  ShareTrackResponseDto,
  SupplierDraftResponseDto,
  SupplierMediaBatchDeleteResponseDto,
  SupplierMediaBatchUploadResponseDto,
  SupplierMediaDeleteResponseDto,
  SupplierMediaPresignedUploadResponseDto,
  SupplierMediaResponseDto,
  SupplierMediaVerifyUploadResponseDto,
  SupplierProfileResponseDto,
  PaginatedFavoriteSuppliersResponseDto,
  SupplierSuggestionsListResponseDto,
  SuppliersListResponseDto,
} from './dto/suppliers-response.dto';
import {
  CreateSupplierReviewDto,
  SupplierReviewListResponseDto,
  SupplierReviewResponseDto,
  UpdateSupplierReviewDto,
} from './dto/supplier-reviews.dto';

/** When an admin uploads for a specific supplier, resolve by `supplierId` instead of the admin's user id. */
function resolveMediaUploadOwnerUserId(
  user: AuthUser | undefined,
  supplierId?: string,
): string | undefined {
  if (!user?.id || user.id.startsWith('anonymous:')) {
    return undefined;
  }
  if (user.roles.includes('ADMIN') && supplierId?.trim()) {
    return undefined;
  }
  return user.id;
}

@ApiTags('Suppliers')
@ApiProtectedErrors()
@Controller()
export class SuppliersController {
  constructor(
    private readonly suppliersService: SuppliersService,
    private readonly prisma: PrismaService,
  ) {}

  @Get('suppliers')
  @ApiOperation({ summary: 'List marketplace suppliers with layered filters' })
  @ApiOkEnvelopePaginated(SuppliersListResponseDto, {
    description: 'Paginated supplier list with facets',
  })
  listSuppliers(@Query() query: ListSuppliersQueryDto) {
    return this.suppliersService.list(query);
  }

  @Get('suppliers/:slugOrId/reviews')
  @ApiOperation({ summary: 'List reviews for an approved supplier' })
  @ApiOkEnvelopePaginated(SupplierReviewListResponseDto)
  listSupplierReviews(@Param('slugOrId') slugOrId: string, @Query() query: PaginationQueryDto) {
    return this.suppliersService.listSupplierReviews(slugOrId, query.page, query.limit);
  }

  @Post('suppliers/:slugOrId/reviews')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Submit a review for a supplier (one per account)' })
  @ApiCreatedResponse({ type: SupplierReviewResponseDto })
  @UseGuards(AuthGuard)
  createSupplierReview(
    @CurrentUser() user: AuthUser | undefined,
    @Param('slugOrId') slugOrId: string,
    @Body() body: CreateSupplierReviewDto,
  ) {
    const userId = user?.id;
    if (!userId || userId.startsWith('anonymous:')) {
      throw new UnauthorizedException('Authenticated user required');
    }
    return this.suppliersService.createSupplierReview(slugOrId, userId, body);
  }

  @Patch('suppliers/:slugOrId/reviews/me')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update your review for this supplier' })
  @ApiOkResponse({ type: SupplierReviewResponseDto })
  @UseGuards(AuthGuard)
  updateMySupplierReview(
    @CurrentUser() user: AuthUser | undefined,
    @Param('slugOrId') slugOrId: string,
    @Body() body: UpdateSupplierReviewDto,
  ) {
    const userId = user?.id;
    if (!userId || userId.startsWith('anonymous:')) {
      throw new UnauthorizedException('Authenticated user required');
    }
    return this.suppliersService.updateMySupplierReview(slugOrId, userId, body);
  }

  @Delete('suppliers/:slugOrId/reviews/me')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete your review for this supplier' })
  @ApiOkResponse({ schema: { example: { deleted: true } } })
  @UseGuards(AuthGuard)
  deleteMySupplierReview(@CurrentUser() user: AuthUser | undefined, @Param('slugOrId') slugOrId: string) {
    const userId = user?.id;
    if (!userId || userId.startsWith('anonymous:')) {
      throw new UnauthorizedException('Authenticated user required');
    }
    return this.suppliersService.deleteMySupplierReview(slugOrId, userId);
  }

  @Get('suppliers/:slugOrId')
  @ApiOperation({ summary: 'Get public supplier profile by id or slug' })
  @ApiOkEnvelopeData(SupplierProfileResponseDto, { description: 'Public supplier profile' })
  getSupplier(@Param('slugOrId') slugOrId: string) {
    return this.suppliersService.getByIdOrSlug(slugOrId);
  }

  @Get('search/suggestions')
  @ApiOperation({ summary: 'Get supplier/category/subcategory typeahead suggestions' })
  @ApiOkEnvelopePaginated(SupplierSuggestionsListResponseDto)
  async suggestions(@Query() query: SupplierSuggestionsQueryDto) {
    const q = query.q ?? '';
    if (!q) {
      return { items: [], totalItems: 0 };
    }
    return this.suppliersService.suggestions(q, query.take);
  }

  @Post('supplier/profile')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Create supplier profile for authenticated user',
    description:
      'Creates the supplier row and returns the same **public profile** shape as `GET /suppliers/:slugOrId` (aggregated category labels, gallery URLs, similar suppliers, etc.). Optional `socialLinks` replaces all existing links when provided; omit to leave links unchanged unless `instagram` / `facebook` / `whatsapp` are sent (those patch individual platforms). Optional `categories` replaces all `SupplierCategory` rows; `serviceAreas` replaces the string array on the supplier; `gallery` replaces `SupplierMedia` rows with `mediaType` `gallery`; `labelsRules` / `labelsNiche` are stored on `SupplierAttribute`.',
  })
  @ApiCreatedResponse({
    description: 'Created or updated supplier profile',
    type: SupplierProfileResponseDto,
  })
  @UseGuards(AuthGuard)
  createProfile(
    @CurrentUser() user: AuthUser | undefined,
    @Body() body: UpsertSupplierProfileDto,
  ) {
    const userId = user?.id;
    if (!userId || userId.startsWith('anonymous:')) {
      throw new UnauthorizedException('Authenticated user required');
    }
    return this.suppliersService.upsertProfile(userId, body);
  }

  @Patch('supplier/profile')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Update supplier profile for authenticated user',
    description:
      'Same payload options as `POST /supplier/profile`. Returns the public profile aggregate. Omit nested arrays/objects to leave those relations unchanged.',
  })
  @ApiOkResponse({ description: 'Public supplier profile aggregate', type: SupplierProfileResponseDto })
  @UseGuards(AuthGuard)
  patchProfile(
    @CurrentUser() user: AuthUser | undefined,
    @Body() body: UpsertSupplierProfileDto,
  ) {
    const userId = user?.id;
    if (!userId || userId.startsWith('anonymous:')) {
      throw new UnauthorizedException('Authenticated user required');
    }
    return this.suppliersService.upsertProfile(userId, body);
  }

  @Post('supplier/media')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Add supplier media by public URL',
    description:
      'Creates a `SupplierMedia` row pointing at an already-hosted URL (e.g. after a client-side upload elsewhere). For direct binary upload to Spaces from this API, use `POST /supplier/media/upload-file` or the presigned flow `upload-url` → `verify-upload` → `complete-upload`.',
  })
  @ApiBody({ type: AddSupplierMediaDto })
  @ApiOkResponse({
    description: 'Created media row',
    type: SupplierMediaResponseDto,
  })
  @UseGuards(AuthGuard)
  addMedia(@CurrentUser() user: AuthUser | undefined, @Body() body: AddSupplierMediaDto) {
    const userId = user?.id;
    if (!userId || userId.startsWith('anonymous:')) {
      throw new UnauthorizedException('Authenticated user required');
    }
    return this.suppliersService.addMedia(userId, body);
  }

  @Post('supplier/media/upload-file')
  @ApiBearerAuth()
  @ApiConsumes('multipart/form-data')
  @ApiOperation({
    summary: 'Upload supplier media file (multipart) and create media record',
    description:
      '**Auth:** Optional Bearer.\n' +
      '- **SUPPLIER** Bearer: attaches to the caller’s supplier.\n' +
      '- **ADMIN** Bearer + `supplierId`: attaches to that supplier (admin add-supplier flow).\n' +
      '- No Bearer: `supplierId` is **required** (onboarding).\n\n' +
      '`attachKosher` / `attachForm3010`: when true, also saves the uploaded public URL on the supplier row (`kosher` / `form_3010`).\n\n' +
      '**Multipart parts:** `file` (required binary), optional `supplierId`, `mediaType`, `sortOrder`, `attachKosher`, `attachForm3010`. Max file size **20 MB**.',
  })
  @ApiBody({
    description: 'Multipart form-data',
    type: SupplierMediaUploadFileMultipartDto,
  })
  @ApiOkResponse({
    description: 'Created `SupplierMedia` row with public `url` (and optional supplier compliance fields updated).',
    type: SupplierMediaResponseDto,
  })
  @UseGuards(OptionalAuthGuard)
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
      limits: { fileSize: 20 * 1024 * 1024 },
    }),
  )
  uploadMediaFile(
    @CurrentUser() user: AuthUser | undefined,
    @UploadedFile() file: Express.Multer.File | undefined,
    @Body() body: UploadSupplierMediaFileDto,
  ) {
    if (!file) {
      throw new BadRequestException('Missing multipart field "file"');
    }
    const parsedSortOrder =
      body.sortOrder !== undefined && body.sortOrder !== ''
        ? Number.parseInt(body.sortOrder, 10)
        : undefined;
    if (parsedSortOrder !== undefined && Number.isNaN(parsedSortOrder)) {
      throw new BadRequestException('sortOrder must be a number');
    }
    const ownerUserId = resolveMediaUploadOwnerUserId(user, body.supplierId);
    return this.suppliersService.uploadMediaFile({
      ownerUserId,
      supplierId: body.supplierId,
      file,
      mediaType: body.mediaType,
      sortOrder: parsedSortOrder,
      attachKosher: body.attachKosher,
      attachForm3010: body.attachForm3010,
    });
  }

  @Post('supplier/media/upload/gallery')
  @ApiBearerAuth()
  @ApiConsumes('multipart/form-data')
  @ApiOperation({
    summary: 'Upload multiple files to the supplier gallery in one request',
    description:
      'Multipart form part **`files`** (repeat the field or use an array) — up to **24** files, **20 MB** each.\n\n' +
      '**Auth:** same as `POST /supplier/media/upload-file` (SUPPLIER own profile, **ADMIN** + `supplierId`, or unauthenticated onboarding with `supplierId`).\n\n' +
      'Use `mediaType=gallery` for marketplace gallery rows. Optional starting `sortOrder` applies to the first file; subsequent files increment by 1.',
  })
  @ApiBody({ type: SupplierMediaUploadFilesMultipartDto })
  @ApiOkResponse({
    description: 'Created `SupplierMedia` rows',
    type: SupplierMediaBatchUploadResponseDto,
  })
  @UseGuards(OptionalAuthGuard)
  @UseInterceptors(
    FilesInterceptor('files', 24, {
      storage: memoryStorage(),
      limits: { fileSize: 200 * 1024 * 1024 },
    }),
  )
  uploadMediaFiles(
    @CurrentUser() user: AuthUser | undefined,
    @UploadedFiles() files: Express.Multer.File[] | undefined,
    @Body() body: UploadSupplierMediaFilesFormDto,
  ) {
    const list = files?.length ? files : [];
    if (!list.length) {
      throw new BadRequestException('Missing multipart field "files" (one or more files required)');
    }
    const parsedSortOrder =
      body.sortOrder !== undefined && body.sortOrder !== ''
        ? Number.parseInt(body.sortOrder, 10)
        : undefined;
    if (parsedSortOrder !== undefined && Number.isNaN(parsedSortOrder)) {
      throw new BadRequestException('sortOrder must be a number');
    }
    const ownerUserId = resolveMediaUploadOwnerUserId(user, body.supplierId);
    return this.suppliersService.uploadMediaFiles({
      ownerUserId,
      supplierId: body.supplierId,
      files: list,
      mediaType: body.mediaType,
      baseSortOrder: parsedSortOrder,
    });
  }

  @Post('supplier/media/upload-url')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get presigned PUT URL for supplier media (Spaces)',
    description:
      'Returns a time-limited `uploadUrl` for the client to PUT bytes directly to object storage, plus stable `publicUrl` and object `key`. Follow with `verify-upload` then `complete-upload` to create the `SupplierMedia` row.',
  })
  @ApiBody({ type: CreateMediaUploadUrlDto })
  @ApiOkResponse({
    description: 'Presigned upload target',
    type: SupplierMediaPresignedUploadResponseDto,
  })
  @UseGuards(AuthGuard)
  createMediaUploadUrl(@CurrentUser() user: AuthUser | undefined, @Body() body: CreateMediaUploadUrlDto) {
    const userId = user?.id;
    if (!userId || userId.startsWith('anonymous:')) {
      throw new UnauthorizedException('Authenticated user required');
    }
    return this.suppliersService.createMediaUploadUrl(userId, body);
  }

  @Post('supplier/media/verify-upload')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Verify uploaded object exists in Spaces (HEAD)',
    description:
      'Checks that the object for `key` exists under the caller’s supplier prefix. Use after PUT to the presigned `uploadUrl`. Response includes size and headers from storage.',
  })
  @ApiBody({ type: VerifyMediaUploadDto })
  @ApiOkResponse({
    description: 'Object exists and metadata from HEAD',
    type: SupplierMediaVerifyUploadResponseDto,
  })
  @UseGuards(AuthGuard)
  verifyMediaUpload(@CurrentUser() user: AuthUser | undefined, @Body() body: VerifyMediaUploadDto) {
    const userId = user?.id;
    if (!userId || userId.startsWith('anonymous:')) {
      throw new UnauthorizedException('Authenticated user required');
    }
    return this.suppliersService.verifyMediaUpload(userId, body);
  }

  @Post('supplier/media/complete-upload')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Complete presigned upload: verify object and create SupplierMedia',
    description:
      'Runs the same existence check as `verify-upload`, then inserts a `SupplierMedia` row with the public URL. Prefer this over `verify-upload` + separate add when using the presigned flow.',
  })
  @ApiBody({ type: CompleteMediaUploadDto })
  @ApiOkResponse({
    description: 'Created media row',
    type: SupplierMediaResponseDto,
  })
  @UseGuards(AuthGuard)
  completeMediaUpload(@CurrentUser() user: AuthUser | undefined, @Body() body: CompleteMediaUploadDto) {
    const userId = user?.id;
    if (!userId || userId.startsWith('anonymous:')) {
      throw new UnauthorizedException('Authenticated user required');
    }
    return this.suppliersService.completeMediaUpload(userId, body);
  }

  @Delete('supplier/media/:id')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Delete one supplier media item',
    description: 'Deletes a single `SupplierMedia` row by id. For multiple ids in one call, use `POST /supplier/media/delete-batch`.',
  })
  @ApiParam({ name: 'id', description: '`SupplierMedia` id (cuid)', example: 'smed_2k3j4h5g6f7d8s9' })
  @ApiOkResponse({
    description: 'Deletion confirmation',
    type: SupplierMediaDeleteResponseDto,
  })
  @UseGuards(AuthGuard)
  deleteMedia(@CurrentUser() user: AuthUser | undefined, @Param('id') id: string) {
    const userId = user?.id;
    if (!userId || userId.startsWith('anonymous:')) {
      throw new UnauthorizedException('Authenticated user required');
    }
    return this.suppliersService.deleteMedia(userId, id);
  }

  @Post('supplier/media/delete-batch')
  @HttpCode(200)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Delete multiple supplier media items',
    description:
      'Deletes every `SupplierMedia` row whose id is in `ids`, belongs to the authenticated user’s supplier, and exists. Unknown or other suppliers’ ids are skipped (not an error).',
  })
  @ApiBody({ type: DeleteSupplierMediaBatchDto })
  @ApiOkResponse({
    description: 'How many rows were deleted and which ids were removed',
    type: SupplierMediaBatchDeleteResponseDto,
  })
  @UseGuards(AuthGuard)
  deleteMediaBatch(@CurrentUser() user: AuthUser | undefined, @Body() body: DeleteSupplierMediaBatchDto) {
    const userId = user?.id;
    if (!userId || userId.startsWith('anonymous:')) {
      throw new UnauthorizedException('Authenticated user required');
    }
    return this.suppliersService.deleteMediaBatch(userId, body.ids);
  }

  @Patch('supplier/attributes')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update supplier private attributes and capabilities' })
  @UseGuards(AuthGuard)
  updateAttributes(@CurrentUser() user: AuthUser | undefined, @Body() body: UpdateSupplierAttributesDto) {
    const userId = user?.id;
    if (!userId || userId.startsWith('anonymous:')) {
      throw new UnauthorizedException('Authenticated user required');
    }
    return this.suppliersService.updateAttributes(userId, body);
  }

  @Patch('supplier/service-areas')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Replace supplier service areas list' })
  @UseGuards(AuthGuard)
  updateServiceAreas(@CurrentUser() user: AuthUser | undefined, @Body() body: UpdateSupplierServiceAreasDto) {
    const userId = user?.id;
    if (!userId || userId.startsWith('anonymous:')) {
      throw new UnauthorizedException('Authenticated user required');
    }
    return this.suppliersService.updateServiceAreas(userId, body.serviceAreas);
  }

  @Post('suppliers/:id/favorite')
  @ApiOperation({ summary: 'Save supplier as favorite (user or anonymous actor)' })
  async favorite(@Param('id') supplierId: string, @Headers('authorization') authorization?: string) {
    const { userId, anonymousSessionId } = await this.resolveActor(authorization);
    return this.suppliersService.saveFavorite(userId, anonymousSessionId, supplierId);
  }

  @Post('suppliers/:id/share')
  @ApiOperation({ summary: 'Track supplier share metadata (channel/context)' })
  @ApiCreatedResponse({
    description: 'Share telemetry persisted',
    type: ShareTrackResponseDto,
  })
  async share(
    @Param('id') supplierId: string,
    @Headers('authorization') authorization?: string,
    @Body() body?: ShareSupplierDto,
  ) {
    const { userId, anonymousSessionId } = await this.resolveActor(authorization);
    return this.suppliersService.trackShare(userId, anonymousSessionId, supplierId, body);
  }

  @Delete('suppliers/:id/favorite')
  @ApiOperation({ summary: 'Remove supplier from favorites' })
  async unfavorite(@Param('id') supplierId: string, @Headers('authorization') authorization?: string) {
    const { userId, anonymousSessionId } = await this.resolveActor(authorization);
    return this.suppliersService.removeFavorite(userId, anonymousSessionId, supplierId);
  }

  @Get('users/me/favorites')
  @ApiOperation({ summary: 'List current actor favorite suppliers' })
  @ApiOkEnvelopePaginated(PaginatedFavoriteSuppliersResponseDto)
  async listFavorites(@Headers('authorization') authorization?: string, @Query() query?: PaginationQueryDto) {
    const { userId, anonymousSessionId } = await this.resolveActor(authorization);
    return this.suppliersService.listFavorites(userId, anonymousSessionId, query?.page, query?.limit);
  }

  @Post('supplier/draft')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Save supplier onboarding draft step payload' })
  @ApiOkResponse({ description: 'Upserted supplier draft', type: SupplierDraftResponseDto })
  @UseGuards(AuthGuard, SupplierOnlyGuard)
  saveDraft(@CurrentUser() user: AuthUser | undefined, @Body() body: UpsertSupplierDraftDto) {
    const userId = user?.id;
    if (!userId || userId.startsWith('anonymous:')) {
      throw new UnauthorizedException('Authenticated supplier required');
    }
    return this.suppliersService.upsertDraftForUser(userId, body);
  }

  @Get('supplier/draft/me')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current supplier onboarding draft' })
  @ApiOkEnvelopeData(SupplierDraftResponseDto, { description: 'Current supplier draft' })
  @UseGuards(AuthGuard, SupplierOnlyGuard)
  getDraft(@CurrentUser() user: AuthUser | undefined) {
    const userId = user?.id;
    if (!userId || userId.startsWith('anonymous:')) {
      throw new UnauthorizedException('Authenticated supplier required');
    }
    return this.suppliersService.getDraftForUser(userId);
  }

  @Get('supplier/draft/:supplierId')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Legacy: Get supplier draft by id (owner-only)' })
  @ApiOkEnvelopeData(SupplierDraftResponseDto, { description: 'Current supplier draft' })
  @UseGuards(AuthGuard, SupplierOnlyGuard)
  async getDraftLegacy(@CurrentUser() user: AuthUser | undefined, @Param('supplierId') supplierId: string) {
    const userId = user?.id;
    if (!userId || userId.startsWith('anonymous:')) {
      throw new UnauthorizedException('Authenticated supplier required');
    }
    const draft = await this.suppliersService.getDraftForUser(userId);
    if (draft && draft.supplierId !== supplierId) {
      throw new ForbiddenException('Not allowed to access this supplier draft');
    }
    return draft;
  }

  private async resolveActor(authorization?: string): Promise<{ userId: string | null; anonymousSessionId: string | null }> {
    const token = authorization?.startsWith('Bearer ') ? authorization.slice(7) : undefined;
    if (!token) {
      return { userId: null, anonymousSessionId: null };
    }

    if (token.startsWith('anon_')) {
      const session = await this.prisma.anonymousSession.findUnique({ where: { token } });
      return { userId: null, anonymousSessionId: session?.id ?? null };
    }

    try {
      const decoded = verifyAccessToken(token);
      return { userId: decoded.sub, anonymousSessionId: null };
    } catch {
      return { userId: null, anonymousSessionId: null };
    }
  }
}
