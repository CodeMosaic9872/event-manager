import {
  Body,
  Controller,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
  Query,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { JobBoardService } from './job-board.service';
import { JobPublishGuard } from './guards/job-publish.guard';
import { SupplierOnlyGuard } from './guards/supplier-only.guard';
import { AuthGuard } from '../../common/guards/auth.guard';
import { AuthUser } from '../../common/interfaces/auth-user.interface';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { ApiProtectedErrors } from '../../common/swagger/api-error-responses.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';
import { ApplyJobDto, CreateJobDto, JobApplicationListQueryDto, PublicJobsQueryDto, UpdateJobApplicationStatusDto, UpdateJobDto } from './dto/job-board.dto';
import {
  JobApplicationResponseDto,
  JobApplicationsCountResponseDto,
  JobDetailResponseDto,
  PaginatedJobApplicationHistoryResponseDto,
  PaginatedJobApplicationsResponseDto,
  PaginatedJobPostsResponseDto,
  PaginatedRecommendedJobsResponseDto,
  UserMeStatsResponseDto,
} from './dto/job-board-response.dto';

@ApiTags('Job Board')
@ApiProtectedErrors()
@Controller('jobs')
export class JobBoardController {
  constructor(private readonly jobBoardService: JobBoardService) { }

  @Get()
  @ApiOperation({ summary: 'List public published jobs' })
  @ApiOkResponse({
    description: 'Published jobs with taxonomy relations',
    type: PaginatedJobPostsResponseDto,
  })
  listPublicJobs(@Query() query: PublicJobsQueryDto) {
    return this.jobBoardService.listPublicJobs(query.page, query.limit, query.categoryId, query.subcategoryId);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get a job by id (any status: DRAFT, PUBLISHED, CLOSED, ARCHIVED)',
    description:
      'Unauthenticated access is allowed. Treat job ids as opaque; only users with the link can open drafts.',
  })
  @ApiOkResponse({ type: JobDetailResponseDto })
  getJobById(@Param('id') id: string) {
    return this.jobBoardService.getJobById(id);
  }

  @Post()
  @HttpCode(200)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Create job post (authenticated user required)',
    description:
      'Returns the full job row with taxonomy relations. HTTP status is 200 (not 201) because a global interceptor normalizes success responses.',
  })
  @ApiOkResponse({
    description: 'Created job post (full detail, same shape as GET /jobs/:id)',
    type: JobDetailResponseDto,
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
  @ApiOkResponse({ type: JobDetailResponseDto })
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
  @ApiOkResponse({ type: JobDetailResponseDto })
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
  @ApiOkResponse({ type: JobDetailResponseDto })
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
  @ApiOkResponse({ type: JobDetailResponseDto })
  @UseGuards(AuthGuard)
  archive(@CurrentUser() user: AuthUser | undefined, @Param('id') id: string) {
    const userId = user?.id;
    if (!userId || userId.startsWith('anonymous:')) {
      throw new UnauthorizedException('Authenticated user required');
    }
    return this.jobBoardService.archiveJob(id, userId);
  }

  @Post(':id/applications')
  @HttpCode(200)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Apply to job as supplier',
    description: 'HTTP status is 200 (not 201) because a global interceptor normalizes success responses.',
  })
  @ApiOkResponse({
    description: 'Created job application row',
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
  @ApiOkResponse({ type: JobApplicationResponseDto })
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
  applications(@Param('id') id: string, @Query() query: JobApplicationListQueryDto) {
    return this.jobBoardService.listApplications(id, query.page, query.limit, query.status);
  }
}

@ApiTags('Job Board')
@ApiProtectedErrors()
@ApiBearerAuth()
@UseGuards(AuthGuard, RolesGuard)
@Roles('ADMIN')
@Controller('job-applications')
export class JobApplicationController {
  constructor(private readonly jobBoardService: JobBoardService) { }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Update job application status' })
  @ApiOkResponse({ type: JobApplicationResponseDto })
  updateStatus(
    @Param('id') id: string,
    @Body() body: UpdateJobApplicationStatusDto,
  ) {
    return this.jobBoardService.updateApplicationStatus(id, body.status);
  }

  @Get(':id/history')
  @ApiOperation({ summary: 'Get status timeline/history for a job application' })
  @ApiOkResponse({ type: PaginatedJobApplicationHistoryResponseDto })
  history(@Param('id') id: string, @Query() query: PaginationQueryDto) {
    return this.jobBoardService.listApplicationHistory(id, query.page, query.limit);
  }
}

@ApiTags('Job Board')
@ApiProtectedErrors()
@Controller()
export class JobQueryController {
  constructor(private readonly jobBoardService: JobBoardService) { }

  @Get('users/me/stats')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Dashboard counters for the current user (jobs, pending applications, favorites, saved concepts)',
  })
  @ApiOkResponse({ type: UserMeStatsResponseDto })
  @UseGuards(AuthGuard)
  userMeStats(@CurrentUser() user: AuthUser | undefined) {
    const userId = user?.id;
    if (!userId || userId.startsWith('anonymous:')) {
      throw new UnauthorizedException('Authenticated user required');
    }
    return this.jobBoardService.getUserMeStats(userId);
  }

  @Get('users/me/jobs/:jobId/applications/count')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Count job applications for one of your tenders (default: SUBMITTED only)',
  })
  @ApiQuery({
    name: 'status',
    required: false,
    description: 'Comma-separated statuses: SUBMITTED,SHORTLISTED,REJECTED,WITHDRAWN (default SUBMITTED)',
    example: 'SUBMITTED',
  })
  @ApiOkResponse({ type: JobApplicationsCountResponseDto })
  @UseGuards(AuthGuard)
  jobApplicationsCount(
    @CurrentUser() user: AuthUser | undefined,
    @Param('jobId') jobId: string,
    @Query('status') status?: string,
  ) {
    const userId = user?.id;
    if (!userId || userId.startsWith('anonymous:')) {
      throw new UnauthorizedException('Authenticated user required');
    }
    return this.jobBoardService.countApplicationsForOwnerJob(jobId, userId, status);
  }

  @Get('users/me/jobs')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List current user owned jobs' })
  @ApiOkResponse({
    description: 'Owned jobs with taxonomy relations',
    type: PaginatedJobPostsResponseDto,
  })
  @UseGuards(AuthGuard)
  userJobs(@CurrentUser() user: AuthUser | undefined, @Query() query: PaginationQueryDto) {
    const userId = user?.id;
    if (!userId || userId.startsWith('anonymous:')) {
      throw new UnauthorizedException('Authenticated user required');
    }
    return this.jobBoardService.listUserJobs(userId, query.page, query.limit);
  }

  @Get('supplier/jobs/recommended')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List recommended jobs for supplier dashboard' })
  @ApiOkResponse({
    description: 'Recommended jobs sorted by match score (paginated)',
    type: PaginatedRecommendedJobsResponseDto,
  })
  @UseGuards(AuthGuard, SupplierOnlyGuard)
  supplierRecommendedJobs(@CurrentUser() user: AuthUser | undefined, @Query() query: PaginationQueryDto) {
    const userId = user?.id;
    if (!userId || userId.startsWith('anonymous:')) {
      throw new UnauthorizedException('Authenticated supplier required');
    }
    return this.jobBoardService.listRecommendedJobsForUser(userId, query.page, query.limit);
  }

  @Get('supplier/jobs/applied')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List jobs the current supplier has applied to' })
  @UseGuards(AuthGuard, SupplierOnlyGuard)
  supplierAppliedJobs(@CurrentUser() user: AuthUser | undefined, @Query() query: PaginationQueryDto) {
    const userId = user?.id;
    if (!userId || userId.startsWith('anonymous:')) {
      throw new UnauthorizedException('Authenticated supplier required');
    }
    return this.jobBoardService.listSupplierAppliedJobs(userId, query.page, query.limit);
  }
}
