import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PluginsService } from './plugins.service';
import {
  PluginDto,
  ProjectPluginDto,
  InstallPluginDto,
  UpdateProjectPluginDto,
  PluginCategory,
} from '@nirmaanify/types';

@ApiTags('Plugins & Marketplace')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller()
export class PluginsController {
  constructor(private readonly pluginsService: PluginsService) {}

  // ==========================================
  // MARKETPLACE ENDPOINTS
  // ==========================================

  @Get('plugins/marketplace')
  @ApiOperation({ summary: 'Browse or search the Plugin Marketplace catalog' })
  getMarketplacePlugins(
    @Query('category') category?: PluginCategory,
    @Query('search') search?: string
  ): { plugins: PluginDto[] } {
    const plugins = this.pluginsService.getMarketplacePlugins(category, search);
    return { plugins };
  }

  @Get('plugins/marketplace/:slug')
  @ApiOperation({ summary: 'Get plugin manifest and details by slug' })
  getMarketplacePluginBySlug(@Param('slug') slug: string): { plugin: PluginDto } {
    const plugin = this.pluginsService.getMarketplacePluginBySlug(slug);
    return { plugin };
  }

  // ==========================================
  // PROJECT INSTALLED PLUGINS ENDPOINTS
  // ==========================================

  @Get('projects/:projectId/plugins')
  @ApiOperation({ summary: 'List all plugins installed in a specific project' })
  async listProjectPlugins(
    @Param('projectId') projectId: string
  ): Promise<{ plugins: ProjectPluginDto[] }> {
    const plugins = await this.pluginsService.listProjectPlugins(projectId);
    return { plugins };
  }

  @Post('projects/:projectId/plugins/install')
  @ApiOperation({ summary: 'Install a plugin into a project with user-granted permissions' })
  async installPlugin(
    @Param('projectId') projectId: string,
    @Body() dto: InstallPluginDto
  ): Promise<{ plugin: ProjectPluginDto }> {
    const installed = await this.pluginsService.installPlugin(projectId, dto);
    return { plugin: installed };
  }

  @Patch('projects/:projectId/plugins/:pluginId')
  @ApiOperation({ summary: 'Update plugin configuration, toggle enabled, or update secrets' })
  async updateProjectPlugin(
    @Param('projectId') projectId: string,
    @Param('pluginId') pluginId: string,
    @Body() dto: UpdateProjectPluginDto
  ): Promise<{ plugin: ProjectPluginDto }> {
    const updated = await this.pluginsService.updateProjectPlugin(projectId, pluginId, dto);
    return { plugin: updated };
  }

  @Delete('projects/:projectId/plugins/:pluginId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Uninstall a plugin from a project' })
  async uninstallPlugin(
    @Param('projectId') projectId: string,
    @Param('pluginId') pluginId: string
  ): Promise<void> {
    await this.pluginsService.uninstallPlugin(projectId, pluginId);
  }
}
