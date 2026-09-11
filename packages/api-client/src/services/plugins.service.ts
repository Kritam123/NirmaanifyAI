import { HttpClient } from '../http-client';
import { API_ENDPOINTS } from '../endpoints';
import {
  PluginDto,
  ProjectPluginDto,
  InstallPluginDto,
  UpdateProjectPluginDto,
  PluginCategory,
} from '@nirmaanify/types';

export class PluginsService {
  constructor(private readonly http: HttpClient) {}

  async getMarketplace(category?: PluginCategory, search?: string): Promise<PluginDto[]> {
    const params = new URLSearchParams();
    if (category) params.append('category', category);
    if (search) params.append('search', search);

    const queryStr = params.toString() ? `?${params.toString()}` : '';
    const res = await this.http.get<{ plugins: PluginDto[] }>(
      `${API_ENDPOINTS.PLUGINS.MARKETPLACE}${queryStr}`
    );
    return res.plugins || [];
  }

  async getMarketplaceDetail(slug: string): Promise<PluginDto> {
    const res = await this.http.get<{ plugin: PluginDto }>(
      API_ENDPOINTS.PLUGINS.MARKETPLACE_DETAIL(slug)
    );
    return res.plugin;
  }

  async listProjectPlugins(projectId: string): Promise<ProjectPluginDto[]> {
    const res = await this.http.get<{ plugins: ProjectPluginDto[] }>(
      API_ENDPOINTS.PLUGINS.PROJECT_PLUGINS(projectId)
    );
    return res.plugins || [];
  }

  async installPlugin(projectId: string, dto: InstallPluginDto): Promise<ProjectPluginDto> {
    const res = await this.http.post<{ plugin: ProjectPluginDto }>(
      API_ENDPOINTS.PLUGINS.INSTALL(projectId),
      dto
    );
    return res.plugin;
  }

  async updateProjectPlugin(
    projectId: string,
    pluginId: string,
    dto: UpdateProjectPluginDto
  ): Promise<ProjectPluginDto> {
    const res = await this.http.patch<{ plugin: ProjectPluginDto }>(
      API_ENDPOINTS.PLUGINS.UPDATE(projectId, pluginId),
      dto
    );
    return res.plugin;
  }

  async uninstallPlugin(projectId: string, pluginId: string): Promise<void> {
    await this.http.delete<void>(API_ENDPOINTS.PLUGINS.UNINSTALL(projectId, pluginId));
  }
}
