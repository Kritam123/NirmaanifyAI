import {
  Controller,
  Get,
  Post,
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
import { PackagesService } from './packages.service';
import {
  InstallPackageDto,
  SwitchPresetDto,
  ProjectPackageDto,
  CompatibilityCheckResponse,
  NpmRegistrySearchResult,
} from '@nirmaanify/types';

@ApiTags('Project Packages & Libraries')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('projects/:projectId/packages')
export class PackagesController {
  constructor(private readonly packagesService: PackagesService) {}

  @Get('presets')
  @ApiOperation({ summary: 'Get all curated library presets (UI, Animation, Forms, Charts, Icons)' })
  getCuratedPresets() {
    return {
      presets: this.packagesService.getCuratedPresets(),
    };
  }

  @Get('search-npm')
  @ApiOperation({ summary: 'Search the public NPM registry for custom packages' })
  async searchNpmRegistry(@Query('q') query: string): Promise<{ results: NpmRegistrySearchResult[] }> {
    const results = await this.packagesService.searchNpmRegistry(query);
    return { results };
  }

  @Get()
  @ApiOperation({ summary: 'List all packages and libraries configured in the project' })
  @ApiResponse({ status: 200, description: 'List of installed packages' })
  async listPackages(@Param('projectId') projectId: string): Promise<{ packages: ProjectPackageDto[] }> {
    const packages = await this.packagesService.listPackages(projectId);
    return { packages };
  }

  @Post('check-compatibility')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Run 4-tier compatibility engine on candidate package' })
  async checkCompatibility(
    @Param('projectId') projectId: string,
    @Body() body: { packageName: string; version?: string }
  ): Promise<CompatibilityCheckResponse> {
    return this.packagesService.checkCompatibility(projectId, body.packageName, body.version);
  }

  @Post('install')
  @ApiOperation({ summary: 'Install or update a library or NPM package in the project' })
  async installPackage(
    @Param('projectId') projectId: string,
    @Body() dto: InstallPackageDto
  ): Promise<{ package: ProjectPackageDto }> {
    const installed = await this.packagesService.installPackage(projectId, dto);
    return { package: installed };
  }

  @Delete(':packageName')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remove a package from the project' })
  async removePackage(
    @Param('projectId') projectId: string,
    @Param('packageName') packageName: string
  ): Promise<void> {
    await this.packagesService.removePackage(projectId, packageName);
  }

  @Post('switch-preset')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Switch core UI framework, animation engine, or form framework' })
  async switchPreset(
    @Param('projectId') projectId: string,
    @Body() dto: SwitchPresetDto
  ): Promise<{ success: boolean; activePreset: string }> {
    return this.packagesService.switchPreset(projectId, dto);
  }
}
