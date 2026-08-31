import { z } from 'zod';

// ============================================================================
// 1. CMS FIELD TYPES & DEFINITIONS
// ============================================================================

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

export interface CmsFieldValidation {
  min?: number;
  max?: number;
  pattern?: string;
  customMessage?: string;
}

export interface CmsSelectOption {
  label: string;
  value: string;
}

export interface CmsFieldDefinition {
  id: string;
  name: string;
  key: string;
  type: CmsFieldType;
  required: boolean;
  validation?: CmsFieldValidation;
  defaultValue?: any;
  options?: CmsSelectOption[]; // for SELECT
  relationTo?: string; // target collection slug/ID
  helpText?: string;
  placeholder?: string;
}

export const CmsFieldDefinitionSchema = z.object({
  id: z.string(),
  name: z.string().min(1),
  key: z.string().min(1),
  type: z.enum([
    'TEXT',
    'RICH_TEXT',
    'NUMBER',
    'BOOLEAN',
    'DATE',
    'IMAGE',
    'FILE',
    'SELECT',
    'RELATION',
    'JSON',
  ]),
  required: z.boolean().default(false),
  validation: z
    .object({
      min: z.number().optional(),
      max: z.number().optional(),
      pattern: z.string().optional(),
      customMessage: z.string().optional(),
    })
    .optional(),
  defaultValue: z.any().optional(),
  options: z
    .array(
      z.object({
        label: z.string(),
        value: z.string(),
      })
    )
    .optional(),
  relationTo: z.string().optional(),
  helpText: z.string().optional(),
  placeholder: z.string().optional(),
});

// ============================================================================
// 2. CMS COLLECTION SCHEMA
// ============================================================================

export interface CmsCollection {
  id: string;
  projectId: string;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  fields: CmsFieldDefinition[];
  isSystem?: boolean;
  createdAt: string;
  updatedAt: string;
}

export const CmsCollectionSchema = z.object({
  id: z.string(),
  projectId: z.string(),
  name: z.string().min(1),
  slug: z.string().min(1),
  description: z.string().optional(),
  icon: z.string().optional(),
  fields: z.array(CmsFieldDefinitionSchema).default([]),
  isSystem: z.boolean().optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

// ============================================================================
// 3. CMS CONTENT ENTRY & LIFECYCLE
// ============================================================================

export type CmsEntryStatus = 'DRAFT' | 'PUBLISHED' | 'SCHEDULED' | 'ARCHIVED';

export interface CmsEntry {
  id: string;
  projectId: string;
  collectionId: string;
  slug: string;
  status: CmsEntryStatus;
  data: Record<string, any>;
  scheduledPublishAt?: string | null;
  publishedAt?: string | null;
  authorId?: string | null;
  createdAt: string;
  updatedAt: string;
}

export const CmsEntrySchema = z.object({
  id: z.string(),
  projectId: z.string(),
  collectionId: z.string(),
  slug: z.string().min(1),
  status: z.enum(['DRAFT', 'PUBLISHED', 'SCHEDULED', 'ARCHIVED']),
  data: z.record(z.any()),
  scheduledPublishAt: z.string().nullable().optional(),
  publishedAt: z.string().nullable().optional(),
  authorId: z.string().nullable().optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

// ============================================================================
// 4. CMS DATA SOURCE & BINDING QUERY
// ============================================================================

export interface CmsDataSourceConfig {
  collectionSlug: string;
  limit?: number;
  offset?: number;
  filter?: Record<string, any>;
  sort?: {
    field: string;
    direction: 'asc' | 'desc';
  };
  status?: CmsEntryStatus;
}

export interface CmsBindingMapping {
  titleField?: string;
  subtitleField?: string;
  bodyField?: string;
  imageField?: string;
  priceField?: string;
  categoryField?: string;
  dateField?: string;
  slugField?: string;
}

// ============================================================================
// 5. DTO TYPES FOR API REQUESTS
// ============================================================================

export interface CreateCollectionDto {
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  fields?: CmsFieldDefinition[];
}

export interface UpdateCollectionDto {
  name?: string;
  slug?: string;
  description?: string;
  icon?: string;
  fields?: CmsFieldDefinition[];
}

export interface CreateEntryDto {
  slug: string;
  status?: CmsEntryStatus;
  data: Record<string, any>;
  scheduledPublishAt?: string;
}

export interface UpdateEntryDto {
  slug?: string;
  status?: CmsEntryStatus;
  data?: Record<string, any>;
  scheduledPublishAt?: string;
}
