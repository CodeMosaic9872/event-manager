import { Body, Controller, Get, Param, Patch, Post, UnauthorizedException, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiCreatedResponse, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JobBoardService } from './job-board.service';
import { JobPublishGuard } from './guards/job-publish.guard';
import { SupplierOnlyGuard } from './guards/supplier-only.guard';
import { AuthGuard } from '../../common/guards/auth.guard';
import { AuthUser } from '../../common/interfaces/auth-user.interface';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { ApiProtectedErrors } from '../../common/swagger/api-error-responses.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';
import { ApplyJobDto, CreateJobDto, UpdateJobApplicationStatusDto, UpdateJobDto } from './dto/job-board.dto';
import {
  CreatedJobResponseDto,
  JobApplicationResponseDto,
  JobSummaryResponseDto,
  RecommendedJobResponseDto,
} from './dto/job-board-response.dto';

@ApiTags('Job Board')
@ApiProtectedErrors()
@Controller('jobs')
export class JobBoardController {
  constructor(private readonly jobBoardService: JobBoardService) {}

  @Get()
  @ApiOperation({ summary: 'List public published jobs' })
  @ApiOkResponse({
    description: 'Published jobs list',
    type: JobSummaryResponseDto,
    isArray: true,
  })
  listPublicJobs() {
    return this.jobBoardService.listPublicJobs();
  }

  @Post()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create job post (authenticated user required)' })
  @ApiCreatedResponse({
    description: 'Created job post',
    type: CreatedJobResponseDto,
  })
  @UseGuards(AuthGuard, JobPublishGuard)
  createJob(
    @CurrentUser() user: AuthUser | undefined,
    @Body() body: CreateJobDto,
  ) {
    const userId = user?.id;
    if (!userId || userId.startsWith('anonymous:')) {
      throw new UnauthorizedException('Authenticated user required');
    }
    return this.jobBoardService.createJob({ userId, ...body });
  }

  @Patch(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update own job post draft/details' })
  @UseGuards(AuthGuard)
  patchJob(
    @CurrentUser() user: AuthUser | undefined,
    @Param('id') id: string,
    @Body() body: UpdateJobDto,
  ) {
    const userId = user?.id;
    if (!userId || userId.startsWith('anonymous:')) {
      throw new UnauthorizedException('Authenticated user required');
    }
    return this.jobBoardService.updateJob(id, userId, body);
  }

  @Post(':id/publish')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Publish own job post' })
  @UseGuards(AuthGuard, JobPublishGuard)
  publish(@CurrentUser() user: AuthUser | undefined, @Param('id') id: string) {
    const userId = user?.id;
    if (!userId || userId.startsWith('anonymous:')) {
      throw new UnauthorizedException('Authenticated user required');
    }
    return this.jobBoardService.publishJob(id, userId);
  }

  @Post(':id/close')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Close own published job post' })
  @UseGuards(AuthGuard)
  close(@CurrentUser() user: AuthUser | undefined, @Param('id') id: string) {
    const userId = user?.id;
    if (!userId || userId.startsWith('anonymous:')) {
      throw new UnauthorizedException('Authenticated user required');
    }
    return this.jobBoardService.closeJob(id, userId);
  }

  @Post(':id/archive')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Archive own job post' })
  @UseGuards(AuthGuard)
  archive(@CurrentUser() user: AuthUser | undefined, @Param('id') id: string) {
    const userId = user?.id;
    if (!userId || userId.startsWith('anonymous:')) {
      throw new UnauthorizedException('Authenticated user required');
    }
    return this.jobBoardService.archiveJob(id, userId);
  }

  @Post(':id/applications')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Apply to job as supplier' })
  @ApiCreatedResponse({
    description: 'Created job application',
    type: JobApplicationResponseDto,
  })
  @UseGuards(AuthGuard, SupplierOnlyGuard)
  apply(@CurrentUser() user: AuthUser | undefined, @Param('id') id: string, @Body() body: ApplyJobDto) {
    const userId = user?.id;
    if (!userId || userId.startsWith('anonymous:')) {
      throw new UnauthorizedException('Authenticated supplier required');
    }
    return this.jobBoardService.applyForUser(id, userId, body.message);
  }

  @Post(':id/applications/withdraw')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Withdraw own application for a job' })
  @UseGuards(AuthGuard, SupplierOnlyGuard)
  withdraw(@CurrentUser() user: AuthUser | undefined, @Param('id') id: string) {
    const userId = user?.id;
    if (!userId || userId.startsWith('anonymous:')) {
      throw new UnauthorizedException('Authenticated supplier required');
    }
    return this.jobBoardService.withdrawForUser(id, userId);
  }

  @Get(':id/applications')
  @ApiOperation({ summary: 'List applications for a specific job' })
  applications(@Param('id') id: string) {
    return this.jobBoardService.listApplications(id);
  }
}

@ApiTags('Job Board')
@ApiProtectedErrors()
@UseGuards(AuthGuard, RolesGuard)
@Roles('ADMIN')
@Controller('job-applications')
export class JobApplicationController {
  constructor(private readonly jobBoardService: JobBoardService) {}

  @Patch(':id/status')
  @ApiOperation({ summary: 'Update job application status' })
  updateStatus(
    @Param('id') id: string,
    @Body() body: UpdateJobApplicationStatusDto,
  ) {
    return this.jobBoardService.updateApplicationStatus(id, body.status);
  }

  @Get(':id/history')
  @ApiOperation({ summary: 'Get status timeline/history for a job application' })
  history(@Param('id') id: string) {
    return this.jobBoardService.listApplicationHistory(id);
  }
}

@ApiTags('Job Board')
@ApiProtectedErrors()
@Controller()
export class JobQueryController {
  constructor(private readonly jobBoardService: JobBoardService) {}

  @Get('users/me/jobs')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List current user owned jobs' })
  @UseGuards(AuthGuard)
  userJobs(@CurrentUser() user: AuthUser | undefined) {
    const userId = user?.id;
    if (!userId || userId.startsWith('anonymous:')) {
      throw new UnauthorizedException('Authenticated user required');
    }
    return this.jobBoardService.listUserJobs(userId);
  }

  @Get('supplier/jobs/recommended')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List recommended jobs for supplier dashboard' })
  @ApiOkResponse({
    description: 'Recommended jobs sorted by match score',
    type: RecommendedJobResponseDto,
    isArray: true,
  })
  @UseGuards(AuthGuard, SupplierOnlyGuard)
  supplierRecommendedJobs(@CurrentUser() user: AuthUser | undefined) {
    const userId = user?.id;
    if (!userId || userId.startsWith('anonymous:')) {
      throw new UnauthorizedException('Authenticated supplier required');
    }
    return this.jobBoardService.listRecommendedJobsForUser(userId);
  }
}
