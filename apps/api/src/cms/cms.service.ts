import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import {
  CmsCollection,
  CmsEntry,
  CmsFieldDefinition,
  CreateCollectionDto,
  UpdateCollectionDto,
  CreateEntryDto,
  UpdateEntryDto,
  CmsDataSourceConfig,
} from '@nirmaanify/types';

@Injectable()
export class CmsService {
  constructor(private readonly prisma: PrismaService) {}

  // ==========================================================================
  // PRE-BUILT COLLECTION TEMPLATES
  // ==========================================================================

  getPrebuiltTemplates(): { id: string; name: string; slug: string; description: string; icon: string; fields: CmsFieldDefinition[] }[] {
    return [
      {
        id: 'posts',
        name: 'Blog Posts',
        slug: 'posts',
        description: 'Editorial articles, news, and rich-text blog publications.',
        icon: 'FileText',
        fields: [
          { id: 'f-title', name: 'Title', key: 'title', type: 'TEXT', required: true, helpText: 'Main post headline' },
          { id: 'f-slug', name: 'URL Slug', key: 'slug', type: 'TEXT', required: true, helpText: 'Unique URL path (e.g. intro-to-ai)' },
          { id: 'f-excerpt', name: 'Short Excerpt', key: 'excerpt', type: 'TEXT', required: false, helpText: 'Summary for preview cards' },
          { id: 'f-content', name: 'Article Content', key: 'content', type: 'RICH_TEXT', required: true, helpText: 'Full article body with formatting' },
          { id: 'f-cover', name: 'Cover Image URL', key: 'coverImage', type: 'IMAGE', required: false, helpText: 'Header graphic thumbnail' },
          {
            id: 'f-cat',
            name: 'Category',
            key: 'category',
            type: 'SELECT',
            required: false,
            options: [
              { label: 'Architecture', value: 'architecture' },
              { label: 'Engineering', value: 'engineering' },
              { label: 'Design Systems', value: 'design-systems' },
              { label: 'AI Platform', value: 'ai-platform' },
            ],
          },
          { id: 'f-author', name: 'Author Name', key: 'author', type: 'TEXT', required: false, defaultValue: 'Editorial Staff' },
          { id: 'f-featured', name: 'Featured Article', key: 'isFeatured', type: 'BOOLEAN', required: false, defaultValue: false },
        ],
      },
      {
        id: 'products',
        name: 'E-Commerce Products',
        slug: 'products',
        description: 'Catalog items with pricing, inventory, images, and category tags.',
        icon: 'ShoppingBag',
        fields: [
          { id: 'f-prod-title', name: 'Product Name', key: 'title', type: 'TEXT', required: true },
          { id: 'f-prod-slug', name: 'Product Slug', key: 'slug', type: 'TEXT', required: true },
          { id: 'f-prod-price', name: 'Sale Price ($)', key: 'price', type: 'NUMBER', required: true, defaultValue: 49.0 },
          { id: 'f-prod-orig-price', name: 'Original Price ($)', key: 'originalPrice', type: 'NUMBER', required: false },
          { id: 'f-prod-sku', name: 'SKU / Item Code', key: 'sku', type: 'TEXT', required: false },
          { id: 'f-prod-desc', name: 'Description', key: 'description', type: 'RICH_TEXT', required: false },
          { id: 'f-prod-img', name: 'Thumbnail Image URL', key: 'imageUrl', type: 'IMAGE', required: true },
          {
            id: 'f-prod-cat',
            name: 'Department / Category',
            key: 'category',
            type: 'SELECT',
            required: false,
            options: [
              { label: 'Apparel', value: 'apparel' },
              { label: 'Outerwear', value: 'outerwear' },
              { label: 'Accessories', value: 'accessories' },
              { label: 'Footwear', value: 'footwear' },
            ],
          },
          { id: 'f-prod-stock', name: 'In Stock', key: 'inStock', type: 'BOOLEAN', required: false, defaultValue: true },
          { id: 'f-prod-badge', name: 'Badge Pill', key: 'badgeText', type: 'TEXT', required: false, defaultValue: 'New' },
        ],
      },
      {
        id: 'categories',
        name: 'Categories & Taxonomies',
        slug: 'categories',
        description: 'Grouping taxonomies for posts, products, and media.',
        icon: 'Tag',
        fields: [
          { id: 'f-cat-name', name: 'Category Name', key: 'name', type: 'TEXT', required: true },
          { id: 'f-cat-slug', name: 'Category Slug', key: 'slug', type: 'TEXT', required: true },
          { id: 'f-cat-desc', name: 'Description', key: 'description', type: 'TEXT', required: false },
          { id: 'f-cat-color', name: 'Accent Color', key: 'color', type: 'TEXT', required: false, defaultValue: '#635BFF' },
        ],
      },
      {
        id: 'authors',
        name: 'Authors & Team',
        slug: 'authors',
        description: 'Creator bios, social links, and avatars.',
        icon: 'Users',
        fields: [
          { id: 'f-auth-name', name: 'Full Name', key: 'name', type: 'TEXT', required: true },
          { id: 'f-auth-slug', name: 'Profile Slug', key: 'slug', type: 'TEXT', required: true },
          { id: 'f-auth-role', name: 'Job Title / Role', key: 'role', type: 'TEXT', required: false, defaultValue: 'Staff Writer' },
          { id: 'f-auth-bio', name: 'Biography', key: 'bio', type: 'TEXT', required: false },
          { id: 'f-auth-avatar', name: 'Avatar URL', key: 'avatarUrl', type: 'IMAGE', required: false },
        ],
      },
    ];
  }

  // ==========================================================================
  // 1. COLLECTIONS MANAGEMENT
  // ==========================================================================

  async initializeDefaultCollections(projectId: string): Promise<CmsCollection[]> {
    const templates = this.getPrebuiltTemplates();
    const created: CmsCollection[] = [];

    for (const t of templates) {
      const existing = await this.prisma.cmsCollection.findUnique({
        where: {
          projectId_slug: {
            projectId,
            slug: t.slug,
          },
        },
      });

      if (!existing) {
        const col = await this.prisma.cmsCollection.create({
          data: {
            projectId,
            name: t.name,
            slug: t.slug,
            description: t.description,
            icon: t.icon,
            fields: t.fields as any,
            isSystem: false,
          },
        });

        // Seed initial sample entries for blog and products
        if (t.slug === 'posts') {
          await this.createSamplePosts(projectId, col.id);
        } else if (t.slug === 'products') {
          await this.createSampleProducts(projectId, col.id);
        }

        created.push(this.mapCollection(col));
      }
    }

    return created;
  }

  async createCollection(projectId: string, dto: CreateCollectionDto): Promise<CmsCollection> {
    const slug = dto.slug.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const existing = await this.prisma.cmsCollection.findUnique({
      where: {
        projectId_slug: { projectId, slug },
      },
    });

    if (existing) {
      throw new BadRequestException(`Collection with slug "${slug}" already exists in this project.`);
    }

    const collection = await this.prisma.cmsCollection.create({
      data: {
        projectId,
        name: dto.name,
        slug,
        description: dto.description || '',
        icon: dto.icon || 'Folder',
        fields: (dto.fields || []) as any,
        isSystem: false,
      },
    });

    return this.mapCollection(collection);
  }

  async listCollections(projectId: string): Promise<CmsCollection[]> {
    let collections = await this.prisma.cmsCollection.findMany({
      where: { projectId },
      orderBy: { createdAt: 'asc' },
    });

    if (collections.length === 0) {
      await this.initializeDefaultCollections(projectId);
      collections = await this.prisma.cmsCollection.findMany({
        where: { projectId },
        orderBy: { createdAt: 'asc' },
      });
    }

    return collections.map((c) => this.mapCollection(c));
  }

  async getCollection(id: string): Promise<CmsCollection> {
    const col = await this.prisma.cmsCollection.findUnique({ where: { id } });
    if (!col) throw new NotFoundException('CMS Collection not found.');
    return this.mapCollection(col);
  }

  async updateCollection(id: string, dto: UpdateCollectionDto): Promise<CmsCollection> {
    const col = await this.prisma.cmsCollection.update({
      where: { id },
      data: {
        name: dto.name,
        slug: dto.slug ? dto.slug.toLowerCase().replace(/[^a-z0-9]+/g, '-') : undefined,
        description: dto.description,
        icon: dto.icon,
        fields: dto.fields ? (dto.fields as any) : undefined,
      },
    });

    return this.mapCollection(col);
  }

  async deleteCollection(id: string): Promise<{ success: boolean }> {
    await this.prisma.cmsCollection.delete({ where: { id } });
    return { success: true };
  }

  // ==========================================================================
  // 2. CONTENT ENTRIES MANAGEMENT
  // ==========================================================================

  async createEntry(
    projectId: string,
    collectionId: string,
    dto: CreateEntryDto,
    authorId?: string
  ): Promise<CmsEntry> {
    const collection = await this.prisma.cmsCollection.findUnique({ where: { id: collectionId } });
    if (!collection) throw new NotFoundException('Target collection not found.');

    const slug = dto.slug
      ? dto.slug.toLowerCase().replace(/[^a-z0-9]+/g, '-')
      : `entry-${Date.now().toString(36)}`;

    const existing = await this.prisma.cmsEntry.findUnique({
      where: {
        collectionId_slug: { collectionId, slug },
      },
    });

    if (existing) {
      throw new BadRequestException(`Entry with slug "${slug}" already exists in this collection.`);
    }

    const entry = await this.prisma.cmsEntry.create({
      data: {
        projectId,
        collectionId,
        slug,
        status: (dto.status || 'DRAFT') as any,
        data: dto.data || {},
        scheduledPublishAt: dto.scheduledPublishAt ? new Date(dto.scheduledPublishAt) : null,
        publishedAt: dto.status === 'PUBLISHED' ? new Date() : null,
        authorId,
      },
    });

    return this.mapEntry(entry);
  }

  async listEntries(
    collectionId: string,
    query: { status?: string; search?: string; limit?: number; offset?: number } = {}
  ): Promise<{ entries: CmsEntry[]; total: number }> {
    const where: any = { collectionId };

    if (query.status && query.status !== 'ALL') {
      where.status = query.status;
    }

    const [entries, total] = await Promise.all([
      this.prisma.cmsEntry.findMany({
        where,
        take: query.limit ? Number(query.limit) : 50,
        skip: query.offset ? Number(query.offset) : 0,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.cmsEntry.count({ where }),
    ]);

    return {
      entries: entries.map((e) => this.mapEntry(e)),
      total,
    };
  }

  async getEntry(id: string): Promise<CmsEntry> {
    const entry = await this.prisma.cmsEntry.findUnique({ where: { id } });
    if (!entry) throw new NotFoundException('CMS Entry not found.');
    return this.mapEntry(entry);
  }

  async updateEntry(id: string, dto: UpdateEntryDto): Promise<CmsEntry> {
    const existing = await this.prisma.cmsEntry.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('CMS Entry not found.');

    const isPublishing = dto.status === 'PUBLISHED' && existing.status !== 'PUBLISHED';

    const entry = await this.prisma.cmsEntry.update({
      where: { id },
      data: {
        slug: dto.slug ? dto.slug.toLowerCase().replace(/[^a-z0-9]+/g, '-') : undefined,
        status: dto.status as any,
        data: dto.data !== undefined ? dto.data : undefined,
        scheduledPublishAt: dto.scheduledPublishAt ? new Date(dto.scheduledPublishAt) : undefined,
        publishedAt: isPublishing ? new Date() : undefined,
      },
    });

    return this.mapEntry(entry);
  }

  async deleteEntry(id: string): Promise<{ success: boolean }> {
    await this.prisma.cmsEntry.delete({ where: { id } });
    return { success: true };
  }

  async publishEntry(id: string): Promise<CmsEntry> {
    return this.updateEntry(id, { status: 'PUBLISHED' });
  }

  async archiveEntry(id: string): Promise<CmsEntry> {
    return this.updateEntry(id, { status: 'ARCHIVED' });
  }

  // ==========================================================================
  // 3. FRONTEND CMS DATA SOURCE PUBLIC QUERY ENGINE
  // ==========================================================================

  async queryCmsData(
    projectSlug: string,
    collectionSlug: string,
    config: CmsDataSourceConfig = { collectionSlug }
  ): Promise<{ data: any[]; total: number; collection: CmsCollection }> {
    const project = await this.prisma.project.findFirst({
      where: { slug: projectSlug },
    });

    if (!project) throw new NotFoundException(`Project "${projectSlug}" not found.`);

    const collection = await this.prisma.cmsCollection.findUnique({
      where: {
        projectId_slug: {
          projectId: project.id,
          slug: collectionSlug,
        },
      },
    });

    if (!collection) throw new NotFoundException(`Collection "${collectionSlug}" not found.`);

    const where: any = {
      collectionId: collection.id,
      status: 'PUBLISHED',
    };

    const entries = await this.prisma.cmsEntry.findMany({
      where,
      take: config.limit || 20,
      skip: config.offset || 0,
      orderBy: { createdAt: config.sort?.direction || 'desc' },
    });

    const total = await this.prisma.cmsEntry.count({ where });

    const formattedData = entries.map((e) => ({
      id: e.id,
      slug: e.slug,
      publishedAt: e.publishedAt,
      createdAt: e.createdAt,
      ...((e.data as Record<string, any>) || {}),
    }));

    return {
      data: formattedData,
      total,
      collection: this.mapCollection(collection),
    };
  }

  // ==========================================================================
  // HELPER MAPPERS & SEED DATA
  // ==========================================================================

  private mapCollection(c: any): CmsCollection {
    return {
      id: c.id,
      projectId: c.projectId,
      name: c.name,
      slug: c.slug,
      description: c.description || '',
      icon: c.icon || 'Folder',
      fields: (c.fields as CmsFieldDefinition[]) || [],
      isSystem: Boolean(c.isSystem),
      createdAt: c.createdAt.toISOString(),
      updatedAt: c.updatedAt.toISOString(),
    };
  }

  private mapEntry(e: any): CmsEntry {
    return {
      id: e.id,
      projectId: e.projectId,
      collectionId: e.collectionId,
      slug: e.slug,
      status: e.status,
      data: (e.data as Record<string, any>) || {},
      scheduledPublishAt: e.scheduledPublishAt ? e.scheduledPublishAt.toISOString() : null,
      publishedAt: e.publishedAt ? e.publishedAt.toISOString() : null,
      authorId: e.authorId || null,
      createdAt: e.createdAt.toISOString(),
      updatedAt: e.updatedAt.toISOString(),
    };
  }

  private async createSamplePosts(projectId: string, collectionId: string) {
    const posts = [
      {
        slug: 'building-autonomous-cloud-architectures',
        status: 'PUBLISHED',
        data: {
          title: 'Building Autonomous Cloud Architectures with AI',
          excerpt: 'How declarative JSON schemas and unified design systems enable 10x faster product velocity.',
          content: 'Modern engineering teams are transitioning from static component libraries to fullstack declarative generators. By decoupling visual schema definitions from platform targets, Nirmaanify enables instant deployment to Next.js 15, NestJS, and AWS.',
          coverImage: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80',
          category: 'ai-platform',
          author: 'Alex Vance',
          isFeatured: true,
        },
      },
      {
        slug: 'mastering-design-token-pipelines',
        status: 'PUBLISHED',
        data: {
          title: 'Mastering Design Token Pipelines Across React & Tailwind',
          excerpt: 'Explore how unified design tokens synchronize typography, spacing, and colors.',
          content: 'A cohesive design token contract ensures that Figma tokens, web components, and dynamic studio controls share the exact same source of truth.',
          coverImage: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=800&auto=format&fit=crop&q=80',
          category: 'design-systems',
          author: 'Marcus Vance',
          isFeatured: false,
        },
      },
    ];

    for (const p of posts) {
      await this.prisma.cmsEntry.create({
        data: {
          projectId,
          collectionId,
          slug: p.slug,
          status: p.status as any,
          data: p.data,
          publishedAt: new Date(),
        },
      });
    }
  }

  private async createSampleProducts(projectId: string, collectionId: string) {
    const products = [
      {
        slug: 'wool-tailored-blazer',
        status: 'PUBLISHED',
        data: {
          title: 'Merino Wool Oversized Blazer',
          price: 189.0,
          originalPrice: 240.0,
          sku: 'BLZ-902-WOOL',
          description: 'Handcrafted oversized blazer tailored with 100% fine Italian merino wool.',
          imageUrl: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=600&auto=format&fit=crop&q=80',
          category: 'outerwear',
          inStock: true,
          badgeText: 'Bestseller',
        },
      },
      {
        slug: 'silk-structured-shirt',
        status: 'PUBLISHED',
        data: {
          title: 'Structured Mulberry Silk Shirt',
          price: 145.0,
          originalPrice: 180.0,
          sku: 'SHRT-410-SILK',
          description: 'Minimalist silhouette cut from 22-momme organic mulberry silk.',
          imageUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600&auto=format&fit=crop&q=80',
          category: 'apparel',
          inStock: true,
          badgeText: 'New',
        },
      },
    ];

    for (const pr of products) {
      await this.prisma.cmsEntry.create({
        data: {
          projectId,
          collectionId,
          slug: pr.slug,
          status: pr.status as any,
          data: pr.data,
          publishedAt: new Date(),
        },
      });
    }
  }
}
