import { ProjectSchema, ComponentNode, PageSchema } from '@nirmaanify/types';
import { createComponentNode } from '../registry';

export function createDefaultProjectSchema(
  name: string = 'My NextGen App',
  type: string = 'SAAS'
): ProjectSchema {
  const slug = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
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
  } else if (type === 'BLOG') {
    pages = [
      createBlogHomePage(),
      createBlogArticlePage(),
    ];
  } else if (type === 'PORTFOLIO') {
    pages = [
      createPortfolioHomePage(),
    ];
  } else if (type === 'WEBSITE') {
    pages = [
      createWebsiteHomePage(),
      createWebsiteAboutPage(),
    ];
  } else {
    // Default SaaS / Custom
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

// ==========================================
// BLOG TEMPLATES
// ==========================================

function createBlogHomePage(): PageSchema {
  const rootNode: ComponentNode = {
    id: 'root-blog-home',
    type: 'container',
    name: 'Blog Home Root',
    props: { maxWidth: '100%', padding: '0px', direction: 'column', gap: '0px' },
    children: [
      {
        id: 'node-blog-nav',
        type: 'navbar',
        name: 'Blog Navbar',
        props: {
          brandName: 'The Nirmaanify Journal',
          links: 'Articles, Tutorials, Changelog, Subscribe',
          ctaText: 'Subscribe',
          isSticky: true,
        },
      },
      {
        id: 'node-blog-hero',
        type: 'hero',
        name: 'Blog Hero',
        props: {
          badgeText: 'Insights & Engineering',
          title: 'Stories from the Nirmaanify team',
          subtitle:
            'Long-form essays on visual schema engines, declarative architecture, and shipping product at startup speed.',
          primaryCtaText: 'Browse latest articles',
          secondaryCtaText: 'Subscribe to newsletter',
          align: 'center',
        },
      },
      {
        id: 'node-blog-section-featured',
        type: 'section',
        name: 'Featured Posts Section',
        props: { paddingY: '64px', paddingX: '24px', backgroundColor: 'transparent' },
        children: [
          {
            id: 'node-blog-heading-featured',
            type: 'heading',
            name: 'Featured Heading',
            props: { text: 'Featured Articles', level: 'h2', align: 'center' },
          },
          {
            id: 'node-blog-grid-featured',
            type: 'grid',
            name: 'Featured Posts Grid',
            props: { columns: 3, gap: '24px' },
            children: [
              {
                id: 'node-blog-post-1',
                type: 'feature-card',
                name: 'Post: Declarative Schema',
                props: {
                  tag: 'Architecture',
                  title: 'Why declarative schemas beat hand-written JSX',
                  description: 'How a clean JSON tree separates the visual layer from the code generator.',
                },
              },
              {
                id: 'node-blog-post-2',
                type: 'feature-card',
                name: 'Post: Drag and Drop',
                props: {
                  tag: 'Engineering',
                  title: 'Building a visual canvas with React 19',
                  description: 'Recursive renderers, selection rings, and dnd-kit for production-grade editors.',
                },
              },
              {
                id: 'node-blog-post-3',
                type: 'feature-card',
                name: 'Post: AI Planning',
                props: {
                  tag: 'AI',
                  title: 'From prompt to working app in 90 seconds',
                  description: 'How Nirmaanify compiles an AI plan into a structured ProjectSchema.',
                },
              },
            ],
          },
        ],
      },
      {
        id: 'node-blog-section-testimonials',
        type: 'section',
        name: 'Reader Testimonials Section',
        props: { paddingY: '48px', paddingX: '24px', backgroundColor: '#0E121E' },
        children: [
          {
            id: 'node-blog-heading-testimonials',
            type: 'heading',
            name: 'Reader Quotes Heading',
            props: { text: 'What readers are saying', level: 'h2', align: 'center', gradient: true },
          },
          {
            id: 'node-blog-grid-testimonials',
            type: 'grid',
            name: 'Testimonials Grid',
            props: { columns: 3, gap: '24px' },
            children: [
              {
                id: 'node-blog-testimonial-1',
                type: 'testimonial-card',
                name: 'Testimonial 1',
                props: {
                  quote: 'The schema-first approach finally made our visual editor feel solid.',
                  authorName: 'Priya Raman',
                  authorRole: 'Staff Engineer',
                  rating: 5,
                },
              },
              {
                id: 'node-blog-testimonial-2',
                type: 'testimonial-card',
                name: 'Testimonial 2',
                props: {
                  quote: 'We shipped a marketing site in a single afternoon — no JSX edits needed.',
                  authorName: 'Marcus Hale',
                  authorRole: 'Founder, Beacon Labs',
                  rating: 5,
                },
              },
              {
                id: 'node-blog-testimonial-3',
                type: 'testimonial-card',
                name: 'Testimonial 3',
                props: {
                  quote: 'Clean separation between schema and renderer is a genuinely good idea.',
                  authorName: 'Eleanor Whitcombe',
                  authorRole: 'Design Engineer',
                  rating: 4,
                },
              },
            ],
          },
        ],
      },
      {
        id: 'node-blog-section-newsletter',
        type: 'section',
        name: 'Newsletter Section',
        props: { paddingY: '64px', paddingX: '24px', backgroundColor: 'transparent' },
        children: [
          {
            id: 'node-blog-newsletter-card',
            type: 'card',
            name: 'Newsletter Signup Card',
            props: {
              title: 'Join 12,000+ readers',
              description: 'One thoughtful essay a week on visual development, schemas, and shipping fast.',
              hoverable: true,
            },
            children: [
              {
                id: 'node-blog-newsletter-form',
                type: 'form',
                name: 'Newsletter Form',
                props: {
                  title: 'Subscribe to the Journal',
                  submitButtonLabel: 'Subscribe',
                },
                children: [
                  {
                    id: 'node-blog-newsletter-input',
                    type: 'input',
                    name: 'Email Input',
                    props: {
                      label: 'Email address',
                      placeholder: 'you@company.com',
                      inputType: 'email',
                      helperText: 'We send one email per week. Unsubscribe any time.',
                    },
                  },
                ],
              },
            ],
          },
        ],
      },
      {
        id: 'node-blog-footer',
        type: 'footer',
        name: 'Blog Footer',
        props: {
          brandName: 'The Nirmaanify Journal',
          copyrightText: '© 2026 Nirmaanify. All rights reserved.',
        },
      },
    ],
  };

  return {
    id: 'page-blog-home',
    name: 'Blog Home',
    path: '/',
    title: 'The Nirmaanify Journal — Insights & Engineering',
    layout: 'default',
    rootNode,
  };
}

function createBlogArticlePage(): PageSchema {
  const rootNode: ComponentNode = {
    id: 'root-blog-article',
    type: 'container',
    name: 'Article Root',
    props: { maxWidth: '800px', padding: '24px', direction: 'column', gap: '24px' },
    children: [
      {
        id: 'node-article-nav',
        type: 'navbar',
        name: 'Article Navbar',
        props: {
          brandName: 'The Nirmaanify Journal',
          links: 'Articles, Tutorials, Changelog',
          ctaText: 'Subscribe',
          isSticky: true,
        },
      },
      {
        id: 'node-article-meta',
        type: 'badge',
        name: 'Article Category Badge',
        props: { text: 'Architecture', variant: 'cyan', size: 'sm' },
      },
      {
        id: 'node-article-title',
        type: 'heading',
        name: 'Article Title',
        props: {
          text: 'Why declarative schemas beat hand-written JSX',
          level: 'h1',
          align: 'left',
          gradient: true,
        },
      },
      {
        id: 'node-article-author',
        type: 'text',
        name: 'Author Byline',
        props: {
          content: 'By Kritam Dahal · 8 min read · Published August 2026',
          size: 'sm',
          align: 'left',
          color: 'muted',
        },
      },
      {
        id: 'node-article-divider',
        type: 'separator',
        name: 'Article Divider',
        props: { orientation: 'horizontal' },
      },
      {
        id: 'node-article-section-intro',
        type: 'section',
        name: 'Introduction Section',
        props: { paddingY: '16px', paddingX: '0px', backgroundColor: 'transparent' },
        children: [
          {
            id: 'node-article-intro-text',
            type: 'text',
            name: 'Article Intro',
            props: {
              content:
                'Every visual builder eventually faces the same question: where does the design live — in JSX, or in a schema? After three years of building editors, the answer is clear: schemas win. They are diffable, serializable, and survive every framework migration.',
              size: 'lg',
              align: 'left',
              color: 'default',
            },
          },
        ],
      },
      {
        id: 'node-article-section-headings',
        type: 'section',
        name: 'Article Body Section',
        props: { paddingY: '24px', paddingX: '0px', backgroundColor: 'transparent' },
        children: [
          {
            id: 'node-article-h2-1',
            type: 'heading',
            name: 'Body Heading 1',
            props: { text: 'What is a Project Schema?', level: 'h2', align: 'left' },
          },
          {
            id: 'node-article-h2-1-text',
            type: 'text',
            name: 'Body Paragraph 1',
            props: {
              content:
                'A project schema is a structured representation of your application — pages, components, theme tokens, data sources — that is independent of any single rendering technology. You can store it as JSON, version it with Git, and pass it to any code generator.',
              size: 'base',
              align: 'left',
              color: 'default',
            },
          },
          {
            id: 'node-article-h2-2',
            type: 'heading',
            name: 'Body Heading 2',
            props: { text: 'Why it matters for visual builders', level: 'h2', align: 'left' },
          },
          {
            id: 'node-article-h2-2-text',
            type: 'text',
            name: 'Body Paragraph 2',
            props: {
              content:
                'When state is a tree of nodes, every action — add, delete, move, undo — becomes a pure transformation. There is no JSX to patch, no rebuild step in the editor loop, and the same schema can power a canvas, an export pipeline, and a runtime renderer.',
              size: 'base',
              align: 'left',
              color: 'default',
            },
          },
        ],
      },
      {
        id: 'node-article-quote',
        type: 'testimonial-card',
        name: 'Article Pull Quote',
        props: {
          quote:
            'The moment we lifted our state into a schema tree, undo/redo, multi-user editing, and AI planning all became free.',
          authorName: 'Anonymous Hacker News commenter',
          authorRole: '',
          rating: 5,
        },
      },
      {
        id: 'node-article-footer',
        type: 'footer',
        name: 'Article Footer',
        props: {
          brandName: 'The Nirmaanify Journal',
          copyrightText: '© 2026 Nirmaanify. All rights reserved.',
        },
      },
    ],
  };

  return {
    id: 'page-blog-article',
    name: 'Sample Article',
    path: '/articles/declarative-schemas',
    title: 'Why declarative schemas beat hand-written JSX — Nirmaanify Journal',
    layout: 'default',
    rootNode,
  };
}

// ==========================================
// PORTFOLIO TEMPLATE
// ==========================================

function createPortfolioHomePage(): PageSchema {
  const rootNode: ComponentNode = {
    id: 'root-portfolio-home',
    type: 'container',
    name: 'Portfolio Root',
    props: { maxWidth: '100%', padding: '0px', direction: 'column', gap: '0px' },
    children: [
      {
        id: 'node-portfolio-nav',
        type: 'navbar',
        name: 'Portfolio Navbar',
        props: {
          brandName: 'Aria Sundaram',
          links: 'Work, About, Writing, Contact',
          ctaText: 'Hire me',
          isSticky: true,
        },
      },
      {
        id: 'node-portfolio-hero',
        type: 'hero',
        name: 'Portfolio Hero',
        props: {
          badgeText: 'Available for freelance · 2026',
          title: 'Independent product designer & engineer.',
          subtitle:
            'I help early-stage startups ship their first product — from visual identity through full-stack implementation.',
          primaryCtaText: 'See selected work',
          secondaryCtaText: 'Read about me',
          align: 'left',
        },
      },
      {
        id: 'node-portfolio-section-work',
        type: 'section',
        name: 'Selected Work Section',
        props: { paddingY: '64px', paddingX: '24px', backgroundColor: 'transparent' },
        children: [
          {
            id: 'node-portfolio-heading-work',
            type: 'heading',
            name: 'Work Heading',
            props: { text: 'Selected work', level: 'h2', align: 'left' },
          },
          {
            id: 'node-portfolio-grid-work',
            type: 'grid',
            name: 'Work Grid',
            props: { columns: 2, gap: '24px' },
            children: [
              {
                id: 'node-portfolio-work-1',
                type: 'feature-card',
                name: 'Case Study: Beacon',
                props: {
                  tag: '2025 · Fintech',
                  title: 'Beacon — Mobile banking for freelancers',
                  description: 'Designed and shipped the MVP in 11 weeks. Now used by 4,000 freelancers across the EU.',
                },
              },
              {
                id: 'node-portfolio-work-2',
                type: 'feature-card',
                name: 'Case Study: Lumen',
                props: {
                  tag: '2024 · Health',
                  title: 'Lumen — Mental health journaling app',
                  description: 'Brand, onboarding flow, and a privacy-first data architecture for an early-stage health startup.',
                },
              },
              {
                id: 'node-portfolio-work-3',
                type: 'feature-card',
                name: 'Case Study: Drift',
                props: {
                  tag: '2024 · Climate',
                  title: 'Drift — Carbon footprint dashboard',
                  description: 'A live dashboard that helped a climate-tech seed round hit its traction metrics in eight weeks.',
                },
              },
              {
                id: 'node-portfolio-work-4',
                type: 'feature-card',
                name: 'Case Study: Orbis',
                props: {
                  tag: '2023 · Productivity',
                  title: 'Orbis — Async-first team workspace',
                  description: 'Design system, marketing site, and the first three months of customer interviews.',
                },
              },
            ],
          },
        ],
      },
      {
        id: 'node-portfolio-section-testimonials',
        type: 'section',
        name: 'Client Testimonials Section',
        props: { paddingY: '48px', paddingX: '24px', backgroundColor: '#0E121E' },
        children: [
          {
            id: 'node-portfolio-heading-testimonials',
            type: 'heading',
            name: 'Testimonials Heading',
            props: { text: 'Kind words from clients', level: 'h2', align: 'left', gradient: true },
          },
          {
            id: 'node-portfolio-grid-testimonials',
            type: 'grid',
            name: 'Testimonials Grid',
            props: { columns: 2, gap: '24px' },
            children: [
              {
                id: 'node-portfolio-testimonial-1',
                type: 'testimonial-card',
                name: 'Testimonial 1',
                props: {
                  quote: 'Aria delivered our MVP ahead of schedule and made the engineering team faster.',
                  authorName: 'Jonas Weber',
                  authorRole: 'CTO, Beacon',
                  rating: 5,
                },
              },
              {
                id: 'node-portfolio-testimonial-2',
                type: 'testimonial-card',
                name: 'Testimonial 2',
                props: {
                  quote: 'The design system alone paid for the engagement within two quarters.',
                  authorName: 'Helena Park',
                  authorRole: 'Founder, Drift',
                  rating: 5,
                },
              },
            ],
          },
        ],
      },
      {
        id: 'node-portfolio-section-contact',
        type: 'section',
        name: 'Contact Section',
        props: { paddingY: '64px', paddingX: '24px', backgroundColor: 'transparent' },
        children: [
          {
            id: 'node-portfolio-heading-contact',
            type: 'heading',
            name: 'Contact Heading',
            props: { text: 'Let’s build something', level: 'h2', align: 'left' },
          },
          {
            id: 'node-portfolio-contact-text',
            type: 'text',
            name: 'Contact Text',
            props: {
              content:
                'I take on one new project per quarter. Email aria@orias.studio with a short brief and I will reply within two business days.',
              size: 'lg',
              align: 'left',
              color: 'muted',
            },
          },
          {
            id: 'node-portfolio-contact-form',
            type: 'form',
            name: 'Contact Form',
            props: {
              title: 'Send a brief',
              submitButtonLabel: 'Send message',
            },
            children: [
              {
                id: 'node-portfolio-contact-name',
                type: 'input',
                name: 'Name Input',
                props: {
                  label: 'Your name',
                  placeholder: 'Jane Doe',
                  inputType: 'text',
                  helperText: '',
                },
              },
              {
                id: 'node-portfolio-contact-email',
                type: 'input',
                name: 'Email Input',
                props: {
                  label: 'Email',
                  placeholder: 'jane@company.com',
                  inputType: 'email',
                  helperText: '',
                },
              },
              {
                id: 'node-portfolio-contact-brief',
                type: 'textarea',
                name: 'Brief Textarea',
                props: {
                  label: 'Project brief',
                  placeholder: 'A few sentences about your project, timeline, and budget.',
                  rows: 5,
                },
              },
            ],
          },
        ],
      },
      {
        id: 'node-portfolio-footer',
        type: 'footer',
        name: 'Portfolio Footer',
        props: {
          brandName: 'Aria Sundaram',
          copyrightText: '© 2026 Aria Sundaram. All rights reserved.',
        },
      },
    ],
  };

  return {
    id: 'page-portfolio-home',
    name: 'Portfolio Home',
    path: '/',
    title: 'Aria Sundaram — Independent product designer & engineer',
    layout: 'default',
    rootNode,
  };
}

// ==========================================
// WEBSITE TEMPLATE
// ==========================================

function createWebsiteHomePage(): PageSchema {
  const rootNode: ComponentNode = {
    id: 'root-website-home',
    type: 'container',
    name: 'Website Home Root',
    props: { maxWidth: '100%', padding: '0px', direction: 'column', gap: '0px' },
    children: [
      {
        id: 'node-website-nav',
        type: 'navbar',
        name: 'Website Navbar',
        props: {
          brandName: 'Nirmaanify',
          links: 'Home, Features, Pricing, About, Contact',
          ctaText: 'Start free',
          isSticky: true,
        },
      },
      {
        id: 'node-website-hero',
        type: 'hero',
        name: 'Website Hero',
        props: {
          badgeText: 'New · Visual Schema Engine v1',
          title: 'Visual websites, built on a clean schema.',
          subtitle:
            'Nirmaanify gives marketing teams a visual canvas and engineers a clean JSON schema they can actually own.',
          primaryCtaText: 'Start building free',
          secondaryCtaText: 'Book a 15-minute demo',
          align: 'center',
        },
      },
      {
        id: 'node-website-section-features',
        type: 'section',
        name: 'Features Section',
        props: { paddingY: '64px', paddingX: '24px', backgroundColor: 'transparent' },
        children: [
          {
            id: 'node-website-heading-features',
            type: 'heading',
            name: 'Features Heading',
            props: { text: 'Everything your team needs', level: 'h2', align: 'center' },
          },
          {
            id: 'node-website-grid-features',
            type: 'grid',
            name: 'Features Grid',
            props: { columns: 3, gap: '24px' },
            children: [
              {
                id: 'node-website-feature-1',
                type: 'feature-card',
                name: 'Feature: Visual Canvas',
                props: {
                  tag: 'Editor',
                  title: 'A real visual canvas',
                  description: 'Drag, drop, and resize components directly on the canvas — no JSX editing required.',
                },
              },
              {
                id: 'node-website-feature-2',
                type: 'feature-card',
                name: 'Feature: Schema Output',
                props: {
                  tag: 'Engineering',
                  title: 'Clean JSON output',
                  description: 'Every change is persisted as structured schema that engineers can read, review, and version.',
                },
              },
              {
                id: 'node-website-feature-3',
                type: 'feature-card',
                name: 'Feature: Export',
                props: {
                  tag: 'Deploy',
                  title: 'Export to Next.js',
                  description: 'One-click export to a production-ready Next.js codebase with Tailwind, TypeScript, and your schema embedded.',
                },
              },
            ],
          },
        ],
      },
      {
        id: 'node-website-section-testimonials',
        type: 'section',
        name: 'Testimonials Section',
        props: { paddingY: '48px', paddingX: '24px', backgroundColor: '#0E121E' },
        children: [
          {
            id: 'node-website-heading-testimonials',
            type: 'heading',
            name: 'Testimonials Heading',
            props: { text: 'Loved by indie teams', level: 'h2', align: 'center', gradient: true },
          },
          {
            id: 'node-website-grid-testimonials',
            type: 'grid',
            name: 'Testimonials Grid',
            props: { columns: 3, gap: '24px' },
            children: [
              {
                id: 'node-website-testimonial-1',
                type: 'testimonial-card',
                name: 'Testimonial 1',
                props: {
                  quote: 'Our marketing team ships three pages a week now. Engineering is no longer the bottleneck.',
                  authorName: 'Theo Anderson',
                  authorRole: 'VP Marketing, Lumen',
                  rating: 5,
                },
              },
              {
                id: 'node-website-testimonial-2',
                type: 'testimonial-card',
                name: 'Testimonial 2',
                props: {
                  quote: 'A clean schema means we can finally reuse marketing layouts across products.',
                  authorName: 'Sabrina Klein',
                  authorRole: 'Design Lead, Drift',
                  rating: 5,
                },
              },
              {
                id: 'node-website-testimonial-3',
                type: 'testimonial-card',
                name: 'Testimonial 3',
                props: {
                  quote: 'The inspector is fast enough that I forget I am using a low-code tool.',
                  authorName: 'Daniel Okafor',
                  authorRole: 'Solo Founder',
                  rating: 4,
                },
              },
            ],
          },
        ],
      },
      {
        id: 'node-website-section-cta',
        type: 'section',
        name: 'Final CTA Section',
        props: { paddingY: '64px', paddingX: '24px', backgroundColor: 'transparent' },
        children: [
          {
            id: 'node-website-cta-card',
            type: 'card',
            name: 'Final CTA Card',
            props: {
              title: 'Ready to ship your next website on a real schema?',
              description: 'Spin up a free workspace in under a minute. No credit card required.',
              hoverable: true,
            },
            children: [
              {
                id: 'node-website-cta-button',
                type: 'button',
                name: 'CTA Button',
                props: {
                  label: 'Create a free workspace',
                  variant: 'default',
                  size: 'lg',
                  fullWidth: false,
                },
              },
            ],
          },
        ],
      },
      {
        id: 'node-website-footer',
        type: 'footer',
        name: 'Website Footer',
        props: {
          brandName: 'Nirmaanify',
          copyrightText: '© 2026 Nirmaanify. All rights reserved.',
        },
      },
    ],
  };

  return {
    id: 'page-website-home',
    name: 'Home',
    path: '/',
    title: 'Nirmaanify — Visual websites on a clean schema',
    layout: 'default',
    rootNode,
  };
}

function createWebsiteAboutPage(): PageSchema {
  const rootNode: ComponentNode = {
    id: 'root-website-about',
    type: 'container',
    name: 'About Root',
    props: { maxWidth: '900px', padding: '24px', direction: 'column', gap: '24px' },
    children: [
      {
        id: 'node-about-nav',
        type: 'navbar',
        name: 'About Navbar',
        props: {
          brandName: 'Nirmaanify',
          links: 'Home, Features, Pricing, About, Contact',
          ctaText: 'Start free',
          isSticky: true,
        },
      },
      {
        id: 'node-about-heading',
        type: 'heading',
        name: 'About Heading',
        props: { text: 'We are building the visual layer for the schema-first era.', level: 'h1', align: 'left', gradient: true },
      },
      {
        id: 'node-about-text-1',
        type: 'text',
        name: 'About Body 1',
        props: {
          content:
            'Nirmaanify started in 2025 with a simple observation: most visual builders store state as raw JSX strings, which makes them impossible to version, impossible to migrate, and impossible to extend. We took the opposite bet — that schemas would win.',
          size: 'lg',
          align: 'left',
          color: 'default',
        },
      },
      {
        id: 'node-about-text-2',
        type: 'text',
        name: 'About Body 2',
        props: {
          content:
            'Today our engine ships a recursive React renderer, an undoable editor, an AI planner, and a production-grade export pipeline. We are a small team of six, fully remote, and we ship every week.',
          size: 'base',
          align: 'left',
          color: 'muted',
        },
      },
      {
        id: 'node-about-section-metrics',
        type: 'section',
        name: 'Metrics Section',
        props: { paddingY: '24px', paddingX: '0px', backgroundColor: 'transparent' },
        children: [
          {
            id: 'node-about-grid-metrics',
            type: 'grid',
            name: 'Metrics Grid',
            props: { columns: 3, gap: '24px' },
            children: [
              {
                id: 'node-about-metric-1',
                type: 'metric-card',
                name: 'Metric: Workspaces',
                props: { label: 'Active workspaces', value: '1,240', change: '+38%', isPositive: true, subtext: 'past 90 days' },
              },
              {
                id: 'node-about-metric-2',
                type: 'metric-card',
                name: 'Metric: Schemas',
                props: { label: 'Schemas authored', value: '8,900', change: '+62%', isPositive: true, subtext: 'past 90 days' },
              },
              {
                id: 'node-about-metric-3',
                type: 'metric-card',
                name: 'Metric: Exports',
                props: { label: 'Production exports', value: '412', change: '+19%', isPositive: true, subtext: 'past 90 days' },
              },
            ],
          },
        ],
      },
      {
        id: 'node-about-footer',
        type: 'footer',
        name: 'About Footer',
        props: {
          brandName: 'Nirmaanify',
          copyrightText: '© 2026 Nirmaanify. All rights reserved.',
        },
      },
    ],
  };

  return {
    id: 'page-website-about',
    name: 'About',
    path: '/about',
    title: 'About — Nirmaanify',
    layout: 'default',
    rootNode,
  };
}
