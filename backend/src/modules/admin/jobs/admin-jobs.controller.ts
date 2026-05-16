import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { ApiOkResponse, ApiOperation } from '@nestjs/swagger';
import { ApiOkEnvelopePaginated } from '../../../common/swagger/api-response.decorators';
import { AdminControllerAuth } from '../common/admin-controller.decorator';
import { PaginationQueryDto } from '../../../common/dto/pagination-query.dto';
import {
  JobApplicationResponseDto,
  JobDetailResponseDto,
  PaginatedJobApplicationsResponseDto,
} from '../../job-board/dto/job-board-response.dto';
import { ModerateJobApplicationDto } from '../dto/admin.dto';
import { PaginatedAdminJobPostsDataDto } from '../dto/admin-swagger-responses.dto';
import { AdminJobsService } from './admin-jobs.service';

@AdminControllerAuth()
@Controller('admin')
export class AdminJobsController {
  constructor(private readonly adminJobsService: AdminJobsService) {}

  @Get('jobs')
  @ApiOperation({ summary: 'List all job posts for admin moderation' })
  @ApiOkEnvelopePaginated(PaginatedAdminJobPostsDataDto)
  jobs(@Query() query: PaginationQueryDto) {
    return this.adminJobsService.listJobs(query.page, query.limit);
  }

  @Get('jobs/applications')
  @ApiOperation({ summary: 'List job applications for admin moderation' })
  @ApiOkEnvelopePaginated(PaginatedJobApplicationsResponseDto)
  jobApplications(@Query('jobId') jobId?: string, @Query() query?: PaginationQueryDto) {
    return this.adminJobsService.listJobApplications(jobId, query?.page, query?.limit);
  }

  @Post('jobs/:id/archive')
  @ApiOperation({ summary: 'Archive a job post as admin' })
  @ApiOkResponse({ type: JobDetailResponseDto })
  archiveJob(@Param('id') id: string) {
    return this.adminJobsService.archiveJob(id);
  }

  @Post('jobs/applications/:id/status')
  @ApiOperation({ summary: 'Moderate job application status with optional reason' })
  @ApiOkResponse({ type: JobApplicationResponseDto })
  moderateJobApplication(@Param('id') id: string, @Body() body: ModerateJobApplicationDto) {
    return this.adminJobsService.moderateJobApplication(id, body.status, body.reason);
  }
}
