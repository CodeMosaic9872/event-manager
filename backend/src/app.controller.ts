import { Controller, Get } from '@nestjs/common';
import { PrismaService } from './prisma/prisma.service';

@Controller()
export class AppController {
  constructor(private readonly prisma: PrismaService) {}

  @Get('health')
  async health() {
    await this.prisma.$queryRaw`SELECT 1`;
    return {
      ok: true,
      service: 'event-marketplace-backend',
      timestamp: new Date().toISOString(),
    };
  }

  @Get('version')
  version() {
    return {
      name: 'event-marketplace-backend',
      version: '0.1.0',
      phase: 'phase-0-foundation',
    };
  }
}
