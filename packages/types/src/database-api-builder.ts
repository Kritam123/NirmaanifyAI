import { z } from 'zod';

// ============================================================================
// 1. DATA MODEL FIELD TYPES & RELATIONS
// ============================================================================

export type DataModelFieldType =
  | 'String'
  | 'Int'
  | 'Float'
  | 'Boolean'
  | 'DateTime'
  | 'Enum'
  | 'Json'
  | 'Relation';

export type DataModelRelationType =
  | 'ONE_TO_ONE'
  | 'ONE_TO_MANY'
  | 'MANY_TO_ONE'
  | 'MANY_TO_MANY';

export interface DataModelField {
  id: string;
  name: string;
  type: DataModelFieldType;
  isId?: boolean;
  isUnique?: boolean;
  isNullable?: boolean;
  defaultValue?: string;
  enumValues?: string[];
  relationTarget?: string; // Target Model Name
  relationType?: DataModelRelationType;
  relationForeignKey?: string;
  documentation?: string;
}

export interface DataModel {
  id: string;
  name: string;
  pluralName: string;
  description?: string;
  fields: DataModelField[];
  indexes?: { fields: string[]; isUnique?: boolean }[];
  isSystem?: boolean;
}

export interface ApiRouteConfig {
  id: string;
  modelId: string;
  modelName: string;
  path: string;
  method: 'GET' | 'POST' | 'PATCH' | 'DELETE';
  operation: 'LIST' | 'GET_ONE' | 'CREATE' | 'UPDATE' | 'DELETE';
  authRequired: boolean;
  roles?: string[];
  enabled: boolean;
  pagination?: {
    defaultLimit: number;
    maxLimit: number;
  };
  allowFiltering?: boolean;
  allowSorting?: boolean;
  allowedFilterFields?: string[];
  allowedSortFields?: string[];
}

export interface DatabaseApiSchema {
  models: DataModel[];
  apiRoutes: ApiRouteConfig[];
}

export const DataModelFieldSchema = z.object({
  id: z.string(),
  name: z.string().min(1),
  type: z.enum(['String', 'Int', 'Float', 'Boolean', 'DateTime', 'Enum', 'Json', 'Relation']),
  isId: z.boolean().optional(),
  isUnique: z.boolean().optional(),
  isNullable: z.boolean().optional(),
  defaultValue: z.string().optional(),
  enumValues: z.array(z.string()).optional(),
  relationTarget: z.string().optional(),
  relationType: z.enum(['ONE_TO_ONE', 'ONE_TO_MANY', 'MANY_TO_ONE', 'MANY_TO_MANY']).optional(),
  relationForeignKey: z.string().optional(),
  documentation: z.string().optional(),
});

export const DataModelSchema = z.object({
  id: z.string(),
  name: z.string().min(1),
  pluralName: z.string().min(1),
  description: z.string().optional(),
  fields: z.array(DataModelFieldSchema).default([]),
  indexes: z
    .array(
      z.object({
        fields: z.array(z.string()),
        isUnique: z.boolean().optional(),
      })
    )
    .optional(),
  isSystem: z.boolean().optional(),
});

export const ApiRouteConfigSchema = z.object({
  id: z.string(),
  modelId: z.string(),
  modelName: z.string(),
  path: z.string(),
  method: z.enum(['GET', 'POST', 'PATCH', 'DELETE']),
  operation: z.enum(['LIST', 'GET_ONE', 'CREATE', 'UPDATE', 'DELETE']),
  authRequired: z.boolean().default(false),
  roles: z.array(z.string()).optional(),
  enabled: z.boolean().default(true),
  pagination: z
    .object({
      defaultLimit: z.number().default(20),
      maxLimit: z.number().default(100),
    })
    .optional(),
  allowFiltering: z.boolean().default(true),
  allowSorting: z.boolean().default(true),
  allowedFilterFields: z.array(z.string()).optional(),
  allowedSortFields: z.array(z.string()).optional(),
});

export const DatabaseApiSchemaValidator = z.object({
  models: z.array(DataModelSchema).default([]),
  apiRoutes: z.array(ApiRouteConfigSchema).default([]),
});

export function getDefaultDatabaseApiSchema(): DatabaseApiSchema {
  const defaultModels: DataModel[] = [
    {
      id: 'model-user',
      name: 'User',
      pluralName: 'Users',
      description: 'System identity accounts with authentication credentials and roles.',
      isSystem: true,
      fields: [
        { id: 'f-u-id', name: 'id', type: 'String', isId: true, isUnique: true, defaultValue: 'uuid()' },
        { id: 'f-u-email', name: 'email', type: 'String', isUnique: true, isNullable: false },
        { id: 'f-u-password', name: 'passwordHash', type: 'String', isNullable: false },
        { id: 'f-u-name', name: 'name', type: 'String', isNullable: false },
        { id: 'f-u-role', name: 'role', type: 'Enum', enumValues: ['ADMIN', 'DEVELOPER', 'MEMBER', 'CUSTOMER'], defaultValue: 'MEMBER' },
        { id: 'f-u-avatar', name: 'avatarUrl', type: 'String', isNullable: true },
        { id: 'f-u-orders', name: 'orders', type: 'Relation', relationTarget: 'Order', relationType: 'ONE_TO_MANY' },
        { id: 'f-u-created', name: 'createdAt', type: 'DateTime', defaultValue: 'now()' },
        { id: 'f-u-updated', name: 'updatedAt', type: 'DateTime' },
      ],
    },
    {
      id: 'model-product',
      name: 'Product',
      pluralName: 'Products',
      description: 'E-commerce products catalog with pricing, category tags, and inventory.',
      fields: [
        { id: 'f-p-id', name: 'id', type: 'String', isId: true, isUnique: true, defaultValue: 'uuid()' },
        { id: 'f-p-name', name: 'name', type: 'String', isNullable: false },
        { id: 'f-p-slug', name: 'slug', type: 'String', isUnique: true, isNullable: false },
        { id: 'f-p-desc', name: 'description', type: 'String', isNullable: true },
        { id: 'f-p-price', name: 'price', type: 'Float', isNullable: false, defaultValue: '0.0' },
        { id: 'f-p-orig', name: 'originalPrice', type: 'Float', isNullable: true },
        { id: 'f-p-stock', name: 'stockCount', type: 'Int', defaultValue: '10' },
        { id: 'f-p-instock', name: 'inStock', type: 'Boolean', defaultValue: 'true' },
        { id: 'f-p-img', name: 'imageUrl', type: 'String', isNullable: false },
        { id: 'f-p-cat', name: 'category', type: 'Relation', relationTarget: 'Category', relationType: 'MANY_TO_ONE', relationForeignKey: 'categoryId' },
        { id: 'f-p-created', name: 'createdAt', type: 'DateTime', defaultValue: 'now()' },
      ],
    },
    {
      id: 'model-category',
      name: 'Category',
      pluralName: 'Categories',
      description: 'Hierarchical taxonomies for organizing items.',
      fields: [
        { id: 'f-c-id', name: 'id', type: 'String', isId: true, isUnique: true, defaultValue: 'uuid()' },
        { id: 'f-c-name', name: 'name', type: 'String', isNullable: false },
        { id: 'f-c-slug', name: 'slug', type: 'String', isUnique: true, isNullable: false },
        { id: 'f-c-products', name: 'products', type: 'Relation', relationTarget: 'Product', relationType: 'ONE_TO_MANY' },
        { id: 'f-c-created', name: 'createdAt', type: 'DateTime', defaultValue: 'now()' },
      ],
    },
    {
      id: 'model-order',
      name: 'Order',
      pluralName: 'Orders',
      description: 'Customer transactions and order line item records.',
      fields: [
        { id: 'f-o-id', name: 'id', type: 'String', isId: true, isUnique: true, defaultValue: 'uuid()' },
        { id: 'f-o-user', name: 'user', type: 'Relation', relationTarget: 'User', relationType: 'MANY_TO_ONE', relationForeignKey: 'userId' },
        { id: 'f-o-total', name: 'totalAmount', type: 'Float', isNullable: false },
        { id: 'f-o-status', name: 'status', type: 'Enum', enumValues: ['PENDING', 'PAID', 'PROCESSING', 'SHIPPED', 'COMPLETED'], defaultValue: 'PENDING' },
        { id: 'f-o-items', name: 'itemsJson', type: 'Json', isNullable: false },
        { id: 'f-o-created', name: 'createdAt', type: 'DateTime', defaultValue: 'now()' },
      ],
    },
  ];

  const defaultRoutes: ApiRouteConfig[] = [];

  defaultModels.forEach((m) => {
    const slug = m.pluralName.toLowerCase();
    defaultRoutes.push(
      {
        id: `route-${m.id}-list`,
        modelId: m.id,
        modelName: m.name,
        path: `/${slug}`,
        method: 'GET',
        operation: 'LIST',
        authRequired: m.name === 'Order' || m.name === 'User',
        roles: m.name === 'User' ? ['ADMIN'] : undefined,
        enabled: true,
        allowFiltering: true,
        allowSorting: true,
      },
      {
        id: `route-${m.id}-get`,
        modelId: m.id,
        modelName: m.name,
        path: `/${slug}/:id`,
        method: 'GET',
        operation: 'GET_ONE',
        authRequired: m.name === 'Order',
        enabled: true,
      },
      {
        id: `route-${m.id}-create`,
        modelId: m.id,
        modelName: m.name,
        path: `/${slug}`,
        method: 'POST',
        operation: 'CREATE',
        authRequired: m.name !== 'User', // register is public
        roles: m.name === 'Product' || m.name === 'Category' ? ['ADMIN'] : undefined,
        enabled: true,
      },
      {
        id: `route-${m.id}-update`,
        modelId: m.id,
        modelName: m.name,
        path: `/${slug}/:id`,
        method: 'PATCH',
        operation: 'UPDATE',
        authRequired: true,
        roles: ['ADMIN'],
        enabled: true,
      },
      {
        id: `route-${m.id}-delete`,
        modelId: m.id,
        modelName: m.name,
        path: `/${slug}/:id`,
        method: 'DELETE',
        operation: 'DELETE',
        authRequired: true,
        roles: ['ADMIN'],
        enabled: true,
      }
    );
  });

  return {
    models: defaultModels,
    apiRoutes: defaultRoutes,
  };
}
