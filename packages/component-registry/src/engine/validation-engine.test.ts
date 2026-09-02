import { describe, it, expect } from 'vitest';
import { ProjectSchema, ComponentNode, PageSchema } from '@nirmaanify/types';
import { ProjectValidator } from './validation-engine';

function buildBaseSchema(): ProjectSchema {
  const root: ComponentNode = {
    id: 'root',
    type: 'container',
    name: 'Root',
    props: { maxWidth: '1200px' },
    children: [
      {
        id: 'a',
        type: 'section',
        name: 'A',
        props: {},
        children: [
          {
            id: 'b',
            type: 'heading',
            name: 'B',
            props: { text: 'hi', level: 'h1', align: 'left', gradient: false },
          },
        ],
      },
    ],
  };

  const page: PageSchema = {
    id: 'p1',
    name: 'Home',
    path: '/',
    title: 'Home',
    layout: 'default',
    rootNode: root,
  };

  return {
    version: '1.0.0',
    id: 'schema-test',
    settings: {
      name: 'Test',
      slug: 'test',
      responsive: { mobile: 375, tablet: 768, desktop: 1280, widescreen: 1536 },
    },
    theme: {
      mode: 'dark',
      primaryColor: '#635BFF',
      fontFamily: { heading: 'Inter', body: 'Inter', mono: 'JetBrains Mono' },
      borderRadius: 'md',
    },
    pages: [page],
    assets: [],
    dataSources: [],
    packages: [],
    plugins: [],
    backendConfiguration: {
      enabled: true,
      framework: 'NestJS 11',
      modules: [],
      databaseEngine: 'PostgreSQL 16',
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

describe('ProjectValidator — happy path', () => {
  it('passes a well-formed schema', () => {
    const result = ProjectValidator.validate(buildBaseSchema());
    expect(result.isValid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('emits a warning for unregistered component types', () => {
    const schema = buildBaseSchema();
    schema.pages[0].rootNode.children![0].type = 'mystery-widget';
    const result = ProjectValidator.validate(schema);
    expect(result.warnings.length).toBeGreaterThan(0);
    expect(result.warnings[0].message).toMatch(/not in the registered components library/);
  });
});

describe('ProjectValidator — duplicate ID detection', () => {
  it('flags duplicate node ids across children and slots', () => {
    const schema = buildBaseSchema();
    // Inject a duplicate id inside the existing tree.
    schema.pages[0].rootNode.children![0].children!.push({
      id: 'b',
      type: 'heading',
      name: 'B-dup',
      props: { text: 'dup', level: 'h2', align: 'left', gradient: false },
    });

    const result = ProjectValidator.validate(schema);
    expect(result.isValid).toBe(false);
    expect(result.errors.some((e) => e.code === 'DUPLICATE_ID')).toBe(true);
  });

  it('flags duplicate page paths', () => {
    const schema = buildBaseSchema();
    schema.pages.push({ ...schema.pages[0], id: 'p2', name: 'Home copy' });
    const result = ProjectValidator.validate(schema);
    expect(result.errors.some((e) => e.code === 'DUPLICATE_ID' && e.path.includes('path'))).toBe(true);
  });
});

describe('ProjectValidator — slot traversal', () => {
  it('descends into slots to find duplicates', () => {
    const schema = buildBaseSchema();
    schema.pages[0].rootNode.children![0].slots = {
      header: [
        {
          id: 'slot-node',
          type: 'heading',
          name: 'S',
          props: { text: 's', level: 'h3', align: 'left', gradient: false },
        },
        {
          id: 'slot-node',
          type: 'heading',
          name: 'S-dup',
          props: { text: 'd', level: 'h3', align: 'left', gradient: false },
        },
      ],
    };

    const result = ProjectValidator.validate(schema);
    expect(result.errors.some((e) => e.code === 'DUPLICATE_ID')).toBe(true);
  });

  it('flags orphan parent pointers that are not reachable from the root', () => {
    const schema = buildBaseSchema();
    schema.pages[0].rootNode.children![0].parent = 'ghost-id';
    const result = ProjectValidator.validate(schema);
    expect(result.errors.some((e) => e.code === 'ORPHAN_NODE')).toBe(true);
  });
});

describe('ProjectValidator — circular reference detection', () => {
  it('flags a parent pointer that points at one of the node descendants', () => {
    const schema = buildBaseSchema();
    // The container 'a' has child 'b'; pointing 'a.parent' at 'b' means
    // 'b' is reachable from 'a', so 'a' -> 'b' forms a cycle.
    schema.pages[0].rootNode.children![0].parent = 'b';
    const result = ProjectValidator.validate(schema);
    expect(result.errors.some((e) => e.code === 'CIRCULAR_REF')).toBe(true);
  });
});

describe('ProjectValidator.validateNode', () => {
  it('accepts a minimal valid node', () => {
    const result = ProjectValidator.validateNode({
      id: 'x',
      type: 'container',
      name: 'X',
      props: {},
    });
    expect(result.isValid).toBe(true);
  });
});
