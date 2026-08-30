import { ProjectSchema, ComponentNode, PageSchema } from '@nirmaanify/types';
import { createComponentNode } from '../registry';

export function createDefaultProjectSchema(
  name: string = 'My NextGen App',
  type: string = 'SAAS'
): ProjectSchema {
  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  const now = new Date().toISOString();

  let pages: PageSchema[] = [];

  if (type === 'ECOMMERCE') {
    pages = [
      createEcommerceHomePage(),
      createEcommerceProductsPage(),
    ];
  } else if (type === 'DASHBOARD') {
    pages = [
      createDashboardOverviewPage(),
    ];
  } else {
    // Default SaaS / Website
    pages = [
      createSaasLandingPage(name),
      createSaasPricingPage(),
    ];
  }

  return {
    version: '1.0.0',
    id: `schema-${Date.now()}`,
    settings: {
      name,
      slug,
      description: `Production-ready ${type} application designed with Nirmaanify Engine.`,
      responsive: {
        mobile: 375,
        tablet: 768,
        desktop: 1280,
        widescreen: 1536,
      },
    },
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
    packages: [
      { name: '@nirmaanify/ui', version: '^0.1.0', scope: 'dependencies' },
      { name: 'lucide-react', version: '^0.475.0', scope: 'dependencies' },
      { name: 'clsx', version: '^2.1.1', scope: 'dependencies' },
    ],
    plugins: [
      { name: 'S3 Storage Driver', category: 'Storage', enabled: true },
      { name: 'PostgreSQL Prisma', category: 'Database', enabled: true },
    ],
    backendConfiguration: {
      enabled: true,
      framework: 'NestJS 11',
      modules: ['Auth', 'Users', 'App'],
      databaseEngine: 'PostgreSQL 16',
    },
    createdAt: now,
    updatedAt: now,
  };
}

function createSaasLandingPage(brandName: string): PageSchema {
  const rootNode: ComponentNode = {
    id: 'root-landing',
    type: 'container',
    name: 'Page Root',
    props: { maxWidth: '100%', padding: '0px', direction: 'column', gap: '0px' },
    children: [
      {
        id: 'node-nav-1',
        type: 'navbar',
        name: 'Header Navbar',
        props: {
          brandName,
          links: 'Features, Architecture, Pricing, Docs',
          ctaText: 'Start Building Free',
          isSticky: true,
        },
      },
      {
        id: 'node-hero-1',
        type: 'hero',
        name: 'Main Hero Banner',
        props: {
          badgeText: 'Powered by Next.js 15 & AI Engine',
          title: 'Imagine. Build. Launch.',
          subtitle: 'Architect production-grade fullstack web applications directly from validated schemas.',
          primaryCtaText: 'Launch Studio Free',
          secondaryCtaText: 'View Blueprint Docs',
          align: 'center',
        },
      },
      {
        id: 'node-section-feat',
        type: 'section',
        name: 'Features Section',
        props: { paddingY: '48px', paddingX: '24px', backgroundColor: 'transparent' },
        children: [
          {
            id: 'node-grid-feat',
            type: 'grid',
            name: 'Features 3-Col Grid',
            props: { columns: 3, gap: '24px' },
            children: [
              {
                id: 'node-f1',
                type: 'feature-card',
                name: 'Feature: Declarative Schema',
                props: {
                  tag: 'Architecture',
                  title: 'Visual Schema Engine',
                  description: 'State-driven Component Nodes that separate presentation from code generators.',
                },
              },
              {
                id: 'node-f2',
                type: 'feature-card',
                name: 'Feature: Component Registry',
                props: {
                  tag: 'Design System',
                  title: 'Verified Registry',
                  description: '20+ core components with Zod validation, default props, and inspector controls.',
                },
              },
              {
                id: 'node-f3',
                type: 'feature-card',
                name: 'Feature: History Engine',
                props: {
                  tag: 'Editor',
                  title: 'Time-Travel Undo / Redo',
                  description: 'Immutable snapshot state stack ensuring zero accidental work loss.',
                },
              },
            ],
          },
        ],
      },
      {
        id: 'node-footer-1',
        type: 'footer',
        name: 'Page Footer',
        props: {
          brandName: `${brandName} AI`,
          copyrightText: `© 2026 ${brandName}. All rights reserved.`,
        },
      },
    ],
  };

  return {
    id: 'page-home',
    name: 'Landing Page',
    path: '/',
    title: `${brandName} — Imagine. Build. Launch.`,
    layout: 'default',
    rootNode,
  };
}

function createSaasPricingPage(): PageSchema {
  const rootNode: ComponentNode = {
    id: 'root-pricing',
    type: 'container',
    name: 'Pricing Root',
    props: { maxWidth: '100%', padding: '0px', direction: 'column', gap: '0px' },
    children: [
      {
        id: 'node-nav-pricing',
        type: 'navbar',
        name: 'Navbar',
        props: { brandName: 'Nirmaanify', links: 'Home, Features, Pricing', ctaText: 'Sign In' },
      },
      {
        id: 'node-section-pricing',
        type: 'section',
        name: 'Pricing Section',
        props: { paddingY: '48px', paddingX: '24px', backgroundColor: 'transparent' },
        children: [
          {
            id: 'node-heading-pricing',
            type: 'heading',
            name: 'Pricing Headline',
            props: { text: 'Transparent Plans for Ambitious Creators', level: 'h1', align: 'center', gradient: true },
          },
          {
            id: 'node-grid-pricing',
            type: 'grid',
            name: 'Pricing Grid',
            props: { columns: 3, gap: '24px' },
            children: [
              {
                id: 'node-plan-starter',
                type: 'pricing-card',
                name: 'Starter Plan',
                props: {
                  tierName: 'Starter',
                  price: '$0',
                  period: '/forever',
                  description: 'For hobbyists building proof of concepts.',
                  features: '3 Active Projects, Next.js Static Export, Community Support',
                  buttonText: 'Get Started Free',
                  isPopular: false,
                },
              },
              {
                id: 'node-plan-pro',
                type: 'pricing-card',
                name: 'Pro Plan',
                props: {
                  tierName: 'Pro Creator',
                  price: '$29',
                  period: '/month',
                  description: 'For growing teams requiring fullstack export & cloud hosting.',
                  features: 'Unlimited Projects, Full NestJS Backend Export, 10GB S3 Storage, Priority Support',
                  buttonText: 'Upgrade to Pro',
                  isPopular: true,
                },
              },
              {
                id: 'node-plan-enterprise',
                type: 'pricing-card',
                name: 'Enterprise Plan',
                props: {
                  tierName: 'Enterprise',
                  price: '$99',
                  period: '/month',
                  description: 'Dedicated infrastructure with custom SLA and security audits.',
                  features: 'Custom Domains, SSO Authentication, Dedicated BullMQ Workers, 24/7 SLA',
                  buttonText: 'Contact Enterprise',
                  isPopular: false,
                },
              },
            ],
          },
        ],
      },
      {
        id: 'node-footer-pricing',
        type: 'footer',
        name: 'Footer',
        props: { brandName: 'Nirmaanify', copyrightText: '© 2026 Nirmaanify AI.' },
      },
    ],
  };

  return {
    id: 'page-pricing',
    name: 'Pricing & Plans',
    path: '/pricing',
    title: 'Pricing Plans — Nirmaanify',
    layout: 'default',
    rootNode,
  };
}

function createEcommerceHomePage(): PageSchema {
  const rootNode: ComponentNode = {
    id: 'root-ecom-home',
    type: 'container',
    name: 'Storefront Root',
    props: { maxWidth: '100%', padding: '0px', direction: 'column', gap: '0px' },
    children: [
      {
        id: 'node-ecom-nav',
        type: 'navbar',
        name: 'Storefront Navbar',
        props: { brandName: 'Luxe Boutique', links: 'New Arrivals, Apparel, Accessories, Sale', ctaText: 'Cart (0)' },
      },
      {
        id: 'node-ecom-hero',
        type: 'hero',
        name: 'Boutique Hero',
        props: {
          badgeText: 'Autumn / Winter Collection',
          title: 'Modern Elegance Redefined',
          subtitle: 'Curated apparel crafted with organic fabrics and timeless silhouettes.',
          primaryCtaText: 'Shop New Arrivals',
          secondaryCtaText: 'Explore Lookbook',
          align: 'center',
        },
      },
      {
        id: 'node-ecom-sec-prod',
        type: 'section',
        name: 'Featured Products Section',
        props: { paddingY: '48px', paddingX: '24px', backgroundColor: 'transparent' },
        children: [
          {
            id: 'node-ecom-grid',
            type: 'grid',
            name: 'Products Grid',
            props: { columns: 3, gap: '24px' },
            children: [
              {
                id: 'node-p1',
                type: 'product-card',
                name: 'Product: Wool Blazer',
                props: {
                  title: 'Merino Wool Oversized Blazer',
                  price: '$189.00',
                  originalPrice: '$240.00',
                  category: 'Outerwear',
                  imageUrl: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=600&auto=format&fit=crop&q=80',
                  badgeText: 'Bestseller',
                },
              },
              {
                id: 'node-p2',
                type: 'product-card',
                name: 'Product: Silk Blouse',
                props: {
                  title: 'Structured Mulberry Silk Shirt',
                  price: '$145.00',
                  originalPrice: '',
                  category: 'Tops',
                  imageUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600&auto=format&fit=crop&q=80',
                  badgeText: 'New',
                },
              },
              {
                id: 'node-p3',
                type: 'product-card',
                name: 'Product: Leather Tote',
                props: {
                  title: 'Handcrafted Minimalist Tote',
                  price: '$260.00',
                  originalPrice: '$310.00',
                  category: 'Accessories',
                  imageUrl: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=600&auto=format&fit=crop&q=80',
                  badgeText: 'Limited',
                },
              },
            ],
          },
        ],
      },
      {
        id: 'node-ecom-foot',
        type: 'footer',
        name: 'Store Footer',
        props: { brandName: 'Luxe Boutique', copyrightText: '© 2026 Luxe Boutique. All rights reserved.' },
      },
    ],
  };

  return {
    id: 'page-ecom-home',
    name: 'Home Storefront',
    path: '/',
    title: 'Luxe Boutique — Curated Apparel',
    layout: 'default',
    rootNode,
  };
}

function createEcommerceProductsPage(): PageSchema {
  const rootNode: ComponentNode = {
    id: 'root-catalog',
    type: 'container',
    name: 'Catalog Root',
    props: { maxWidth: '1200px', padding: '24px', direction: 'column', gap: '24px' },
    children: [
      {
        id: 'node-cat-head',
        type: 'heading',
        name: 'Catalog Heading',
        props: { text: 'Complete Collection', level: 'h1', align: 'left' },
      },
      {
        id: 'node-cat-grid',
        type: 'grid',
        name: 'Catalog Grid',
        props: { columns: 3, gap: '24px' },
        children: [
          {
            id: 'node-cat-p1',
            type: 'product-card',
            name: 'Product 1',
            props: { title: 'Cashmere Ribbed Knit', price: '$210.00', category: 'Knitwear' },
          },
          {
            id: 'node-cat-p2',
            type: 'product-card',
            name: 'Product 2',
            props: { title: 'Wide Leg Tailored Trousers', price: '$165.00', category: 'Pants' },
          },
          {
            id: 'node-cat-p3',
            type: 'product-card',
            name: 'Product 3',
            props: { title: 'Classic Trench Coat', price: '$320.00', category: 'Coats' },
          },
        ],
      },
    ],
  };

  return {
    id: 'page-ecom-catalog',
    name: 'Catalog & Products',
    path: '/products',
    title: 'Product Catalog — Luxe Boutique',
    layout: 'default',
    rootNode,
  };
}

function createDashboardOverviewPage(): PageSchema {
  const rootNode: ComponentNode = {
    id: 'root-dash',
    type: 'container',
    name: 'Dashboard Root',
    props: { maxWidth: '1200px', padding: '24px', direction: 'column', gap: '24px' },
    children: [
      {
        id: 'node-dash-head',
        type: 'heading',
        name: 'Executive Title',
        props: { text: 'Executive Analytics Hub', level: 'h1', align: 'left' },
      },
      {
        id: 'node-dash-metrics',
        type: 'grid',
        name: 'KPI Metrics Row',
        props: { columns: 3, gap: '24px' },
        children: [
          {
            id: 'node-m1',
            type: 'metric-card',
            name: 'KPI: MRR',
            props: { label: 'Monthly Recurring Revenue', value: '$72,400', change: '+18.4%', isPositive: true },
          },
          {
            id: 'node-m2',
            type: 'metric-card',
            name: 'KPI: Active Users',
            props: { label: 'Monthly Active Users', value: '14,290', change: '+24.1%', isPositive: true },
          },
          {
            id: 'node-m3',
            type: 'metric-card',
            name: 'KPI: Churn Rate',
            props: { label: 'Net Churn Rate', value: '1.2%', change: '-0.4%', isPositive: true },
          },
        ],
      },
    ],
  };

  return {
    id: 'page-dash-overview',
    name: 'Overview Dashboard',
    path: '/dashboard',
    title: 'Analytics Overview',
    layout: 'dashboard',
    rootNode,
  };
}
