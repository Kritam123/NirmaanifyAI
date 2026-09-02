import { z } from 'zod';
export interface ComponentNodeStyle {
    padding?: string;
    margin?: string;
    backgroundColor?: string;
    color?: string;
    borderRadius?: string;
    borderWidth?: string;
    borderColor?: string;
    boxShadow?: string;
    fontSize?: string;
    fontWeight?: string;
    textAlign?: 'left' | 'center' | 'right' | 'justify';
    width?: string;
    maxWidth?: string;
    height?: string;
    minHeight?: string;
    display?: 'flex' | 'grid' | 'block' | 'inline-block' | 'inline-flex';
    flexDirection?: 'row' | 'column' | 'row-reverse' | 'column-reverse';
    alignItems?: 'flex-start' | 'center' | 'flex-end' | 'stretch' | 'baseline';
    justifyContent?: 'flex-start' | 'center' | 'flex-end' | 'space-between' | 'space-around' | 'space-evenly';
    gap?: string;
    gridTemplateColumns?: string;
    opacity?: number;
    overflow?: 'visible' | 'hidden' | 'scroll' | 'auto';
    customCss?: string;
    [key: string]: any;
}
export interface ComponentNode {
    id: string;
    type: string;
    name: string;
    props: Record<string, any>;
    style?: ComponentNodeStyle;
    children?: ComponentNode[];
    slots?: Record<string, ComponentNode[]>;
    parent?: string | null;
    isLocked?: boolean;
    isHidden?: boolean;
}
export declare const ComponentNodeStyleSchema: any;
export declare const ComponentNodeSchema: z.ZodType<ComponentNode, any, any>;
export interface PageSeo {
    title?: string;
    description?: string;
    ogImage?: string;
    keywords?: string[];
    canonicalUrl?: string;
    noIndex?: boolean;
}
export interface PageSchema {
    id: string;
    name: string;
    path: string;
    title: string;
    description?: string;
    isProtected?: boolean;
    layout?: 'default' | 'blank' | 'dashboard' | 'sidebar' | 'centered';
    seo?: PageSeo;
    rootNode: ComponentNode;
    createdAt?: string;
    updatedAt?: string;
}
export declare const PageSeoSchema: any;
export declare const PageSchemaValidator: any;
export interface ThemeSchema {
    mode: 'light' | 'dark' | 'system';
    primaryColor: string;
    secondaryColor?: string;
    accentColor?: string;
    backgroundColor?: string;
    textColor?: string;
    fontFamily: {
        heading: string;
        body: string;
        mono: string;
    };
    borderRadius: 'none' | 'sm' | 'md' | 'lg' | 'xl' | 'full';
    tokens?: Record<string, string>;
}
export declare const ThemeSchemaValidator: any;
export interface ProjectSettingsSchema {
    name: string;
    slug: string;
    description?: string;
    favicon?: string;
    responsive: {
        mobile: number;
        tablet: number;
        desktop: number;
        widescreen: number;
    };
    analyticsId?: string;
    customHeadTags?: string;
}
export declare const ProjectSettingsValidator: any;
export interface ProjectAsset {
    id: string;
    name: string;
    url: string;
    type: 'image' | 'video' | 'font' | 'icon' | 'document';
    size?: number;
    dimensions?: {
        width: number;
        height: number;
    };
}
export interface ProjectDataSource {
    id: string;
    name: string;
    type: 'rest' | 'graphql' | 'static' | 'mock';
    endpoint?: string;
    method?: 'GET' | 'POST';
    headers?: Record<string, string>;
    data?: any;
}
export interface ProjectPluginConfig {
    name: string;
    category: string;
    enabled: boolean;
    config?: Record<string, any>;
}
export interface ProjectPackageConfig {
    name: string;
    version: string;
    scope: 'dependencies' | 'devDependencies';
}
export interface ProjectBackendConfig {
    enabled: boolean;
    framework: string;
    modules: string[];
    databaseEngine: string;
}
export interface ProjectSchema {
    version: string;
    id: string;
    settings: ProjectSettingsSchema;
    theme: ThemeSchema;
    pages: PageSchema[];
    assets: ProjectAsset[];
    dataSources: ProjectDataSource[];
    packages: ProjectPackageConfig[];
    plugins: ProjectPluginConfig[];
    backendConfiguration: ProjectBackendConfig;
    createdAt: string;
    updatedAt: string;
}
export declare const ProjectSchemaValidator: any;
//# sourceMappingURL=project-schema.d.ts.map