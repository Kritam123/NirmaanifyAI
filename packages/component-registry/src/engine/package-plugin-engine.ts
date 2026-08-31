import {
  PackageDefinition,
  PluginManifest,
  InstalledPlugin,
  InstalledPackageRecord,
} from '@nirmaanify/types';

// ============================================================================
// 1. CURATED NPM PACKAGES CATALOG
// ============================================================================

export const CURATED_PACKAGES_CATALOG: PackageDefinition[] = [
  // UI & Components
  {
    id: 'pkg-radix-ui',
    name: 'Radix UI Primitives (shadcn/ui)',
    npmPackage: '@radix-ui/react-dialog',
    version: '^1.1.6',
    description: 'Unstyled, accessible UI components for building high-quality design systems and web apps.',
    category: 'ui',
    frameworks: ['nextjs-15', 'react-19'],
    dependencies: { '@radix-ui/react-dialog': '^1.1.6', '@radix-ui/react-dropdown-menu': '^2.1.6' },
    peerDependencies: { react: '^19.0.0', 'react-dom': '^19.0.0' },
    author: 'WorkOS / Radix',
    downloads: '8.4M/mo',
    icon: 'Layers',
  },
  {
    id: 'pkg-lucide',
    name: 'Lucide React Icons',
    npmPackage: 'lucide-react',
    version: '^1.16.0',
    description: 'Beautiful & consistent icon toolkit made by the community. 1000+ vector icons.',
    category: 'ui',
    frameworks: ['nextjs-15', 'react-19'],
    dependencies: { 'lucide-react': '^1.16.0' },
    author: 'Lucide Project',
    downloads: '12.8M/mo',
    icon: 'Sparkles',
  },
  {
    id: 'pkg-tailwind-variants',
    name: 'Tailwind Variants',
    npmPackage: 'tailwind-variants',
    version: '^0.3.1',
    description: 'Type-safe component styling variants powered by Tailwind CSS with first-class TypeScript support.',
    category: 'ui',
    frameworks: ['nextjs-15', 'react-19'],
    dependencies: { 'tailwind-variants': '^0.3.1' },
    author: 'Junior Garcia',
    downloads: '1.2M/mo',
    icon: 'Palette',
  },
  {
    id: 'pkg-mui',
    name: 'Material UI (MUI Core)',
    npmPackage: '@mui/material',
    version: '^6.4.5',
    description: 'Comprehensive library of foundational and advanced UI components implementing Google Material Design.',
    category: 'ui',
    frameworks: ['nextjs-15', 'react-19'],
    dependencies: { '@mui/material': '^6.4.5', '@emotion/react': '^11.14.0', '@emotion/styled': '^11.14.0' },
    peerDependencies: { react: '^19.0.0' },
    conflictsWith: ['@chakra-ui/react'],
    author: 'MUI Org',
    downloads: '4.6M/mo',
    icon: 'Layout',
  },

  // Animation
  {
    id: 'pkg-framer-motion',
    name: 'Framer Motion (Motion)',
    npmPackage: 'framer-motion',
    version: '^12.4.7',
    description: 'Production-ready declarative animations, gestures, and layout transitions for React 19.',
    category: 'animation',
    frameworks: ['nextjs-15', 'react-19'],
    dependencies: { 'framer-motion': '^12.4.7' },
    peerDependencies: { react: '^19.0.0' },
    author: 'Framer',
    downloads: '7.9M/mo',
    icon: 'Zap',
  },
  {
    id: 'pkg-gsap',
    name: 'GreenSock Animation Platform (GSAP)',
    npmPackage: 'gsap',
    version: '^3.12.7',
    description: 'Ultra high-performance professional JavaScript animation engine for complex timelines and SVG morphing.',
    category: 'animation',
    frameworks: ['nextjs-15', 'react-19'],
    dependencies: { gsap: '^3.12.7' },
    author: 'GreenSock',
    downloads: '3.1M/mo',
    icon: 'Play',
  },

  // Forms & Validation
  {
    id: 'pkg-react-hook-form',
    name: 'React Hook Form',
    npmPackage: 'react-hook-form',
    version: '^7.54.2',
    description: 'Performant, flexible and extensible forms with easy-to-use validation. Zero re-render overhead.',
    category: 'forms',
    frameworks: ['nextjs-15', 'react-19'],
    dependencies: { 'react-hook-form': '^7.54.2', '@hookform/resolvers': '^3.10.0' },
    author: 'Broc',
    downloads: '6.5M/mo',
    icon: 'FileText',
  },
  {
    id: 'pkg-zod',
    name: 'Zod Type Validator',
    npmPackage: 'zod',
    version: '^3.24.2',
    description: 'TypeScript-first schema declaration and validation with static type inference.',
    category: 'forms',
    frameworks: ['nextjs-15', 'react-19', 'nestjs-11'],
    dependencies: { zod: '^3.24.2' },
    author: 'Colin McDonnell',
    downloads: '18.4M/mo',
    icon: 'Shield',
  },

  // State & Data Fetching
  {
    id: 'pkg-tanstack-query',
    name: 'TanStack Query (React Query)',
    npmPackage: '@tanstack/react-query',
    version: '^5.66.9',
    description: 'Powerful asynchronous state management, server cache synchronization, and optimistic UI mutations.',
    category: 'state',
    frameworks: ['nextjs-15', 'react-19'],
    dependencies: { '@tanstack/react-query': '^5.66.9' },
    author: 'Tanner Linsley',
    downloads: '5.8M/mo',
    icon: 'Database',
  },
  {
    id: 'pkg-zustand',
    name: 'Zustand State Store',
    npmPackage: 'zustand',
    version: '^5.0.3',
    description: 'Bearbones, fast and scalable state-management solution using simplified flux principles.',
    category: 'state',
    frameworks: ['nextjs-15', 'react-19'],
    dependencies: { zustand: '^5.0.3' },
    author: 'Poimandres',
    downloads: '4.9M/mo',
    icon: 'Layers',
  },

  // Charts & Visualization
  {
    id: 'pkg-recharts',
    name: 'Recharts Data Visualization',
    npmPackage: 'recharts',
    version: '^2.15.1',
    description: 'Redefined chart library built with React and D3. Area, Bar, Line, Pie, and Radar charts.',
    category: 'charts',
    frameworks: ['nextjs-15', 'react-19'],
    dependencies: { recharts: '^2.15.1' },
    peerDependencies: { react: '^19.0.0' },
    author: 'Recharts Org',
    downloads: '2.4M/mo',
    icon: 'BarChart3',
  },

  // Utilities
  {
    id: 'pkg-tailwind-merge',
    name: 'Tailwind Merge + Clsx',
    npmPackage: 'tailwind-merge',
    version: '^3.0.2',
    description: 'Utility function to efficiently merge Tailwind CSS classes in JS without style conflicts.',
    category: 'utils',
    frameworks: ['nextjs-15', 'react-19'],
    dependencies: { 'tailwind-merge': '^3.0.2', clsx: '^2.1.1' },
    author: 'Dany Scherzer',
    downloads: '14.2M/mo',
    icon: 'Code2',
  },
  {
    id: 'pkg-date-fns',
    name: 'date-fns Modern Date Toolkit',
    npmPackage: 'date-fns',
    version: '^4.1.0',
    description: 'Modern JavaScript date utility library with modular functions and full TypeScript support.',
    category: 'utils',
    frameworks: ['nextjs-15', 'react-19', 'nestjs-11'],
    dependencies: { 'date-fns': '^4.1.0' },
    author: 'Sasha Koss',
    downloads: '19.8M/mo',
    icon: 'Calendar',
  },
];

// ============================================================================
// 2. CURATED PLUGIN MARKETPLACE
// ============================================================================

export const CURATED_PLUGINS_MARKETPLACE: PluginManifest[] = [
  {
    id: 'plugin-seo-optimizer',
    name: 'AI SEO & OpenGraph Optimizer',
    version: '1.2.0',
    author: 'Nirmaanify Labs',
    description: 'Auto-generates meta tags, OpenGraph Twitter/Facebook preview cards, JSON-LD structured data, and dynamic sitemap.xml.',
    category: 'SEO',
    icon: 'Sparkles',
    rating: 4.9,
    downloads: '14.2k',
    permissions: ['read:project', 'write:schema'],
    configSchema: {
      siteTitle: { type: 'string', label: 'Default Site Title', defaultValue: 'My Nirmaanify Platform' },
      twitterHandle: { type: 'string', label: 'Twitter / X Handle', defaultValue: '@nirmaanify' },
      enableSitemap: { type: 'boolean', label: 'Auto-generate sitemap.xml', defaultValue: true },
    },
  },
  {
    id: 'plugin-stripe-checkout',
    name: 'Stripe Global Payments & Webhooks',
    version: '2.0.1',
    author: 'Stripe Verified Partner',
    description: 'Drop-in Stripe Checkout, PaymentIntents, Apple Pay / Google Pay, and signature-verified webhook listeners.',
    category: 'Payments',
    icon: 'CreditCard',
    rating: 4.8,
    downloads: '28.5k',
    permissions: ['read:project', 'inject:dependencies', 'custom:backend'],
    configSchema: {
      publishableKey: { type: 'string', label: 'Stripe Publishable Key (pk_test_...)', defaultValue: '' },
      secretKey: { type: 'secret', label: 'Stripe Secret Key (sk_test_...)', defaultValue: '' },
      currency: { type: 'string', label: 'Default Currency (USD, EUR, GBP)', defaultValue: 'USD' },
    },
  },
  {
    id: 'plugin-auth-clerk',
    name: 'Clerk / NextAuth Identity Engine',
    version: '1.4.0',
    author: 'Auth Security Team',
    description: 'Complete multi-factor authentication, social OAuth (Google, GitHub, Apple), and session authorization hooks.',
    category: 'Authentication',
    icon: 'Shield',
    rating: 4.9,
    downloads: '21.0k',
    permissions: ['read:project', 'inject:dependencies', 'network:access'],
    configSchema: {
      authProvider: { type: 'string', label: 'Primary Auth Provider', defaultValue: 'NextAuth JWT' },
      enableSocialLogin: { type: 'boolean', label: 'Enable Google & GitHub Login', defaultValue: true },
    },
  },
  {
    id: 'plugin-analytics-posthog',
    name: 'PostHog Product Analytics & Heatmaps',
    version: '1.1.2',
    author: 'PostHog Community',
    description: 'Session replay, user funnels, feature flags, and custom event tracking with zero performance penalty.',
    category: 'Analytics',
    icon: 'BarChart3',
    rating: 4.7,
    downloads: '9.8k',
    permissions: ['read:project', 'network:access'],
    configSchema: {
      apiKey: { type: 'string', label: 'PostHog Project API Key', defaultValue: '' },
      apiHost: { type: 'string', label: 'PostHog Host URL', defaultValue: 'https://us.i.posthog.com' },
    },
  },
  {
    id: 'plugin-framer-transitions',
    name: 'Framer Page Transition Effects',
    version: '1.0.5',
    author: 'Motion Guild',
    description: 'App-wide smooth page transitions, sticky header animations, and staggered card entrances.',
    category: 'Animation',
    icon: 'Zap',
    rating: 4.8,
    downloads: '16.4k',
    permissions: ['read:project', 'inject:dependencies'],
    configSchema: {
      transitionType: { type: 'string', label: 'Transition Style (fade, slide, zoom)', defaultValue: 'fade' },
      duration: { type: 'number', label: 'Transition Duration (seconds)', defaultValue: 0.3 },
    },
  },
  {
    id: 'plugin-vercel-deployment',
    name: 'Vercel & AWS Cloud Pipeline',
    version: '2.1.0',
    author: 'Cloud Deployers',
    description: 'Automated 1-click CI/CD deployment pipelines with preview environments and custom domain SSL provisioning.',
    category: 'Deployment',
    icon: 'UploadCloud',
    rating: 5.0,
    downloads: '35.1k',
    permissions: ['read:project', 'network:access', 'storage:access'],
    configSchema: {
      targetPlatform: { type: 'string', label: 'Deployment Platform (Vercel, AWS ECS)', defaultValue: 'Vercel' },
      productionBranch: { type: 'string', label: 'Production Git Branch', defaultValue: 'main' },
    },
  },
];

// ============================================================================
// 3. DEPENDENCY & PLUGIN ENGINES
// ============================================================================

export class PackageCompatibilityEngine {
  static checkCompatibility(
    pkg: PackageDefinition,
    installed: InstalledPackageRecord[]
  ): { compatible: boolean; issues: string[]; requiredPeers: string[] } {
    const issues: string[] = [];
    const requiredPeers: string[] = [];

    // Conflict check
    if (pkg.conflictsWith && pkg.conflictsWith.length > 0) {
      for (const installedItem of installed) {
        if (pkg.conflictsWith.includes(installedItem.npmPackage)) {
          issues.push(`Package conflicts with already installed "${installedItem.npmPackage}".`);
        }
      }
    }

    // Peer dependencies check
    if (pkg.peerDependencies) {
      for (const [peer, reqVersion] of Object.entries(pkg.peerDependencies)) {
        requiredPeers.push(`${peer}@${reqVersion}`);
      }
    }

    return {
      compatible: issues.length === 0,
      issues,
      requiredPeers,
    };
  }

  static buildMergedPackageJson(installedPackages: InstalledPackageRecord[]): Record<string, string> {
    const deps: Record<string, string> = {
      next: '15.5.24',
      react: '^19.0.0',
      'react-dom': '^19.0.0',
    };

    installedPackages.forEach((pkg) => {
      deps[pkg.npmPackage] = pkg.version;
    });

    return deps;
  }
}
