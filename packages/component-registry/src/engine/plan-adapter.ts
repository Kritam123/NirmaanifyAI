import {
  AIProjectPlan,
  PlanComponent,
  PlanPage,
  ProjectSchema,
  PageSchema,
  ComponentNode,
  ProjectPackageConfig,
} from '@nirmaanify/types';
import { createComponentNode, getComponentDefinition, COMPONENT_REGISTRY } from '../registry';

/**
 * Mapping from PlanComponent.source identifiers to registry component IDs.
 * The AI planner uses coarse type/source vocabulary; we resolve each one to a
 * concrete ComponentDefinition in the registry.
 */
const PLAN_TYPE_TO_REGISTRY: Record<string, string> = {
  // layout primitives
  container: 'container',
  grid: 'grid',
  section: 'section',
  navbar: 'navbar',
  nav: 'navbar',
  footer: 'footer',
  // typography & basic
  heading: 'heading',
  title: 'heading',
  text: 'text',
  paragraph: 'text',
  button: 'button',
  cta: 'button',
  badge: 'badge',
  tag: 'badge',
  separator: 'separator',
  divider: 'separator',
  // media & cards
  image: 'image',
  card: 'card',
  // marketing
  hero: 'hero',
  feature: 'feature-card',
  'feature-card': 'feature-card',
  pricing: 'pricing-card',
  'pricing-card': 'pricing-card',
  testimonial: 'testimonial-card',
  'testimonial-card': 'testimonial-card',
  // ecommerce
  'product-card': 'product-card',
  product: 'product-card',
  // forms
  form: 'form',
  input: 'input',
  'text-input': 'input',
  textarea: 'textarea',
  // dashboard
  metric: 'metric-card',
  'metric-card': 'metric-card',
  kpi: 'metric-card',
};

/**
 * Best-effort resolution from a plan component name/type into a registered
 * component ID. Falls back to `container` so the plan always produces a
 * renderable tree even when the planner invents a name we don't know.
 *
 * Accepts either a fully-typed PlanComponent object OR a bare string (the
 * planner service uses string IDs; the visual studio uses PlanComponent).
 *
 * Matching strategy:
 *   1. Exact lookup against the alias map and registry keys
 *   2. Substring containment: if the lowered name contains any registered
 *      id as a token (e.g. "HeroInteractive" -> "hero"), use that match
 *   3. Fall back to "container"
 */
export function resolveComponentId(planComp: PlanComponent | string): string {
  const lookup = (raw: string): string | null => {
    const key = raw.toLowerCase().trim();
    if (!key) return null;
    if (PLAN_TYPE_TO_REGISTRY[key]) return PLAN_TYPE_TO_REGISTRY[key];
    if (COMPONENT_REGISTRY[key]) return key;
    // Substring matching for planner-flavoured names ("HeroInteractive",
    // "HeroBanner", "ProductCardLarge", "TestimonialMarquee", etc.).
    const tokenHit = Object.keys(COMPONENT_REGISTRY).find(
      (id) => key.includes(id) || id.includes(key)
    );
    return tokenHit ?? null;
  };

  if (typeof planComp === 'string') {
    return lookup(planComp) ?? 'container';
  }
  const candidates = [planComp.name, planComp.type, planComp.source];
  for (const c of candidates) {
    if (!c) continue;
    const hit = lookup(c);
    if (hit) return hit;
  }
  return 'container';
}

/**
 * Build a single rootNode tree from a plan page's component list. Pages
 * without an explicit list of components still get a usable empty container
 * so the schema is never broken.
 */
export function planPageToRootNode(planPage: PlanPage, pageIdx: number): ComponentNode {
  const rootId = `root-${planPage.path.replace(/[^a-z0-9]+/gi, '-') || pageIdx}`;
  const root: ComponentNode = {
    id: rootId,
    type: 'container',
    name: planPage.name || 'Page Root',
    props: { maxWidth: '1200px', padding: '24px', direction: 'column', gap: '24px' },
    children: [],
    parent: null,
  };

  if (!Array.isArray(planPage.components) || planPage.components.length === 0) {
    return root;
  }

  root.children = planPage.components.map((comp, idx) => {
    const type = resolveComponentId(comp);
    return createComponentNode(type, {}, root.id);
  });

  return root;
}

function planPageToPageSchema(planPage: PlanPage, idx: number): PageSchema {
  return {
    id: `page-${planPage.path.replace(/[^a-z0-9]+/gi, '-') || idx}`,
    name: planPage.name,
    path: planPage.path.startsWith('/') ? planPage.path : `/${planPage.path}`,
    title: `${planPage.name} — ${planPage.description}`.trim(),
    description: planPage.description,
    isProtected: planPage.isProtected ?? false,
    layout: 'default',
    rootNode: planPageToRootNode(planPage, idx),
  };
}

/**
 * Convert an AI planner output into a fully-populated ProjectSchema ready for
 * the Visual Studio. The bridge:
 *   - copies plan metadata into settings + theme defaults
 *   - materializes each PlanPage into a PageSchema with a concrete component tree
 *   - mirrors the planner's requiredPackages + plugin recommendations onto the schema
 *   - carries forward backend requirements as backendConfiguration
 *
 * The returned schema passes Zod validation in the common case; if the plan
 * is incomplete, missing fields fall back to the same defaults that
 * `createDefaultProjectSchema` would generate for the project type.
 */
export function applyPlanToSchema(plan: AIProjectPlan): ProjectSchema {
  const now = new Date().toISOString();

  const settings = {
    name: plan.name || 'AI Planned App',
    slug: plan.slug || (plan.name || 'app').toLowerCase().replace(/[^a-z0-9]+/g, '-'),
    description: plan.description,
    responsive: {
      mobile: 375,
      tablet: 768,
      desktop: 1280,
      widescreen: 1536,
    },
  };

  const pages: PageSchema[] = Array.isArray(plan.pages)
    ? plan.pages.map((p, idx) => planPageToPageSchema(p, idx))
    : [];

  // Guarantee at least one page so the studio never opens onto an empty tree.
  if (pages.length === 0) {
    pages.push({
      id: 'page-root',
      name: 'Home',
      path: '/',
      title: plan.name || 'Home',
      layout: 'default',
      rootNode: {
        id: 'root-fallback',
        type: 'container',
        name: 'Page Root',
        props: { maxWidth: '1200px', padding: '24px', direction: 'column', gap: '24px' },
        children: [],
        parent: null,
      },
    });
  }

  const packages: ProjectPackageConfig[] = Array.isArray(plan.requiredPackages)
    ? plan.requiredPackages
        .filter((p) => !!p?.name)
        .map((p) => ({
          name: p.name,
          version: p.version ?? '^1.0.0',
          scope: p.scope ?? 'dependencies',
        }))
    : [];

  const plugins = Array.isArray(plan.pluginRecommendations)
    ? plan.pluginRecommendations
        .filter((p) => !!p?.name && p.isRecommended)
        .map((p) => ({
          name: p.name,
          category: p.category,
          enabled: true,
          config: { reason: p.reason },
        }))
    : [];

  const backendConfig = {
    enabled: plan.backendRequirements?.enabled ?? true,
    framework: plan.backendRequirements?.framework ?? 'NestJS 11',
    modules: (plan.backendRequirements?.modules ?? []).map((m) => m.name).filter(Boolean),
    databaseEngine: plan.databaseRequirements?.engine ?? 'PostgreSQL 16',
  };

  return {
    version: '1.0.0',
    id: `schema-${plan.id || Date.now()}`,
    settings,
    theme: {
      mode: 'dark',
      primaryColor: '#635BFF',
      fontFamily: {
        heading: 'Inter',
        body: 'Inter',
        mono: 'JetBrains Mono',
      },
      borderRadius: 'md',
    },
    pages,
    assets: [],
    dataSources: [],
    packages,
    plugins,
    backendConfiguration: backendConfig,
    createdAt: now,
    updatedAt: now,
  };
}

/**
 * Merge helper: apply a plan onto an existing schema instead of replacing it.
 * Useful when an AI plan is approved but the user already has a workspace.
 * Existing pages are preserved if the plan does not redefine them.
 */
export function mergePlanIntoSchema(
  schema: ProjectSchema,
  plan: AIProjectPlan
): ProjectSchema {
  const generated = applyPlanToSchema(plan);
  // Preserve original identity + timestamps where possible.
  return {
    ...generated,
    id: schema.id,
    createdAt: schema.createdAt,
    updatedAt: new Date().toISOString(),
    settings: { ...generated.settings, ...schema.settings },
    theme: { ...generated.theme, ...schema.theme },
    pages: generated.pages.length > 0 ? generated.pages : schema.pages,
  };
}

// Re-export registry helpers so the bridge module has a single import surface.
export { getComponentDefinition };
