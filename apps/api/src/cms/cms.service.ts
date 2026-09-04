import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  ConflictException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import {
  CmsCollectionDto,
  CmsCollectionType,
  CmsContentItemDto,
  CmsContentStatus,
  CmsFieldDto,
  CmsFieldType,
  CmsPaginatedResult,
  CMS_COLLECTION_PRESETS,
} from '@nirmaanify/types';
import {
  CreateCmsCollectionDto,
  CreateCmsContentItemDto,
  CreateCmsFieldDto,
  UpdateCmsCollectionDto,
  UpdateCmsContentItemDto,
  UpdateCmsFieldDto,
  CmsFilterQueryDto,
} from './dto/cms.dto';

@Injectable()
export class CmsService {
  private readonly logger = new Logger(CmsService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Ensure user has access to the project via workspace ownership or membership
   */
  async verifyProjectAccess(projectId: string, userId?: string): Promise<any> {
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
      include: {
        workspace: {
          include: { members: true },
        },
      },
    });

    if (!project) {
      throw new NotFoundException(`Project with ID "${projectId}" not found`);
    }

    if (userId) {
      const ws = project.workspace;
      const isOwner = ws.ownerId === userId;
      const isMember = ws.members.some((m) => m.userId === userId);

      if (!isOwner && !isMember) {
        throw new ForbiddenException('Access denied: You do not have permission for this project');
      }
    }

    return project;
  }

  // ============================================================================
  // COLLECTIONS
  // ============================================================================

  async listCollections(projectId: string, userId?: string): Promise<CmsCollectionDto[]> {
    await this.verifyProjectAccess(projectId, userId);

    const collections = await this.prisma.cmsCollection.findMany({
      where: { projectId },
      include: {
        fields: {
          orderBy: { order: 'asc' },
        },
        _count: {
          select: { items: true },
        },
      },
      orderBy: { createdAt: 'asc' },
    });

    return collections.map((col) => ({
      id: col.id,
      projectId: col.projectId,
      name: col.name,
      slug: col.slug,
      description: col.description,
      type: col.type as CmsCollectionType,
      isSystem: col.isSystem,
      fields: col.fields.map(this.mapFieldToDto),
      itemCount: col._count.items,
      createdAt: col.createdAt,
      updatedAt: col.updatedAt,
    }));
  }

  async getCollection(
    projectId: string,
    idOrSlug: string,
    userId?: string
  ): Promise<CmsCollectionDto> {
    await this.verifyProjectAccess(projectId, userId);

    const collection = await this.findCollection(projectId, idOrSlug);
    if (!collection) {
      throw new NotFoundException(`Collection "${idOrSlug}" not found in project`);
    }

    return {
      id: collection.id,
      projectId: collection.projectId,
      name: collection.name,
      slug: collection.slug,
      description: collection.description,
      type: collection.type as CmsCollectionType,
      isSystem: collection.isSystem,
      fields: collection.fields.map(this.mapFieldToDto),
      createdAt: collection.createdAt,
      updatedAt: collection.updatedAt,
    };
  }

  async createCollection(
    projectId: string,
    dto: CreateCmsCollectionDto,
    userId: string
  ): Promise<CmsCollectionDto> {
    await this.verifyProjectAccess(projectId, userId);

    const slug = dto.slug?.trim() || this.slugify(dto.name);
    const existing = await this.prisma.cmsCollection.findUnique({
      where: {
        projectId_slug: { projectId, slug },
      },
    });

    if (existing) {
      throw new ConflictException(`A collection with slug "${slug}" already exists in this project`);
    }

    const collection = await this.prisma.cmsCollection.create({
      data: {
        projectId,
        name: dto.name.trim(),
        slug,
        description: dto.description?.trim(),
        type: (dto.type || 'CUSTOM') as any,
        fields: dto.fields && dto.fields.length > 0
          ? {
              create: dto.fields.map((f, idx) => ({
                name: f.name.trim(),
                key: f.key?.trim() || this.keyify(f.name),
                type: f.type as any,
                required: f.required ?? false,
                defaultValue: f.defaultValue ?? undefined,
                validation: f.validation ? JSON.parse(JSON.stringify(f.validation)) : {},
                options: f.options ? JSON.parse(JSON.stringify(f.options)) : [],
                order: f.order ?? idx,
              })),
            }
          : undefined,
      },
      include: {
        fields: {
          orderBy: { order: 'asc' },
        },
      },
    });

    return {
      id: collection.id,
      projectId: collection.projectId,
      name: collection.name,
      slug: collection.slug,
      description: collection.description,
      type: collection.type as CmsCollectionType,
      isSystem: collection.isSystem,
      fields: collection.fields.map(this.mapFieldToDto),
      itemCount: 0,
      createdAt: collection.createdAt,
      updatedAt: collection.updatedAt,
    };
  }

  async updateCollection(
    projectId: string,
    collectionId: string,
    dto: UpdateCmsCollectionDto,
    userId: string
  ): Promise<CmsCollectionDto> {
    await this.verifyProjectAccess(projectId, userId);

    const existing = await this.prisma.cmsCollection.findFirst({
      where: { id: collectionId, projectId },
    });

    if (!existing) {
      throw new NotFoundException(`Collection "${collectionId}" not found`);
    }

    let slug = existing.slug;
    if (dto.slug && dto.slug !== existing.slug) {
      slug = this.slugify(dto.slug);
      const conflict = await this.prisma.cmsCollection.findUnique({
        where: { projectId_slug: { projectId, slug } },
      });
      if (conflict && conflict.id !== collectionId) {
        throw new ConflictException(`Slug "${slug}" is already used by another collection`);
      }
    }

    const updated = await this.prisma.cmsCollection.update({
      where: { id: collectionId },
      data: {
        name: dto.name?.trim() ?? existing.name,
        slug,
        description: dto.description !== undefined ? dto.description : existing.description,
      },
      include: {
        fields: {
          orderBy: { order: 'asc' },
        },
      },
    });

    return {
      id: updated.id,
      projectId: updated.projectId,
      name: updated.name,
      slug: updated.slug,
      description: updated.description,
      type: updated.type as CmsCollectionType,
      isSystem: updated.isSystem,
      fields: updated.fields.map(this.mapFieldToDto),
      createdAt: updated.createdAt,
      updatedAt: updated.updatedAt,
    };
  }

  async deleteCollection(
    projectId: string,
    collectionId: string,
    userId: string
  ): Promise<{ success: boolean; id: string }> {
    await this.verifyProjectAccess(projectId, userId);

    const existing = await this.prisma.cmsCollection.findFirst({
      where: { id: collectionId, projectId },
    });

    if (!existing) {
      throw new NotFoundException(`Collection "${collectionId}" not found`);
    }

    await this.prisma.cmsCollection.delete({
      where: { id: collectionId },
    });

    return { success: true, id: collectionId };
  }

  // ============================================================================
  // FIELDS
  // ============================================================================

  async addField(
    projectId: string,
    collectionId: string,
    dto: CreateCmsFieldDto,
    userId: string
  ): Promise<CmsFieldDto> {
    await this.verifyProjectAccess(projectId, userId);

    const collection = await this.prisma.cmsCollection.findFirst({
      where: { id: collectionId, projectId },
      include: { fields: true },
    });

    if (!collection) {
      throw new NotFoundException(`Collection "${collectionId}" not found`);
    }

    const key = dto.key?.trim() || this.keyify(dto.name);
    const existingKey = collection.fields.find((f) => f.key.toLowerCase() === key.toLowerCase());
    if (existingKey) {
      throw new ConflictException(`Field with key "${key}" already exists in this collection`);
    }

    const maxOrder = collection.fields.reduce((max, f) => Math.max(max, f.order), -1);

    const field = await this.prisma.cmsField.create({
      data: {
        collectionId,
        name: dto.name.trim(),
        key,
        type: dto.type as any,
        required: dto.required ?? false,
        defaultValue: dto.defaultValue ?? undefined,
        validation: dto.validation ? JSON.parse(JSON.stringify(dto.validation)) : {},
        options: dto.options ? JSON.parse(JSON.stringify(dto.options)) : [],
        order: dto.order ?? maxOrder + 1,
      },
    });

    return this.mapFieldToDto(field);
  }

  async updateField(
    projectId: string,
    collectionId: string,
    fieldId: string,
    dto: UpdateCmsFieldDto,
    userId: string
  ): Promise<CmsFieldDto> {
    await this.verifyProjectAccess(projectId, userId);

    const field = await this.prisma.cmsField.findFirst({
      where: { id: fieldId, collectionId, collection: { projectId } },
    });

    if (!field) {
      throw new NotFoundException(`Field "${fieldId}" not found in collection`);
    }

    let key = field.key;
    if (dto.key && dto.key !== field.key) {
      key = this.keyify(dto.key);
      const conflict = await this.prisma.cmsField.findUnique({
        where: { collectionId_key: { collectionId, key } },
      });
      if (conflict && conflict.id !== fieldId) {
        throw new ConflictException(`Field key "${key}" already in use`);
      }
    }

    const updated = await this.prisma.cmsField.update({
      where: { id: fieldId },
      data: {
        name: dto.name?.trim() ?? field.name,
        key,
        type: dto.type ? (dto.type as any) : field.type,
        required: dto.required !== undefined ? dto.required : field.required,
        defaultValue: dto.defaultValue !== undefined ? dto.defaultValue : field.defaultValue,
        validation: dto.validation !== undefined ? JSON.parse(JSON.stringify(dto.validation)) : field.validation,
        options: dto.options !== undefined ? JSON.parse(JSON.stringify(dto.options)) : field.options,
        order: dto.order !== undefined ? dto.order : field.order,
      },
    });

    return this.mapFieldToDto(updated);
  }

  async deleteField(
    projectId: string,
    collectionId: string,
    fieldId: string,
    userId: string
  ): Promise<{ success: boolean; id: string }> {
    await this.verifyProjectAccess(projectId, userId);

    const field = await this.prisma.cmsField.findFirst({
      where: { id: fieldId, collectionId, collection: { projectId } },
    });

    if (!field) {
      throw new NotFoundException(`Field "${fieldId}" not found`);
    }

    await this.prisma.cmsField.delete({
      where: { id: fieldId },
    });

    return { success: true, id: fieldId };
  }

  // ============================================================================
  // CONTENT MANAGEMENT & PUBLISHING WORKFLOW
  // ============================================================================

  async listContent(
    projectId: string,
    collectionIdOrSlug: string,
    query: CmsFilterQueryDto,
    userId?: string
  ): Promise<CmsPaginatedResult<CmsContentItemDto>> {
    await this.verifyProjectAccess(projectId, userId);

    const collection = await this.findCollection(projectId, collectionIdOrSlug);
    if (!collection) {
      throw new NotFoundException(`Collection "${collectionIdOrSlug}" not found`);
    }

    // Auto-promote overdue scheduled items to PUBLISHED
    await this.publishOverdueScheduledItems(projectId, collection.id);

    const page = Math.max(1, parseInt(query.page || '1', 10));
    const limit = Math.min(100, Math.max(1, parseInt(query.limit || '20', 10)));
    const skip = (page - 1) * limit;

    const where: any = {
      projectId,
      collectionId: collection.id,
    };

    if (query.status && query.status !== 'ALL') {
      where.status = query.status;
    }

    if (query.search && query.search.trim()) {
      const search = query.search.trim();
      where.OR = [
        { slug: { contains: search, mode: 'insensitive' } },
        // For JSON search in postgres:
        { data: { path: ['title'], string_contains: search } },
        { data: { path: ['name'], string_contains: search } },
      ];
    }

    const orderBy: any = {};
    const sortField = query.sortBy || 'createdAt';
    const sortOrder = query.sortOrder || 'desc';
    orderBy[sortField] = sortOrder;

    const [items, total] = await Promise.all([
      this.prisma.cmsContentItem.findMany({
        where,
        skip,
        take: limit,
        orderBy,
      }),
      this.prisma.cmsContentItem.count({ where }),
    ]);

    return {
      items: items.map(this.mapContentItemToDto),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 1,
    };
  }

  async getContentItem(
    projectId: string,
    collectionIdOrSlug: string,
    itemId: string,
    userId?: string
  ): Promise<CmsContentItemDto> {
    await this.verifyProjectAccess(projectId, userId);

    const collection = await this.findCollection(projectId, collectionIdOrSlug);
    if (!collection) {
      throw new NotFoundException(`Collection "${collectionIdOrSlug}" not found`);
    }

    const item = await this.prisma.cmsContentItem.findFirst({
      where: {
        id: itemId,
        projectId,
        collectionId: collection.id,
      },
    });

    if (!item) {
      throw new NotFoundException(`Content item "${itemId}" not found`);
    }

    return this.mapContentItemToDto(item);
  }

  async createContentItem(
    projectId: string,
    collectionIdOrSlug: string,
    dto: CreateCmsContentItemDto,
    userId: string
  ): Promise<CmsContentItemDto> {
    await this.verifyProjectAccess(projectId, userId);

    const collection = await this.findCollection(projectId, collectionIdOrSlug);
    if (!collection) {
      throw new NotFoundException(`Collection "${collectionIdOrSlug}" not found`);
    }

    // Validate fields against collection schema
    this.validateContentData(collection.fields, dto.data || {});

    let status: CmsContentStatus = dto.status || 'DRAFT';
    let publishedAt: Date | null = null;
    let scheduledAt: Date | null = null;

    if (status === 'PUBLISHED') {
      publishedAt = new Date();
    } else if (status === 'SCHEDULED') {
      if (!dto.scheduledAt) {
        throw new BadRequestException('Scheduled publication requires a valid scheduledAt date');
      }
      scheduledAt = new Date(dto.scheduledAt);
      if (isNaN(scheduledAt.getTime())) {
        throw new BadRequestException('Invalid scheduledAt date format');
      }
    }

    const item = await this.prisma.cmsContentItem.create({
      data: {
        projectId,
        collectionId: collection.id,
        slug: dto.slug?.trim() || this.extractSlugFromData(dto.data),
        data: dto.data || {},
        status: status as any,
        publishedAt,
        scheduledAt,
        authorId: userId,
      },
    });

    return this.mapContentItemToDto(item);
  }

  async updateContentItem(
    projectId: string,
    collectionIdOrSlug: string,
    itemId: string,
    dto: UpdateCmsContentItemDto,
    userId: string
  ): Promise<CmsContentItemDto> {
    await this.verifyProjectAccess(projectId, userId);

    const collection = await this.findCollection(projectId, collectionIdOrSlug);
    if (!collection) {
      throw new NotFoundException(`Collection "${collectionIdOrSlug}" not found`);
    }

    const existing = await this.prisma.cmsContentItem.findFirst({
      where: { id: itemId, projectId, collectionId: collection.id },
    });

    if (!existing) {
      throw new NotFoundException(`Content item "${itemId}" not found`);
    }

    const updatedData = dto.data ? { ...(existing.data as any), ...dto.data } : (existing.data as any);
    this.validateContentData(collection.fields, updatedData, false);

    let status = dto.status ?? (existing.status as CmsContentStatus);
    let publishedAt = existing.publishedAt;
    let scheduledAt = existing.scheduledAt;

    if (dto.status === 'PUBLISHED' && existing.status !== 'PUBLISHED') {
      publishedAt = new Date();
      scheduledAt = null;
    } else if (dto.status === 'SCHEDULED') {
      if (dto.scheduledAt) {
        scheduledAt = new Date(dto.scheduledAt);
      }
      publishedAt = null;
    } else if (dto.status === 'DRAFT') {
      publishedAt = null;
      scheduledAt = null;
    }

    const updated = await this.prisma.cmsContentItem.update({
      where: { id: itemId },
      data: {
        slug: dto.slug !== undefined ? dto.slug : existing.slug,
        data: updatedData,
        status: status as any,
        publishedAt,
        scheduledAt,
      },
    });

    return this.mapContentItemToDto(updated);
  }

  async deleteContentItem(
    projectId: string,
    collectionIdOrSlug: string,
    itemId: string,
    userId: string
  ): Promise<{ success: boolean; id: string }> {
    await this.verifyProjectAccess(projectId, userId);

    const collection = await this.findCollection(projectId, collectionIdOrSlug);
    if (!collection) {
      throw new NotFoundException(`Collection "${collectionIdOrSlug}" not found`);
    }

    const existing = await this.prisma.cmsContentItem.findFirst({
      where: { id: itemId, projectId, collectionId: collection.id },
    });

    if (!existing) {
      throw new NotFoundException(`Content item "${itemId}" not found`);
    }

    await this.prisma.cmsContentItem.delete({
      where: { id: itemId },
    });

    return { success: true, id: itemId };
  }

  async publishContentItem(
    projectId: string,
    collectionIdOrSlug: string,
    itemId: string,
    userId: string
  ): Promise<CmsContentItemDto> {
    await this.verifyProjectAccess(projectId, userId);

    const collection = await this.findCollection(projectId, collectionIdOrSlug);
    if (!collection) {
      throw new NotFoundException(`Collection "${collectionIdOrSlug}" not found`);
    }

    const updated = await this.prisma.cmsContentItem.update({
      where: { id: itemId },
      data: {
        status: 'PUBLISHED',
        publishedAt: new Date(),
        scheduledAt: null,
      },
    });

    return this.mapContentItemToDto(updated);
  }

  async unpublishContentItem(
    projectId: string,
    collectionIdOrSlug: string,
    itemId: string,
    userId: string
  ): Promise<CmsContentItemDto> {
    await this.verifyProjectAccess(projectId, userId);

    const collection = await this.findCollection(projectId, collectionIdOrSlug);
    if (!collection) {
      throw new NotFoundException(`Collection "${collectionIdOrSlug}" not found`);
    }

    const updated = await this.prisma.cmsContentItem.update({
      where: { id: itemId },
      data: {
        status: 'DRAFT',
        publishedAt: null,
        scheduledAt: null,
      },
    });

    return this.mapContentItemToDto(updated);
  }

  async schedulePublish(
    projectId: string,
    collectionIdOrSlug: string,
    itemId: string,
    scheduledAtIso: string,
    userId: string
  ): Promise<CmsContentItemDto> {
    await this.verifyProjectAccess(projectId, userId);

    const collection = await this.findCollection(projectId, collectionIdOrSlug);
    if (!collection) {
      throw new NotFoundException(`Collection "${collectionIdOrSlug}" not found`);
    }

    const scheduledDate = new Date(scheduledAtIso);
    if (isNaN(scheduledDate.getTime())) {
      throw new BadRequestException('Invalid scheduled date format');
    }

    if (scheduledDate.getTime() <= Date.now()) {
      // If scheduled in the past or immediately, mark published directly
      return this.publishContentItem(projectId, collectionIdOrSlug, itemId, userId);
    }

    const updated = await this.prisma.cmsContentItem.update({
      where: { id: itemId },
      data: {
        status: 'SCHEDULED',
        scheduledAt: scheduledDate,
        publishedAt: null,
      },
    });

    return this.mapContentItemToDto(updated);
  }

  // ============================================================================
  // PRESETS & DEMO CONTENT SEEDING
  // ============================================================================

  async seedPresetCollection(
    projectId: string,
    presetType: CmsCollectionType,
    userId: string
  ): Promise<CmsCollectionDto> {
    await this.verifyProjectAccess(projectId, userId);

    if (presetType === 'CUSTOM') {
      throw new BadRequestException('Cannot seed CUSTOM preset');
    }

    const preset = CMS_COLLECTION_PRESETS[presetType as keyof typeof CMS_COLLECTION_PRESETS];
    if (!preset) {
      throw new NotFoundException(`Preset type "${presetType}" not recognized`);
    }

    // Check if collection already exists
    let collection = await this.prisma.cmsCollection.findUnique({
      where: { projectId_slug: { projectId, slug: preset.slug } },
      include: { fields: true },
    });

    if (!collection) {
      // Create collection with all preset fields
      collection = await this.prisma.cmsCollection.create({
        data: {
          projectId,
          name: preset.name,
          slug: preset.slug,
          description: preset.description,
          type: preset.type as any,
          fields: {
            create: preset.fields.map((f) => ({
              name: f.name,
              key: f.key,
              type: f.type as any,
              required: f.required,
              defaultValue: f.defaultValue ?? undefined,
              validation: f.validation ? JSON.parse(JSON.stringify(f.validation)) : {},
              options: [],
              order: f.order,
            })),
          },
        },
        include: { fields: { orderBy: { order: 'asc' } } },
      });
    }

    // Seed realistic sample items if collection is empty
    const currentCount = await this.prisma.cmsContentItem.count({
      where: { collectionId: collection.id },
    });

    if (currentCount === 0) {
      const sampleItems = this.getSampleItemsForPreset(presetType, projectId, collection.id);
      for (const itemData of sampleItems) {
        await this.prisma.cmsContentItem.create({
          data: {
            projectId,
            collectionId: collection.id,
            slug: itemData.slug,
            data: itemData.data,
            status: itemData.status as any,
            publishedAt: itemData.publishedAt,
            scheduledAt: itemData.scheduledAt,
            authorId: userId,
          },
        });
      }
    }

    return this.getCollection(projectId, collection.id, userId);
  }

  // ============================================================================
  // PUBLIC CONTENT DELIVERY API (Used by live websites and preview)
  // ============================================================================

  async getPublicCollectionContent(
    projectId: string,
    collectionSlug: string,
    limit: number = 50
  ): Promise<CmsContentItemDto[]> {
    const collection = await this.prisma.cmsCollection.findUnique({
      where: { projectId_slug: { projectId, slug: collectionSlug } },
    });

    if (!collection) {
      return [];
    }

    // Auto-promote any overdue scheduled items
    await this.publishOverdueScheduledItems(projectId, collection.id);

    const items = await this.prisma.cmsContentItem.findMany({
      where: {
        projectId,
        collectionId: collection.id,
        status: 'PUBLISHED',
      },
      orderBy: [{ publishedAt: 'desc' }, { createdAt: 'desc' }],
      take: limit,
    });

    return items.map(this.mapContentItemToDto);
  }

  // ============================================================================
  // SCHEDULED PUBLISHING BACKGROUND EXECUTION
  // ============================================================================

  async publishOverdueScheduledItems(
    projectId?: string,
    collectionId?: string
  ): Promise<number> {
    const now = new Date();
    const where: any = {
      status: 'SCHEDULED',
      scheduledAt: { lte: now },
    };

    if (projectId) where.projectId = projectId;
    if (collectionId) where.collectionId = collectionId;

    const overdueItems = await this.prisma.cmsContentItem.findMany({
      where,
      select: { id: true, slug: true },
    });

    if (overdueItems.length === 0) return 0;

    const result = await this.prisma.cmsContentItem.updateMany({
      where: {
        id: { in: overdueItems.map((i) => i.id) },
      },
      data: {
        status: 'PUBLISHED',
        publishedAt: now,
      },
    });

    this.logger.log(`✓ Published ${result.count} scheduled CMS items`);
    return result.count;
  }

  // ============================================================================
  // INTERNAL HELPERS
  // ============================================================================

  private async findCollection(projectId: string, idOrSlug: string) {
    return this.prisma.cmsCollection.findFirst({
      where: {
        projectId,
        OR: [{ id: idOrSlug }, { slug: idOrSlug }],
      },
      include: {
        fields: { orderBy: { order: 'asc' } },
      },
    });
  }

  private validateContentData(
    fields: any[],
    data: Record<string, any>,
    checkRequired: boolean = true
  ) {
    for (const field of fields) {
      const val = data[field.key];

      if (checkRequired && field.required) {
        if (val === undefined || val === null || val === '') {
          throw new BadRequestException(`Field "${field.name}" (${field.key}) is required`);
        }
      }

      if (val !== undefined && val !== null) {
        switch (field.type) {
          case 'NUMBER':
            if (typeof val !== 'number' && isNaN(Number(val))) {
              throw new BadRequestException(`Field "${field.name}" must be a valid number`);
            }
            break;
          case 'BOOLEAN':
            if (typeof val !== 'boolean') {
              // Convert truthy string if provided
              data[field.key] = val === true || val === 'true' || val === 1 || val === '1';
            }
            break;
        }
      }
    }
  }

  private extractSlugFromData(data: Record<string, any>): string {
    const raw = data.slug || data.title || data.name || `entry-${Date.now().toString(36)}`;
    return this.slugify(String(raw));
  }

  private slugify(text: string): string {
    return text
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  }

  private keyify(text: string): string {
    return text
      .trim()
      .replace(/[^a-zA-Z0-9]+(.)/g, (_, chr) => chr.toUpperCase())
      .replace(/^[A-Z]/, (chr) => chr.toLowerCase());
  }

  private mapFieldToDto(field: any): CmsFieldDto {
    return {
      id: field.id,
      collectionId: field.collectionId,
      name: field.name,
      key: field.key,
      type: field.type as CmsFieldType,
      required: field.required,
      defaultValue: field.defaultValue,
      validation: field.validation || {},
      options: field.options || [],
      order: field.order,
      createdAt: field.createdAt,
      updatedAt: field.updatedAt,
    };
  }

  private mapContentItemToDto(item: any): CmsContentItemDto {
    return {
      id: item.id,
      collectionId: item.collectionId,
      projectId: item.projectId,
      slug: item.slug,
      data: (item.data as Record<string, any>) || {},
      status: item.status as CmsContentStatus,
      scheduledAt: item.scheduledAt,
      publishedAt: item.publishedAt,
      authorId: item.authorId,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
    };
  }

  private getSampleItemsForPreset(
    type: CmsCollectionType,
    projectId: string,
    collectionId: string
  ): any[] {
    const now = new Date();
    switch (type) {
      case 'POSTS':
        return [
          {
            slug: 'mastering-modern-web-development-2026',
            status: 'PUBLISHED',
            publishedAt: new Date(Date.now() - 86400000 * 2),
            data: {
              title: 'Mastering Modern Web Development in 2026',
              slug: 'mastering-modern-web-development-2026',
              excerpt: 'Explore how AI-augmented workflows, server actions, and component registries redefine frontend architectures.',
              content: '## The Evolution of Full-Stack Architecture\n\nModern web engineering has shifted dramatically towards unified schema-driven development. With high-performance compilation and instantaneous visual feedback, developer velocity is higher than ever.\n\n### Key Pillars\n- **Type-safe Endpoints**\n- **Dynamic CMS Ingestion**\n- **Automated Responsive Layouts**\n\nBuild fearlessly!',
              coverImage: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=1200&q=80',
              tags: 'tech',
              featured: true,
            },
          },
          {
            slug: 'design-systems-that-scale',
            status: 'PUBLISHED',
            publishedAt: new Date(Date.now() - 86400000 * 1),
            data: {
              title: 'Building Design Systems That Truly Scale',
              slug: 'design-systems-that-scale',
              excerpt: 'How multi-brand design tokens and atomic primitives create cohesion across enterprise platforms.',
              content: '## Tokens as the Source of Truth\n\nDesign tokens unify engineering and design teams. By tokenizing color curves, typography scales, and responsive breakpoints, applications can re-theme on the fly without brittle CSS rewrites.\n\nEnjoy consistent aesthetics across web and mobile viewports.',
              coverImage: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=1200&q=80',
              tags: 'design',
              featured: false,
            },
          },
          {
            slug: 'the-future-of-headless-cms',
            status: 'SCHEDULED',
            scheduledAt: new Date(Date.now() + 86400000 * 3),
            data: {
              title: 'The Future of Headless Content Platforms',
              slug: 'the-future-of-headless-cms',
              excerpt: 'Connecting dynamic database models with visual drag-and-drop canvases in real-time.',
              content: '## Seamless CMS Data Binding\n\nEditorial teams need flexibility while engineers demand strong typing. The ideal dynamic CMS bridges both worlds through real-time field bindings and scheduled publishing pipelines.',
              coverImage: 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&w=1200&q=80',
              tags: 'productivity',
              featured: false,
            },
          },
        ];

      case 'PRODUCTS':
        return [
          {
            slug: 'pro-wireless-anc-headphones',
            status: 'PUBLISHED',
            publishedAt: new Date(Date.now() - 86400000 * 5),
            data: {
              name: 'Pro Wireless ANC Headphones',
              slug: 'pro-wireless-anc-headphones',
              description: 'Studio-grade acoustic audio with active noise cancellation and 40-hour ultra battery life.',
              price: 299,
              compareAtPrice: 349,
              sku: 'AUDIO-ANC-01',
              inventory: 45,
              imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80',
              isAvailable: true,
            },
          },
          {
            slug: 'ergonomic-mechanical-keyboard',
            status: 'PUBLISHED',
            publishedAt: new Date(Date.now() - 86400000 * 3),
            data: {
              name: 'Ergonomic Mechanical Keyboard',
              slug: 'ergonomic-mechanical-keyboard',
              description: 'Custom hot-swappable switches with gasket mount engineering and aluminum CNC chassis.',
              price: 189,
              compareAtPrice: 219,
              sku: 'KB-MECH-PRO',
              inventory: 28,
              imageUrl: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=800&q=80',
              isAvailable: true,
            },
          },
          {
            slug: 'smart-desk-led-monitor-light',
            status: 'DRAFT',
            data: {
              name: 'Smart Desk LED Monitor Light Bar',
              slug: 'smart-desk-led-monitor-light',
              description: 'Asymmetric optical design with auto-dimming ambient sensor and touch controls.',
              price: 79,
              sku: 'DESK-LGT-03',
              inventory: 120,
              imageUrl: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?auto=format&fit=crop&w=800&q=80',
              isAvailable: true,
            },
          },
        ];

      case 'CATEGORIES':
        return [
          {
            slug: 'technology',
            status: 'PUBLISHED',
            publishedAt: now,
            data: {
              name: 'Technology',
              slug: 'technology',
              description: 'Engineering architectures, AI innovations, and system design.',
              image: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=80',
            },
          },
          {
            slug: 'design-systems',
            status: 'PUBLISHED',
            publishedAt: now,
            data: {
              name: 'Design Systems',
              slug: 'design-systems',
              description: 'Tokens, component libraries, accessibility, and visual guidelines.',
              image: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=800&q=80',
            },
          },
        ];

      case 'AUTHORS':
        return [
          {
            slug: 'alexandra-chen',
            status: 'PUBLISHED',
            publishedAt: now,
            data: {
              name: 'Alexandra Chen',
              bio: 'Principal Systems Architect and Design Systems enthusiast with 12+ years in cloud infrastructure.',
              avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=80',
              email: 'alexandra@nirmaanify.ai',
              twitter: '@alexandrachen',
              role: 'Lead Architect',
            },
          },
          {
            slug: 'marcus-vance',
            status: 'PUBLISHED',
            publishedAt: now,
            data: {
              name: 'Marcus Vance',
              bio: 'Full-stack engineer passionate about Next.js, compilers, and visual web builders.',
              avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
              email: 'marcus@nirmaanify.ai',
              twitter: '@marcusvance',
              role: 'Frontend Staff Engineer',
            },
          },
        ];

      default:
        return [];
    }
  }
}
