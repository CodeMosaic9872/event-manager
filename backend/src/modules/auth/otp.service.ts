import { BadRequestException, Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { compare, hash } from 'bcryptjs';
import { randomInt } from 'crypto';
import nodemailer, { Transporter } from 'nodemailer';
import { PrismaService } from '../../prisma/prisma.service';
import { SmsService } from '../sms/sms.service';

export type OtpPurpose = 'register' | 'login';

const ALLOWED_PURPOSES: ReadonlyArray<OtpPurpose> = ['register', 'login'];

export interface RequestOtpResult {
  sent: boolean;
  message: string;
  mode: 'fixed' | 'live';
  expiresAt: Date;
}

export interface VerifyOtpResult {
  verified: true;
  message: string;
}

@Injectable()
export class OtpService {
  private readonly logger = new Logger(OtpService.name);
  private smtpTransporter: Transporter | null = null;

  constructor(
    private readonly prisma: PrismaService,
    private readonly sms: SmsService,
  ) {}

  async requestOtp(payload: { phone?: string; email?: string; purpose: OtpPurpose }): Promise<RequestOtpResult> {
    const target = this.resolveTarget(payload);
    const purpose = payload.purpose;
    this.assertPurpose(purpose);

    await this.prisma.otpRequest.updateMany({
      where: {
        purpose,
        consumedAt: null,
        ...(target.channel === 'PHONE' ? { phone: target.value } : { email: target.value }),
      },
      data: { consumedAt: new Date() },
    });

    const fixed = this.sms.isFixedMode();
    const code = fixed ? this.getFixedCode() : this.generateCode();
    const validMinutes = this.getValidMinutes();
    const maxAttempts = this.getMaxAttempts();
    const codeHash = await hash(code, 10);
    const expiresAt = new Date(Date.now() + validMinutes * 60_000);

    await this.prisma.otpRequest.create({
      data: {
        channel: target.channel,
        purpose,
        codeHash,
        maxAttempts,
        expiresAt,
        ...(target.channel === 'PHONE' ? { phone: target.value } : { email: target.value }),
      },
    });

    const mode = await this.dispatchOtp(target, code);
    this.logger.log(`otp.requested target=${this.maskTarget(target)} purpose=${purpose} mode=${mode}`);
    return {
      sent: true,
      message:
        fixed && target.channel === 'EMAIL'
          ? 'Email OTP created in fixed mode. Use AUTH_FIXED_OTP_CODE to verify.'
          : fixed
        ? 'OTP created in fixed mode. Use AUTH_FIXED_OTP_CODE to verify.'
        : target.channel === 'EMAIL'
          ? 'OTP email sent successfully.'
          : 'OTP sent successfully.',
      mode,
      expiresAt,
    };
  }

  async verifyOtp(payload: { phone?: string; email?: string; code: string; purpose: OtpPurpose }): Promise<VerifyOtpResult> {
    const target = this.resolveTarget(payload);
    const code = payload.code;
    const purpose = payload.purpose;
    this.assertPurpose(purpose);
    if (!code || !/^\d{4,8}$/.test(code)) {
      throw new BadRequestException('Invalid OTP format. Code must be 4-8 digits.');
    }

    const record = await this.findActiveRecord(target, purpose);

    if (!record) {
      throw new UnauthorizedException('No active OTP request found. Please request a new OTP.');
    }
    if (record.attempts >= record.maxAttempts) {
      throw new UnauthorizedException('OTP is locked due to too many failed attempts. Please request a new OTP.');
    }

    const isMatch = await compare(code, record.codeHash);
    if (!isMatch) {
      await this.prisma.otpRequest.update({
        where: { id: record.id },
        data: { attempts: { increment: 1 } },
      });
      throw new UnauthorizedException('Incorrect OTP code. Please try again.');
    }

    await this.prisma.otpRequest.update({
      where: { id: record.id },
      data: { verifiedAt: new Date() },
    });

    this.logger.log(`otp.verified target=${this.maskTarget(target)} purpose=${purpose}`);
    return { verified: true, message: 'OTP verified successfully.' };
  }

  /**
   * Verifies an OTP and immediately consumes it (single-use).
   * Used by flows like /auth/login to avoid a separate /auth/verify-otp call.
   */
  async verifyAndConsumeOtp(payload: { phone?: string; email?: string; code: string; purpose: OtpPurpose }): Promise<void> {
    const target = this.resolveTarget(payload);
    const code = payload.code;
    const purpose = payload.purpose;
    this.assertPurpose(purpose);
    if (!code || !/^\d{4,8}$/.test(code)) {
      throw new BadRequestException('Invalid OTP format. Code must be 4-8 digits.');
    }

    const record = await this.findActiveRecord(target, purpose);

    if (!record) {
      throw new UnauthorizedException('No active OTP request found. Please request a new OTP.');
    }
    if (record.attempts >= record.maxAttempts) {
      throw new UnauthorizedException('OTP is locked due to too many failed attempts. Please request a new OTP.');
    }

    const isMatch = await compare(code, record.codeHash);
    if (!isMatch) {
      await this.prisma.otpRequest.update({
        where: { id: record.id },
        data: { attempts: { increment: 1 } },
      });
      throw new UnauthorizedException('Incorrect OTP code. Please try again.');
    }

    await this.prisma.otpRequest.update({
      where: { id: record.id },
      data: { verifiedAt: new Date(), consumedAt: new Date() },
    });

    this.logger.log(`otp.verified_consumed target=${this.maskTarget(target)} purpose=${purpose}`);
  }

  async consumeVerifiedOtp(payload: { phone?: string; email?: string; purpose: OtpPurpose }): Promise<void> {
    const target = this.resolveTarget(payload);
    const purpose = payload.purpose;
    this.assertPurpose(purpose);

    const record = await this.prisma.otpRequest.findFirst({
      where: {
        purpose,
        consumedAt: null,
        verifiedAt: { not: null },
        expiresAt: { gt: new Date() },
        ...(target.channel === 'PHONE' ? { phone: target.value } : { email: target.value }),
      },
      orderBy: { createdAt: 'desc' },
    });

    if (!record) {
      throw new UnauthorizedException('Phone is not verified. Complete OTP verification and try again.');
    }

    await this.prisma.otpRequest.update({
      where: { id: record.id },
      data: { consumedAt: new Date() },
    });
  }

  private assertPurpose(purpose: OtpPurpose): void {
    if (!ALLOWED_PURPOSES.includes(purpose)) {
      throw new BadRequestException(`purpose must be one of: ${ALLOWED_PURPOSES.join(', ')}`);
    }
  }

  private getFixedCode(): string {
    const fixed = process.env.AUTH_FIXED_OTP_CODE?.trim();
    if (fixed && /^\d{4,8}$/.test(fixed)) {
      return fixed;
    }
    return '123456';
  }

  private generateCode(): string {
    return String(randomInt(100000, 1000000));
  }

  private getValidMinutes(): number {
    const parsed = Number(process.env.OTP_VALID_MINUTES ?? 5);
    if (!Number.isFinite(parsed) || parsed < 1) return 5;
    return Math.min(15, Math.floor(parsed));
  }

  private getMaxAttempts(): number {
    const parsed = Number(process.env.OTP_MAX_ATTEMPTS ?? 5);
    if (!Number.isFinite(parsed) || parsed < 1) return 5;
    return Math.min(10, Math.floor(parsed));
  }

  private maskPhone(phone: string): string {
    if (phone.length <= 4) return '****';
    return `${phone.slice(0, 3)}***${phone.slice(-2)}`;
  }

  private normalizeEmail(rawEmail: string): string {
    const normalized = rawEmail.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized)) {
      throw new BadRequestException('Email must be a valid email address.');
    }
    return normalized;
  }

  private resolveTarget(payload: { phone?: string; email?: string }): { channel: 'PHONE' | 'EMAIL'; value: string } {
    const hasPhone = Boolean(payload.phone);
    const hasEmail = Boolean(payload.email);
    if ((hasPhone && hasEmail) || (!hasPhone && !hasEmail)) {
      throw new BadRequestException('Provide either phone or email (exactly one).');
    }
    if (payload.phone) {
      return { channel: 'PHONE', value: this.sms.normalizeIsraeliMobile(payload.phone) };
    }
    return { channel: 'EMAIL', value: this.normalizeEmail(payload.email!) };
  }

  private async findActiveRecord(target: { channel: 'PHONE' | 'EMAIL'; value: string }, purpose: OtpPurpose) {
    return this.prisma.otpRequest.findFirst({
      where: {
        purpose,
        consumedAt: null,
        expiresAt: { gt: new Date() },
        ...(target.channel === 'PHONE' ? { phone: target.value } : { email: target.value }),
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  private async dispatchOtp(target: { channel: 'PHONE' | 'EMAIL'; value: string }, code: string): Promise<'fixed' | 'live'> {
    if (target.channel === 'PHONE') {
      const result = await this.sms.sendOtp(target.value, code);
      return result.mode;
    }

    if (this.sms.isFixedMode()) {
      this.logger.log(`otp.email.fixed target=${this.maskTarget(target)} (no provider call made)`);
      return 'fixed';
    }

    const host = process.env.NOTIFICATION_SMTP_HOST;
    const port = Number(process.env.NOTIFICATION_SMTP_PORT ?? 587);
    const user = process.env.NOTIFICATION_SMTP_USER;
    const pass = process.env.NOTIFICATION_SMTP_PASS;
    const from = process.env.OTP_EMAIL_FROM || process.env.NOTIFICATION_SMTP_FROM;

    if (!host || !user || !pass || !from) {
      throw new BadRequestException(
        'SMTP is not configured for email OTP. Set NOTIFICATION_SMTP_HOST, NOTIFICATION_SMTP_USER, NOTIFICATION_SMTP_PASS and OTP_EMAIL_FROM (or NOTIFICATION_SMTP_FROM).',
      );
    }

    if (!this.smtpTransporter) {
      this.smtpTransporter = nodemailer.createTransport({
        host,
        port,
        secure: port === 465,
        auth: { user, pass },
      });
    }

    await this.smtpTransporter.sendMail({
      from,
      to: target.value,
      subject: 'Your Event Marketplace OTP code',
      text: `Your OTP code is ${code}. It will expire in ${this.getValidMinutes()} minutes.`,
    });
    this.logger.log(`otp.email.sent target=${this.maskTarget(target)}`);
    return 'live';
  }

  private maskTarget(target: { channel: 'PHONE' | 'EMAIL'; value: string }): string {
    if (target.channel === 'PHONE') {
      return this.maskPhone(target.value);
    }
    const [local, domain = ''] = target.value.split('@');
    const localMasked = local.length <= 2 ? `${local[0] ?? '*'}*` : `${local.slice(0, 2)}***`;
    return `${localMasked}@${domain}`;
  }
}
