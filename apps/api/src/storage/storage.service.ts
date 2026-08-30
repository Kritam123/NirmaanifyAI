import { Injectable, Logger } from '@nestjs/common';
import * as fs from 'fs/promises';
import * as path from 'path';

export interface FileUploadPayload {
  filename: string;
  buffer: Buffer;
  mimeType: string;
}

@Injectable()
export class StorageService {
  private readonly logger = new Logger(StorageService.name);
  private readonly storageRoot = path.join(process.cwd(), '.storage');

  constructor() {
    fs.mkdir(this.storageRoot, { recursive: true }).catch((err) =>
      this.logger.error('Failed to create local storage directory', err)
    );
  }

  async uploadFile(payload: FileUploadPayload): Promise<{ key: string; url: string }> {
    const key = `${Date.now()}-${payload.filename}`;
    const filePath = path.join(this.storageRoot, key);
    await fs.writeFile(filePath, payload.buffer);
    return {
      key,
      url: `/storage/${key}`,
    };
  }

  async getFile(key: string): Promise<Buffer> {
    const filePath = path.join(this.storageRoot, key);
    return fs.readFile(filePath);
  }

  async deleteFile(key: string): Promise<boolean> {
    const filePath = path.join(this.storageRoot, key);
    try {
      await fs.unlink(filePath);
      return true;
    } catch {
      return false;
    }
  }
}
