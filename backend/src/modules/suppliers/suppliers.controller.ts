import { Body, Controller, Delete, Get, Headers, Param, Patch, Post, Query, UnauthorizedException, UseGuards } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { SuppliersService } from './suppliers.service';
import { verifyAccessToken } from '../../common/utils/jwt.util';
import { AuthGuard } from '../../common/guards/auth.guard';
import { AuthUser } from '../../common/interfaces/auth-user.interface';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
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

@Controller()
export class SuppliersController {
  constructor(
    private readonly suppliersService: SuppliersService,
    private readonly prisma: PrismaService,
  ) {}

  @Get('suppliers')
  listSuppliers(@Query() query: ListSuppliersQueryDto) {
    return this.suppliersService.list(query);
  }

  @Get('suppliers/:slugOrId')
  getSupplier(@Param('slugOrId') slugOrId: string) {
    return this.suppliersService.getByIdOrSlug(slugOrId);
  }

  @Get('search/suggestions')
  async suggestions(@Query() query: SupplierSuggestionsQueryDto) {
    const q = query.q ?? '';
    if (!q) {
      return [];
    }
    return this.suppliersService.suggestions(q, query.take);
  }

  @Post('supplier/profile')
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
  @UseGuards(AuthGuard)
  addMedia(@CurrentUser() user: AuthUser | undefined, @Body() body: AddSupplierMediaDto) {
    const userId = user?.id;
    if (!userId || userId.startsWith('anonymous:')) {
      throw new UnauthorizedException('Authenticated user required');
    }
    return this.suppliersService.addMedia(userId, body);
  }

  @Delete('supplier/media/:id')
  @UseGuards(AuthGuard)
  deleteMedia(@CurrentUser() user: AuthUser | undefined, @Param('id') id: string) {
    const userId = user?.id;
    if (!userId || userId.startsWith('anonymous:')) {
      throw new UnauthorizedException('Authenticated user required');
    }
    return this.suppliersService.deleteMedia(userId, id);
  }

  @Patch('supplier/attributes')
  @UseGuards(AuthGuard)
  updateAttributes(@CurrentUser() user: AuthUser | undefined, @Body() body: UpdateSupplierAttributesDto) {
    const userId = user?.id;
    if (!userId || userId.startsWith('anonymous:')) {
      throw new UnauthorizedException('Authenticated user required');
    }
    return this.suppliersService.updateAttributes(userId, body);
  }

  @Patch('supplier/service-areas')
  @UseGuards(AuthGuard)
  updateServiceAreas(@CurrentUser() user: AuthUser | undefined, @Body() body: UpdateSupplierServiceAreasDto) {
    const userId = user?.id;
    if (!userId || userId.startsWith('anonymous:')) {
      throw new UnauthorizedException('Authenticated user required');
    }
    return this.suppliersService.updateServiceAreas(userId, body.serviceAreas);
  }

  @Post('suppliers/:id/favorite')
  async favorite(@Param('id') supplierId: string, @Headers('authorization') authorization?: string) {
    const { userId, anonymousSessionId } = await this.resolveActor(authorization);
    return this.suppliersService.saveFavorite(userId, anonymousSessionId, supplierId);
  }

  @Post('suppliers/:id/share')
  async share(
    @Param('id') supplierId: string,
    @Headers('authorization') authorization?: string,
    @Body() body?: ShareSupplierDto,
  ) {
    const { userId, anonymousSessionId } = await this.resolveActor(authorization);
    return this.suppliersService.trackShare(userId, anonymousSessionId, supplierId, body);
  }

  @Delete('suppliers/:id/favorite')
  async unfavorite(@Param('id') supplierId: string, @Headers('authorization') authorization?: string) {
    const { userId, anonymousSessionId } = await this.resolveActor(authorization);
    return this.suppliersService.removeFavorite(userId, anonymousSessionId, supplierId);
  }

  @Get('users/me/favorites')
  async listFavorites(@Headers('authorization') authorization?: string) {
    const { userId, anonymousSessionId } = await this.resolveActor(authorization);
    return this.suppliersService.listFavorites(userId, anonymousSessionId);
  }

  @Post('supplier/draft')
  saveDraft(@Body() body: UpsertSupplierDraftDto) {
    return this.suppliersService.upsertDraft(body.supplierId, body);
  }

  @Get('supplier/draft/:supplierId')
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
