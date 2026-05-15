/**
 * Smoke-check CardCom-related environment variables and optional SOAP reachability.
 * Does not perform a real charge.
 *
 * Usage:
 *   npx ts-node scripts/test-cardcom-connection.ts
 *   npx ts-node scripts/test-cardcom-connection.ts --ping
 */
import { CardcomClient } from '../src/modules/payments/providers/cardcom.client';

function requireEnvVar(name: string): string {
  const v = process.env[name];
  if (!v?.trim()) throw new Error(`Missing ${name}`);
  return v.trim();
}

async function main() {
  const ping = process.argv.includes('--ping');
  console.log('CardCom configuration check\n');

  const keys = [
    'CARDCOM_TERMINAL_NUMBER',
    'CARDCOM_USERNAME',
    'CARDCOM_PUBLIC_APP_BASE_URL',
    'CARDCOM_SUCCESS_REDIRECT_URL',
    'CARDCOM_ERROR_REDIRECT_URL',
    'CARDCOM_CANCEL_REDIRECT_URL',
  ];
  const missing = keys.filter((k) => !process.env[k]?.trim());
  if (missing.length) {
    console.error('Missing env:', missing.join(', '));
    process.exitCode = 1;
    return;
  }

  const base = requireEnvVar('CARDCOM_PUBLIC_APP_BASE_URL').replace(/\/$/, '');
  const secret = process.env.CARDCOM_WEBHOOK_SHARED_SECRET?.trim();
  const indicator = secret
    ? `${base}/v1/webhooks/cardcom/indicator?s=${encodeURIComponent(secret)}`
    : `${base}/v1/webhooks/cardcom/indicator`;
  console.log('IndicatorUrl would be:', indicator);
  console.log('SOAP URL:', process.env.CARDCOM_SOAP_URL ?? 'https://secure.cardcom.solutions/Interface/BillGoldService.asmx');

  if (!ping) {
    console.log('\nPass --ping to send a minimal GetLowProfileIndicator SOAP call (expect SOAP fault / error in body).');
    return;
  }

  const terminal = Number.parseInt(requireEnvVar('CARDCOM_TERMINAL_NUMBER'), 10);
  const username = requireEnvVar('CARDCOM_USERNAME');
  const client = new CardcomClient();
  const fakeCode = '00000000-0000-0000-0000-000000000000';
  console.log('\nPinging GetLowProfileIndicator with dummy lowProfileCode...');
  try {
    const res = await client.getLowProfileIndicator(terminal, username, fakeCode);
    console.log('Parsed SOAP result:', res);
  } catch (e) {
    console.error('Request failed:', (e as Error).message);
    process.exitCode = 1;
  }
}

void main();
