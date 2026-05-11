import { BadRequestException, Injectable } from '@nestjs/common';
import { HeadObjectCommand, PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { randomUUID } from 'crypto';

@Injectable()
export class MediaStorageService {
  private createClient(config: {
    endpoint: string;
    region: string;
    accessKeyId: string;
    secretAccessKey: string;
  }) {
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

  private getConfig() {
    const endpoint = process.env.DO_SPACES_ENDPOINT;
    const bucket = process.env.DO_SPACES_BUCKET;
    const region = process.env.DO_SPACES_REGION ?? 'fra1';
    const accessKeyId = process.env.DO_SPACES_KEY;
    const secretAccessKey = process.env.DO_SPACES_SECRET;
    const publicBaseUrl = process.env.DO_SPACES_PUBLIC_BASE_URL;

    if (!endpoint || !bucket || !accessKeyId || !secretAccessKey || !publicBaseUrl) {
      throw new BadRequestException('DigitalOcean Spaces is not configured');
    }

    return { endpoint, bucket, region, accessKeyId, secretAccessKey, publicBaseUrl };
  }

  private async headObject(key: string) {
    const config = this.getConfig();
    const client = this.createClient(config);
    const head = await client.send(
      new HeadObjectCommand({
        Bucket: config.bucket,
        Key: key,
      }),
    );
    return {
      key,
      publicUrl: `${config.publicBaseUrl}/${key}`,
      contentLength: head.ContentLength ?? 0,
      contentType: head.ContentType ?? null,
      etag: head.ETag ?? null,
      lastModified: head.LastModified ?? null,
    };
  }

  private async createSignedPutUrl(key: string, contentType: string) {
    const config = this.getConfig();
    const client = this.createClient(config);
    const command = new PutObjectCommand({
      Bucket: config.bucket,
      Key: key,
      ContentType: contentType,
      ACL: 'public-read',
    });
    const expiresIn = 60 * 10;
    const uploadUrl = await getSignedUrl(client, command, { expiresIn });
    return { uploadUrl, expiresInSeconds: expiresIn, publicBaseUrl: config.publicBaseUrl };
  }

  async createUploadUrl(input: { supplierId: string; fileName: string; contentType: string }) {
    const safeFileName = input.fileName.replace(/[^a-zA-Z0-9._-]/g, '_');
    const key = `suppliers/${input.supplierId}/${randomUUID()}-${safeFileName}`;
    const { uploadUrl, expiresInSeconds, publicBaseUrl } = await this.createSignedPutUrl(key, input.contentType);
    return {
      key,
      uploadUrl,
      publicUrl: `${publicBaseUrl}/${key}`,
      expiresInSeconds,
    };
  }

  async verifyUpload(input: { supplierId: string; key: string }) {
    const expectedPrefix = `suppliers/${input.supplierId}/`;
    if (!input.key.startsWith(expectedPrefix)) {
      throw new BadRequestException('Upload key does not belong to supplier');
    }
    const head = await this.headObject(input.key);
    return {
      exists: true as const,
      ...head,
    };
  }

  async createUserUploadUrl(input: { userId: string; fileName: string; contentType: string }) {
    const safeFileName = input.fileName.replace(/[^a-zA-Z0-9._-]/g, '_');
    const key = `users/${input.userId}/${randomUUID()}-${safeFileName}`;
    const { uploadUrl, expiresInSeconds, publicBaseUrl } = await this.createSignedPutUrl(key, input.contentType);
    return {
      key,
      uploadUrl,
      publicUrl: `${publicBaseUrl}/${key}`,
      expiresInSeconds,
    };
  }

  async verifyUserUpload(input: { userId: string; key: string }) {
    const expectedPrefix = `users/${input.userId}/`;
    if (!input.key.startsWith(expectedPrefix)) {
      throw new BadRequestException('Upload key does not belong to user');
    }
    const head = await this.headObject(input.key);
    return {
      exists: true as const,
      ...head,
    };
  }
}
