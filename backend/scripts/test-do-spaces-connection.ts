/**
 * Verifies DigitalOcean Spaces configuration from backend/.env (same vars as MediaStorageService).
 *
 * Usage (from backend/):
 *   npx ts-node scripts/test-do-spaces-connection.ts
 *   npx ts-node scripts/test-do-spaces-connection.ts --presign   # also builds a presigned PUT URL (no upload)
 *   npx ts-node scripts/test-do-spaces-connection.ts --upload      # PUT tiny object + HeadObject + Delete (full round-trip)
 *
 * Requires: DO_SPACES_ENDPOINT, DO_SPACES_BUCKET, DO_SPACES_REGION, DO_SPACES_KEY, DO_SPACES_SECRET, DO_SPACES_PUBLIC_BASE_URL
 */

import { HeadBucketCommand, HeadObjectCommand, PutObjectCommand, DeleteObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { randomUUID } from 'crypto';
import { existsSync, readFileSync } from 'fs';
import { join } from 'path';

function loadEnvFromFile(filePath: string): void {
  if (!existsSync(filePath)) {
    return;
  }
  const raw = readFileSync(filePath, 'utf8');
  for (const line of raw.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq <= 0) continue;
    const key = trimmed.slice(0, eq).trim();
    let val = trimmed.slice(eq + 1).trim();
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1);
    }
    if (process.env[key] === undefined) {
      process.env[key] = val;
    }
  }
}

function createClient(config: {
  endpoint: string;
  region: string;
  accessKeyId: string;
  secretAccessKey: string;
}): S3Client {
  return new S3Client({
    region: config.region,
    endpoint: `https://${config.endpoint}`,
    credentials: {
      accessKeyId: config.accessKeyId,
      secretAccessKey: config.secretAccessKey,
    },
    forcePathStyle: false,
  });
}

function requireConfig(): {
  endpoint: string;
  bucket: string;
  region: string;
  accessKeyId: string;
  secretAccessKey: string;
  publicBaseUrl: string;
} {
  const endpoint = process.env.DO_SPACES_ENDPOINT;
  const bucket = process.env.DO_SPACES_BUCKET;
  const region = process.env.DO_SPACES_REGION ?? 'fra1';
  const accessKeyId = process.env.DO_SPACES_KEY;
  const secretAccessKey = process.env.DO_SPACES_SECRET;
  const publicBaseUrl = process.env.DO_SPACES_PUBLIC_BASE_URL;

  const missing: string[] = [];
  if (!endpoint) missing.push('DO_SPACES_ENDPOINT');
  if (!bucket) missing.push('DO_SPACES_BUCKET');
  if (!accessKeyId) missing.push('DO_SPACES_KEY');
  if (!secretAccessKey) missing.push('DO_SPACES_SECRET');
  if (!publicBaseUrl) missing.push('DO_SPACES_PUBLIC_BASE_URL');

  if (missing.length > 0) {
    console.error('Missing env vars:', missing.join(', '));
    console.error('Set them in backend/.env (see .env.example).');
    process.exit(1);
  }

  return {
    endpoint: endpoint!,
    bucket: bucket!,
    region,
    accessKeyId: accessKeyId!,
    secretAccessKey: secretAccessKey!,
    publicBaseUrl: publicBaseUrl!,
  };
}

async function main(): Promise<void> {
  const envPath = join(__dirname, '..', '.env');
  loadEnvFromFile(envPath);
  if (!existsSync(envPath)) {
    console.warn(`No file at ${envPath} — using process.env only.\n`);
  }

  const args = process.argv.slice(2);
  const wantPresign = args.includes('--presign');
  const wantUpload = args.includes('--upload');

  const config = requireConfig();
  const client = createClient({
    endpoint: config.endpoint,
    region: config.region,
    accessKeyId: config.accessKeyId,
    secretAccessKey: config.secretAccessKey,
  });

  console.log('DigitalOcean Spaces connection test');
  console.log('  endpoint:', config.endpoint);
  console.log('  region:', config.region);
  console.log('  bucket:', config.bucket);
  console.log('  publicBaseUrl:', config.publicBaseUrl);
  console.log('');

  try {
    await client.send(new HeadBucketCommand({ Bucket: config.bucket }));
    console.log('✓ HeadBucket: OK (credentials and bucket name are valid)');
  } catch (err: unknown) {
    const e = err as { name?: string; $metadata?: { httpStatusCode?: number }; message?: string };
    console.error('✗ HeadBucket failed:', e.name ?? err);
    console.error('  HTTP:', e.$metadata?.httpStatusCode);
    console.error('  Message:', e.message);
    process.exit(1);
  }

  if (wantPresign || wantUpload) {
    const testKey = `_healthcheck/${randomUUID()}.txt`;
    const put = new PutObjectCommand({
      Bucket: config.bucket,
      Key: testKey,
      ContentType: 'text/plain',
      ACL: 'public-read',
    });
    const uploadUrl = await getSignedUrl(client, put, { expiresIn: 600 });
    console.log('');
    console.log('✓ Presigned PUT URL generated (expires in 600s)');
    console.log('  key:', testKey);

    if (wantUpload) {
      const body = `do-spaces-test ${new Date().toISOString()}`;
      const res = await fetch(uploadUrl, {
        method: 'PUT',
        headers: { 'Content-Type': 'text/plain' },
        body,
      });
      if (!res.ok) {
        console.error('✗ Upload HTTP', res.status, await res.text());
        process.exit(1);
      }
      console.log('✓ PUT upload succeeded');

      const head = await client.send(
        new HeadObjectCommand({
          Bucket: config.bucket,
          Key: testKey,
        }),
      );
      console.log('✓ HeadObject:', 'ContentLength=', head.ContentLength, 'ETag=', head.ETag);

      await client.send(
        new DeleteObjectCommand({
          Bucket: config.bucket,
          Key: testKey,
        }),
      );
      console.log('✓ DeleteObject: removed test key');
    }
  }

  console.log('');
  console.log('All checks passed.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
