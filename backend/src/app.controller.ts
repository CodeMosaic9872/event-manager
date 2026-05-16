import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ApiOkEnvelopeData } from './common/swagger/api-response.decorators';
import { HealthResponseDto, VersionResponseDto } from './common/swagger/app-health.dto';
import { PrismaService } from './prisma/prisma.service';

@ApiTags('System')
@Controller()
export class AppController {
  constructor(private readonly prisma: PrismaService) {}

  @Get('health')
  @ApiOperation({ summary: 'Health check with database connectivity' })
  @ApiOkEnvelopeData(HealthResponseDto)
  async health() {
    await this.prisma.$queryRaw`SELECT 1`;
    return {
      ok: true,
      service: 'event-marketplace-backend',
      timestamp: new Date().toISOString(),
    };
  }

  @Get('version')
  @ApiOperation({ summary: 'API version metadata' })
  @ApiOkEnvelopeData(VersionResponseDto)
  version() {
    return {
      name: 'event-marketplace-backend',
      version: '0.1.0',
      phase: 'phase-0-foundation',
    };
  }
}
