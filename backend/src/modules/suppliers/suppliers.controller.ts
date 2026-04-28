import { Body, Controller, Delete, Get, Headers, Param, Patch, Post, Query, UnauthorizedException, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiCreatedResponse, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { PrismaService } from '../../prisma/prisma.service';
import { SuppliersService } from './suppliers.service';
import { verifyAccessToken } from '../../common/utils/jwt.util';
import { AuthGuard } from '../../common/guards/auth.guard';
import { AuthUser } from '../../common/interfaces/auth-user.interface';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { ApiProtectedErrors } from '../../common/swagger/api-error-responses.decorator';
import { ListSuppliersQueryDto } from './dto/list-suppliers-query.dto';
import { SupplierSuggestionsQueryDto } from './dto/supplier-suggestions-query.dto';
import { UpsertSupplierProfileDto } from './dto/upsert-supplier-profile.dto';
import { UpsertSupplierDraftDto } from './dto/supplier-draft.dto';
import { ShareSupplierDto } from './dto/share-supplier.dto';
import {
  AddSupplierMediaDto,
  UpdateSupplierAttributesDto,
  UpdateSupplierServiceAreasDto,
} from './dto/supplier-private-profile.dto';
import {
  ShareTrackResponseDto,
  SupplierProfileResponseDto,
  SuppliersListResponseDto,
} from './dto/suppliers-response.dto';

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
  @ApiOkResponse({
    description: 'Paginated supplier list with facets',
    type: SuppliersListResponseDto,
  })
  listSuppliers(@Query() query: ListSuppliersQueryDto) {
    return this.suppliersService.list(query);
  }

  @Get('suppliers/:slugOrId')
  @ApiOperation({ summary: 'Get public supplier profile by id or slug' })
  @ApiOkResponse({
    description: 'Public supplier profile',
    type: SupplierProfileResponseDto,
  })
  getSupplier(@Param('slugOrId') slugOrId: string) {
    return this.suppliersService.getByIdOrSlug(slugOrId);
  }

  @Get('search/suggestions')
  @ApiOperation({ summary: 'Get supplier/category/subcategory typeahead suggestions' })
  async suggestions(@Query() query: SupplierSuggestionsQueryDto) {
    const q = query.q ?? '';
    if (!q) {
      return [];
    }
    return this.suppliersService.suggestions(q, query.take);
  }

  @Post('supplier/profile')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create supplier profile for authenticated user' })
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
  @ApiOperation({ summary: 'Update supplier profile for authenticated user' })
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
  @ApiOperation({ summary: 'Add media item to supplier profile' })
  @UseGuards(AuthGuard)
  addMedia(@CurrentUser() user: AuthUser | undefined, @Body() body: AddSupplierMediaDto) {
    const userId = user?.id;
    if (!userId || userId.startsWith('anonymous:')) {
      throw new UnauthorizedException('Authenticated user required');
    }
    return this.suppliersService.addMedia(userId, body);
  }

  @Delete('supplier/media/:id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete media item from supplier profile' })
  @UseGuards(AuthGuard)
  deleteMedia(@CurrentUser() user: AuthUser | undefined, @Param('id') id: string) {
    const userId = user?.id;
    if (!userId || userId.startsWith('anonymous:')) {
      throw new UnauthorizedException('Authenticated user required');
    }
    return this.suppliersService.deleteMedia(userId, id);
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
  async listFavorites(@Headers('authorization') authorization?: string) {
    const { userId, anonymousSessionId } = await this.resolveActor(authorization);
    return this.suppliersService.listFavorites(userId, anonymousSessionId);
  }

  @Post('supplier/draft')
  @ApiOperation({ summary: 'Save supplier onboarding draft step payload' })
  saveDraft(@Body() body: UpsertSupplierDraftDto) {
    return this.suppliersService.upsertDraft(body.supplierId, body);
  }

  @Get('supplier/draft/:supplierId')
  @ApiOperation({ summary: 'Get supplier onboarding draft by supplier id' })
  getDraft(@Param('supplierId') supplierId: string) {
    return this.suppliersService.getDraft(supplierId);
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
