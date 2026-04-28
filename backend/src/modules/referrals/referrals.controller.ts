import { Controller, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { ReferralsService } from './referrals.service';

@Controller('supplier/referrals')
export class ReferralsController {
  constructor(private readonly referralsService: ReferralsService) {}

  @Get('link')
  link(@Query('supplierId') supplierId: string) {
    return this.referralsService.getLink(supplierId);
  }

  @Post('link/regenerate')
  regenerate(@Query('supplierId') supplierId: string) {
    return this.referralsService.regenerateLink(supplierId);
  }

  @Get('attributions')
  attributions(@Query('supplierId') supplierId: string) {
    return this.referralsService.listAttributions(supplierId);
  }

  @Get('rewards')
  rewards(@Query('supplierId') supplierId: string) {
    return this.referralsService.listRewards(supplierId);
  }
}

@Controller('admin/referrals')
export class AdminReferralsController {
  @Get()
  list() {
    return { referrals: [] };
  }

  @Patch('rewards/:id')
  patchReward(@Param('id') id: string) {
    return { id, updated: true };
  }
}
