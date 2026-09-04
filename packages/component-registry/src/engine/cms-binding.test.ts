import { describe, it, expect } from 'vitest';
import {
  COMPONENT_REGISTRY,
  getComponentDefinition,
  getComponentsByCategory,
  createComponentNode,
} from '../registry';
import { ReactCodeGenerator } from './code-generator';
import { PageSchema, CMS_COLLECTION_PRESETS } from '@nirmaanify/types';

describe('Phase 7 CMS & Dynamic Content Architecture', () => {
  describe('CMS Component Registry & Definitions', () => {
    it('registers all 4 CMS components in COMPONENT_REGISTRY', () => {
      expect(COMPONENT_REGISTRY['cms-collection-list']).toBeDefined();
      expect(COMPONENT_REGISTRY['cms-item-detail']).toBeDefined();
      expect(COMPONENT_REGISTRY['cms-rich-text']).toBeDefined();
      expect(COMPONENT_REGISTRY['cms-author-badge']).toBeDefined();
    });

    it('returns all CMS components when filtered by category "cms"', () => {
      const cmsComponents = getComponentsByCategory('cms');
      expect(cmsComponents.length).toBe(4);
      const ids = cmsComponents.map((c) => c.id);
      expect(ids).toContain('cms-collection-list');
      expect(ids).toContain('cms-item-detail');
      expect(ids).toContain('cms-rich-text');
      expect(ids).toContain('cms-author-badge');
    });

    it('creates cms-collection-list node with correct default props', () => {
      const node = createComponentNode('cms-collection-list');
      expect(node.type).toBe('cms-collection-list');
      expect(node.name).toBe('CMS Collection Grid');
      expect(node.props.collectionSlug).toBe('posts');
      expect(node.props.layout).toBe('grid');
      expect(node.props.columns).toBe(3);
    });

    it('creates cms-item-detail node with article default content', () => {
      const node = createComponentNode('cms-item-detail');
      expect(node.type).toBe('cms-item-detail');
      expect(node.props.title).toBe('Mastering Modern Web Development in 2026');
      expect(node.props.authorName).toBe('Alexandra Chen');
    });
  });

  describe('CMS Code Generation Engine', () => {
    it('generates Next.js TSX with CMS imports and dynamic collection feed', () => {
      const page: PageSchema = {
        id: 'page-blog',
        name: 'Blog',
        path: '/blog',
        title: 'Blog Articles',
        rootNode: {
          id: 'root',
          type: 'container',
          name: 'Page Container',
          props: {},
          children: [
            {
              id: 'node-cms-1',
              type: 'cms-collection-list',
              name: 'Blog Feed',
              props: {
                collectionSlug: 'posts',
                collectionName: 'Engineering Insights',
                buttonText: 'Read Article',
                columns: 3,
              },
            },
          ],
        },
      };

      const code = ReactCodeGenerator.generatePageComponent(page);

      // Verify React Next.js TSX output
      expect(code).toContain("'use client';");
      expect(code).toContain('export default function Blog()');
      expect(code).toContain('CMS Collection: posts');
      expect(code).toContain('Engineering Insights');
      expect(code).toContain('Read Article');
      expect(code).toContain("import { Badge, Button, Card } from '@nirmaanify/ui';");
      expect(code).toContain('Database');
    });

    it('generates Next.js TSX for CMS item detail view', () => {
      const page: PageSchema = {
        id: 'page-article',
        name: 'Article',
        path: '/posts/mastering-modern-web-development-2026',
        title: 'Article Detail',
        rootNode: {
          id: 'root',
          type: 'container',
          name: 'Article Container',
          props: {},
          children: [
            {
              id: 'node-detail-1',
              type: 'cms-item-detail',
              name: 'Article Detail View',
              props: {
                title: 'Building Enterprise Scale Micro-Frontends',
                excerpt: 'Architectural overview of modern decoupled apps.',
                authorName: 'Marcus Vance',
                category: 'Architecture',
              },
            },
          ],
        },
      };

      const code = ReactCodeGenerator.generatePageComponent(page);

      expect(code).toContain('Building Enterprise Scale Micro-Frontends');
      expect(code).toContain('Architectural overview of modern decoupled apps.');
      expect(code).toContain('Marcus Vance');
      expect(code).toContain('Architecture');
    });
  });

  describe('CMS Collection Presets & Field Schema', () => {
    it('defines standard presets: POSTS, PRODUCTS, CATEGORIES, AUTHORS', () => {
      expect(CMS_COLLECTION_PRESETS.POSTS).toBeDefined();
      expect(CMS_COLLECTION_PRESETS.PRODUCTS).toBeDefined();
      expect(CMS_COLLECTION_PRESETS.CATEGORIES).toBeDefined();
      expect(CMS_COLLECTION_PRESETS.AUTHORS).toBeDefined();
    });

    it('validates all field types across presets', () => {
      const allFieldTypes = new Set<string>();
      Object.values(CMS_COLLECTION_PRESETS).forEach((preset) => {
        preset.fields.forEach((f) => allFieldTypes.add(f.type));
      });

      expect(allFieldTypes.has('TEXT')).toBe(true);
      expect(allFieldTypes.has('RICH_TEXT')).toBe(true);
      expect(allFieldTypes.has('NUMBER')).toBe(true);
      expect(allFieldTypes.has('BOOLEAN')).toBe(true);
      expect(allFieldTypes.has('IMAGE')).toBe(true);
      expect(allFieldTypes.has('RELATION')).toBe(true);
      expect(allFieldTypes.has('SELECT')).toBe(true);
    });
  });
});
