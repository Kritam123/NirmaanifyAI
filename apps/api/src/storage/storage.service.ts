import { Injectable, Logger } from '@nestjs/common';
import {
  StorageDriverType,
  StorageDriverInfo,
  FileUploadPayload,
  StorageUploadResult,
  StorageFileInfo,
} from '@nirmaanify/types';
import { IStorageDriver } from './drivers/storage-driver.interface';
import { LocalStorageDriver } from './drivers/local.driver';
import { S3StorageDriver } from './drivers/s3.driver';
import { VercelBlobStorageDriver } from './drivers/vercel-blob.driver';

@Injectable()
export class StorageService {
  private readonly logger = new Logger(StorageService.name);
  private drivers: Map<StorageDriverType, IStorageDriver> = new Map();
  private activeDriverType: StorageDriverType = 'local';

  constructor() {
    // Register all supported storage drivers
    this.registerDriver(new LocalStorageDriver());
    this.registerDriver(new S3StorageDriver());
    this.registerDriver(new VercelBlobStorageDriver());

    // Initialize active driver from environment
    const initialDriver = (process.env.STORAGE_DRIVER as StorageDriverType) || 'local';
    if (this.drivers.has(initialDriver)) {
      this.activeDriverType = initialDriver;
    } else {
      this.activeDriverType = 'local';
    }

    this.logger.log(`🗄️ Storage Service initialized. Active Driver: [${this.activeDriverType.toUpperCase()}]`);
  }

  private registerDriver(driver: IStorageDriver) {
    this.drivers.set(driver.type, driver);
  }

  /**
   * One-click dynamic switcher between S3, Vercel Blob, and Local
   */
  setActiveDriver(driverType: StorageDriverType): StorageDriverInfo {
    if (!this.drivers.has(driverType)) {
      throw new Error(`Unsupported storage driver: ${driverType}. Available: local, s3, vercel-blob`);
    }

    this.activeDriverType = driverType;
    this.logger.log(`🔄 Switched active storage driver to: [${driverType.toUpperCase()}]`);

    return this.getActiveDriverInfo();
  }

  getActiveDriverType(): StorageDriverType {
    return this.activeDriverType;
  }

  getActiveDriver(): IStorageDriver {
    const driver = this.drivers.get(this.activeDriverType);
    if (!driver) throw new Error(`Active driver ${this.activeDriverType} not found`);
    return driver;
  }

  getDriver(type: StorageDriverType): IStorageDriver {
    const driver = this.drivers.get(type);
    if (!driver) throw new Error(`Driver ${type} not found`);
    return driver;
  }

  getActiveDriverInfo(): StorageDriverInfo {
    const driver = this.getActiveDriver();
    return {
      name: driver.type,
      label: driver.label,
      isActive: true,
      isConfigured: driver.isConfigured(),
      description: driver.getDescription(),
    };
  }

  getAllDriversStatus(): StorageDriverInfo[] {
    const list: StorageDriverInfo[] = [];
    for (const [type, driver] of this.drivers.entries()) {
      list.push({
        name: type,
        label: driver.label,
        isActive: type === this.activeDriverType,
        isConfigured: driver.isConfigured(),
        description: driver.getDescription(),
      });
    }
    return list;
  }

  // Unified Multi-Driver Operations
  async uploadFile(payload: FileUploadPayload, overrideDriver?: StorageDriverType): Promise<StorageUploadResult> {
    const driver = overrideDriver ? this.getDriver(overrideDriver) : this.getActiveDriver();
    this.logger.log(`Uploading file '${payload.filename}' via ${driver.label} driver`);
    return driver.upload(payload);
  }

  async getFile(key: string, overrideDriver?: StorageDriverType): Promise<Buffer> {
    const driver = overrideDriver ? this.getDriver(overrideDriver) : this.getActiveDriver();
    return driver.download(key);
  }

  async deleteFile(key: string, overrideDriver?: StorageDriverType): Promise<boolean> {
    const driver = overrideDriver ? this.getDriver(overrideDriver) : this.getActiveDriver();
    return driver.delete(key);
  }

  async getFileUrl(key: string, overrideDriver?: StorageDriverType): Promise<string> {
    const driver = overrideDriver ? this.getDriver(overrideDriver) : this.getActiveDriver();
    return driver.getUrl(key);
  }

  async listFiles(overrideDriver?: StorageDriverType): Promise<StorageFileInfo[]> {
    const driver = overrideDriver ? this.getDriver(overrideDriver) : this.getActiveDriver();
    return driver.listFiles();
  }
}
