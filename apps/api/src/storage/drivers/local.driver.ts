import * as fs from 'fs/promises';
import * as path from 'path';
import { Logger } from '@nestjs/common';
import {
  FileUploadPayload,
  StorageUploadResult,
  StorageFileInfo,
  StorageDriverType,
} from '@nirmaanify/types';
import { IStorageDriver } from './storage-driver.interface';

export class LocalStorageDriver implements IStorageDriver {
  readonly type: StorageDriverType = 'local';
  readonly label = 'Local Filesystem';
  private readonly logger = new Logger(LocalStorageDriver.name);
  private readonly storageRoot: string;

  constructor() {
    this.storageRoot = path.join(process.cwd(), '.storage');
    fs.mkdir(this.storageRoot, { recursive: true }).catch((err) =>
      this.logger.error('Failed to create .storage folder', err)
    );
  }

  isConfigured(): boolean {
    return true;
  }

  getDescription(): string {
    return 'Local disk storage for offline development and local caching.';
  }

  async upload(payload: FileUploadPayload): Promise<StorageUploadResult> {
    const cleanFilename = payload.filename.replace(/[^a-zA-Z0-9.-]/g, '_');
    const folder = payload.folder ? `${payload.folder}/` : '';
    const key = `${folder}${Date.now()}-${cleanFilename}`;
    const filePath = path.join(this.storageRoot, key);

    await fs.mkdir(path.dirname(filePath), { recursive: true });
    await fs.writeFile(filePath, payload.buffer);

    return {
      key,
      url: `/api/v1/storage/files/${encodeURIComponent(key)}`,
      size: payload.buffer.length,
      driver: 'local',
      uploadedAt: new Date().toISOString(),
    };
  }

  async download(key: string): Promise<Buffer> {
    const filePath = path.join(this.storageRoot, key);
    return fs.readFile(filePath);
  }

  async delete(key: string): Promise<boolean> {
    const filePath = path.join(this.storageRoot, key);
    try {
      await fs.unlink(filePath);
      return true;
    } catch {
      return false;
    }
  }

  async getUrl(key: string): Promise<string> {
    return `/api/v1/storage/files/${encodeURIComponent(key)}`;
  }

  async listFiles(): Promise<StorageFileInfo[]> {
    try {
      const files = await fs.readdir(this.storageRoot, { recursive: true });
      const results: StorageFileInfo[] = [];

      for (const file of files) {
        const filePath = path.join(this.storageRoot, String(file));
        const stat = await fs.stat(filePath);
        if (stat.isFile()) {
          const key = String(file).replace(/\\/g, '/');
          results.push({
            key,
            url: `/api/v1/storage/files/${encodeURIComponent(key)}`,
            size: stat.size,
            uploadedAt: stat.mtime.toISOString(),
            driver: 'local',
          });
        }
      }
      return results;
    } catch {
      return [];
    }
  }
}
