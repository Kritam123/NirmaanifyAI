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
  ParseIntPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiParam, ApiQuery } from '@nestjs/swagger';
import { CmsService } from './cms.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import {
  CreateCmsCollectionDto,
  CreateCmsContentItemDto,
  CreateCmsFieldDto,
  UpdateCmsCollectionDto,
  UpdateCmsContentItemDto,
  UpdateCmsFieldDto,
  SchedulePublishDto,
  SeedPresetDto,
  CmsFilterQueryDto,
} from './dto/cms.dto';

@ApiTags('CMS & Content Management')
@Controller('cms')
export class CmsController {
  constructor(private readonly cmsService: CmsService) {}

  // ============================================================================
  // COLLECTIONS ENDPOINTS
  // ============================================================================

  @Get('projects/:projectId/collections')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List all CMS collections in a project' })
  @ApiParam({ name: 'projectId' })
  async listCollections(
    @Param('projectId') projectId: string,
    @CurrentUser('id') userId: string
  ) {
    return this.cmsService.listCollections(projectId, userId);
  }

  @Get('projects/:projectId/collections/:idOrSlug')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get single CMS collection by ID or slug' })
  @ApiParam({ name: 'projectId' })
  @ApiParam({ name: 'idOrSlug' })
  async getCollection(
    @Param('projectId') projectId: string,
    @Param('idOrSlug') idOrSlug: string,
    @CurrentUser('id') userId: string
  ) {
    return this.cmsService.getCollection(projectId, idOrSlug, userId);
  }

  @Post('projects/:projectId/collections')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new CMS collection' })
  @ApiParam({ name: 'projectId' })
  async createCollection(
    @Param('projectId') projectId: string,
    @Body() dto: CreateCmsCollectionDto,
    @CurrentUser('id') userId: string
  ) {
    return this.cmsService.createCollection(projectId, dto, userId);
  }

  @Patch('projects/:projectId/collections/:collectionId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update CMS collection metadata' })
  @ApiParam({ name: 'projectId' })
  @ApiParam({ name: 'collectionId' })
  async updateCollection(
    @Param('projectId') projectId: string,
    @Param('collectionId') collectionId: string,
    @Body() dto: UpdateCmsCollectionDto,
    @CurrentUser('id') userId: string
  ) {
    return this.cmsService.updateCollection(projectId, collectionId, dto, userId);
  }

  @Delete('projects/:projectId/collections/:collectionId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a CMS collection and its contents' })
  @ApiParam({ name: 'projectId' })
  @ApiParam({ name: 'collectionId' })
  async deleteCollection(
    @Param('projectId') projectId: string,
    @Param('collectionId') collectionId: string,
    @CurrentUser('id') userId: string
  ) {
    return this.cmsService.deleteCollection(projectId, collectionId, userId);
  }

  @Post('projects/:projectId/collections/seed-preset')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Seed standard preset collection (Posts, Products, Categories, Authors) with sample data' })
  @ApiParam({ name: 'projectId' })
  async seedPreset(
    @Param('projectId') projectId: string,
    @Body() dto: SeedPresetDto,
    @CurrentUser('id') userId: string
  ) {
    return this.cmsService.seedPresetCollection(projectId, dto.type, userId);
  }

  // ============================================================================
  // SCHEMA FIELDS ENDPOINTS
  // ============================================================================

  @Post('projects/:projectId/collections/:collectionId/fields')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Add a new schema field to collection' })
  @ApiParam({ name: 'projectId' })
  @ApiParam({ name: 'collectionId' })
  async addField(
    @Param('projectId') projectId: string,
    @Param('collectionId') collectionId: string,
    @Body() dto: CreateCmsFieldDto,
    @CurrentUser('id') userId: string
  ) {
    return this.cmsService.addField(projectId, collectionId, dto, userId);
  }

  @Patch('projects/:projectId/collections/:collectionId/fields/:fieldId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update field definition in collection' })
  @ApiParam({ name: 'projectId' })
  @ApiParam({ name: 'collectionId' })
  @ApiParam({ name: 'fieldId' })
  async updateField(
    @Param('projectId') projectId: string,
    @Param('collectionId') collectionId: string,
    @Param('fieldId') fieldId: string,
    @Body() dto: UpdateCmsFieldDto,
    @CurrentUser('id') userId: string
  ) {
    return this.cmsService.updateField(projectId, collectionId, fieldId, dto, userId);
  }

  @Delete('projects/:projectId/collections/:collectionId/fields/:fieldId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete field from collection' })
  @ApiParam({ name: 'projectId' })
  @ApiParam({ name: 'collectionId' })
  @ApiParam({ name: 'fieldId' })
  async deleteField(
    @Param('projectId') projectId: string,
    @Param('collectionId') collectionId: string,
    @Param('fieldId') fieldId: string,
    @CurrentUser('id') userId: string
  ) {
    return this.cmsService.deleteField(projectId, collectionId, fieldId, userId);
  }

  // ============================================================================
  // CONTENT ITEMS ENDPOINTS
  // ============================================================================

  @Get('projects/:projectId/collections/:collectionIdOrSlug/items')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List content items with pagination and filters' })
  @ApiParam({ name: 'projectId' })
  @ApiParam({ name: 'collectionIdOrSlug' })
  async listContent(
    @Param('projectId') projectId: string,
    @Param('collectionIdOrSlug') collectionIdOrSlug: string,
    @Query() query: CmsFilterQueryDto,
    @CurrentUser('id') userId: string
  ) {
    return this.cmsService.listContent(projectId, collectionIdOrSlug, query, userId);
  }

  @Get('projects/:projectId/collections/:collectionIdOrSlug/items/:itemId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get single content item' })
  @ApiParam({ name: 'projectId' })
  @ApiParam({ name: 'collectionIdOrSlug' })
  @ApiParam({ name: 'itemId' })
  async getContentItem(
    @Param('projectId') projectId: string,
    @Param('collectionIdOrSlug') collectionIdOrSlug: string,
    @Param('itemId') itemId: string,
    @CurrentUser('id') userId: string
  ) {
    return this.cmsService.getContentItem(projectId, collectionIdOrSlug, itemId, userId);
  }

  @Post('projects/:projectId/collections/:collectionIdOrSlug/items')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create new content item' })
  @ApiParam({ name: 'projectId' })
  @ApiParam({ name: 'collectionIdOrSlug' })
  async createContentItem(
    @Param('projectId') projectId: string,
    @Param('collectionIdOrSlug') collectionIdOrSlug: string,
    @Body() dto: CreateCmsContentItemDto,
    @CurrentUser('id') userId: string
  ) {
    return this.cmsService.createContentItem(projectId, collectionIdOrSlug, dto, userId);
  }

  @Patch('projects/:projectId/collections/:collectionIdOrSlug/items/:itemId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update content item' })
  @ApiParam({ name: 'projectId' })
  @ApiParam({ name: 'collectionIdOrSlug' })
  @ApiParam({ name: 'itemId' })
  async updateContentItem(
    @Param('projectId') projectId: string,
    @Param('collectionIdOrSlug') collectionIdOrSlug: string,
    @Param('itemId') itemId: string,
    @Body() dto: UpdateCmsContentItemDto,
    @CurrentUser('id') userId: string
  ) {
    return this.cmsService.updateContentItem(projectId, collectionIdOrSlug, itemId, dto, userId);
  }

  @Delete('projects/:projectId/collections/:collectionIdOrSlug/items/:itemId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete content item' })
  @ApiParam({ name: 'projectId' })
  @ApiParam({ name: 'collectionIdOrSlug' })
  @ApiParam({ name: 'itemId' })
  async deleteContentItem(
    @Param('projectId') projectId: string,
    @Param('collectionIdOrSlug') collectionIdOrSlug: string,
    @Param('itemId') itemId: string,
    @CurrentUser('id') userId: string
  ) {
    return this.cmsService.deleteContentItem(projectId, collectionIdOrSlug, itemId, userId);
  }

  @Post('projects/:projectId/collections/:collectionIdOrSlug/items/:itemId/publish')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Publish content item immediately' })
  @ApiParam({ name: 'projectId' })
  @ApiParam({ name: 'collectionIdOrSlug' })
  @ApiParam({ name: 'itemId' })
  async publishContentItem(
    @Param('projectId') projectId: string,
    @Param('collectionIdOrSlug') collectionIdOrSlug: string,
    @Param('itemId') itemId: string,
    @CurrentUser('id') userId: string
  ) {
    return this.cmsService.publishContentItem(projectId, collectionIdOrSlug, itemId, userId);
  }

  @Post('projects/:projectId/collections/:collectionIdOrSlug/items/:itemId/unpublish')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Unpublish content item (revert to DRAFT)' })
  @ApiParam({ name: 'projectId' })
  @ApiParam({ name: 'collectionIdOrSlug' })
  @ApiParam({ name: 'itemId' })
  async unpublishContentItem(
    @Param('projectId') projectId: string,
    @Param('collectionIdOrSlug') collectionIdOrSlug: string,
    @Param('itemId') itemId: string,
    @CurrentUser('id') userId: string
  ) {
    return this.cmsService.unpublishContentItem(projectId, collectionIdOrSlug, itemId, userId);
  }

  @Post('projects/:projectId/collections/:collectionIdOrSlug/items/:itemId/schedule')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Schedule content publication for future date' })
  @ApiParam({ name: 'projectId' })
  @ApiParam({ name: 'collectionIdOrSlug' })
  @ApiParam({ name: 'itemId' })
  async schedulePublish(
    @Param('projectId') projectId: string,
    @Param('collectionIdOrSlug') collectionIdOrSlug: string,
    @Param('itemId') itemId: string,
    @Body() dto: SchedulePublishDto,
    @CurrentUser('id') userId: string
  ) {
    return this.cmsService.schedulePublish(projectId, collectionIdOrSlug, itemId, dto.scheduledAt, userId);
  }

  // ============================================================================
  // PUBLIC CONTENT DELIVERY API (No JWT needed)
  // ============================================================================

  @Get('public/:projectId/:collectionSlug')
  @ApiOperation({ summary: 'Public content delivery endpoint for website rendering' })
  @ApiParam({ name: 'projectId' })
  @ApiParam({ name: 'collectionSlug' })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async getPublicContent(
    @Param('projectId') projectId: string,
    @Param('collectionSlug') collectionSlug: string,
    @Query('limit') limit?: string
  ) {
    const limitNum = limit ? parseInt(limit, 10) : 50;
    return this.cmsService.getPublicCollectionContent(projectId, collectionSlug, limitNum);
  }
}
