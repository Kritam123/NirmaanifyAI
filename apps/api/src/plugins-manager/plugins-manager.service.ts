import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import {
  ProjectPackagesAndPlugins,
  getDefaultPackagesAndPlugins,
  PackageDefinition,
  PluginManifest,
  InstalledPlugin,
} from '@nirmaanify/types';
import {
  CURATED_PACKAGES_CATALOG,
  CURATED_PLUGINS_MARKETPLACE,
  PackageCompatibilityEngine,
} from '@nirmaanify/component-registry';

@Injectable()
export class PluginsManagerService {
  constructor(private readonly prisma: PrismaService) {}

  async getPackagesAndPlugins(projectId: string): Promise<ProjectPackagesAndPlugins> {
    const project = await this.prisma.project.findUnique({ where: { id: projectId } });
    if (!project) throw new NotFoundException('Project not found.');

    const schema = (project.projectSchema as any) || {};
    if (schema.packagesAndPlugins && schema.packagesAndPlugins.installedPackages) {
      return schema.packagesAndPlugins as ProjectPackagesAndPlugins;
    }

    return getDefaultPackagesAndPlugins();
  }

  async updatePackagesAndPlugins(
    projectId: string,
    data: ProjectPackagesAndPlugins
  ): Promise<ProjectPackagesAndPlugins> {
    const project = await this.prisma.project.findUnique({ where: { id: projectId } });
    if (!project) throw new NotFoundException('Project not found.');

    const currentSchema = (project.projectSchema as any) || {};
    const updatedSchema = {
      ...currentSchema,
      packagesAndPlugins: data,
    };

    await this.prisma.project.update({
      where: { id: projectId },
      data: { projectSchema: updatedSchema },
    });

    return data;
  }

  async installPackage(
    projectId: string,
    payload: { npmPackage: string; version?: string; category?: any }
  ): Promise<ProjectPackagesAndPlugins> {
    const current = await this.getPackagesAndPlugins(projectId);
    const existing = current.installedPackages.find((p) => p.npmPackage === payload.npmPackage);

    if (existing) {
      existing.version = payload.version || existing.version;
    } else {
      const catalogItem = CURATED_PACKAGES_CATALOG.find((p) => p.npmPackage === payload.npmPackage);
      current.installedPackages.push({
        npmPackage: payload.npmPackage,
        version: payload.version || catalogItem?.version || '^1.0.0',
        category: payload.category || catalogItem?.category || 'utils',
        installedAt: new Date().toISOString(),
      });
    }

    return this.updatePackagesAndPlugins(projectId, current);
  }

  async uninstallPackage(projectId: string, npmPackage: string): Promise<ProjectPackagesAndPlugins> {
    const current = await this.getPackagesAndPlugins(projectId);
    current.installedPackages = current.installedPackages.filter((p) => p.npmPackage !== npmPackage);
    return this.updatePackagesAndPlugins(projectId, current);
  }

  async installPlugin(
    projectId: string,
    payload: { pluginId: string; config?: Record<string, any> }
  ): Promise<ProjectPackagesAndPlugins> {
    const current = await this.getPackagesAndPlugins(projectId);
    const manifest = CURATED_PLUGINS_MARKETPLACE.find((p) => p.id === payload.pluginId);
    if (!manifest) throw new NotFoundException(`Plugin ${payload.pluginId} not found in marketplace.`);

    const existingIdx = current.installedPlugins.findIndex((p) => p.pluginId === payload.pluginId);
    const defaultVals: Record<string, any> = {};
    if (manifest.configSchema) {
      Object.entries(manifest.configSchema).forEach(([k, v]) => {
        defaultVals[k] = v.defaultValue;
      });
    }

    const pluginRecord: InstalledPlugin = {
      pluginId: manifest.id,
      manifest,
      status: 'ACTIVE',
      config: { ...defaultVals, ...(payload.config || {}) },
      installedAt: new Date().toISOString(),
    };

    if (existingIdx !== -1) {
      current.installedPlugins[existingIdx] = pluginRecord;
    } else {
      current.installedPlugins.push(pluginRecord);
    }

    return this.updatePackagesAndPlugins(projectId, current);
  }

  async updatePlugin(
    projectId: string,
    pluginId: string,
    updates: { status?: 'ACTIVE' | 'INACTIVE'; config?: Record<string, any> }
  ): Promise<ProjectPackagesAndPlugins> {
    const current = await this.getPackagesAndPlugins(projectId);
    const idx = current.installedPlugins.findIndex((p) => p.pluginId === pluginId);
    if (idx === -1) throw new NotFoundException('Plugin not installed.');

    if (updates.status) current.installedPlugins[idx].status = updates.status;
    if (updates.config) current.installedPlugins[idx].config = { ...current.installedPlugins[idx].config, ...updates.config };

    return this.updatePackagesAndPlugins(projectId, current);
  }

  async uninstallPlugin(projectId: string, pluginId: string): Promise<ProjectPackagesAndPlugins> {
    const current = await this.getPackagesAndPlugins(projectId);
    current.installedPlugins = current.installedPlugins.filter((p) => p.pluginId !== pluginId);
    return this.updatePackagesAndPlugins(projectId, current);
  }

  getMarketplaceCatalog(): { packages: PackageDefinition[]; plugins: PluginManifest[] } {
    return {
      packages: CURATED_PACKAGES_CATALOG,
      plugins: CURATED_PLUGINS_MARKETPLACE,
    };
  }
}
