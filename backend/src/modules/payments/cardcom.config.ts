import { InternalServerErrorException } from '@nestjs/common';

export function requireEnv(name: string): string {
  const v = process.env[name];
  if (!v || !v.trim()) {
    throw new InternalServerErrorException(`Missing required environment variable: ${name}`);
  }
  return v.trim();
}

export function optionalEnv(name: string): string | undefined {
  const v = process.env[name];
  return v?.trim() || undefined;
}

export function cardcomTerminalNumber(): number {
  const raw = requireEnv('CARDCOM_TERMINAL_NUMBER');
  const n = Number.parseInt(raw, 10);
  if (!Number.isFinite(n)) {
    throw new InternalServerErrorException('CARDCOM_TERMINAL_NUMBER must be an integer');
  }
  return n;
}

export function cardcomBillGoldUserId(): number {
  const raw = optionalEnv('CARDCOM_BILLGOLD_USER_ID') ?? '0';
  const n = Number.parseInt(raw, 10);
  return Number.isFinite(n) ? n : 0;
}

export function buildPublicIndicatorUrl(): string {
  const base = requireEnv('CARDCOM_PUBLIC_APP_BASE_URL').replace(/\/$/, '');
  const secret = optionalEnv('CARDCOM_WEBHOOK_SHARED_SECRET');
  const path = `${base}/v1/webhooks/cardcom/indicator`;
  return secret ? `${path}?s=${encodeURIComponent(secret)}` : path;
}

export function defaultRedirectUrls(): { success: string; error: string; cancel: string } {
  return {
    success: requireEnv('CARDCOM_SUCCESS_REDIRECT_URL'),
    error: requireEnv('CARDCOM_ERROR_REDIRECT_URL'),
    cancel: requireEnv('CARDCOM_CANCEL_REDIRECT_URL'),
  };
}
