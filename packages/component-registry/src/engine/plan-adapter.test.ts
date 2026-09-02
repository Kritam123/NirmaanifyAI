import { describe, it, expect } from 'vitest';
import { AIProjectPlan } from '@nirmaanify/types';
import { applyPlanToSchema, resolveComponentId, mergePlanIntoSchema } from './plan-adapter';
import { ProjectValidator } from './validation-engine';

const basePlan: AIProjectPlan = {
  id: 'plan-1',
  prompt: 'Build a SaaS landing page',
  name: 'Acme',
  slug: 'acme',
  description: 'A SaaS landing page',
  type: 'SAAS',
  framework: 'Next.js 15',
  uiLibrary: 'shadcn/ui',
  pages: [
    {
      name: 'Home',
      path: '/',
      description: 'Landing page',
      components: [
        { name: 'navbar', type: 'layout', source: 'shadcn', description: 'Top nav' },
        { name: 'hero', type: 'ui', source: 'custom', description: 'Hero block' },
        { name: 'feature-card', type: 'ui', source: 'custom', description: 'Feature 1' },
        { name: 'footer', type: 'layout', source: 'custom', description: 'Site footer' },
      ],
    },
    {
      name: 'Pricing',
      path: '/pricing',
      description: 'Pricing page',
      components: [{ name: 'pricing-card', type: 'ui', source: 'custom', description: 'Plan' }],
    },
  ],
  features: [
    { title: 'Auth', description: 'Email/password auth', category: 'auth' },
  ],
  components: [],
  requiredPackages: [
    { name: 'stripe', version: '^17.0.0', scope: 'dependencies', purpose: 'Payments' },
  ],
  backendRequirements: {
    enabled: true,
    framework: 'NestJS 11',
    modules: [
      { name: 'Auth', description: 'Authentication', endpoints: [] },
      { name: 'Billing', description: 'Billing', endpoints: [] },
    ],
    auth: { type: 'jwt', providers: ['email'] },
  },
  databaseRequirements: { engine: 'PostgreSQL 16', models: [] },
  cmsRequirements: { enabled: false, type: 'None', collections: [] },
  pluginRecommendations: [
    { name: 'Stripe Plugin', category: 'Payments', reason: 'For billing', isRecommended: true },
    { name: 'Posthog Plugin', category: 'Analytics', reason: 'For metrics', isRecommended: false },
  ],
  architecturePlan: {
    summary: 'Server-rendered Next.js app',
    frontendStack: ['Next.js 15'],
    backendStack: ['NestJS 11'],
    databaseStack: ['PostgreSQL 16'],
    deploymentTarget: 'Vercel',
    scalabilityNotes: 'Static rendering at edge.',
  },
  status: 'APPROVED',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

describe('resolveComponentId', () => {
  it('resolves known plan names to registry ids', () => {
    expect(resolveComponentId({ name: 'navbar', type: 'layout', source: 'shadcn', description: '' })).toBe('navbar');
    expect(resolveComponentId({ name: 'hero', type: 'ui', source: 'custom', description: '' })).toBe('hero');
    expect(resolveComponentId({ name: 'feature-card', type: 'ui', source: 'custom', description: '' })).toBe('feature-card');
  });

  it('resolves bare string component ids', () => {
    expect(resolveComponentId('navbar')).toBe('navbar');
    expect(resolveComponentId('hero')).toBe('hero');
    expect(resolveComponentId('HeroInteractive')).toBe('hero');
  });

  it('falls back to "container" for unknown plans', () => {
    expect(resolveComponentId({ name: 'totally-unknown', type: 'ui', source: 'custom', description: '' })).toBe('container');
    expect(resolveComponentId('totally-unknown')).toBe('container');
  });
});

describe('applyPlanToSchema', () => {
  it('produces a schema with one page per plan page', () => {
    const schema = applyPlanToSchema(basePlan);
    expect(schema.pages).toHaveLength(2);
    expect(schema.pages[0].path).toBe('/');
    expect(schema.pages[1].path).toBe('/pricing');
  });

  it('materializes plan components into the page root tree', () => {
    const schema = applyPlanToSchema(basePlan);
    expect(schema.pages[0].rootNode.children).toHaveLength(4);
    expect(schema.pages[0].rootNode.children!.map((c) => c.type)).toEqual([
      'navbar', 'hero', 'feature-card', 'footer',
    ]);
  });

  it('mirrors required packages and recommended plugins', () => {
    const schema = applyPlanToSchema(basePlan);
    expect(schema.packages.some((p) => p.name === 'stripe')).toBe(true);
    expect(schema.plugins.some((p) => p.name === 'Stripe Plugin')).toBe(true);
    expect(schema.plugins.some((p) => p.name === 'Posthog Plugin')).toBe(false); // not recommended
  });

  it('carries backend requirements into backendConfiguration', () => {
    const schema = applyPlanToSchema(basePlan);
    expect(schema.backendConfiguration.enabled).toBe(true);
    expect(schema.backendConfiguration.framework).toBe('NestJS 11');
    expect(schema.backendConfiguration.modules).toEqual(['Auth', 'Billing']);
    expect(schema.backendConfiguration.databaseEngine).toBe('PostgreSQL 16');
  });

  it('produces a schema that passes ProjectValidator', () => {
    const schema = applyPlanToSchema(basePlan);
    const result = ProjectValidator.validate(schema);
    expect(result.errors).toHaveLength(0);
  });

  it('falls back to a single empty root page when the plan has no pages', () => {
    const emptyPlan = { ...basePlan, pages: [] };
    const schema = applyPlanToSchema(emptyPlan);
    expect(schema.pages).toHaveLength(1);
    expect(schema.pages[0].rootNode.type).toBe('container');
  });
});

describe('mergePlanIntoSchema', () => {
  it('preserves the original schema id and createdAt', () => {
    const generated = applyPlanToSchema(basePlan);
    const merged = mergePlanIntoSchema(generated, basePlan);
    expect(merged.id).toBe(generated.id);
    expect(merged.createdAt).toBe(generated.createdAt);
  });
});
