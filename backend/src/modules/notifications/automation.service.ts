import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { PrismaService } from '../../prisma/prisma.service';

type DomainEvent = {
  eventId: string;
  type: string;
  payload: Record<string, unknown>;
};

@Injectable()
export class AutomationService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(AutomationService.name);
  private reminderTimer: NodeJS.Timeout | null = null;

  constructor(
    private readonly notificationsService: NotificationsService,
    private readonly prisma: PrismaService,
  ) {}

  onModuleInit() {
    if (process.env.NOTIFICATION_REMINDER_WORKER_ENABLED !== 'true') {
      return;
    }
    const parsed = Number(process.env.NOTIFICATION_REMINDER_INTERVAL_MS ?? 3_600_000);
    const intervalMs = Number.isFinite(parsed) && parsed >= 60_000 ? Math.floor(parsed) : 3_600_000;
    this.reminderTimer = setInterval(() => {
      void this.runScheduledReminderSweep().catch((err: unknown) =>
        this.logger.error('automation.reminder.sweep.failed', err as Error),
      );
    }, intervalMs);
    this.logger.log(`automation.reminder.worker.started intervalMs=${intervalMs}`);
  }

  onModuleDestroy() {
    if (this.reminderTimer) {
      clearInterval(this.reminderTimer);
      this.reminderTimer = null;
    }
  }

  async publish(event: DomainEvent) {
    const isDuplicate = await this.hasProcessedEvent(event.eventId);
    if (isDuplicate) {
      this.logger.warn(`automation.event.duplicate ${event.type} ${event.eventId}`);
      return;
    }
    this.logger.log(`automation.event ${event.type} ${event.eventId}`);

    if (event.type === 'job.application.submitted') {
      await this.notificationsService.enqueueEmail({
        recipientUserId: typeof event.payload.ownerUserId === 'string' ? event.payload.ownerUserId : undefined,
        templateKey: 'job.application.submitted',
        data: { ...event.payload, eventId: event.eventId, eventType: event.type },
      });
      await this.notificationsService.enqueuePush({
        recipientUserId: typeof event.payload.ownerUserId === 'string' ? event.payload.ownerUserId : undefined,
        templateKey: 'job.application.submitted',
        data: { ...event.payload, eventId: event.eventId, eventType: event.type },
      });
      await this.notificationsService.enqueueSms({
        recipientUserId: typeof event.payload.ownerUserId === 'string' ? event.payload.ownerUserId : undefined,
        templateKey: 'job.application.submitted',
        data: { ...event.payload, eventId: event.eventId, eventType: event.type },
      });
    }

    if (event.type === 'job.material.updated') {
      const supplierIds = Array.isArray(event.payload.supplierIds)
        ? event.payload.supplierIds.filter((id): id is string => typeof id === 'string')
        : [];
      await Promise.all(
        supplierIds.map((supplierId) =>
          this.notificationsService.enqueueEmail({
            recipientSupplierId: supplierId,
            templateKey: 'job.material.updated',
            data: { ...event.payload, eventId: event.eventId, eventType: event.type },
          }),
        ),
      );
      await Promise.all(
        supplierIds.map((supplierId) =>
          this.notificationsService.enqueuePush({
            recipientSupplierId: supplierId,
            templateKey: 'job.material.updated',
            data: { ...event.payload, eventId: event.eventId, eventType: event.type },
          }),
        ),
      );
      await Promise.all(
        supplierIds.map((supplierId) =>
          this.notificationsService.enqueueSms({
            recipientSupplierId: supplierId,
            templateKey: 'job.material.updated',
            data: { ...event.payload, eventId: event.eventId, eventType: event.type },
          }),
        ),
      );
    }

    if (event.type === 'job.matching.published') {
      const supplierIds = Array.isArray(event.payload.supplierIds)
        ? event.payload.supplierIds.filter((id): id is string => typeof id === 'string')
        : [];
      await Promise.all(
        supplierIds.map((supplierId) =>
          this.notificationsService.enqueueEmail({
            recipientSupplierId: supplierId,
            templateKey: 'job.matching.published',
            data: { ...event.payload, eventId: event.eventId, eventType: event.type },
          }),
        ),
      );
      await Promise.all(
        supplierIds.map((supplierId) =>
          this.notificationsService.enqueuePush({
            recipientSupplierId: supplierId,
            templateKey: 'job.matching.published',
            data: { ...event.payload, eventId: event.eventId, eventType: event.type },
          }),
        ),
      );
      await Promise.all(
        supplierIds.map((supplierId) =>
          this.notificationsService.enqueueSms({
            recipientSupplierId: supplierId,
            templateKey: 'job.matching.published',
            data: { ...event.payload, eventId: event.eventId, eventType: event.type },
          }),
        ),
      );
    }

    if (event.type === 'user.registered') {
      await this.notificationsService.enqueueEmail({
        recipientUserId: typeof event.payload.userId === 'string' ? event.payload.userId : undefined,
        templateKey: 'user.welcome',
        data: { ...event.payload, eventId: event.eventId, eventType: event.type },
      });
      await this.notificationsService.enqueuePush({
        recipientUserId: typeof event.payload.userId === 'string' ? event.payload.userId : undefined,
        templateKey: 'user.welcome',
        data: { ...event.payload, eventId: event.eventId, eventType: event.type },
      });
      await this.notificationsService.enqueueSms({
        recipientUserId: typeof event.payload.userId === 'string' ? event.payload.userId : undefined,
        templateKey: 'user.welcome',
        data: { ...event.payload, eventId: event.eventId, eventType: event.type },
      });
    }

    if (event.type === 'supplier.onboarding.abandoned') {
      const scheduledAt = new Date(Date.now() + 3 * 60 * 60 * 1000);
      await this.notificationsService.enqueueEmail({
        recipientUserId: typeof event.payload.userId === 'string' ? event.payload.userId : undefined,
        recipientSupplierId: typeof event.payload.supplierId === 'string' ? event.payload.supplierId : undefined,
        templateKey: 'supplier.onboarding.abandoned',
        scheduledAt,
        data: { ...event.payload, eventId: event.eventId, eventType: event.type },
      });
      await this.notificationsService.enqueuePush({
        recipientUserId: typeof event.payload.userId === 'string' ? event.payload.userId : undefined,
        recipientSupplierId: typeof event.payload.supplierId === 'string' ? event.payload.supplierId : undefined,
        templateKey: 'supplier.onboarding.abandoned',
        scheduledAt,
        data: { ...event.payload, eventId: event.eventId, eventType: event.type },
      });
      await this.notificationsService.enqueueSms({
        recipientUserId: typeof event.payload.userId === 'string' ? event.payload.userId : undefined,
        recipientSupplierId: typeof event.payload.supplierId === 'string' ? event.payload.supplierId : undefined,
        templateKey: 'supplier.onboarding.abandoned',
        scheduledAt,
        data: { ...event.payload, eventId: event.eventId, eventType: event.type },
      });
    }

    if (event.type === 'supplier.approved') {
      const ownerUserId = typeof event.payload.ownerUserId === 'string' ? event.payload.ownerUserId : undefined;
      const data = { ...event.payload, eventId: event.eventId, eventType: event.type };
      await this.notificationsService.enqueueEmail({
        recipientUserId: ownerUserId,
        templateKey: 'supplier.approved',
        data,
      });
      await this.notificationsService.enqueuePush({
        recipientUserId: ownerUserId,
        templateKey: 'supplier.approved',
        data,
      });
      await this.notificationsService.enqueueSms({
        recipientUserId: ownerUserId,
        templateKey: 'supplier.approved',
        data,
      });
    }

    if (event.type === 'supplier.rejected') {
      const ownerUserId = typeof event.payload.ownerUserId === 'string' ? event.payload.ownerUserId : undefined;
      const reasonRaw = event.payload.reason;
      const reason = typeof reasonRaw === 'string' && reasonRaw.trim() ? reasonRaw.trim() : 'Not specified';
      const data = {
        ...event.payload,
        reason,
        eventId: event.eventId,
        eventType: event.type,
      };
      await this.notificationsService.enqueueEmail({
        recipientUserId: ownerUserId,
        templateKey: 'supplier.rejected',
        data,
      });
      await this.notificationsService.enqueuePush({
        recipientUserId: ownerUserId,
        templateKey: 'supplier.rejected',
        data,
      });
      await this.notificationsService.enqueueSms({
        recipientUserId: ownerUserId,
        templateKey: 'supplier.rejected',
        data,
      });
    }

    if (event.type === 'supplier.lead.received') {
      const supplierId = typeof event.payload.supplierId === 'string' ? event.payload.supplierId : undefined;
      if (!supplierId) {
        return;
      }
      const data = this.enrichLeadNotificationPayload({
        ...event.payload,
        eventId: event.eventId,
        eventType: event.type,
      });
      await this.notificationsService.enqueueEmail({
        recipientSupplierId: supplierId,
        templateKey: 'supplier.lead.received',
        data,
      });
      await this.notificationsService.enqueuePush({
        recipientSupplierId: supplierId,
        templateKey: 'supplier.lead.received',
        data,
      });
      await this.notificationsService.enqueueSms({
        recipientSupplierId: supplierId,
        templateKey: 'supplier.lead.received',
        data,
      });
    }
  }

  /**
   * Periodic reminders: AI limit, favorites, profile-view follow-up, draft jobs, user/supplier inactivity,
   * subscription renewal window, admin digests (incomplete, leads, inactive suppliers), AI failure spike alert.
   * Enqueues notifications directly (no domain publish) with deduplication via payload.eventId or recent-send checks.
   */
  async runScheduledReminderSweep() {
    const msDay = 86_400_000;
    await this.sweepAiRegistrationReminders(msDay);
    await this.sweepFavoriteFollowUps(msDay);
    await this.sweepSupplierProfileViewFollowUps(msDay);
    await this.sweepDraftJobReminders(msDay);
    await this.sweepUserInactivityReminders(msDay);
    await this.sweepSupplierInactivityReminders(msDay);
    await this.sweepSubscriptionRenewals(msDay);
    await this.sweepAdminIncompleteDigest();
    await this.sweepAdminLeadsDigest();
    await this.sweepAdminInactiveSuppliersDigest();
    await this.sweepAdminAiFailureAlert();
  }

  private async sweepAiRegistrationReminders(msDay: number) {
    const counters = await this.prisma.aiUsageCounter.findMany({
      where: {
        userId: { not: null },
        messageCount: { gte: 8, lt: 10 },
      },
      take: 80,
    });
    for (const row of counters) {
      if (!row.userId) {
        continue;
      }
      const recent = await this.wasRecentlyNotified({
        templateKey: 'user.ai.limit.reminder',
        recipientUserId: row.userId,
        sinceMs: msDay,
      });
      if (recent) {
        continue;
      }
      const eventId = `ai_limit_${row.userId}_${new Date().toISOString().slice(0, 10)}`;
      const base = {
        userId: row.userId,
        messageCount: row.messageCount,
        eventId,
        eventType: 'user.ai.limit.reminder',
      };
      await this.notificationsService.enqueueEmail({
        recipientUserId: row.userId,
        templateKey: 'user.ai.limit.reminder',
        data: base,
      });
      await this.notificationsService.enqueuePush({
        recipientUserId: row.userId,
        templateKey: 'user.ai.limit.reminder',
        data: base,
      });
      await this.notificationsService.enqueueSms({
        recipientUserId: row.userId,
        templateKey: 'user.ai.limit.reminder',
        data: base,
      });
    }
  }

  private async sweepFavoriteFollowUps(msDay: number) {
    const cutoff = new Date(Date.now() - 48 * 60 * 60 * 1000);
    const favorites = await this.prisma.favoriteSupplier.findMany({
      where: {
        userId: { not: null },
        createdAt: { lte: cutoff },
      },
      take: 60,
    });
    for (const fav of favorites) {
      if (!fav.userId) {
        continue;
      }
      const recent = await this.wasRecentlyNotified({
        templateKey: 'user.favorites.followup',
        recipientUserId: fav.userId,
        sinceMs: 7 * msDay,
      });
      if (recent) {
        continue;
      }
      const eventId = `fav_followup_${fav.userId}_${fav.supplierId}_${new Date().toISOString().slice(0, 10)}`;
      const base = {
        favoriteId: fav.id,
        supplierId: fav.supplierId,
        eventId,
        eventType: 'user.favorites.followup',
      };
      await this.notificationsService.enqueueEmail({
        recipientUserId: fav.userId,
        templateKey: 'user.favorites.followup',
        data: base,
      });
      await this.notificationsService.enqueuePush({
        recipientUserId: fav.userId,
        templateKey: 'user.favorites.followup',
        data: base,
      });
      await this.notificationsService.enqueueSms({
        recipientUserId: fav.userId,
        templateKey: 'user.favorites.followup',
        data: base,
      });
    }
  }

  private async sweepDraftJobReminders(msDay: number) {
    const cutoff = new Date(Date.now() - 72 * 60 * 60 * 1000);
    const drafts = await this.prisma.jobPost.findMany({
      where: {
        status: 'DRAFT',
        updatedAt: { lte: cutoff },
      },
      take: 60,
    });
    for (const job of drafts) {
      const recent = await this.wasRecentlyNotified({
        templateKey: 'job.draft.reminder',
        recipientUserId: job.ownerUserId,
        sinceMs: 7 * msDay,
      });
      if (recent) {
        continue;
      }
      const eventId = `job_draft_${job.id}_${new Date().toISOString().slice(0, 10)}`;
      const base = {
        jobId: job.id,
        jobTitle: job.title,
        eventId,
        eventType: 'job.draft.reminder',
      };
      await this.notificationsService.enqueueEmail({
        recipientUserId: job.ownerUserId,
        templateKey: 'job.draft.reminder',
        data: base,
      });
      await this.notificationsService.enqueuePush({
        recipientUserId: job.ownerUserId,
        templateKey: 'job.draft.reminder',
        data: base,
      });
      await this.notificationsService.enqueueSms({
        recipientUserId: job.ownerUserId,
        templateKey: 'job.draft.reminder',
        data: base,
      });
    }
  }

  private async sweepSubscriptionRenewals(msDay: number) {
    const horizon = new Date(Date.now() + 7 * msDay);
    const subs = await this.prisma.supplierSubscription.findMany({
      where: {
        status: 'ACTIVE',
        canceledAt: null,
        nextBillingAt: {
          lte: horizon,
          gte: new Date(),
        },
      },
      take: 80,
    });
    for (const sub of subs) {
      const dayKey = sub.nextBillingAt.toISOString().slice(0, 10);
      const eventId = `sub_due_${sub.supplierId}_${dayKey}`;
      if (await this.hasProcessedEvent(eventId)) {
        continue;
      }
      const amount = String(sub.amount);
      const base = {
        subscriptionId: sub.id,
        supplierId: sub.supplierId,
        nextBillingAt: sub.nextBillingAt.toISOString(),
        amount,
        currency: sub.currency,
        eventId,
        eventType: 'supplier.subscription.due',
      };
      await this.notificationsService.enqueueEmail({
        recipientSupplierId: sub.supplierId,
        templateKey: 'supplier.subscription.due',
        data: base,
      });
      await this.notificationsService.enqueuePush({
        recipientSupplierId: sub.supplierId,
        templateKey: 'supplier.subscription.due',
        data: base,
      });
      await this.notificationsService.enqueueSms({
        recipientSupplierId: sub.supplierId,
        templateKey: 'supplier.subscription.due',
        data: base,
      });
    }
  }

  private enrichLeadNotificationPayload(payload: Record<string, unknown>): Record<string, unknown> {
    const businessName = typeof payload.businessName === 'string' ? payload.businessName : '';
    const jobTitle = typeof payload.jobTitle === 'string' ? payload.jobTitle : '';
    const source = payload.leadSource;
    let leadSourceLabel = 'Activity';
    let leadSummary = `Someone engaged with "${businessName}" on Event Marketplace.`;
    let leadShort = 'New engagement with your profile.';
    if (source === 'favorite') {
      leadSourceLabel = 'Favorite';
      leadSummary = `A client saved "${businessName}" to their favorites.`;
      leadShort = 'A client favorited your business.';
    } else if (source === 'share') {
      leadSourceLabel = 'Profile activity';
      const ch = typeof payload.shareChannel === 'string' && payload.shareChannel ? ` (${payload.shareChannel})` : '';
      leadSummary = `Someone interacted with your supplier profile for "${businessName}"${ch}.`;
      leadShort = 'Profile share or view activity.';
    } else if (source === 'shortlisted') {
      leadSourceLabel = 'Shortlisted';
      leadSummary = `Your application for "${jobTitle}" was shortlisted by the job owner.`;
      leadShort = 'Your job application was shortlisted.';
    }
    return {
      ...payload,
      leadSourceLabel,
      leadSummary,
      leadShort,
    };
  }

  /** Logged-in users who tracked a profile visit (share event) but never favorited that supplier (PRD follow-up after viewing). */
  private async sweepSupplierProfileViewFollowUps(msDay: number) {
    const now = Date.now();
    const minAgeMs = 48 * 60 * 60 * 1000;
    const maxAgeMs = 21 * msDay;
    const shares = await this.prisma.supplierShareEvent.findMany({
      where: {
        userId: { not: null },
        createdAt: {
          lte: new Date(now - minAgeMs),
          gte: new Date(now - maxAgeMs),
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 120,
      select: {
        userId: true,
        supplierId: true,
        supplier: { select: { businessName: true } },
      },
    });
    const seenPairs = new Set<string>();
    for (const row of shares) {
      if (!row.userId) {
        continue;
      }
      const pairKey = `${row.userId}_${row.supplierId}`;
      if (seenPairs.has(pairKey)) {
        continue;
      }
      seenPairs.add(pairKey);
      const fav = await this.prisma.favoriteSupplier.findFirst({
        where: { userId: row.userId, supplierId: row.supplierId },
        select: { id: true },
      });
      if (fav) {
        continue;
      }
      const weekKey = new Date().toISOString().slice(0, 7);
      const eventId = `view_followup_${row.userId}_${row.supplierId}_${weekKey}`;
      if (await this.hasProcessedEvent(eventId)) {
        continue;
      }
      const supplierName = row.supplier.businessName;
      const base = {
        supplierId: row.supplierId,
        supplierName,
        eventId,
        eventType: 'user.supplier.view.followup',
      };
      await this.notificationsService.enqueueEmail({
        recipientUserId: row.userId,
        templateKey: 'user.supplier.view.followup',
        data: base,
      });
      await this.notificationsService.enqueuePush({
        recipientUserId: row.userId,
        templateKey: 'user.supplier.view.followup',
        data: base,
      });
      await this.notificationsService.enqueueSms({
        recipientUserId: row.userId,
        templateKey: 'user.supplier.view.followup',
        data: base,
      });
    }
  }

  private async sweepUserInactivityReminders(msDay: number) {
    const inactiveAfterMs = 30 * msDay;
    const dedupeMs = 90 * msDay;
    const cutoff = new Date(Date.now() - inactiveAfterMs);
    const users = await this.prisma.user.findMany({
      where: {
        status: 'ACTIVE',
        updatedAt: { lte: cutoff },
        deletedAt: null,
        roles: { some: { role: 'USER' } },
      },
      select: { id: true },
      take: 80,
    });
    for (const u of users) {
      const recent = await this.wasRecentlyNotified({
        templateKey: 'user.inactivity.reminder',
        recipientUserId: u.id,
        sinceMs: dedupeMs,
      });
      if (recent) {
        continue;
      }
      const eventId = `user_inactive_${u.id}_${new Date().toISOString().slice(0, 7)}`;
      if (await this.hasProcessedEvent(eventId)) {
        continue;
      }
      const base = {
        userId: u.id,
        eventId,
        eventType: 'user.inactivity.reminder',
      };
      await this.notificationsService.enqueueEmail({
        recipientUserId: u.id,
        templateKey: 'user.inactivity.reminder',
        data: base,
      });
      await this.notificationsService.enqueuePush({
        recipientUserId: u.id,
        templateKey: 'user.inactivity.reminder',
        data: base,
      });
      await this.notificationsService.enqueueSms({
        recipientUserId: u.id,
        templateKey: 'user.inactivity.reminder',
        data: base,
      });
    }
  }

  private async sweepSupplierInactivityReminders(msDay: number) {
    const staleMs = 45 * msDay;
    const appWindowMs = 60 * msDay;
    const dedupeMs = 90 * msDay;
    const staleCutoff = new Date(Date.now() - staleMs);
    const appCutoff = new Date(Date.now() - appWindowMs);
    const suppliers = await this.prisma.supplier.findMany({
      where: {
        approvalStatus: 'APPROVED',
        isActive: true,
        deletedAt: null,
        updatedAt: { lte: staleCutoff },
        applications: { none: { submittedAt: { gte: appCutoff } } },
      },
      select: { id: true, businessName: true },
      take: 80,
    });
    for (const s of suppliers) {
      const recent = await this.wasRecentlyNotified({
        templateKey: 'supplier.inactivity.reminder',
        recipientSupplierId: s.id,
        sinceMs: dedupeMs,
      });
      if (recent) {
        continue;
      }
      const eventId = `supplier_inactive_${s.id}_${new Date().toISOString().slice(0, 7)}`;
      if (await this.hasProcessedEvent(eventId)) {
        continue;
      }
      const base = {
        supplierId: s.id,
        businessName: s.businessName,
        eventId,
        eventType: 'supplier.inactivity.reminder',
      };
      await this.notificationsService.enqueueEmail({
        recipientSupplierId: s.id,
        templateKey: 'supplier.inactivity.reminder',
        data: base,
      });
      await this.notificationsService.enqueuePush({
        recipientSupplierId: s.id,
        templateKey: 'supplier.inactivity.reminder',
        data: base,
      });
      await this.notificationsService.enqueueSms({
        recipientSupplierId: s.id,
        templateKey: 'supplier.inactivity.reminder',
        data: base,
      });
    }
  }

  private async sweepAdminLeadsDigest() {
    const email = process.env.ADMIN_ALERT_EMAIL?.trim();
    if (!email || process.env.ADMIN_LEADS_DIGEST_ENABLED !== 'true') {
      return;
    }
    const eventId = `admin_digest_leads_${new Date().toISOString().slice(0, 10)}`;
    if (await this.hasProcessedEvent(eventId)) {
      return;
    }
    const since = new Date(Date.now() - 86_400_000);
    const [favoritesCount, shareEventsCount] = await Promise.all([
      this.prisma.favoriteSupplier.count({ where: { createdAt: { gte: since } } }),
      this.prisma.supplierShareEvent.count({ where: { createdAt: { gte: since } } }),
    ]);
    await this.notificationsService.enqueueEmail({
      templateKey: 'admin.digest.leads',
      data: {
        email,
        favoritesCount,
        shareEventsCount,
        eventId,
        eventType: 'admin.digest.leads',
      },
    });
  }

  private async sweepAdminInactiveSuppliersDigest() {
    const email = process.env.ADMIN_ALERT_EMAIL?.trim();
    if (!email || process.env.ADMIN_INACTIVE_SUPPLIERS_DIGEST_ENABLED !== 'true') {
      return;
    }
    const eventId = `admin_digest_inactive_suppliers_${new Date().toISOString().slice(0, 10)}`;
    if (await this.hasProcessedEvent(eventId)) {
      return;
    }
    const staleCutoff = new Date(Date.now() - 45 * 86_400_000);
    const appCutoff = new Date(Date.now() - 60 * 86_400_000);
    const inactiveSupplierCount = await this.prisma.supplier.count({
      where: {
        approvalStatus: 'APPROVED',
        isActive: true,
        deletedAt: null,
        updatedAt: { lte: staleCutoff },
        applications: { none: { submittedAt: { gte: appCutoff } } },
      },
    });
    await this.notificationsService.enqueueEmail({
      templateKey: 'admin.digest.inactive_suppliers',
      data: {
        email,
        inactiveSupplierCount,
        eventId,
        eventType: 'admin.digest.inactive_suppliers',
      },
    });
  }

  private async sweepAdminAiFailureAlert() {
    const email = process.env.ADMIN_ALERT_EMAIL?.trim();
    if (!email || process.env.ADMIN_AI_FAILURE_ALERT_ENABLED !== 'true') {
      return;
    }
    const windowHours = Math.max(
      1,
      Math.min(168, Math.floor(Number(process.env.ADMIN_AI_FAILURE_WINDOW_HOURS ?? 24)) || 24),
    );
    const minFailures = Math.max(1, Math.floor(Number(process.env.ADMIN_AI_FAILURE_MIN_COUNT ?? 25)) || 25);
    const since = new Date(Date.now() - windowHours * 3_600_000);
    const failureCount = await this.prisma.aiRecommendationLog.count({
      where: { failureTag: { not: null }, createdAt: { gte: since } },
    });
    if (failureCount < minFailures) {
      return;
    }
    const eventId = `admin_ai_failures_${new Date().toISOString().slice(0, 10)}`;
    if (await this.hasProcessedEvent(eventId)) {
      return;
    }
    await this.notificationsService.enqueueEmail({
      templateKey: 'admin.alert.ai.failures',
      data: {
        email,
        failureCount,
        windowHours: String(windowHours),
        eventId,
        eventType: 'admin.alert.ai.failures',
      },
    });
  }

  private async sweepAdminIncompleteDigest() {
    const email = process.env.ADMIN_ALERT_EMAIL?.trim();
    if (!email || process.env.ADMIN_INCOMPLETE_DIGEST_ENABLED !== 'true') {
      return;
    }
    const eventId = `admin_digest_incomplete_${new Date().toISOString().slice(0, 10)}`;
    if (await this.hasProcessedEvent(eventId)) {
      return;
    }
    const incompleteDraftCount = await this.prisma.supplierDraft.count({
      where: { completionPercent: { lt: 100 } },
    });
    await this.notificationsService.enqueueEmail({
      templateKey: 'admin.digest.incomplete',
      data: {
        email,
        incompleteDraftCount,
        eventId,
        eventType: 'admin.digest.incomplete',
      },
    });
  }

  private async wasRecentlyNotified(params: {
    templateKey: string;
    recipientUserId?: string;
    recipientSupplierId?: string;
    sinceMs: number;
  }) {
    const since = new Date(Date.now() - params.sinceMs);
    const row = await this.prisma.notification.findFirst({
      where: {
        templateKey: params.templateKey,
        recipientUserId: params.recipientUserId ?? null,
        recipientSupplierId: params.recipientSupplierId ?? null,
        createdAt: { gte: since },
      },
      select: { id: true },
    });
    return Boolean(row);
  }

  private async hasProcessedEvent(eventId: string) {
    const existing = await this.prisma.notification.findFirst({
      where: {
        payloadJson: {
          path: ['eventId'],
          equals: eventId,
        },
      } as never,
      select: { id: true },
    });
    return Boolean(existing);
  }
}
