import { Body, Controller, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiCreatedResponse, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ReferralsService } from './referrals.service';
import { PatchReferralRewardDto, SupplierIdQueryDto } from './dto/referrals.dto';
import { ApiProtectedErrors } from '../../common/swagger/api-error-responses.decorator';
import {
  PatchReferralRewardResponseDto,
  ReferralAttributionResponseDto,
  SupplierReferralLinkResponseDto,
} from './dto/referrals-response.dto';

@ApiTags('Referrals')
@ApiProtectedErrors()
@Controller('supplier/referrals')
export class ReferralsController {
  constructor(private readonly referralsService: ReferralsService) {}

  @Get('link')
  @ApiOperation({ summary: 'Get supplier referral link' })
  @ApiOkResponse({
    description: 'Supplier referral link',
    type: SupplierReferralLinkResponseDto,
  })
  link(@Query() query: SupplierIdQueryDto) {
    return this.referralsService.getLink(query.supplierId);
  }

  @Post('link/regenerate')
  @ApiOperation({ summary: 'Regenerate supplier referral link' })
  regenerate(@Query() query: SupplierIdQueryDto) {
    return this.referralsService.regenerateLink(query.supplierId);
  }

  @Get('attributions')
  @ApiOperation({ summary: 'List supplier referral attributions' })
  @ApiOkResponse({
    description: 'Referral attributions',
    type: ReferralAttributionResponseDto,
    isArray: true,
  })
  attributions(@Query() query: SupplierIdQueryDto) {
    return this.referralsService.listAttributions(query.supplierId);
  }

  @Get('rewards')
  @ApiOperation({ summary: 'List supplier referral rewards' })
  rewards(@Query() query: SupplierIdQueryDto) {
    return this.referralsService.listRewards(query.supplierId);
  }
}

@ApiTags('Referrals')
@ApiProtectedErrors()
@Controller('admin/referrals')
export class AdminReferralsController {
  @Get()
  @ApiOperation({ summary: 'List referral records for admin' })
  list() {
    return { referrals: [] };
  }

  @Patch('rewards/:id')
  @ApiOperation({ summary: 'Patch referral reward state' })
  @ApiCreatedResponse({
    description: 'Updated reward state',
    type: PatchReferralRewardResponseDto,
  })
  patchReward(@Param('id') id: string, @Body() body: PatchReferralRewardDto) {
    return { id, updated: true, body };
  }
}
