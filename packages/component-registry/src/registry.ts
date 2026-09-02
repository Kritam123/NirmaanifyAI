import { ComponentDefinition } from './types';
import { ComponentNode } from '@nirmaanify/types';

import {
  ContainerDefinition,
  GridDefinition,
  SectionDefinition,
  NavbarDefinition,
  FooterDefinition,
} from './components/layout-components';

import {
  HeadingDefinition,
  TextDefinition,
  ButtonDefinition,
  BadgeDefinition,
  SeparatorDefinition,
} from './components/basic-components';

import {
  ImageDefinition,
  CardDefinition,
} from './components/media-components';

import {
  HeroDefinition,
  FeatureCardDefinition,
  PricingCardDefinition,
  TestimonialCardDefinition,
} from './components/marketing-components';

import { ProductCardDefinition } from './components/ecommerce-components';
import { FormDefinition, InputDefinition, TextareaDefinition } from './components/form-components';
import { MetricCardDefinition } from './components/dashboard-components';

// ==========================================
// MASTER COMPONENT REGISTRY MAP
// ==========================================
export const COMPONENT_REGISTRY: Record<string, ComponentDefinition<any>> = {
  // Layout
  container: ContainerDefinition,
  grid: GridDefinition,
  section: SectionDefinition,
  navbar: NavbarDefinition,
  footer: FooterDefinition,

  // Typography & Basic
  heading: HeadingDefinition,
  text: TextDefinition,
  button: ButtonDefinition,
  badge: BadgeDefinition,
  separator: SeparatorDefinition,

  // Media
  image: ImageDefinition,
  card: CardDefinition,

  // Marketing
  hero: HeroDefinition,
  'feature-card': FeatureCardDefinition,
  'pricing-card': PricingCardDefinition,
  'testimonial-card': TestimonialCardDefinition,

  // E-commerce
  'product-card': ProductCardDefinition,

  // Forms
  form: FormDefinition,
  input: InputDefinition,
  textarea: TextareaDefinition,

  // Dashboard
  'metric-card': MetricCardDefinition,
};

// ==========================================
// REGISTRY HELPER UTILITIES
// ==========================================

export function getComponentDefinition(type: string): ComponentDefinition<any> | undefined {
  return COMPONENT_REGISTRY[type];
}

export function getAllComponents(): ComponentDefinition<any>[] {
  return Object.values(COMPONENT_REGISTRY);
}

export function getComponentsByCategory(category: string): ComponentDefinition<any>[] {
  return Object.values(COMPONENT_REGISTRY).filter((c) => c.category === category);
}

export function createComponentNode(
  type: string,
  customProps: Record<string, any> = {},
  parentId: string | null = null
): ComponentNode {
  const def = getComponentDefinition(type);
  const id = `node-${type}-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`;

  return {
    id,
    type,
    name: def ? def.name : type.charAt(0).toUpperCase() + type.slice(1),
    props: {
      ...(def ? def.defaultProps : {}),
      ...customProps,
    },
    style: def?.defaultStyle || {},
    children: [],
    parent: parentId,
  };
}

export const COMPONENT_CATEGORIES = [
  { id: 'marketing', label: 'Marketing & Hero', icon: 'Sparkles' },
  { id: 'layout', label: 'Layout & Structure', icon: 'Layout' },
  { id: 'typography', label: 'Typography & Text', icon: 'Type' },
  { id: 'basic', label: 'Basic Elements', icon: 'Square' },
  { id: 'media', label: 'Media & Cards', icon: 'Image' },
  { id: 'ecommerce', label: 'E-commerce', icon: 'ShoppingBag' },
  { id: 'forms', label: 'Forms & Inputs', icon: 'FormInput' },
  { id: 'dashboard', label: 'Dashboard & Metrics', icon: 'BarChart3' },
] as const;
