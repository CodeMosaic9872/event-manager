import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { NotificationsService } from '../../notifications/notifications.service';
import { listStaticNotificationTemplateKeys } from '../../notifications/notification-templates.static';
import { toAdminPagination } from '../common/admin-pagination.util';

@Injectable()
export class AdminAutomationsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notificationsService: NotificationsService,
  ) {}

  async automationRules(page?: number, limit?: number) {
    const pg = toAdminPagination(page, limit);
    const keys = listStaticNotificationTemplateKeys();
    const totalItems = keys.length;
    const items = keys.slice(pg.skip, pg.skip + pg.take).map((templateKey) => ({
      templateKey,
      source: 'static' as const,
      note: 'Defined in notification-templates.static.ts',
    }));
    return { items, totalItems };
  }

  updateAutomationRule(_id: string, _payload: { isActive?: boolean; config?: Record<string, unknown> }) {
    throw new BadRequestException(
      'Notification templates are defined in code at src/modules/notifications/notification-templates.static.ts. Edit that file and redeploy.',
    );
  }

  async automationRuns(page?: number, limit?: number) {
    const pg = toAdminPagination(page, limit);
    const [items, totalItems] = await this.prisma.$transaction([
      this.prisma.notification.findMany({
        orderBy: { createdAt: 'desc' },
        skip: pg.skip,
        take: pg.take,
      }),
      this.prisma.notification.count(),
    ]);
    return { items, totalItems };
  }

  processAutomationRuns(limit = 50) {
    return this.notificationsService.dispatchPendingEmails(limit);
  }

  async automationMetrics() {
    const [pending, sent, failed] = await this.prisma.$transaction([
      this.prisma.notification.count({ where: { status: 'PENDING' } }),
      this.prisma.notification.count({ where: { status: 'SENT' } }),
      this.prisma.notification.count({ where: { status: 'FAILED' } }),
    ]);
    return {
      pending,
      sent,
      failed,
      total: pending + sent + failed,
    };
  }
}
