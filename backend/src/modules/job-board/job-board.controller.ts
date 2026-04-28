import { Body, Controller, Get, Param, Patch, Post, Query, UnauthorizedException, UseGuards } from '@nestjs/common';
import { JobBoardService } from './job-board.service';
import { JobPublishGuard } from './guards/job-publish.guard';
import { SupplierOnlyGuard } from './guards/supplier-only.guard';
import { AuthGuard } from '../../common/guards/auth.guard';
import { AuthUser } from '../../common/interfaces/auth-user.interface';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@Controller('jobs')
export class JobBoardController {
  constructor(private readonly jobBoardService: JobBoardService) {}

  @Get()
  listPublicJobs() {
    return this.jobBoardService.listPublicJobs();
  }

  @Post()
  @UseGuards(AuthGuard, JobPublishGuard)
  createJob(
    @CurrentUser() user: AuthUser | undefined,
    @Body()
    body: {
      title: string;
      description: string;
      eventDate?: string;
      eventTypeId?: string;
      locationText?: string;
      budgetMin?: number;
      budgetMax?: number;
      guestCount?: number;
    },
  ) {
    const userId = user?.id;
    if (!userId || userId.startsWith('anonymous:')) {
      throw new UnauthorizedException('Authenticated user required');
    }
    return this.jobBoardService.createJob({ userId, ...body });
  }

  @Patch(':id')
  @UseGuards(AuthGuard)
  patchJob(
    @CurrentUser() user: AuthUser | undefined,
    @Param('id') id: string,
    @Body() body: { title?: string; description?: string; eventDate?: string },
  ) {
    const userId = user?.id;
    if (!userId || userId.startsWith('anonymous:')) {
      throw new UnauthorizedException('Authenticated user required');
    }
    return this.jobBoardService.updateJob(id, userId, body);
  }

  @Post(':id/publish')
  @UseGuards(AuthGuard, JobPublishGuard)
  publish(@CurrentUser() user: AuthUser | undefined, @Param('id') id: string) {
    const userId = user?.id;
    if (!userId || userId.startsWith('anonymous:')) {
      throw new UnauthorizedException('Authenticated user required');
    }
    return this.jobBoardService.publishJob(id, userId);
  }

  @Post(':id/close')
  @UseGuards(AuthGuard)
  close(@CurrentUser() user: AuthUser | undefined, @Param('id') id: string) {
    const userId = user?.id;
    if (!userId || userId.startsWith('anonymous:')) {
      throw new UnauthorizedException('Authenticated user required');
    }
    return this.jobBoardService.closeJob(id, userId);
  }

  @Post(':id/applications')
  @UseGuards(AuthGuard, SupplierOnlyGuard)
  apply(@CurrentUser() user: AuthUser | undefined, @Param('id') id: string, @Body() body: { message?: string }) {
    const userId = user?.id;
    if (!userId || userId.startsWith('anonymous:')) {
      throw new UnauthorizedException('Authenticated supplier required');
    }
    return this.jobBoardService.applyForUser(id, userId, body.message);
  }

  @Get(':id/applications')
  applications(@Param('id') id: string) {
    return this.jobBoardService.listApplications(id);
  }
}

@Controller('job-applications')
export class JobApplicationController {
  constructor(private readonly jobBoardService: JobBoardService) {}

  @Patch(':id/status')
  updateStatus(
    @Param('id') id: string,
    @Body() body: { status: 'SUBMITTED' | 'SHORTLISTED' | 'REJECTED' | 'WITHDRAWN' },
  ) {
    return this.jobBoardService.updateApplicationStatus(id, body.status);
  }
}

@Controller()
export class JobQueryController {
  constructor(private readonly jobBoardService: JobBoardService) {}

  @Get('users/me/jobs')
  @UseGuards(AuthGuard)
  userJobs(@CurrentUser() user: AuthUser | undefined) {
    const userId = user?.id;
    if (!userId || userId.startsWith('anonymous:')) {
      throw new UnauthorizedException('Authenticated user required');
    }
    return this.jobBoardService.listUserJobs(userId);
  }

  @Get('supplier/jobs/recommended')
  supplierRecommendedJobs(@Query('supplierId') supplierId: string) {
    return { supplierId, jobs: [], note: 'Recommendation endpoint scaffolded for ranking logic.' };
  }
}
