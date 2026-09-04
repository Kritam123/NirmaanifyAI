import { Injectable, Logger, BadRequestException, NotFoundException } from '@nestjs/common';
import {
  StorageDriverType,
  StorageDriverInfo,
  FileUploadPayload,
  StorageUploadResult,
  StorageFileInfo,
  ProjectStorageConfig,
  UpdateProjectStorageConfigDto,
  TestStorageConnectionDto,
  TestStorageConnectionResult,
} from '@nirmaanify/types';
import { PrismaService } from '../database/prisma.service';
import { IStorageDriver } from './drivers/storage-driver.interface';
import { LocalStorageDriver } from './drivers/local.driver';
import { S3StorageDriver } from './drivers/s3.driver';
import { VercelBlobStorageDriver } from './drivers/vercel-blob.driver';

@Injectable()
export class StorageService {
  private readonly logger = new Logger(StorageService.name);
  private drivers: Map<StorageDriverType, IStorageDriver> = new Map();
  private defaultDriverType: StorageDriverType = 'local';

  constructor(private readonly prisma: PrismaService) {
    // Register default system fallback storage drivers
    this.registerDriver(new LocalStorageDriver());
    this.registerDriver(new S3StorageDriver());
    this.registerDriver(new VercelBlobStorageDriver());

    // Initialize default fallback driver from environment
    const initialDriver = (process.env.STORAGE_DRIVER as StorageDriverType) || 'local';
    if (this.drivers.has(initialDriver)) {
      this.defaultDriverType = initialDriver;
    } else {
      this.defaultDriverType = 'local';
    }

    this.logger.log(`🗄️ Storage Service initialized. Default Fallback Driver: [${this.defaultDriverType.toUpperCase()}]`);
  }

  private registerDriver(driver: IStorageDriver) {
    this.drivers.set(driver.type, driver);
  }

  /**
   * Instantiate driver instance with project-specific credentials or system fallback
   */
  createDriverInstance(type: StorageDriverType, config?: ProjectStorageConfig): IStorageDriver {
    if (type === 's3') {
      return new S3StorageDriver(config?.s3);
    }
    if (type === 'vercel-blob') {
      return new VercelBlobStorageDriver(config?.vercelBlob);
    }
    return new LocalStorageDriver(config?.local);
  }

  /**
   * Resolve storage driver individually per project with its custom credentials
   */
  async getDriverForProject(projectId?: string): Promise<{
    driver: IStorageDriver;
    driverType: StorageDriverType;
    projectName?: string;
    config?: ProjectStorageConfig;
  }> {
    if (projectId) {
      try {
        const project: any = await (this.prisma.project as any).findUnique({
          where: { id: projectId },
          select: { id: true, name: true, storageDriver: true, storageConfig: true },
        });

        if (project) {
          const type = (project.storageDriver as StorageDriverType) || 'local';
          const projectConfig = ((project as any).storageConfig as ProjectStorageConfig) || {};
          const driver = this.createDriverInstance(type, projectConfig);
          return {
            driver,
            driverType: type,
            projectName: project.name,
            config: projectConfig,
          };
        }
      } catch (err: any) {
        this.logger.warn(`Could not resolve project-individual storage driver for ${projectId}: ${err?.message}`);
      }
    }

    const fallbackType = this.defaultDriverType;
    return {
      driver: this.getDriver(fallbackType),
      driverType: fallbackType,
    };
  }

  /**
   * Set individual project storage driver in database
   */
  async setProjectDriver(projectId: string, driverType: StorageDriverType): Promise<{
    message: string;
    driver: StorageDriverInfo;
    project: { id: string; name: string; storageDriver: string };
  }> {
    if (!this.drivers.has(driverType)) {
      throw new BadRequestException(`Unsupported storage driver: ${driverType}. Available: local, s3, vercel-blob`);
    }

    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
    });

    if (!project) {
      throw new NotFoundException(`Project ${projectId} not found`);
    }

    const updated = await this.prisma.project.update({
      where: { id: projectId },
      data: { storageDriver: driverType },
      select: { id: true, name: true, storageDriver: true },
    });

    this.logger.log(`🔄 Switched storage driver for Project "${updated.name}" (${projectId}) to: [${driverType.toUpperCase()}]`);

    const driver = this.createDriverInstance(driverType, ((project as any).storageConfig as ProjectStorageConfig) || {});
    return {
      message: `Project "${updated.name}" storage switched to ${driverType}`,
      project: updated,
      driver: {
        name: driverType,
        label: driver.label,
        isActive: true,
        isConfigured: driver.isConfigured(),
        description: driver.getDescription(),
      },
    };
  }

  /**
   * Update individual project storage configuration and secrets
   */
  async updateProjectStorageConfig(dto: UpdateProjectStorageConfigDto): Promise<{
    message: string;
    projectId: string;
    driver: StorageDriverType;
    config: ProjectStorageConfig;
  }> {
    const project: any = await (this.prisma.project as any).findUnique({
      where: { id: dto.projectId },
    });

    if (!project) {
      throw new NotFoundException(`Project ${dto.projectId} not found`);
    }

    const existingConfig = ((project as any).storageConfig as ProjectStorageConfig) || {};
    const newConfig: ProjectStorageConfig = {
      s3: {
        ...existingConfig.s3,
        ...dto.config.s3,
        secretAccessKey:
          !dto.config.s3?.secretAccessKey || dto.config.s3.secretAccessKey.includes('••')
            ? existingConfig.s3?.secretAccessKey
            : dto.config.s3.secretAccessKey,
      },
      vercelBlob: {
        ...existingConfig.vercelBlob,
        ...dto.config.vercelBlob,
        token:
          !dto.config.vercelBlob?.token || dto.config.vercelBlob.token.includes('••')
            ? existingConfig.vercelBlob?.token
            : dto.config.vercelBlob.token,
      },
      local: {
        ...existingConfig.local,
        ...dto.config.local,
      },
    };

    const targetDriver = dto.driver || (project.storageDriver as StorageDriverType) || 'local';

    await (this.prisma.project as any).update({
      where: { id: dto.projectId },
      data: {
        storageConfig: newConfig as any,
        storageDriver: targetDriver,
      },
    });

    this.logger.log(`✓ Updated storage credentials for Project "${project.name}" (${dto.projectId})`);

    return {
      message: `Storage configuration saved for Project "${project.name}"`,
      projectId: dto.projectId,
      driver: targetDriver,
      config: this.maskStorageConfig(newConfig),
    };
  }

  /**
   * Test connection to a storage provider using project or provided credentials
   */
  async testStorageConnection(dto: TestStorageConnectionDto): Promise<TestStorageConnectionResult> {
    let effectiveConfig: ProjectStorageConfig = dto.config || {};

    if (dto.projectId) {
      const project: any = await (this.prisma.project as any).findUnique({
        where: { id: dto.projectId },
        select: { storageConfig: true },
      });
      const savedConfig = ((project as any)?.storageConfig as ProjectStorageConfig) || {};
      effectiveConfig = {
        s3: {
          ...savedConfig.s3,
          ...dto.config?.s3,
          secretAccessKey:
            !dto.config?.s3?.secretAccessKey || dto.config.s3.secretAccessKey.includes('••')
              ? savedConfig.s3?.secretAccessKey
              : dto.config.s3.secretAccessKey,
        },
        vercelBlob: {
          ...savedConfig.vercelBlob,
          ...dto.config?.vercelBlob,
          token:
            !dto.config?.vercelBlob?.token || dto.config.vercelBlob.token.includes('••')
              ? savedConfig.vercelBlob?.token
              : dto.config.vercelBlob.token,
        },
        local: {
          ...savedConfig.local,
          ...dto.config?.local,
        },
      };
    }

    const driver = this.createDriverInstance(dto.driver, effectiveConfig);
    const testResult = await driver.testConnection();

    return {
      success: testResult.success,
      message: testResult.message,
      driver: dto.driver,
      testedAt: new Date().toISOString(),
      details: testResult.details,
    };
  }

  /**
   * Mask secret keys from storage configuration for safe client transfer
   */
  maskStorageConfig(config?: ProjectStorageConfig): ProjectStorageConfig {
    if (!config) return {};
    return {
      s3: config.s3
        ? {
            ...config.s3,
            secretAccessKey: config.s3.secretAccessKey ? '••••••••••••••••' : undefined,
          }
        : undefined,
      vercelBlob: config.vercelBlob
        ? {
            ...config.vercelBlob,
            token: config.vercelBlob.token ? '••••••••••••••••' : undefined,
          }
        : undefined,
      local: config.local,
    };
  }

  /**
   * Switch default fallback storage driver
   */
  setDefaultDriver(driverType: StorageDriverType): StorageDriverInfo {
    if (!this.drivers.has(driverType)) {
      throw new BadRequestException(`Unsupported storage driver: ${driverType}. Available: local, s3, vercel-blob`);
    }

    this.defaultDriverType = driverType;
    this.logger.log(`🔄 Switched default storage driver to: [${driverType.toUpperCase()}]`);

    return this.getDefaultDriverInfo();
  }

  // Alias for backward compatibility
  setActiveDriver(driverType: StorageDriverType): StorageDriverInfo {
    return this.setDefaultDriver(driverType);
  }

  getDefaultDriverType(): StorageDriverType {
    return this.defaultDriverType;
  }

  getActiveDriverType(): StorageDriverType {
    return this.defaultDriverType;
  }

  getDriver(type: StorageDriverType): IStorageDriver {
    const driver = this.drivers.get(type);
    if (!driver) throw new Error(`Driver ${type} not found`);
    return driver;
  }

  getDefaultDriverInfo(): StorageDriverInfo {
    const driver = this.getDriver(this.defaultDriverType);
    return {
      name: driver.type,
      label: driver.label,
      isActive: true,
      isConfigured: driver.isConfigured(),
      description: driver.getDescription(),
    };
  }

  async getStatusForProject(projectId?: string): Promise<{
    activeDriver: StorageDriverType;
    drivers: StorageDriverInfo[];
    projectId?: string;
    projectName?: string;
    config?: ProjectStorageConfig;
  }> {
    const { driverType, projectName, config } = await this.getDriverForProject(projectId);
    const drivers = this.getAllDriversStatus(driverType, config);
    return {
      activeDriver: driverType,
      drivers,
      projectId,
      projectName,
      config: this.maskStorageConfig(config),
    };
  }

  getAllDriversStatus(
    activeType: StorageDriverType = this.defaultDriverType,
    projectConfig?: ProjectStorageConfig
  ): StorageDriverInfo[] {
    const list: StorageDriverInfo[] = [];
    for (const [type, defaultDriver] of this.drivers.entries()) {
      let isConfigured = defaultDriver.isConfigured();
      if (projectConfig) {
        if (type === 's3') {
          isConfigured =
            Boolean(
              projectConfig.s3?.bucket &&
              projectConfig.s3?.accessKeyId &&
              projectConfig.s3?.secretAccessKey
            ) || defaultDriver.isConfigured();
        } else if (type === 'vercel-blob') {
          isConfigured = Boolean(projectConfig.vercelBlob?.token) || defaultDriver.isConfigured();
        } else if (type === 'local') {
          isConfigured = true;
        }
      }

      list.push({
        name: type,
        label: defaultDriver.label,
        isActive: type === activeType,
        isConfigured,
        description: defaultDriver.getDescription(),
        details:
          type === 's3' && projectConfig?.s3?.bucket
            ? {
                bucket: projectConfig.s3.bucket,
                region: projectConfig.s3.region,
                endpoint: projectConfig.s3.endpoint,
              }
            : undefined,
      });
    }
    return list;
  }

  // Unified Multi-Driver Operations (Individual Project Isolated)
  async uploadFile(payload: FileUploadPayload, projectId?: string, overrideDriver?: StorageDriverType): Promise<StorageUploadResult> {
    const targetProjectId = projectId || payload.projectId;
    let driver: IStorageDriver;
    let driverType: StorageDriverType;

    if (overrideDriver) {
      driver = this.getDriver(overrideDriver);
      driverType = overrideDriver;
    } else {
      const resolved = await this.getDriverForProject(targetProjectId);
      driver = resolved.driver;
      driverType = resolved.driverType;
    }

    const projectFolder = targetProjectId
      ? `projects/${targetProjectId}/${payload.folder || 'uploads'}`
      : payload.folder || 'uploads';

    this.logger.log(`Uploading file '${payload.filename}' for project '${targetProjectId || 'default'}' via ${driver.label} driver`);

    const result = await driver.upload({
      ...payload,
      folder: projectFolder,
    });

    return {
      ...result,
      driver: driverType,
      projectId: targetProjectId,
    };
  }

  async getFile(key: string, projectId?: string, overrideDriver?: StorageDriverType): Promise<Buffer> {
    let driver: IStorageDriver;
    if (overrideDriver) {
      driver = this.getDriver(overrideDriver);
    } else {
      const resolved = await this.getDriverForProject(projectId);
      driver = resolved.driver;
    }

    try {
      return await driver.download(key);
    } catch {
      // Fallback search in other drivers if driver was migrated or file placed in different backend
      for (const otherDriver of this.drivers.values()) {
        if (otherDriver.type !== driver.type) {
          try {
            return await otherDriver.download(key);
          } catch {
            // continue
          }
        }
      }
      throw new NotFoundException(`File ${key} not found`);
    }
  }

  async deleteFile(key: string, projectId?: string, overrideDriver?: StorageDriverType): Promise<boolean> {
    let driver: IStorageDriver;
    if (overrideDriver) {
      driver = this.getDriver(overrideDriver);
    } else {
      const resolved = await this.getDriverForProject(projectId);
      driver = resolved.driver;
    }

    const success = await driver.delete(key);
    if (!success) {
      // Try fallback drivers
      for (const otherDriver of this.drivers.values()) {
        if (otherDriver.type !== driver.type) {
          const ok = await otherDriver.delete(key);
          if (ok) return true;
        }
      }
    }
    return success;
  }

  async getFileUrl(key: string, projectId?: string, overrideDriver?: StorageDriverType): Promise<string> {
    let driver: IStorageDriver;
    if (overrideDriver) {
      driver = this.getDriver(overrideDriver);
    } else {
      const resolved = await this.getDriverForProject(projectId);
      driver = resolved.driver;
    }
    return driver.getUrl(key);
  }

  async listFiles(projectId?: string, overrideDriver?: StorageDriverType): Promise<StorageFileInfo[]> {
    let driver: IStorageDriver;
    let driverType: StorageDriverType;

    if (overrideDriver) {
      driver = this.getDriver(overrideDriver);
      driverType = overrideDriver;
    } else {
      const resolved = await this.getDriverForProject(projectId);
      driver = resolved.driver;
      driverType = resolved.driverType;
    }

    const allFiles = await driver.listFiles();

    if (projectId) {
      const projectPrefix = `projects/${projectId}/`;
      return allFiles
        .filter((file) => file.key.startsWith(projectPrefix))
        .map((file) => ({
          ...file,
          projectId,
          driver: driverType,
        }));
    }

    return allFiles;
  }
}
