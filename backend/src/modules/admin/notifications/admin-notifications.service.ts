import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { NotificationsService } from '../../notifications/notifications.service';
import { toAdminPagination } from '../common/admin-pagination.util';

@Injectable()
export class AdminNotificationsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notificationsService: NotificationsService,
  ) {}

  async notifications(page?: number, limit?: number) {
    const pg = toAdminPagination(page, limit);
    const [items, totalItems] = await this.prisma.$transaction([
      this.prisma.notification.findMany({ orderBy: { createdAt: 'desc' }, skip: pg.skip, take: pg.take }),
      this.prisma.notification.count(),
    ]);
    return { items, totalItems };
  }

  notificationProvidersHealth() {
    return this.notificationsService.getProviderHealth();
  }

  retryNotification(id: string) {
    return this.prisma.notification.update({
      where: { id },
      data: { status: 'PENDING', errorCode: null },
    });
  }
}
