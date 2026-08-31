import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { CmsService } from './cms.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import {
  CreateCollectionDto,
  UpdateCollectionDto,
  CreateEntryDto,
  UpdateEntryDto,
  CmsDataSourceConfig,
} from '@nirmaanify/types';

@Controller()
export class CmsController {
  constructor(private readonly cmsService: CmsService) {}

  // ==========================================================================
  // PUBLIC CMS DATA QUERY API (For dynamic frontend components & static sites)
  // ==========================================================================

  @Get('cms/public/:projectSlug/:collectionSlug')
  async getPublicCmsData(
    @Param('projectSlug') projectSlug: string,
    @Param('collectionSlug') collectionSlug: string,
    @Query('limit') limit?: number,
    @Query('offset') offset?: number,
    @Query('sortField') sortField?: string,
    @Query('sortDir') sortDir?: 'asc' | 'desc'
  ) {
    const config: CmsDataSourceConfig = {
      collectionSlug,
      limit: limit ? Number(limit) : 20,
      offset: offset ? Number(offset) : 0,
      sort: sortField ? { field: sortField, direction: sortDir || 'desc' } : undefined,
    };

    return this.cmsService.queryCmsData(projectSlug, collectionSlug, config);
  }

  // ==========================================================================
  // CMS COLLECTIONS MANAGEMENT (Protected)
  // ==========================================================================

  @Get('projects/:projectId/cms/templates')
  @UseGuards(JwtAuthGuard)
  getPrebuiltTemplates() {
    return this.cmsService.getPrebuiltTemplates();
  }

  @Get('projects/:projectId/cms/collections')
  @UseGuards(JwtAuthGuard)
  async listCollections(@Param('projectId') projectId: string) {
    return this.cmsService.listCollections(projectId);
  }

  @Post('projects/:projectId/cms/collections')
  @UseGuards(JwtAuthGuard)
  async createCollection(
    @Param('projectId') projectId: string,
    @Body() dto: CreateCollectionDto
  ) {
    return this.cmsService.createCollection(projectId, dto);
  }

  @Post('projects/:projectId/cms/collections/initialize-defaults')
  @UseGuards(JwtAuthGuard)
  async initializeDefaults(@Param('projectId') projectId: string) {
    return this.cmsService.initializeDefaultCollections(projectId);
  }

  @Get('projects/:projectId/cms/collections/:id')
  @UseGuards(JwtAuthGuard)
  async getCollection(@Param('id') id: string) {
    return this.cmsService.getCollection(id);
  }

  @Put('projects/:projectId/cms/collections/:id')
  @UseGuards(JwtAuthGuard)
  async updateCollection(
    @Param('id') id: string,
    @Body() dto: UpdateCollectionDto
  ) {
    return this.cmsService.updateCollection(id, dto);
  }

  @Delete('projects/:projectId/cms/collections/:id')
  @UseGuards(JwtAuthGuard)
  async deleteCollection(@Param('id') id: string) {
    return this.cmsService.deleteCollection(id);
  }

  // ==========================================================================
  // CMS CONTENT ENTRIES MANAGEMENT (Protected)
  // ==========================================================================

  @Get('projects/:projectId/cms/collections/:collectionId/entries')
  @UseGuards(JwtAuthGuard)
  async listEntries(
    @Param('collectionId') collectionId: string,
    @Query('status') status?: string,
    @Query('search') search?: string,
    @Query('limit') limit?: number,
    @Query('offset') offset?: number
  ) {
    return this.cmsService.listEntries(collectionId, {
      status,
      search,
      limit,
      offset,
    });
  }

  @Post('projects/:projectId/cms/collections/:collectionId/entries')
  @UseGuards(JwtAuthGuard)
  async createEntry(
    @Param('projectId') projectId: string,
    @Param('collectionId') collectionId: string,
    @Body() dto: CreateEntryDto,
    @Request() req: any
  ) {
    return this.cmsService.createEntry(projectId, collectionId, dto, req.user?.id);
  }

  @Get('projects/:projectId/cms/entries/:id')
  @UseGuards(JwtAuthGuard)
  async getEntry(@Param('id') id: string) {
    return this.cmsService.getEntry(id);
  }

  @Put('projects/:projectId/cms/entries/:id')
  @UseGuards(JwtAuthGuard)
  async updateEntry(
    @Param('id') id: string,
    @Body() dto: UpdateEntryDto
  ) {
    return this.cmsService.updateEntry(id, dto);
  }

  @Delete('projects/:projectId/cms/entries/:id')
  @UseGuards(JwtAuthGuard)
  async deleteEntry(@Param('id') id: string) {
    return this.cmsService.deleteEntry(id);
  }

  @Post('projects/:projectId/cms/entries/:id/publish')
  @UseGuards(JwtAuthGuard)
  async publishEntry(@Param('id') id: string) {
    return this.cmsService.publishEntry(id);
  }

  @Post('projects/:projectId/cms/entries/:id/archive')
  @UseGuards(JwtAuthGuard)
  async archiveEntry(@Param('id') id: string) {
    return this.cmsService.archiveEntry(id);
  }
}
