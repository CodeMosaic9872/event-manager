import { Body, Controller, Get, Param, Patch, Post, Query, UnauthorizedException, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import {
  ApiOkEnvelopeData,
  ApiOkEnvelopePaginated,
} from '../../common/swagger/api-response.decorators';
import { ReferralsService } from './referrals.service';
import { PatchReferralRewardDto, SupplierIdQueryDto } from './dto/referrals.dto';
import { ApiProtectedErrors } from '../../common/swagger/api-error-responses.decorator';
import { AuthGuard } from '../../common/guards/auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { SupplierOnlyGuard } from '../job-board/guards/supplier-only.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { AuthUser } from '../../common/interfaces/auth-user.interface';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';
import {
  AdminReferralRewardsListResponseDto,
  PatchReferralRewardResponseDto,
  ReferralAttributionsListResponseDto,
  ReferralRewardsListResponseDto,
  SupplierReferralLinkResponseDto,
} from './dto/referrals-response.dto';

@ApiTags('Referrals')
@ApiProtectedErrors()
@ApiBearerAuth()
@UseGuards(AuthGuard, SupplierOnlyGuard)
@Controller('supplier/referrals')
export class ReferralsController {
  constructor(private readonly referralsService: ReferralsService) {}

  @Get('link')
  @ApiOperation({ summary: 'Get supplier referral link' })
  @ApiOkEnvelopeData(SupplierReferralLinkResponseDto, { description: 'Supplier referral link' })
  link(@CurrentUser() user: AuthUser | undefined, @Query() query: SupplierIdQueryDto) {
    const userId = user?.id;
    if (!userId || userId.startsWith('anonymous:')) {
      throw new UnauthorizedException('Authenticated supplier required');
    }
    return this.referralsService.getLink(query.supplierId);
  }

  @Post('link/regenerate')
  @ApiOperation({ summary: 'Regenerate supplier referral link' })
  @ApiOkResponse({
    description: 'New active referral link',
    type: SupplierReferralLinkResponseDto,
  })
  regenerate(@CurrentUser() user: AuthUser | undefined, @Query() query: SupplierIdQueryDto) {
    const userId = user?.id;
    if (!userId || userId.startsWith('anonymous:')) {
      throw new UnauthorizedException('Authenticated supplier required');
    }
    return this.referralsService.regenerateLink(query.supplierId);
  }

  @Get('attributions')
  @ApiOperation({ summary: 'List supplier referral attributions' })
  @ApiOkEnvelopePaginated(ReferralAttributionsListResponseDto, {
    description: 'Paginated attributions for the supplier',
  })
  attributions(
    @CurrentUser() user: AuthUser | undefined,
    @Query() query: SupplierIdQueryDto & PaginationQueryDto,
  ) {
    const userId = user?.id;
    if (!userId || userId.startsWith('anonymous:')) {
      throw new UnauthorizedException('Authenticated supplier required');
    }
    return this.referralsService.listAttributions(query.supplierId, query.page, query.limit);
  }

  @Get('rewards')
  @ApiOperation({ summary: 'List supplier referral rewards' })
  @ApiOkEnvelopePaginated(ReferralRewardsListResponseDto, {
    description: 'Paginated rewards with attribution rows',
  })
  rewards(@CurrentUser() user: AuthUser | undefined, @Query() query: SupplierIdQueryDto & PaginationQueryDto) {
    const userId = user?.id;
    if (!userId || userId.startsWith('anonymous:')) {
      throw new UnauthorizedException('Authenticated supplier required');
    }
    return this.referralsService.listRewards(query.supplierId, query.page, query.limit);
  }
}

@ApiTags('Referrals')
@ApiProtectedErrors()
@ApiBearerAuth()
@UseGuards(AuthGuard, RolesGuard)
@Roles('ADMIN')
@Controller('admin/referrals')
export class AdminReferralsController {
  constructor(private readonly referralsService: ReferralsService) {}

  @Get()
  @ApiOperation({ summary: 'List referral records for admin' })
  @ApiOkEnvelopePaginated(AdminReferralRewardsListResponseDto, {
    description: 'Paginated referral rewards with supplier and attribution (including referral link)',
  })
  list(@Query() query: PaginationQueryDto) {
    return this.referralsService.adminList(query.page, query.limit);
  }

  @Patch('rewards/:id')
  @ApiOperation({ summary: 'Patch referral reward state' })
  @ApiOkResponse({
    description: 'Updated reward state',
    type: PatchReferralRewardResponseDto,
  })
  patchReward(@Param('id') id: string, @Body() body: PatchReferralRewardDto) {
    return this.referralsService.patchReward(id, body);
  }
}
