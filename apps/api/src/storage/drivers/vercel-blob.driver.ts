import { Logger } from '@nestjs/common';
import { put, del, list, head } from '@vercel/blob';
import {
  FileUploadPayload,
  StorageUploadResult,
  StorageFileInfo,
  StorageDriverType,
} from '@nirmaanify/types';
import { IStorageDriver } from './storage-driver.interface';

export class VercelBlobStorageDriver implements IStorageDriver {
  readonly type: StorageDriverType = 'vercel-blob';
  readonly label = 'Vercel Blob Storage';
  private readonly logger = new Logger(VercelBlobStorageDriver.name);
  private readonly token: string | undefined;

  constructor() {
    this.token = process.env.BLOB_READ_WRITE_TOKEN || process.env.VERCEL_BLOB_TOKEN;
    if (this.token) {
      this.logger.log('✓ Vercel Blob Storage Driver configured with active token.');
    } else {
      this.logger.warn('Vercel Blob token (BLOB_READ_WRITE_TOKEN) not set. Vercel Blob driver will run in ready/unlinked mode.');
    }
  }

  isConfigured(): boolean {
    return Boolean(this.token);
  }

  getDescription(): string {
    return 'High-performance global edge object storage powered by Vercel Blob CDN.';
  }

  async upload(payload: FileUploadPayload): Promise<StorageUploadResult> {
    const cleanFilename = payload.filename.replace(/[^a-zA-Z0-9.-]/g, '_');
    const folder = payload.folder ? `${payload.folder}/` : '';
    const pathname = `${folder}${Date.now()}-${cleanFilename}`;

    if (!this.token) {
      this.logger.warn(`Vercel Blob token not set. Simulating upload for: ${pathname}`);
      return {
        key: pathname,
        url: `https://public.blob.vercel-storage.com/${pathname}`,
        size: payload.buffer.length,
        driver: 'vercel-blob',
        uploadedAt: new Date().toISOString(),
      };
    }

    const blob = await put(pathname, payload.buffer, {
      access: 'public',
      token: this.token,
      contentType: payload.mimeType,
    });

    return {
      key: blob.pathname,
      url: blob.url,
      size: payload.buffer.length,
      driver: 'vercel-blob',
      uploadedAt: new Date().toISOString(),
    };
  }

  async download(key: string): Promise<Buffer> {
    const url = await this.getUrl(key);
    const res = await fetch(url);
    const arrayBuffer = await res.arrayBuffer();
    return Buffer.from(arrayBuffer);
  }

  async delete(key: string): Promise<boolean> {
    if (!this.token) return true;
    try {
      await del(key, { token: this.token });
      return true;
    } catch {
      return false;
    }
  }

  async getUrl(key: string): Promise<string> {
    if (key.startsWith('http')) return key;
    return `https://public.blob.vercel-storage.com/${key}`;
  }

  async listFiles(): Promise<StorageFileInfo[]> {
    if (!this.token) return [];
    try {
      const { blobs } = await list({ token: this.token, limit: 100 });
      return blobs.map((b) => ({
        key: b.pathname,
        url: b.url,
        size: b.size,
        uploadedAt: b.uploadedAt.toISOString(),
        driver: 'vercel-blob',
      }));
    } catch {
      return [];
    }
  }
}
