import { Controller, Get, Query } from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';
import { ApiOkEnvelopeData } from '../../../common/swagger/api-response.decorators';
import { AdminControllerAuth } from '../common/admin-controller.decorator';
import { AdminDashboardQueryDto } from '../dto/admin.dto';
import { AdminDashboardResponseDto } from '../dto/admin-swagger-responses.dto';
import { AdminDashboardService } from './admin-dashboard.service';

@AdminControllerAuth()
@Controller('admin')
export class AdminDashboardController {
  constructor(private readonly adminDashboardService: AdminDashboardService) {}

  @Get('dashboard')
  @ApiOperation({
    summary: 'Admin home dashboard (KPIs, supplier engagement, growth chart, pending approvals)',
  })
  @ApiOkEnvelopeData(AdminDashboardResponseDto, {
    description:
      'Aggregated metrics for the admin home screen. Supplier engagement uses share events (profile views / phone channels), job applications (messages), closed jobs, and paid supplier payments.',
  })
  dashboard(@Query() query: AdminDashboardQueryDto) {
    return this.adminDashboardService.getDashboard({
      year: query.year,
      month: query.month,
      supplierSearch: query.supplierSearch,
      pendingLimit: query.pendingLimit,
      growthMonths: query.growthMonths,
    });
  }
}
