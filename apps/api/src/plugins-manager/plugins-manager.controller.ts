import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { PluginsManagerService } from './plugins-manager.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller()
export class PluginsManagerController {
  constructor(private readonly pluginsService: PluginsManagerService) {}

  @Get('marketplace/catalog')
  getMarketplaceCatalog() {
    return this.pluginsService.getMarketplaceCatalog();
  }

  @Get('projects/:projectId/packages-plugins')
  @UseGuards(JwtAuthGuard)
  async getPackagesAndPlugins(@Param('projectId') projectId: string) {
    return this.pluginsService.getPackagesAndPlugins(projectId);
  }

  @Post('projects/:projectId/packages/install')
  @UseGuards(JwtAuthGuard)
  async installPackage(
    @Param('projectId') projectId: string,
    @Body() payload: { npmPackage: string; version?: string; category?: any }
  ) {
    return this.pluginsService.installPackage(projectId, payload);
  }

  @Delete('projects/:projectId/packages/:pkg')
  @UseGuards(JwtAuthGuard)
  async uninstallPackage(
    @Param('projectId') projectId: string,
    @Param('pkg') pkg: string
  ) {
    const decodedPkg = decodeURIComponent(pkg);
    return this.pluginsService.uninstallPackage(projectId, decodedPkg);
  }

  @Post('projects/:projectId/plugins/install')
  @UseGuards(JwtAuthGuard)
  async installPlugin(
    @Param('projectId') projectId: string,
    @Body() payload: { pluginId: string; config?: Record<string, any> }
  ) {
    return this.pluginsService.installPlugin(projectId, payload);
  }

  @Put('projects/:projectId/plugins/:id')
  @UseGuards(JwtAuthGuard)
  async updatePlugin(
    @Param('projectId') projectId: string,
    @Param('id') pluginId: string,
    @Body() updates: { status?: 'ACTIVE' | 'INACTIVE'; config?: Record<string, any> }
  ) {
    return this.pluginsService.updatePlugin(projectId, pluginId, updates);
  }

  @Delete('projects/:projectId/plugins/:id')
  @UseGuards(JwtAuthGuard)
  async uninstallPlugin(
    @Param('projectId') projectId: string,
    @Param('id') pluginId: string
  ) {
    return this.pluginsService.uninstallPlugin(projectId, pluginId);
  }
}
