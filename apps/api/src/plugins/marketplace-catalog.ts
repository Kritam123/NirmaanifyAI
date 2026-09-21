import { PluginManifest, PluginCategory } from '@nirmaanify/types';

export interface CatalogPluginEntry {
  slug: string;
  name: string;
  description: string;
  version: string;
  author: string;
  authorUrl?: string;
  iconUrl?: string;
  category: PluginCategory;
  isOfficial: boolean;
  downloadCount: number;
  rating: number;
  manifest: PluginManifest;
}

export const MARKETPLACE_CATALOG: CatalogPluginEntry[] = [
  // 1. Payments: Stripe
  {
    slug: 'stripe-checkout',
    name: 'Stripe Payments & Checkout',
    description: 'Accept credit cards, Apple Pay, and Google Pay with pre-built Stripe Elements and webhook listeners.',
    version: '1.2.0',
    author: 'Nirmaanify Core Team',
    authorUrl: 'https://nirmaanify.com',
    iconUrl: 'credit-card',
    category: 'PAYMENTS',
    isOfficial: true,
    downloadCount: 1420,
    rating: 4.9,
    manifest: {
      id: 'stripe-checkout',
      name: 'Stripe Payments & Checkout',
      version: '1.2.0',
      description: 'Stripe payments integration with checkout sessions, webhooks, and UI elements.',
      author: { name: 'Nirmaanify Core Team', url: 'https://nirmaanify.com' },
      category: 'PAYMENTS',
      permissions: ['ui:render_slot', 'backend:register_routes', 'env:read_secrets', 'network:outbound'],
      entrypoints: {
        frontend: './frontend/index.js',
        backend: './backend/index.js',
        generator: './generator/index.js',
      },
      slots: [
        { name: 'studio:toolbar', title: 'Stripe Products', icon: 'credit-card' },
        { name: 'studio:settings_tab', title: 'Stripe Configuration', icon: 'settings' },
      ],
      configurationSchema: {
        type: 'object',
        properties: {
          publishableKey: {
            type: 'string',
            title: 'Stripe Publishable Key',
            description: 'Starts with pk_test_ or pk_live_',
          },
          secretKey: {
            type: 'string',
            title: 'Stripe Secret Key',
            description: 'Starts with sk_test_ or sk_live_',
            isSecret: true,
          },
          webhookSecret: {
            type: 'string',
            title: 'Webhook Signing Secret',
            description: 'Starts with whsec_',
            isSecret: true,
          },
          currency: {
            type: 'string',
            title: 'Default Currency',
            default: 'usd',
          },
        },
        required: ['publishableKey', 'secretKey'],
      },
    },
  },

  // 2. Authentication: Clerk
  {
    slug: 'clerk-auth',
    name: 'Clerk User Management',
    description: 'Complete user authentication, social logins, multi-factor auth, and pre-built profile UI.',
    version: '1.1.0',
    author: 'Clerk & Nirmaanify',
    authorUrl: 'https://clerk.com',
    iconUrl: 'shield-check',
    category: 'AUTHENTICATION',
    isOfficial: true,
    downloadCount: 980,
    rating: 4.8,
    manifest: {
      id: 'clerk-auth',
      name: 'Clerk User Management',
      version: '1.1.0',
      description: 'Turnkey authentication with Clerk middleware, sign-in modals, and user profiles.',
      author: { name: 'Clerk & Nirmaanify', url: 'https://clerk.com' },
      category: 'AUTHENTICATION',
      permissions: ['ui:render_slot', 'env:read_secrets', 'network:outbound'],
      entrypoints: {
        frontend: './frontend/index.js',
        generator: './generator/index.js',
      },
      slots: [
        { name: 'studio:toolbar', title: 'Auth Settings', icon: 'shield-check' },
      ],
      configurationSchema: {
        type: 'object',
        properties: {
          publishableKey: {
            type: 'string',
            title: 'Clerk Publishable Key',
            description: 'Starts with pk_test_ or pk_live_',
          },
          secretKey: {
            type: 'string',
            title: 'Clerk Secret Key',
            description: 'Starts with sk_test_ or sk_live_',
            isSecret: true,
          },
        },
        required: ['publishableKey', 'secretKey'],
      },
    },
  },

  // 3. Analytics: PostHog
  {
    slug: 'posthog-analytics',
    name: 'PostHog Product Analytics',
    description: 'Event tracking, session replays, feature flags, and conversion funnels for Next.js.',
    version: '1.0.4',
    author: 'PostHog Community',
    authorUrl: 'https://posthog.com',
    iconUrl: 'bar-chart-2',
    category: 'ANALYTICS',
    isOfficial: true,
    downloadCount: 750,
    rating: 4.9,
    manifest: {
      id: 'posthog-analytics',
      name: 'PostHog Product Analytics',
      version: '1.0.4',
      description: 'Analytics, feature flags, and session recordings.',
      author: { name: 'PostHog Community', url: 'https://posthog.com' },
      category: 'ANALYTICS',
      permissions: ['ui:render_slot', 'network:outbound'],
      entrypoints: {
        frontend: './frontend/index.js',
        generator: './generator/index.js',
      },
      configurationSchema: {
        type: 'object',
        properties: {
          apiKey: {
            type: 'string',
            title: 'PostHog API Key',
            description: 'Project API Key',
          },
          apiHost: {
            type: 'string',
            title: 'PostHog Ingestion Host',
            default: 'https://us.i.posthog.com',
          },
          enableSessionRecording: {
            type: 'boolean',
            title: 'Enable Session Recording',
            default: true,
          },
        },
        required: ['apiKey'],
      },
    },
  },

  // 4. SEO: Next SEO Suite
  {
    slug: 'next-seo-suite',
    name: 'Next.js SEO & OpenGraph Suite',
    description: 'Dynamic meta tags, OpenGraph cards, Twitter cards, XML sitemaps, and robots.txt generation.',
    version: '2.0.0',
    author: 'Nirmaanify Core Team',
    authorUrl: 'https://nirmaanify.com',
    iconUrl: 'globe',
    category: 'SEO',
    isOfficial: true,
    downloadCount: 1840,
    rating: 5.0,
    manifest: {
      id: 'next-seo-suite',
      name: 'Next.js SEO & OpenGraph Suite',
      version: '2.0.0',
      description: 'Automated SEO management and social preview cards for Next.js 15.',
      author: { name: 'Nirmaanify Core Team', url: 'https://nirmaanify.com' },
      category: 'SEO',
      permissions: ['ui:render_slot', 'cms:read'],
      entrypoints: {
        frontend: './frontend/index.js',
        generator: './generator/index.js',
      },
      slots: [
        { name: 'studio:inspector_tab', title: 'SEO Inspector', icon: 'globe' },
      ],
      configurationSchema: {
        type: 'object',
        properties: {
          siteName: {
            type: 'string',
            title: 'Site Brand Name',
          },
          canonicalUrl: {
            type: 'string',
            title: 'Canonical Production URL',
            description: 'e.g. https://myproject.com',
          },
          defaultOgImage: {
            type: 'string',
            title: 'Default OpenGraph Image URL',
          },
          twitterHandle: {
            type: 'string',
            title: 'Twitter / X Handle',
          },
        },
        required: ['siteName', 'canonicalUrl'],
      },
    },
  },

  // 5. CMS: Shopify Headless Sync
  {
    slug: 'shopify-sync',
    name: 'Shopify Headless Store Sync',
    description: 'Synchronize Shopify products, variants, and inventory into Nirmaanify CMS collections.',
    version: '1.0.1',
    author: 'E-Commerce Integrations',
    iconUrl: 'shopping-bag',
    category: 'CMS',
    isOfficial: false,
    downloadCount: 420,
    rating: 4.7,
    manifest: {
      id: 'shopify-sync',
      name: 'Shopify Headless Store Sync',
      version: '1.0.1',
      description: 'Sync Shopify products with custom CMS collections.',
      author: { name: 'E-Commerce Integrations' },
      category: 'CMS',
      permissions: ['cms:read', 'cms:write', 'env:read_secrets', 'network:outbound'],
      entrypoints: {
        frontend: './frontend/index.js',
        backend: './backend/index.js',
      },
      slots: [
        { name: 'studio:toolbar', title: 'Shopify Sync', icon: 'shopping-bag' },
      ],
      configurationSchema: {
        type: 'object',
        properties: {
          shopDomain: {
            type: 'string',
            title: 'Shopify Store Domain',
            description: 'yourstore.myshopify.com',
          },
          storefrontAccessToken: {
            type: 'string',
            title: 'Storefront Access Token',
            isSecret: true,
          },
        },
        required: ['shopDomain', 'storefrontAccessToken'],
      },
    },
  },
];
