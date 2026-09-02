"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProjectSchemaValidator = exports.ProjectSettingsValidator = exports.ThemeSchemaValidator = exports.PageSchemaValidator = exports.PageSeoSchema = exports.ComponentNodeSchema = exports.ComponentNodeStyleSchema = void 0;
const zod_1 = require("zod");
exports.ComponentNodeStyleSchema = zod_1.z.record(zod_1.z.any());
exports.ComponentNodeSchema = zod_1.z.lazy(() => zod_1.z.object({
    id: zod_1.z.string().min(1),
    type: zod_1.z.string().min(1),
    name: zod_1.z.string().min(1),
    props: zod_1.z.record(zod_1.z.any()).default({}),
    style: exports.ComponentNodeStyleSchema.optional(),
    children: zod_1.z.array(zod_1.z.lazy(() => exports.ComponentNodeSchema)).optional(),
    slots: zod_1.z.record(zod_1.z.array(zod_1.z.lazy(() => exports.ComponentNodeSchema))).optional(),
    parent: zod_1.z.string().nullable().optional(),
    isLocked: zod_1.z.boolean().optional(),
    isHidden: zod_1.z.boolean().optional(),
}));
exports.PageSeoSchema = zod_1.z.object({
    title: zod_1.z.string().optional(),
    description: zod_1.z.string().optional(),
    ogImage: zod_1.z.string().optional(),
    keywords: zod_1.z.array(zod_1.z.string()).optional(),
    canonicalUrl: zod_1.z.string().optional(),
    noIndex: zod_1.z.boolean().optional(),
});
exports.PageSchemaValidator = zod_1.z.object({
    id: zod_1.z.string().min(1),
    name: zod_1.z.string().min(1),
    path: zod_1.z.string().min(1),
    title: zod_1.z.string().min(1),
    description: zod_1.z.string().optional(),
    isProtected: zod_1.z.boolean().optional().default(false),
    layout: zod_1.z.enum(['default', 'blank', 'dashboard', 'sidebar', 'centered']).optional().default('default'),
    seo: exports.PageSeoSchema.optional(),
    rootNode: exports.ComponentNodeSchema,
    createdAt: zod_1.z.string().optional(),
    updatedAt: zod_1.z.string().optional(),
});
exports.ThemeSchemaValidator = zod_1.z.object({
    mode: zod_1.z.enum(['light', 'dark', 'system']).default('dark'),
    primaryColor: zod_1.z.string().default('#635BFF'),
    secondaryColor: zod_1.z.string().optional(),
    accentColor: zod_1.z.string().optional(),
    backgroundColor: zod_1.z.string().optional(),
    textColor: zod_1.z.string().optional(),
    fontFamily: zod_1.z.object({
        heading: zod_1.z.string().default('Inter'),
        body: zod_1.z.string().default('Inter'),
        mono: zod_1.z.string().default('JetBrains Mono'),
    }),
    borderRadius: zod_1.z.enum(['none', 'sm', 'md', 'lg', 'xl', 'full']).default('md'),
    tokens: zod_1.z.record(zod_1.z.string()).optional(),
});
exports.ProjectSettingsValidator = zod_1.z.object({
    name: zod_1.z.string().min(1),
    slug: zod_1.z.string().min(1),
    description: zod_1.z.string().optional(),
    favicon: zod_1.z.string().optional(),
    responsive: zod_1.z.object({
        mobile: zod_1.z.number().default(375),
        tablet: zod_1.z.number().default(768),
        desktop: zod_1.z.number().default(1280),
        widescreen: zod_1.z.number().default(1536),
    }).default({
        mobile: 375,
        tablet: 768,
        desktop: 1280,
        widescreen: 1536,
    }),
    analyticsId: zod_1.z.string().optional(),
    customHeadTags: zod_1.z.string().optional(),
});
exports.ProjectSchemaValidator = zod_1.z.object({
    version: zod_1.z.string().default('1.0.0'),
    id: zod_1.z.string().min(1),
    settings: exports.ProjectSettingsValidator,
    theme: exports.ThemeSchemaValidator,
    pages: zod_1.z.array(exports.PageSchemaValidator),
    assets: zod_1.z.array(zod_1.z.any()).default([]),
    dataSources: zod_1.z.array(zod_1.z.any()).default([]),
    packages: zod_1.z.array(zod_1.z.any()).default([]),
    plugins: zod_1.z.array(zod_1.z.any()).default([]),
    backendConfiguration: zod_1.z.object({
        enabled: zod_1.z.boolean().default(false),
        framework: zod_1.z.string().default('NestJS 11'),
        modules: zod_1.z.array(zod_1.z.string()).default([]),
        databaseEngine: zod_1.z.string().default('PostgreSQL 16'),
    }),
    createdAt: zod_1.z.string(),
    updatedAt: zod_1.z.string(),
});
//# sourceMappingURL=project-schema.js.map