import { Body, Controller, Get, Param, Patch, Post, Query, UnauthorizedException, UseGuards } from '@nestjs/common';
import { ApiCreatedResponse, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ReferralsService } from './referrals.service';
import { PatchReferralRewardDto, SupplierIdQueryDto } from './dto/referrals.dto';
import { ApiProtectedErrors } from '../../common/swagger/api-error-responses.decorator';
import { AuthGuard } from '../../common/guards/auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { SupplierOnlyGuard } from '../job-board/guards/supplier-only.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { AuthUser } from '../../common/interfaces/auth-user.interface';
import {
  PatchReferralRewardResponseDto,
  ReferralAttributionResponseDto,
  SupplierReferralLinkResponseDto,
} from './dto/referrals-response.dto';

@ApiTags('Referrals')
@ApiProtectedErrors()
@UseGuards(AuthGuard, SupplierOnlyGuard)
@Controller('supplier/referrals')
export class ReferralsController {
  constructor(private readonly referralsService: ReferralsService) {}

  @Get('link')
  @ApiOperation({ summary: 'Get supplier referral link' })
  @ApiOkResponse({
    description: 'Supplier referral link',
    type: SupplierReferralLinkResponseDto,
  })
  link(@CurrentUser() user: AuthUser | undefined, @Query() query: SupplierIdQueryDto) {
    const userId = user?.id;
    if (!userId || userId.startsWith('anonymous:')) {
      throw new UnauthorizedException('Authenticated supplier required');
    }
    return this.referralsService.getLink(query.supplierId);
  }

  @Post('link/regenerate')
  @ApiOperation({ summary: 'Regenerate supplier referral link' })
  regenerate(@CurrentUser() user: AuthUser | undefined, @Query() query: SupplierIdQueryDto) {
    const userId = user?.id;
    if (!userId || userId.startsWith('anonymous:')) {
      throw new UnauthorizedException('Authenticated supplier required');
    }
    return this.referralsService.regenerateLink(query.supplierId);
  }

  @Get('attributions')
  @ApiOperation({ summary: 'List supplier referral attributions' })
  @ApiOkResponse({
    description: 'Referral attributions',
    type: ReferralAttributionResponseDto,
    isArray: true,
  })
  attributions(@CurrentUser() user: AuthUser | undefined, @Query() query: SupplierIdQueryDto) {
    const userId = user?.id;
    if (!userId || userId.startsWith('anonymous:')) {
      throw new UnauthorizedException('Authenticated supplier required');
    }
    return this.referralsService.listAttributions(query.supplierId);
  }

  @Get('rewards')
  @ApiOperation({ summary: 'List supplier referral rewards' })
  rewards(@CurrentUser() user: AuthUser | undefined, @Query() query: SupplierIdQueryDto) {
    const userId = user?.id;
    if (!userId || userId.startsWith('anonymous:')) {
      throw new UnauthorizedException('Authenticated supplier required');
    }
    return this.referralsService.listRewards(query.supplierId);
  }
}

@ApiTags('Referrals')
@ApiProtectedErrors()
@UseGuards(AuthGuard, RolesGuard)
@Roles('ADMIN')
@Controller('admin/referrals')
export class AdminReferralsController {
  constructor(private readonly referralsService: ReferralsService) {}

  @Get()
  @ApiOperation({ summary: 'List referral records for admin' })
  list() {
    return this.referralsService.adminList();
  }

  @Patch('rewards/:id')
  @ApiOperation({ summary: 'Patch referral reward state' })
  @ApiCreatedResponse({
    description: 'Updated reward state',
    type: PatchReferralRewardResponseDto,
  })
  patchReward(@Param('id') id: string, @Body() body: PatchReferralRewardDto) {
    return this.referralsService.patchReward(id, body);
  }
}
