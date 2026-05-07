import { BadRequestException, Injectable, Logger } from '@nestjs/common';

export interface SmsSendOtpResult {
  ok: boolean;
  mode: 'fixed' | 'live';
  providerStatus?: number | string;
  providerMessage?: string;
}

@Injectable()
export class SmsService {
  private readonly logger = new Logger(SmsService.name);

  isFixedMode(): boolean {
    return process.env.AUTH_FIXED_OTP_ENABLED === 'true';
  }

  /**
   * Normalize a phone number to the 019sms expected format `05XXXXXXXX` (10 digits, Israeli mobile).
   * Accepts inputs like `+9725XXXXXXXX`, `9725XXXXXXXX`, `05XXXXXXXX`, `5XXXXXXXX`.
   * Throws BadRequestException for anything else.
   */
  normalizeIsraeliMobile(rawPhone: string): string {
    if (!rawPhone || typeof rawPhone !== 'string') {
      throw new BadRequestException('Phone number is required');
    }
    const digitsOnly = rawPhone.replace(/[^\d]/g, '');
    let local: string | null = null;
    if (digitsOnly.startsWith('972')) {
      const rest = digitsOnly.slice(3);
      if (rest.startsWith('5') && rest.length === 9) {
        local = `0${rest}`;
      }
    } else if (digitsOnly.startsWith('05') && digitsOnly.length === 10) {
      local = digitsOnly;
    } else if (digitsOnly.startsWith('5') && digitsOnly.length === 9) {
      local = `0${digitsOnly}`;
    }
    if (!local || !/^05\d{8}$/.test(local)) {
      throw new BadRequestException('Phone number must be a valid Israeli mobile (e.g. 05XXXXXXXX)');
    }
    return local;
  }

  /**
   * Sends an OTP code to the destination phone via 019sms.
   * In fixed mode (AUTH_FIXED_OTP_ENABLED=true) this is a no-op - useful for local/dev when
   * 019sms credentials are not yet provisioned.
   *
   * The platform owns the OTP value (we generate, persist, and verify it locally).
   * 019sms is used purely as a transport: we inject the code via the `text` parameter
   * with a `[code]` placeholder, so we don't depend on their internal OTP store.
   */
  async sendOtp(phone: string, code: string): Promise<SmsSendOtpResult> {
    if (this.isFixedMode()) {
      this.logger.log(`sms.sendOtp.fixed phone=${this.maskPhone(phone)} (no provider call made)`);
      return { ok: true, mode: 'fixed' };
    }

    const baseUrl = process.env.SMS_019_API_BASE_URL || 'https://019sms.co.il/api';
    const username = process.env.SMS_019_USERNAME;
    const token = process.env.SMS_019_TOKEN;
    const source = process.env.SMS_019_SOURCE;
    const appId = Number(process.env.SMS_019_APP_ID ?? 1) || 1;
    const validTime = Math.max(1, Math.min(15, Number(process.env.OTP_VALID_MINUTES ?? 5) || 5));
    const maxTries = Math.max(3, Math.min(5, Number(process.env.OTP_MAX_ATTEMPTS ?? 5) || 5));

    if (!username || !token || !source) {
      throw new Error('SMS_019 provider is not fully configured (SMS_019_USERNAME / SMS_019_TOKEN / SMS_019_SOURCE)');
    }

    const body = {
      send_otp: {
        user: { username },
        phone,
        source,
        app_id: appId,
        valid_time: validTime,
        max_tries: maxTries,
        text: `Event Marketplace code: ${code}`,
      },
    };

    let response: Response;
    try {
      response = await fetch(baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });
    } catch (error) {
      this.logger.error('sms.sendOtp.network_failed', error as Error);
      throw new Error('SMS_PROVIDER_NETWORK_ERROR');
    }

    let parsed: unknown = null;
    try {
      parsed = await response.json();
    } catch {
      parsed = null;
    }

    const providerStatus = (parsed as { status?: number | string } | null)?.status;
    const providerMessage = (parsed as { message?: string } | null)?.message;

    if (!response.ok || (providerStatus !== undefined && Number(providerStatus) !== 0)) {
      this.logger.warn(
        `sms.sendOtp.provider_error phone=${this.maskPhone(phone)} status=${providerStatus} message=${providerMessage ?? ''}`,
      );
      throw new Error(
        `SMS_PROVIDER_ERROR status=${providerStatus ?? response.status} message=${providerMessage ?? response.statusText}`,
      );
    }

    this.logger.log(`sms.sendOtp.sent phone=${this.maskPhone(phone)} status=${providerStatus ?? 'ok'}`);
    return {
      ok: true,
      mode: 'live',
      providerStatus,
      providerMessage,
    };
  }

  private maskPhone(phone: string): string {
    if (phone.length <= 4) return '****';
    return `${phone.slice(0, 3)}***${phone.slice(-2)}`;
  }
}
