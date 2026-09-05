/**
 * CMS & Content Management Types
 * Defines collections, schema fields, content items, publishing lifecycle, and frontend data bindings.
 */

export type CmsCollectionType =
  | 'POSTS'
  | 'PRODUCTS'
  | 'CATEGORIES'
  | 'AUTHORS'
  | 'CUSTOM';

export type CmsFieldType =
  | 'TEXT'
  | 'RICH_TEXT'
  | 'NUMBER'
  | 'BOOLEAN'
  | 'DATE'
  | 'IMAGE'
  | 'FILE'
  | 'SELECT'
  | 'RELATION'
  | 'JSON';

export type CmsContentStatus =
  | 'DRAFT'
  | 'PUBLISHED'
  | 'SCHEDULED'
  | 'ARCHIVED';

export interface CmsFieldValidation {
  min?: number;
  max?: number;
  regex?: string;
  pattern?: string;
  allowedValues?: string[];
  options?: Array<{ label: string; value: string }>;
  targetCollectionId?: string;
  targetCollectionSlug?: string;
  targetDisplayField?: string;
  allowedMimeTypes?: string[];
  step?: number;
}

export interface CmsFieldDto {
  id: string;
  collectionId: string;
  name: string;
  key: string;
  type: CmsFieldType;
  required: boolean;
  defaultValue?: any;
  validation?: CmsFieldValidation;
  options?: any;
  order: number;
  createdAt: string | Date;
  updatedAt: string | Date;
}

export interface CmsCollectionDto {
  id: string;
  workspaceId: string;
  projectId?: string | null;
  name: string;
  slug: string;
  description?: string | null;
  type: CmsCollectionType;
  isSystem?: boolean;
  fields: CmsFieldDto[];
  itemCount?: number;
  createdAt: string | Date;
  updatedAt: string | Date;
}

export interface CmsContentItemDto {
  id: string;
  workspaceId: string;
  collectionId: string;
  projectId?: string | null;
  slug?: string | null;
  data: Record<string, any>;
  status: CmsContentStatus;
  scheduledAt?: string | Date | null;
  publishedAt?: string | Date | null;
  authorId?: string | null;
  createdAt: string | Date;
  updatedAt: string | Date;
}

// ==========================================
// DTOs for API operations
// ==========================================

export interface CreateCmsCollectionDto {
  name: string;
  slug?: string;
  description?: string;
  type?: CmsCollectionType;
  fields?: Array<Omit<CreateCmsFieldDto, 'collectionId'>>;
}

export interface UpdateCmsCollectionDto {
  name?: string;
  slug?: string;
  description?: string;
}

export interface CreateCmsFieldDto {
  name: string;
  key?: string;
  type: CmsFieldType;
  required?: boolean;
  defaultValue?: any;
  validation?: CmsFieldValidation;
  options?: any;
  order?: number;
}

export interface UpdateCmsFieldDto {
  name?: string;
  key?: string;
  type?: CmsFieldType;
  required?: boolean;
  defaultValue?: any;
  validation?: CmsFieldValidation;
  options?: any;
  order?: number;
}

export interface CreateCmsContentItemDto {
  slug?: string;
  data: Record<string, any>;
  status?: CmsContentStatus;
  scheduledAt?: string | Date | null;
}

export interface UpdateCmsContentItemDto {
  slug?: string;
  data?: Record<string, any>;
  status?: CmsContentStatus;
  scheduledAt?: string | Date | null;
}

export interface CmsFilterOptions {
  status?: CmsContentStatus | 'ALL';
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface CmsPaginatedResult<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface CmsBindingConfig {
  collectionSlug: string;
  fieldKey?: string;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  status?: CmsContentStatus;
  filter?: Record<string, any>;
  mapping?: {
    titleField?: string;
    descriptionField?: string;
    imageField?: string;
    badgeField?: string;
    dateField?: string;
    priceField?: string;
    authorField?: string;
    categoryField?: string;
    linkField?: string;
    [key: string]: string | undefined;
  };
}

// ==========================================
// BUILT-IN COLLECTION PRESETS
// ==========================================

export interface CmsPresetTemplate {
  name: string;
  slug: string;
  type: CmsCollectionType;
  description: string;
  fields: Array<{
    name: string;
    key: string;
    type: CmsFieldType;
    required: boolean;
    defaultValue?: any;
    validation?: CmsFieldValidation;
    order: number;
  }>;
}

export const CMS_COLLECTION_PRESETS: Record<Exclude<CmsCollectionType, 'CUSTOM'>, CmsPresetTemplate> = {
  POSTS: {
    name: 'Blog Posts',
    slug: 'posts',
    type: 'POSTS',
    description: 'Articles, blog entries, news, and editorial publications.',
    fields: [
      { name: 'Title', key: 'title', type: 'TEXT', required: true, order: 0 },
      { name: 'Slug', key: 'slug', type: 'TEXT', required: true, order: 1 },
      { name: 'Excerpt', key: 'excerpt', type: 'TEXT', required: false, order: 2 },
      { name: 'Content', key: 'content', type: 'RICH_TEXT', required: true, order: 3 },
      { name: 'Cover Image', key: 'coverImage', type: 'IMAGE', required: false, order: 4 },
      { name: 'Author', key: 'author', type: 'RELATION', required: false, validation: { targetCollectionSlug: 'authors', targetDisplayField: 'name' }, order: 5 },
      { name: 'Category', key: 'category', type: 'RELATION', required: false, validation: { targetCollectionSlug: 'categories', targetDisplayField: 'name' }, order: 6 },
      { name: 'Tags', key: 'tags', type: 'SELECT', required: false, validation: { options: [{ label: 'Technology', value: 'tech' }, { label: 'Design', value: 'design' }, { label: 'Productivity', value: 'productivity' }] }, order: 7 },
      { name: 'Featured', key: 'featured', type: 'BOOLEAN', required: false, defaultValue: false, order: 8 },
    ],
  },
  PRODUCTS: {
    name: 'Products',
    slug: 'products',
    type: 'PRODUCTS',
    description: 'E-commerce product catalog, inventory items, and digital goods.',
    fields: [
      { name: 'Name', key: 'name', type: 'TEXT', required: true, order: 0 },
      { name: 'Slug', key: 'slug', type: 'TEXT', required: true, order: 1 },
      { name: 'Description', key: 'description', type: 'RICH_TEXT', required: false, order: 2 },
      { name: 'Price', key: 'price', type: 'NUMBER', required: true, defaultValue: 0, order: 3 },
      { name: 'Compare Price', key: 'compareAtPrice', type: 'NUMBER', required: false, order: 4 },
      { name: 'SKU', key: 'sku', type: 'TEXT', required: false, order: 5 },
      { name: 'Inventory Count', key: 'inventory', type: 'NUMBER', required: false, defaultValue: 100, order: 6 },
      { name: 'Product Image', key: 'imageUrl', type: 'IMAGE', required: false, order: 7 },
      { name: 'Category', key: 'category', type: 'RELATION', required: false, validation: { targetCollectionSlug: 'categories', targetDisplayField: 'name' }, order: 8 },
      { name: 'Available', key: 'isAvailable', type: 'BOOLEAN', required: false, defaultValue: true, order: 9 },
    ],
  },
  CATEGORIES: {
    name: 'Categories',
    slug: 'categories',
    type: 'CATEGORIES',
    description: 'Taxonomies, topics, and classification groupings.',
    fields: [
      { name: 'Category Name', key: 'name', type: 'TEXT', required: true, order: 0 },
      { name: 'Slug', key: 'slug', type: 'TEXT', required: true, order: 1 },
      { name: 'Description', key: 'description', type: 'TEXT', required: false, order: 2 },
      { name: 'Banner Image', key: 'image', type: 'IMAGE', required: false, order: 3 },
      { name: 'Parent Category', key: 'parentCategory', type: 'RELATION', required: false, validation: { targetCollectionSlug: 'categories', targetDisplayField: 'name' }, order: 4 },
    ],
  },
  AUTHORS: {
    name: 'Authors',
    slug: 'authors',
    type: 'AUTHORS',
    description: 'Content creators, team members, and contributors.',
    fields: [
      { name: 'Full Name', key: 'name', type: 'TEXT', required: true, order: 0 },
      { name: 'Bio', key: 'bio', type: 'TEXT', required: false, order: 1 },
      { name: 'Avatar', key: 'avatar', type: 'IMAGE', required: false, order: 2 },
      { name: 'Email Address', key: 'email', type: 'TEXT', required: false, order: 3 },
      { name: 'Social Profile', key: 'twitter', type: 'TEXT', required: false, order: 4 },
      { name: 'Role / Title', key: 'role', type: 'TEXT', required: false, defaultValue: 'Contributor', order: 5 },
    ],
  },
};
