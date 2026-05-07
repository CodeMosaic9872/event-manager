import { BadRequestException, Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { compare, hash } from 'bcryptjs';
import { randomInt } from 'crypto';
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

  constructor(
    private readonly prisma: PrismaService,
    private readonly sms: SmsService,
  ) {}

  async requestOtp(rawPhone: string, purpose: OtpPurpose): Promise<RequestOtpResult> {
    this.assertPurpose(purpose);
    const phone = this.sms.normalizeIsraeliMobile(rawPhone);

    await this.prisma.otpRequest.updateMany({
      where: { phone, purpose, consumedAt: null },
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
        phone,
        purpose,
        codeHash,
        maxAttempts,
        expiresAt,
      },
    });

    const result = await this.sms.sendOtp(phone, code);
    this.logger.log(`otp.requested phone=${this.maskPhone(phone)} purpose=${purpose} mode=${result.mode}`);
    return {
      sent: true,
      message: fixed
        ? 'OTP created in fixed mode. Use AUTH_FIXED_OTP_CODE to verify.'
        : 'OTP sent successfully.',
      mode: result.mode,
      expiresAt,
    };
  }

  async verifyOtp(rawPhone: string, code: string, purpose: OtpPurpose): Promise<VerifyOtpResult> {
    this.assertPurpose(purpose);
    if (!code || !/^\d{4,8}$/.test(code)) {
      throw new BadRequestException('Invalid OTP format. Code must be 4-8 digits.');
    }
    const phone = this.sms.normalizeIsraeliMobile(rawPhone);

    const record = await this.prisma.otpRequest.findFirst({
      where: {
        phone,
        purpose,
        consumedAt: null,
        expiresAt: { gt: new Date() },
      },
      orderBy: { createdAt: 'desc' },
    });

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

    this.logger.log(`otp.verified phone=${this.maskPhone(phone)} purpose=${purpose}`);
    return { verified: true, message: 'OTP verified successfully.' };
  }

  async consumeVerifiedOtp(rawPhone: string, purpose: OtpPurpose): Promise<void> {
    this.assertPurpose(purpose);
    const phone = this.sms.normalizeIsraeliMobile(rawPhone);

    const record = await this.prisma.otpRequest.findFirst({
      where: {
        phone,
        purpose,
        consumedAt: null,
        verifiedAt: { not: null },
        expiresAt: { gt: new Date() },
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
}
