import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { App, cert, getApps, initializeApp } from 'firebase-admin/app';
import { getMessaging } from 'firebase-admin/messaging';
import nodemailer, { Transporter } from 'nodemailer';
import Twilio from 'twilio';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class NotificationsService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(NotificationsService.name);
  private workerTimer: NodeJS.Timeout | null = null;
  private isDispatching = false;
  private firebaseApp: App | null = null;
  private smtpTransporter: Transporter | null = null;

  constructor(private readonly prisma: PrismaService) {}

  onModuleInit() {
    const enabled = process.env.NOTIFICATION_WORKER_ENABLED === 'true';
    if (!enabled) {
      return;
    }
    const intervalMs = this.getWorkerIntervalMs();
    this.workerTimer = setInterval(() => {
      void this.dispatchPendingEmails().catch((error: unknown) => {
        this.logger.error('notification.worker.tick.failed', error as Error);
      });
    }, intervalMs);
    this.logger.log(`notification.worker.started intervalMs=${intervalMs}`);
  }

  onModuleDestroy() {
    if (this.workerTimer) {
      clearInterval(this.workerTimer);
      this.workerTimer = null;
    }
  }

  async enqueueEmail(payload: {
    recipientUserId?: string;
    recipientSupplierId?: string;
    templateKey: string;
    data: Record<string, unknown>;
    scheduledAt?: Date;
  }) {
    const allowed = await this.shouldEnqueueChannel({
      templateKey: payload.templateKey,
      channel: 'EMAIL',
      recipientUserId: payload.recipientUserId,
      recipientSupplierId: payload.recipientSupplierId,
    });
    if (!allowed) {
      return { skipped: true, channel: 'EMAIL', templateKey: payload.templateKey };
    }
    const notification = await this.prisma.notification.create({
      data: {
        recipientUserId: payload.recipientUserId ?? null,
        recipientSupplierId: payload.recipientSupplierId ?? null,
        channel: 'EMAIL',
        templateKey: payload.templateKey,
        payloadJson: payload.data as Prisma.InputJsonValue,
        scheduledAt: payload.scheduledAt ?? null,
      },
    });
    this.logger.log(`notification.queued ${notification.id}`);
    return notification;
  }

  async enqueuePush(payload: {
    recipientUserId?: string;
    recipientSupplierId?: string;
    templateKey: string;
    data: Record<string, unknown>;
    scheduledAt?: Date;
  }) {
    const allowed = await this.shouldEnqueueChannel({
      templateKey: payload.templateKey,
      channel: 'PUSH',
      recipientUserId: payload.recipientUserId,
      recipientSupplierId: payload.recipientSupplierId,
    });
    if (!allowed) {
      return { skipped: true, channel: 'PUSH', templateKey: payload.templateKey };
    }
    const notification = await this.prisma.notification.create({
      data: {
        recipientUserId: payload.recipientUserId ?? null,
        recipientSupplierId: payload.recipientSupplierId ?? null,
        channel: 'PUSH',
        templateKey: payload.templateKey,
        payloadJson: payload.data as Prisma.InputJsonValue,
        scheduledAt: payload.scheduledAt ?? null,
      },
    });
    this.logger.log(`notification.queued ${notification.id}`);
    return notification;
  }

  async enqueueSms(payload: {
    recipientUserId?: string;
    recipientSupplierId?: string;
    templateKey: string;
    data: Record<string, unknown>;
    scheduledAt?: Date;
  }) {
    const allowed = await this.shouldEnqueueChannel({
      templateKey: payload.templateKey,
      channel: 'SMS',
      recipientUserId: payload.recipientUserId,
      recipientSupplierId: payload.recipientSupplierId,
    });
    if (!allowed) {
      return { skipped: true, channel: 'SMS', templateKey: payload.templateKey };
    }
    const notification = await this.prisma.notification.create({
      data: {
        recipientUserId: payload.recipientUserId ?? null,
        recipientSupplierId: payload.recipientSupplierId ?? null,
        channel: 'SMS',
        templateKey: payload.templateKey,
        payloadJson: payload.data as Prisma.InputJsonValue,
        scheduledAt: payload.scheduledAt ?? null,
      },
    });
    this.logger.log(`notification.queued ${notification.id}`);
    return notification;
  }

  async registerPushTokenForUser(userId: string, token: string, platform?: string) {
    const supplier = await this.prisma.supplier.findUnique({
      where: { ownerUserId: userId },
      select: { id: true },
    });
    return this.prisma.pushDeviceToken.upsert({
      where: { token },
      create: {
        userId,
        supplierId: supplier?.id ?? null,
        token,
        platform: platform ?? null,
        isActive: true,
        lastSeenAt: new Date(),
      },
      update: {
        userId,
        supplierId: supplier?.id ?? null,
        platform: platform ?? undefined,
        isActive: true,
        lastSeenAt: new Date(),
      },
    });
  }

  async deactivatePushTokenForUser(userId: string, token: string) {
    return this.prisma.pushDeviceToken.updateMany({
      where: { userId, token },
      data: { isActive: false },
    });
  }

  async getNotificationPreferences(userId: string) {
    const pref = await this.prisma.notificationPreference.findUnique({ where: { userId } });
    return {
      items: [
        {
          userId,
          emailEnabled: pref?.emailEnabled ?? true,
          pushEnabled: pref?.pushEnabled ?? true,
          mutedTemplates: this.readMutedTemplates(pref?.mutedTemplatesJson),
        },
      ],
      totalItems: 1,
    };
  }

  async updateNotificationPreferences(
    userId: string,
    payload: { emailEnabled?: boolean; pushEnabled?: boolean; mutedTemplates?: string[] },
  ) {
    const updated = await this.prisma.notificationPreference.upsert({
      where: { userId },
      create: {
        userId,
        emailEnabled: payload.emailEnabled ?? true,
        pushEnabled: payload.pushEnabled ?? true,
        mutedTemplatesJson:
          payload.mutedTemplates === undefined ? Prisma.JsonNull : (payload.mutedTemplates as Prisma.InputJsonValue),
      },
      update: {
        emailEnabled: payload.emailEnabled ?? undefined,
        pushEnabled: payload.pushEnabled ?? undefined,
        mutedTemplatesJson:
          payload.mutedTemplates === undefined ? undefined : (payload.mutedTemplates as Prisma.InputJsonValue),
      },
    });
    return {
      items: [
        {
          userId: updated.userId,
          emailEnabled: updated.emailEnabled,
          pushEnabled: updated.pushEnabled,
          mutedTemplates: this.readMutedTemplates(updated.mutedTemplatesJson),
        },
      ],
      totalItems: 1,
    };
  }

  async dispatchPendingEmails(limit = 50) {
    if (this.isDispatching) {
      return { attempted: 0, sent: 0, failed: 0, deferred: true };
    }
    this.isDispatching = true;
    const pending = await this.prisma.notification.findMany({
      where: {
        channel: { in: ['EMAIL', 'PUSH', 'SMS'] },
        status: 'PENDING',
        OR: [{ scheduledAt: null }, { scheduledAt: { lte: new Date() } }],
      },
      orderBy: { createdAt: 'asc' },
      take: Math.max(1, Math.min(limit, 200)),
    });

    let sent = 0;
    let failed = 0;
    try {
      for (const notification of pending) {
        const payload = this.toPayloadRecord(notification.payloadJson);
        const attempts = this.getAttemptCount(payload);
        try {
          const template = await this.prisma.notificationTemplate.findUnique({
            where: { key: notification.templateKey },
          });
          if (!template) {
            await this.failNotification(notification.id, 'TEMPLATE_NOT_FOUND', attempts, payload);
            failed += 1;
            continue;
          }
          if (!template.isActive) {
            await this.failNotification(notification.id, 'TEMPLATE_INACTIVE', attempts, payload);
            failed += 1;
            continue;
          }

          const renderedSubject = this.renderTemplate(template.subjectTemplate ?? '', payload);
          const renderedBody = this.renderTemplate(template.bodyTemplate, payload);
          const providerMessageId = await this.sendNotificationViaProvider({
            channel:
              notification.channel === 'PUSH' ? 'PUSH' : notification.channel === 'SMS' ? 'SMS' : 'EMAIL',
            notificationId: notification.id,
            templateKey: notification.templateKey,
            subject: renderedSubject,
            body: renderedBody,
            payload,
            recipientUserId: notification.recipientUserId ?? undefined,
            recipientSupplierId: notification.recipientSupplierId ?? undefined,
          });

          await this.prisma.notification.update({
            where: { id: notification.id },
            data: {
              status: 'SENT',
              sentAt: new Date(),
              providerMessageId,
              errorCode: null,
              payloadJson: {
                ...(payload as Prisma.InputJsonValue as Record<string, unknown>),
                _meta: {
                  ...(this.toMetaRecord(payload._meta)),
                  attempts: attempts + 1,
                  renderedSubject,
                },
              } as Prisma.InputJsonValue,
            },
          });
          sent += 1;
        } catch (error) {
          this.logger.error(`notification.dispatch.failed ${notification.id}`, error as Error);
          await this.failNotification(notification.id, 'DISPATCH_EXCEPTION', attempts, payload);
          failed += 1;
        }
      }
    } finally {
      this.isDispatching = false;
    }

    return {
      attempted: pending.length,
      sent,
      failed,
    };
  }

  getProviderHealth() {
    const emailConfigured = this.isSmtpConfigured();
    const pushConfigured = this.isFirebaseConfigured();
    const smsConfigured = this.isTwilioConfigured();
    return {
      email: { configured: emailConfigured, mode: emailConfigured ? 'smtp' : 'mock' },
      push: { configured: pushConfigured, mode: pushConfigured ? 'firebase' : 'mock' },
      sms: { configured: smsConfigured, mode: smsConfigured ? 'twilio' : 'mock' },
    };
  }

  private async failNotification(
    notificationId: string,
    code: string,
    attempts: number,
    payload: Record<string, unknown>,
  ) {
    const nextAttempts = attempts + 1;
    const maxAttempts = this.getMaxAttempts();
    if (nextAttempts >= maxAttempts) {
      await this.prisma.notification.update({
        where: { id: notificationId },
        data: {
          status: 'FAILED',
          errorCode: code,
          payloadJson: {
            ...payload,
            _meta: {
              ...(this.toMetaRecord(payload._meta)),
              attempts: nextAttempts,
              maxAttemptsReached: true,
            },
          } as Prisma.InputJsonValue,
        },
      });
      return;
    }

    await this.prisma.notification.update({
      where: { id: notificationId },
      data: {
        status: 'PENDING',
        errorCode: code,
        scheduledAt: new Date(Date.now() + this.getRetryDelayMs(nextAttempts)),
        payloadJson: {
          ...payload,
          _meta: {
            ...(this.toMetaRecord(payload._meta)),
            attempts: nextAttempts,
          },
        } as Prisma.InputJsonValue,
      },
    });
  }

  private renderTemplate(template: string, payload: Record<string, unknown>) {
    return template.replace(/\{\{\s*([a-zA-Z0-9_.-]+)\s*\}\}/g, (_match, key: string) => {
      const value = key.split('.').reduce<unknown>((acc, part) => {
        if (acc && typeof acc === 'object' && part in (acc as Record<string, unknown>)) {
          return (acc as Record<string, unknown>)[part];
        }
        return undefined;
      }, payload);
      return value === undefined || value === null ? '' : String(value);
    });
  }

  private async sendNotificationViaProvider(payload: {
    channel: 'EMAIL' | 'PUSH' | 'SMS';
    notificationId: string;
    templateKey: string;
    subject: string;
    body: string;
    payload: Record<string, unknown>;
    recipientUserId?: string;
    recipientSupplierId?: string;
  }) {
    if (payload.channel === 'PUSH') {
      return this.sendPushViaProvider(payload);
    }
    if (payload.channel === 'SMS') {
      return this.sendSmsViaProvider(payload);
    }
    if (!this.isSmtpConfigured()) {
      return `mock_email_${payload.notificationId}`;
    }

    const host = process.env.NOTIFICATION_SMTP_HOST;
    const port = Number(process.env.NOTIFICATION_SMTP_PORT ?? 587);
    const user = process.env.NOTIFICATION_SMTP_USER;
    const pass = process.env.NOTIFICATION_SMTP_PASS;
    const from = process.env.NOTIFICATION_SMTP_FROM;
    const to = await this.resolveEmailRecipient(payload);
    if (!host || !user || !pass || !from || !to) {
      throw new Error('SMTP email provider is not fully configured');
    }

    if (!this.smtpTransporter) {
      this.smtpTransporter = nodemailer.createTransport({
        host,
        port,
        secure: port === 465,
        auth: { user, pass },
      });
    }

    const result = await this.smtpTransporter.sendMail({
      from,
      to,
      subject: payload.subject || 'Event Marketplace',
      text: payload.body,
    });
    return result.messageId ?? `smtp_email_${payload.notificationId}`;
  }

  private async sendSmsViaProvider(
    payload: {
      notificationId: string;
      subject: string;
      body: string;
      payload: Record<string, unknown>;
      recipientUserId?: string;
      recipientSupplierId?: string;
    },
  ) {
    const to = await this.resolveSmsRecipient(payload);
    if (!to) {
      throw new Error('SMS_RECIPIENT_MISSING');
    }
    if (!this.isTwilioConfigured()) {
      return `mock_sms_${payload.notificationId}`;
    }
    const sid = process.env.NOTIFICATION_TWILIO_ACCOUNT_SID;
    const authToken = process.env.NOTIFICATION_TWILIO_AUTH_TOKEN;
    const from = process.env.NOTIFICATION_TWILIO_FROM;
    if (!sid || !authToken || !from) {
      throw new Error('TWILIO_SMS_PROVIDER_NOT_CONFIGURED');
    }
    const client = Twilio(sid, authToken);
    const message = await client.messages.create({
      from,
      to,
      body: payload.body,
    });
    return message.sid ?? `twilio_sms_${payload.notificationId}`;
  }

  private async sendPushViaProvider(
    payload: {
      notificationId: string;
      templateKey: string;
      subject: string;
      body: string;
      payload: Record<string, unknown>;
      recipientUserId?: string;
      recipientSupplierId?: string;
    },
  ) {
    const deviceTokens = await this.resolvePushTokens(payload);
    if (!deviceTokens.length) {
      throw new Error('PUSH_DEVICE_TOKEN_MISSING');
    }
    if (!this.isFirebaseConfigured()) {
      return `mock_push_${payload.notificationId}_${deviceTokens.length}`;
    }

    const firebaseApp = this.getOrCreateFirebaseApp();
    const messageIds: string[] = [];
    for (const token of deviceTokens) {
      try {
        const messageId = await getMessaging(firebaseApp).send({
          token,
          notification: {
            title: payload.subject || 'Event Marketplace',
            body: payload.body,
          },
          data: this.toStringRecord(payload.payload),
        });
        messageIds.push(messageId);
      } catch (error) {
        const code = (error as { code?: string })?.code;
        if (code === 'messaging/registration-token-not-registered' || code === 'messaging/invalid-registration-token') {
          await this.prisma.pushDeviceToken.updateMany({
            where: { token },
            data: { isActive: false },
          });
          continue;
        }
        throw error;
      }
    }
    if (!messageIds.length) {
      throw new Error('PUSH_DELIVERY_FAILED_ALL_TOKENS');
    }
    return messageIds.join(',');
  }

  private getWorkerIntervalMs() {
    const parsed = Number(process.env.NOTIFICATION_WORKER_INTERVAL_MS ?? 15000);
    if (!Number.isFinite(parsed) || parsed < 1000) {
      return 15000;
    }
    return Math.floor(parsed);
  }

  private isSmtpConfigured() {
    return Boolean(
      process.env.NOTIFICATION_SMTP_HOST &&
        process.env.NOTIFICATION_SMTP_USER &&
        process.env.NOTIFICATION_SMTP_PASS &&
        process.env.NOTIFICATION_SMTP_FROM,
    );
  }

  private isFirebaseConfigured() {
    return Boolean(process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PRIVATE_KEY);
  }

  private isTwilioConfigured() {
    return Boolean(
      process.env.NOTIFICATION_TWILIO_ACCOUNT_SID &&
        process.env.NOTIFICATION_TWILIO_AUTH_TOKEN &&
        process.env.NOTIFICATION_TWILIO_FROM,
    );
  }

  private getRetryDelayMs(attemptNumber: number) {
    const base = Number(process.env.NOTIFICATION_RETRY_BASE_MS ?? 1000);
    const clampedBase = Number.isFinite(base) && base > 0 ? base : 1000;
    return clampedBase * 2 ** Math.max(0, attemptNumber - 1);
  }

  private getMaxAttempts() {
    const parsed = Number(process.env.NOTIFICATION_MAX_ATTEMPTS ?? 3);
    if (!Number.isFinite(parsed) || parsed < 1) {
      return 3;
    }
    return Math.floor(parsed);
  }

  private toPayloadRecord(payload: unknown): Record<string, unknown> {
    return payload && typeof payload === 'object' ? (payload as Record<string, unknown>) : {};
  }

  private toMetaRecord(meta: unknown): Record<string, unknown> {
    return meta && typeof meta === 'object' ? (meta as Record<string, unknown>) : {};
  }

  private getAttemptCount(payload: Record<string, unknown>) {
    const raw = this.toMetaRecord(payload._meta).attempts;
    return typeof raw === 'number' && Number.isFinite(raw) && raw >= 0 ? Math.floor(raw) : 0;
  }

  private getOrCreateFirebaseApp() {
    if (this.firebaseApp) {
      return this.firebaseApp;
    }
    if (getApps().length > 0) {
      this.firebaseApp = getApps()[0]!;
      return this.firebaseApp;
    }
    const projectId = process.env.FIREBASE_PROJECT_ID;
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
    const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');
    if (!projectId || !clientEmail || !privateKey) {
      throw new Error('Firebase credentials are not configured');
    }
    this.firebaseApp = initializeApp({
      credential: cert({ projectId, clientEmail, privateKey }),
    });
    return this.firebaseApp;
  }

  private extractDeviceToken(payload: Record<string, unknown>) {
    const token = payload.deviceToken ?? payload.fcmToken;
    return typeof token === 'string' && token.trim().length > 0 ? token : null;
  }

  private async resolvePushTokens(payload: {
    payload: Record<string, unknown>;
    recipientUserId?: string;
    recipientSupplierId?: string;
  }) {
    const direct = this.extractDeviceToken(payload.payload);
    if (direct) {
      return [direct];
    }
    const whereOr: Array<{ userId: string } | { supplierId: string }> = [];
    if (payload.recipientUserId) {
      whereOr.push({ userId: payload.recipientUserId });
    }
    if (payload.recipientSupplierId) {
      whereOr.push({ supplierId: payload.recipientSupplierId });
    }
    if (!whereOr.length) {
      return [];
    }
    const tokenRows = await this.prisma.pushDeviceToken.findMany({
      where: {
        isActive: true,
        OR: whereOr,
      },
      orderBy: { lastSeenAt: 'desc' },
      select: { token: true },
    });
    return tokenRows.map((row) => row.token);
  }

  private toStringRecord(payload: Record<string, unknown>) {
    const entries = Object.entries(payload).filter(([key]) => key !== '_meta');
    return Object.fromEntries(entries.map(([key, value]) => [key, value === undefined || value === null ? '' : String(value)]));
  }

  private async shouldEnqueueChannel(payload: {
    channel: 'EMAIL' | 'PUSH' | 'SMS';
    templateKey: string;
    recipientUserId?: string;
    recipientSupplierId?: string;
  }) {
    const preferenceUserId = await this.resolvePreferenceUserId(payload.recipientUserId, payload.recipientSupplierId);
    if (!preferenceUserId) {
      return true;
    }
    const pref = await this.prisma.notificationPreference.findUnique({
      where: { userId: preferenceUserId },
    });
    if (!pref) {
      return true;
    }
    const enabled = payload.channel === 'EMAIL' ? pref.emailEnabled : payload.channel === 'PUSH' ? pref.pushEnabled : true;
    if (!enabled) {
      return false;
    }
    const mutedTemplates = this.readMutedTemplates(pref.mutedTemplatesJson);
    if (mutedTemplates.includes(payload.templateKey)) {
      return false;
    }
    return true;
  }

  private async resolvePreferenceUserId(recipientUserId?: string, recipientSupplierId?: string) {
    if (recipientUserId) {
      return recipientUserId;
    }
    if (!recipientSupplierId) {
      return null;
    }
    const supplier = await this.prisma.supplier.findUnique({
      where: { id: recipientSupplierId },
      select: { ownerUserId: true },
    });
    return supplier?.ownerUserId ?? null;
  }

  private readMutedTemplates(value: unknown) {
    return Array.isArray(value) ? value.filter((item): item is string => typeof item === 'string') : [];
  }

  private async resolveEmailRecipient(payload: {
    payload: Record<string, unknown>;
    recipientUserId?: string;
    recipientSupplierId?: string;
  }) {
    const direct = payload.payload.email;
    if (typeof direct === 'string' && direct.includes('@')) {
      return direct;
    }
    if (payload.recipientUserId) {
      const user = await this.prisma.user.findUnique({
        where: { id: payload.recipientUserId },
        select: { email: true },
      });
      if (user?.email) {
        return user.email;
      }
    }
    if (payload.recipientSupplierId) {
      const supplier = await this.prisma.supplier.findUnique({
        where: { id: payload.recipientSupplierId },
        include: { owner: { select: { email: true } } },
      });
      if (supplier?.owner?.email) {
        return supplier.owner.email;
      }
    }
    return null;
  }

  private async resolveSmsRecipient(payload: {
    payload: Record<string, unknown>;
    recipientUserId?: string;
    recipientSupplierId?: string;
  }) {
    const direct = payload.payload.phone ?? payload.payload.phoneNumber;
    if (typeof direct === 'string' && direct.trim().length > 4) {
      return direct.trim();
    }
    if (payload.recipientUserId) {
      const user = await this.prisma.user.findUnique({
        where: { id: payload.recipientUserId },
        select: { phone: true },
      });
      if (user?.phone) {
        return user.phone;
      }
    }
    if (payload.recipientSupplierId) {
      const supplier = await this.prisma.supplier.findUnique({
        where: { id: payload.recipientSupplierId },
        include: { owner: { select: { phone: true } } },
      });
      if (supplier?.owner?.phone) {
        return supplier.owner.phone;
      }
    }
    return null;
  }
}
