import { useState, useCallback, useEffect } from 'react';
import {
  PluginDto,
  ProjectPluginDto,
  InstallPluginDto,
  UpdateProjectPluginDto,
  PluginCategory,
} from '@nirmaanify/types';
import { apiClient } from '../lib/api';

export function usePlugins(projectId: string) {
  const [projectPlugins, setProjectPlugins] = useState<ProjectPluginDto[]>([]);
  const [marketplacePlugins, setMarketplacePlugins] = useState<PluginDto[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProjectPlugins = useCallback(async () => {
    if (!projectId) return;
    try {
      const plugins = await apiClient.plugins.listProjectPlugins(projectId);
      setProjectPlugins(plugins || []);
    } catch (err: any) {
      setError(err.message || 'Error fetching project plugins');
    }
  }, [projectId]);

  const fetchMarketplace = useCallback(async (category?: PluginCategory, search?: string) => {
    setIsLoading(true);
    try {
      const plugins = await apiClient.plugins.getMarketplace(category, search);
      setMarketplacePlugins(plugins || []);
    } catch (err: any) {
      setError(err.message || 'Error fetching marketplace plugins');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProjectPlugins();
    fetchMarketplace();
  }, [fetchProjectPlugins, fetchMarketplace]);

  const installPlugin = async (dto: InstallPluginDto): Promise<ProjectPluginDto> => {
    const plugin = await apiClient.plugins.installPlugin(projectId, dto);
    await fetchProjectPlugins();
    return plugin;
  };

  const updatePlugin = async (pluginId: string, dto: UpdateProjectPluginDto): Promise<ProjectPluginDto> => {
    const plugin = await apiClient.plugins.updateProjectPlugin(projectId, pluginId, dto);
    await fetchProjectPlugins();
    return plugin;
  };

  const uninstallPlugin = async (pluginId: string): Promise<void> => {
    await apiClient.plugins.uninstallPlugin(projectId, pluginId);
    await fetchProjectPlugins();
  };

  return {
    projectPlugins,
    marketplacePlugins,
    isLoading,
    error,
    fetchProjectPlugins,
    fetchMarketplace,
    installPlugin,
    updatePlugin,
    uninstallPlugin,
  };
}
