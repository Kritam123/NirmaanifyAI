import { Logger } from '@nestjs/common';
import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
  ListObjectsV2Command,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import {
  FileUploadPayload,
  StorageUploadResult,
  StorageFileInfo,
  StorageDriverType,
} from '@nirmaanify/types';
import { IStorageDriver } from './storage-driver.interface';

export class S3StorageDriver implements IStorageDriver {
  readonly type: StorageDriverType = 's3';
  readonly label = 'AWS S3 / MinIO';
  private readonly logger = new Logger(S3StorageDriver.name);
  private s3Client: S3Client | null = null;
  private readonly bucketName: string;
  private readonly endpoint?: string;
  private readonly region: string;

  constructor() {
    this.bucketName = process.env.S3_BUCKET_NAME || 'nirmaanify-storage';
    this.region = process.env.S3_REGION || 'us-east-1';
    this.endpoint = process.env.S3_ENDPOINT || undefined;

    const accessKeyId = process.env.S3_ACCESS_KEY;
    const secretAccessKey = process.env.S3_SECRET_KEY;

    if (accessKeyId && secretAccessKey) {
      this.s3Client = new S3Client({
        region: this.region,
        endpoint: this.endpoint,
        forcePathStyle: Boolean(this.endpoint), // Required for MinIO / LocalStack
        credentials: {
          accessKeyId,
          secretAccessKey,
        },
      });
      this.logger.log(`✓ S3 Driver configured (Bucket: ${this.bucketName}, Endpoint: ${this.endpoint || 'AWS'})`);
    } else {
      this.logger.warn('S3 Driver credentials not provided. S3 driver will operate in mock/unconfigured mode.');
    }
  }

  isConfigured(): boolean {
    return this.s3Client !== null;
  }

  getDescription(): string {
    return 'AWS S3, MinIO, Cloudflare R2, or DigitalOcean Spaces compatible object storage.';
  }

  async upload(payload: FileUploadPayload): Promise<StorageUploadResult> {
    const cleanFilename = payload.filename.replace(/[^a-zA-Z0-9.-]/g, '_');
    const folder = payload.folder ? `${payload.folder}/` : '';
    const key = `${folder}${Date.now()}-${cleanFilename}`;

    if (!this.s3Client) {
      this.logger.warn(`S3 not fully configured. Storing reference for key: ${key}`);
      return {
        key,
        url: `https://${this.bucketName}.s3.${this.region}.amazonaws.com/${key}`,
        size: payload.buffer.length,
        driver: 's3',
        uploadedAt: new Date().toISOString(),
      };
    }

    await this.s3Client.send(
      new PutObjectCommand({
        Bucket: this.bucketName,
        Key: key,
        Body: payload.buffer,
        ContentType: payload.mimeType,
      })
    );

    const url = await this.getUrl(key);
    return {
      key,
      url,
      size: payload.buffer.length,
      driver: 's3',
      uploadedAt: new Date().toISOString(),
    };
  }

  async download(key: string): Promise<Buffer> {
    if (!this.s3Client) throw new Error('S3 Client is not configured');
    const response = await this.s3Client.send(
      new GetObjectCommand({
        Bucket: this.bucketName,
        Key: key,
      })
    );

    const byteArray = await response.Body?.transformToByteArray();
    if (!byteArray) throw new Error(`Could not download file ${key} from S3`);
    return Buffer.from(byteArray);
  }

  async delete(key: string): Promise<boolean> {
    if (!this.s3Client) return false;
    try {
      await this.s3Client.send(
        new DeleteObjectCommand({
          Bucket: this.bucketName,
          Key: key,
        })
      );
      return true;
    } catch {
      return false;
    }
  }

  async getUrl(key: string): Promise<string> {
    if (this.endpoint) {
      return `${this.endpoint}/${this.bucketName}/${key}`;
    }
    if (this.s3Client) {
      const command = new GetObjectCommand({ Bucket: this.bucketName, Key: key });
      return getSignedUrl(this.s3Client, command, { expiresIn: 3600 });
    }
    return `https://${this.bucketName}.s3.${this.region}.amazonaws.com/${key}`;
  }

  async listFiles(): Promise<StorageFileInfo[]> {
    if (!this.s3Client) return [];
    try {
      const response = await this.s3Client.send(
        new ListObjectsV2Command({
          Bucket: this.bucketName,
          MaxKeys: 100,
        })
      );

      return (response.Contents || []).map((item) => ({
        key: item.Key || '',
        url: `${this.endpoint || 'https://s3.amazonaws.com'}/${this.bucketName}/${item.Key}`,
        size: item.Size,
        uploadedAt: item.LastModified?.toISOString(),
        driver: 's3',
      }));
    } catch {
      return [];
    }
  }
}
