import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import * as crypto from 'crypto';
import { PrismaService } from '../database/prisma.service';
import { MARKETPLACE_CATALOG, CatalogPluginEntry } from './marketplace-catalog';
import {
  PluginDto,
  ProjectPluginDto,
  InstallPluginDto,
  UpdateProjectPluginDto,
  PluginCategory,
  PluginPermission,
} from '@nirmaanify/types';

@Injectable()
export class PluginsService {
  private readonly logger = new Logger(PluginsService.name);
  private readonly encryptionKey: Buffer;

  constructor(private readonly prisma: PrismaService) {
    // Derive 32-byte key from JWT secret or fallback
    const rawSecret = process.env.JWT_SECRET || 'nirmaanify-default-secret-key-32-chars!!';
    this.encryptionKey = crypto.createHash('sha256').update(rawSecret).digest();
  }

  public getMarketplacePlugins(category?: PluginCategory, search?: string): PluginDto[] {
    let items = [...MARKETPLACE_CATALOG];

    if (category) {
      items = items.filter((p) => p.category === category);
    }

    if (search && search.trim().length > 0) {
      const q = search.toLowerCase().trim();
      items = items.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.slug.toLowerCase().includes(q)
      );
    }

    return items.map(this.mapCatalogToDto);
  }

  public getMarketplacePluginBySlug(slug: string): PluginDto {
    const found = MARKETPLACE_CATALOG.find((p) => p.slug === slug);
    if (!found) {
      throw new NotFoundException(`Plugin "${slug}" not found in marketplace`);
    }
    return this.mapCatalogToDto(found);
  }

  public async listProjectPlugins(projectId: string): Promise<ProjectPluginDto[]> {
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
    });
    if (!project) {
      throw new NotFoundException(`Project with ID ${projectId} not found`);
    }

    const records = await (this.prisma as any).projectPlugin.findMany({
      where: { projectId },
      include: { plugin: true },
      orderBy: { installedAt: 'asc' },
    });

    return records.map((record: any) => {
      const catalogEntry = MARKETPLACE_CATALOG.find(
        (c) => c.slug === record.plugin?.slug || c.slug === record.pluginId
      );
      return {
        id: record.id,
        projectId: record.projectId,
        pluginId: record.pluginId,
        version: record.version,
        isEnabled: record.isEnabled,
        grantedPermissions: record.grantedPermissions as PluginPermission[],
        configValues: record.configValues || {},
        hasSecretsConfigured: !!record.encryptedSecrets,
        installedAt: record.installedAt.toISOString(),
        updatedAt: record.updatedAt.toISOString(),
        plugin: catalogEntry ? this.mapCatalogToDto(catalogEntry) : undefined,
      };
    });
  }

  public async installPlugin(projectId: string, dto: InstallPluginDto): Promise<ProjectPluginDto> {
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
    });
    if (!project) {
      throw new NotFoundException(`Project with ID ${projectId} not found`);
    }

    const catalogEntry = MARKETPLACE_CATALOG.find(
      (c) => c.slug === dto.pluginId || c.manifest.id === dto.pluginId
    );
    if (!catalogEntry) {
      throw new NotFoundException(`Plugin "${dto.pluginId}" does not exist in marketplace`);
    }

    // Ensure Plugin record exists in database
    const pluginRecord = await (this.prisma as any).plugin.upsert({
      where: { slug: catalogEntry.slug },
      update: {
        name: catalogEntry.name,
        description: catalogEntry.description,
        version: catalogEntry.version,
        manifest: catalogEntry.manifest as any,
        permissions: catalogEntry.manifest.permissions,
        category: catalogEntry.category as any,
        isOfficial: catalogEntry.isOfficial,
      },
      create: {
        slug: catalogEntry.slug,
        name: catalogEntry.name,
        description: catalogEntry.description,
        version: catalogEntry.version,
        author: catalogEntry.author,
        authorUrl: catalogEntry.authorUrl,
        iconUrl: catalogEntry.iconUrl,
        category: catalogEntry.category as any,
        isOfficial: catalogEntry.isOfficial,
        manifest: catalogEntry.manifest as any,
        permissions: catalogEntry.manifest.permissions,
        downloadCount: catalogEntry.downloadCount + 1,
        rating: catalogEntry.rating,
      },
    });

    // Encrypt secrets if provided
    let encryptedSecrets: any = null;
    if (dto.secrets && Object.keys(dto.secrets).length > 0) {
      encryptedSecrets = this.encryptData(dto.secrets);
    }

    // Upsert ProjectPlugin
    const projectPlugin = await (this.prisma as any).projectPlugin.upsert({
      where: {
        projectId_pluginId: {
          projectId,
          pluginId: pluginRecord.id,
        },
      },
      update: {
        version: dto.version || catalogEntry.version,
        isEnabled: true,
        grantedPermissions: dto.grantedPermissions,
        configValues: dto.configValues || {},
        ...(encryptedSecrets ? { encryptedSecrets } : {}),
      },
      create: {
        projectId,
        pluginId: pluginRecord.id,
        version: dto.version || catalogEntry.version,
        isEnabled: true,
        grantedPermissions: dto.grantedPermissions,
        configValues: dto.configValues || {},
        encryptedSecrets,
      },
    });

    return {
      id: projectPlugin.id,
      projectId: projectPlugin.projectId,
      pluginId: projectPlugin.pluginId,
      version: projectPlugin.version,
      isEnabled: projectPlugin.isEnabled,
      grantedPermissions: projectPlugin.grantedPermissions as PluginPermission[],
      configValues: projectPlugin.configValues || {},
      hasSecretsConfigured: !!projectPlugin.encryptedSecrets,
      installedAt: projectPlugin.installedAt.toISOString(),
      updatedAt: projectPlugin.updatedAt.toISOString(),
      plugin: this.mapCatalogToDto(catalogEntry),
    };
  }

  public async updateProjectPlugin(
    projectId: string,
    pluginId: string,
    dto: UpdateProjectPluginDto
  ): Promise<ProjectPluginDto> {
    const existing = await (this.prisma as any).projectPlugin.findFirst({
      where: {
        projectId,
        OR: [
          { id: pluginId },
          { pluginId: pluginId },
          { plugin: { slug: pluginId } },
        ],
      },
      include: { plugin: true },
    });

    if (!existing) {
      throw new NotFoundException(`Plugin is not installed in project ${projectId}`);
    }

    const updateData: any = {};
    if (dto.isEnabled !== undefined) updateData.isEnabled = dto.isEnabled;
    if (dto.grantedPermissions !== undefined) updateData.grantedPermissions = dto.grantedPermissions;
    if (dto.configValues !== undefined) updateData.configValues = dto.configValues;
    if (dto.secrets !== undefined) {
      updateData.encryptedSecrets = this.encryptData(dto.secrets);
    }

    const updated = await (this.prisma as any).projectPlugin.update({
      where: { id: existing.id },
      data: updateData,
      include: { plugin: true },
    });

    const catalogEntry = MARKETPLACE_CATALOG.find((c) => c.slug === updated.plugin?.slug);

    return {
      id: updated.id,
      projectId: updated.projectId,
      pluginId: updated.pluginId,
      version: updated.version,
      isEnabled: updated.isEnabled,
      grantedPermissions: updated.grantedPermissions as PluginPermission[],
      configValues: updated.configValues || {},
      hasSecretsConfigured: !!updated.encryptedSecrets,
      installedAt: updated.installedAt.toISOString(),
      updatedAt: updated.updatedAt.toISOString(),
      plugin: catalogEntry ? this.mapCatalogToDto(catalogEntry) : undefined,
    };
  }

  public async uninstallPlugin(projectId: string, pluginId: string): Promise<void> {
    const existing = await (this.prisma as any).projectPlugin.findFirst({
      where: {
        projectId,
        OR: [
          { id: pluginId },
          { pluginId: pluginId },
          { plugin: { slug: pluginId } },
        ],
      },
    });

    if (!existing) {
      throw new NotFoundException(`Plugin is not installed in project ${projectId}`);
    }

    await (this.prisma as any).projectPlugin.delete({
      where: { id: existing.id },
    });
  }

  private mapCatalogToDto(entry: CatalogPluginEntry): PluginDto {
    return {
      id: entry.slug,
      slug: entry.slug,
      name: entry.name,
      description: entry.description,
      version: entry.version,
      author: entry.author,
      authorUrl: entry.authorUrl,
      iconUrl: entry.iconUrl,
      category: entry.category,
      reviewStatus: 'OFFICIAL_VERIFIED',
      isOfficial: entry.isOfficial,
      manifest: entry.manifest,
      permissions: entry.manifest.permissions,
      downloadCount: entry.downloadCount,
      rating: entry.rating,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  }

  private encryptData(data: Record<string, string>): { iv: string; content: string } {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv('aes-256-gcm', this.encryptionKey, iv);
    let encrypted = cipher.update(JSON.stringify(data), 'utf8', 'hex');
    encrypted += cipher.final('hex');
    const tag = cipher.getAuthTag().toString('hex');
    return {
      iv: iv.toString('hex'),
      content: `${encrypted}:${tag}`,
    };
  }
}
