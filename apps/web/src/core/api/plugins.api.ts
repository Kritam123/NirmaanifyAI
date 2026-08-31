import { apiClient } from './client';
import { ENDPOINTS } from './endpoints';
import {
  ProjectPackagesAndPlugins,
  PackageDefinition,
  PluginManifest,
} from '@nirmaanify/types';

export const pluginsApi = {
  async getEcosystem(projectId: string): Promise<ProjectPackagesAndPlugins> {
    return apiClient.get<ProjectPackagesAndPlugins>(ENDPOINTS.PLUGINS.ECOSYSTEM(projectId));
  },

  async installPackage(projectId: string, pkg: PackageDefinition): Promise<ProjectPackagesAndPlugins> {
    return apiClient.post<ProjectPackagesAndPlugins>(ENDPOINTS.PLUGINS.INSTALL_PACKAGE(projectId), {
      npmPackage: pkg.npmPackage,
      version: pkg.version,
      category: pkg.category,
    });
  },

  async uninstallPackage(projectId: string, pkgName: string): Promise<ProjectPackagesAndPlugins> {
    return apiClient.delete<ProjectPackagesAndPlugins>(ENDPOINTS.PLUGINS.UNINSTALL_PACKAGE(projectId, pkgName));
  },

  async installPlugin(projectId: string, plugin: PluginManifest): Promise<ProjectPackagesAndPlugins> {
    return apiClient.post<ProjectPackagesAndPlugins>(ENDPOINTS.PLUGINS.INSTALL_PLUGIN(projectId), {
      pluginId: plugin.id,
    });
  },

  async uninstallPlugin(projectId: string, pluginId: string): Promise<ProjectPackagesAndPlugins> {
    return apiClient.delete<ProjectPackagesAndPlugins>(ENDPOINTS.PLUGINS.UNINSTALL_PLUGIN(projectId, pluginId));
  },

  async togglePlugin(projectId: string, pluginId: string, status: 'ACTIVE' | 'INACTIVE'): Promise<ProjectPackagesAndPlugins> {
    return apiClient.put<ProjectPackagesAndPlugins>(ENDPOINTS.PLUGINS.CONFIG_PLUGIN(projectId, pluginId), {
      status,
    });
  },

  async configurePlugin(projectId: string, pluginId: string, config: Record<string, any>): Promise<ProjectPackagesAndPlugins> {
    return apiClient.put<ProjectPackagesAndPlugins>(ENDPOINTS.PLUGINS.CONFIG_PLUGIN(projectId, pluginId), {
      config,
    });
  },
};
