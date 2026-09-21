import { PackageDefinition } from '@nirmaanify/types';

export const CURATED_PRESETS: Record<string, PackageDefinition> = {
  // UI Frameworks
  'shadcn/ui': {
    name: 'shadcn/ui',
    displayName: 'shadcn/ui + Tailwind CSS v4',
    version: '^2.1.0',
    category: 'UI_FRAMEWORK',
    description: 'Beautifully designed components built with Radix UI and Tailwind CSS.',
    homepage: 'https://ui.shadcn.com',
    icon: 'palette',
    isOfficialPreset: true,
    requiredPeerDeps: {
      'clsx': '^2.1.1',
      'tailwind-merge': '^2.5.4',
      'lucide-react': '^0.460.0',
      '@radix-ui/react-slot': '^1.1.0',
    },
    incompatibleWith: ['@mui/material'],
  },
  '@mui/material': {
    name: '@mui/material',
    displayName: 'Material UI (MUI v6)',
    version: '^6.1.0',
    category: 'UI_FRAMEWORK',
    description: 'Google Material Design components for React with comprehensive styling.',
    homepage: 'https://mui.com',
    icon: 'layers',
    isOfficialPreset: true,
    requiredPeerDeps: {
      '@emotion/react': '^11.13.3',
      '@emotion/styled': '^11.13.0',
      '@mui/material-nextjs': '^6.1.0',
    },
    incompatibleWith: ['shadcn/ui'],
    requiredProviders: [
      {
        name: 'AppRouterCacheProvider',
        importPath: '@mui/material-nextjs/v15-appRouter',
        isClientOnly: false,
      },
      {
        name: 'ThemeProvider',
        importPath: '@mui/material/styles',
        isClientOnly: true,
      },
    ],
  },
  '@chakra-ui/react': {
    name: '@chakra-ui/react',
    displayName: 'Chakra UI v3',
    version: '^3.0.0',
    category: 'UI_FRAMEWORK',
    description: 'Simple, modular and accessible component library for React applications.',
    homepage: 'https://chakra-ui.com',
    icon: 'component',
    isOfficialPreset: true,
    requiredPeerDeps: {
      '@emotion/react': '^11.13.3',
    },
    incompatibleWith: ['shadcn/ui'],
    requiredProviders: [
      {
        name: 'Provider',
        importPath: '@/components/ui/provider',
        isClientOnly: true,
      },
    ],
  },

  // Animation Engines
  'framer-motion': {
    name: 'framer-motion',
    displayName: 'Framer Motion v12',
    version: '^12.4.0',
    category: 'ANIMATION_ENGINE',
    description: 'Production-ready motion library for React with gesture controls and layout animations.',
    homepage: 'https://motion.dev',
    icon: 'sparkles',
    isOfficialPreset: true,
    requiredProviders: [
      {
        name: 'MotionConfig',
        importPath: 'framer-motion',
        isClientOnly: true,
        props: { reducedMotion: 'user' },
      },
    ],
  },
  'gsap': {
    name: 'gsap',
    displayName: 'GSAP (GreenSock v3)',
    version: '^3.12.5',
    category: 'ANIMATION_ENGINE',
    description: 'Ultra high-performance professional JavaScript animation engine.',
    homepage: 'https://gsap.com',
    icon: 'zap',
    isOfficialPreset: true,
  },
  'motion': {
    name: 'motion',
    displayName: 'Motion One',
    version: '^10.18.0',
    category: 'ANIMATION_ENGINE',
    description: 'Smallest, fastest animation library built on the Web Animations API.',
    homepage: 'https://motion.dev/docs/motion-one',
    icon: 'activity',
    isOfficialPreset: true,
  },

  // Form Engines
  'react-hook-form': {
    name: 'react-hook-form',
    displayName: 'React Hook Form v7',
    version: '^7.53.0',
    category: 'FORM_ENGINE',
    description: 'Performant, flexible and extensible forms with easy-to-use validation.',
    homepage: 'https://react-hook-form.com',
    icon: 'file-text',
    isOfficialPreset: true,
    requiredPeerDeps: {
      '@hookform/resolvers': '^3.9.0',
      'zod': '^3.23.8',
    },
  },
  'formik': {
    name: 'formik',
    displayName: 'Formik v2',
    version: '^2.4.6',
    category: 'FORM_ENGINE',
    description: 'Build forms in React without tears with declarative schema validation.',
    homepage: 'https://formik.org',
    icon: 'check-square',
    isOfficialPreset: true,
    requiredPeerDeps: {
      'yup': '^1.4.0',
    },
  },

  // Data Visualization
  'recharts': {
    name: 'recharts',
    displayName: 'Recharts v2',
    version: '^2.13.0',
    category: 'DATA_VISUALIZATION',
    description: 'Redefined chart library built with React and D3.',
    homepage: 'https://recharts.org',
    icon: 'bar-chart',
    isOfficialPreset: true,
  },
  '@tanstack/react-table': {
    name: '@tanstack/react-table',
    displayName: 'TanStack Table v8',
    version: '^8.20.5',
    category: 'DATA_VISUALIZATION',
    description: 'Headless UI for building powerful tables & datagrids.',
    homepage: 'https://tanstack.com/table',
    icon: 'table',
    isOfficialPreset: true,
  },

  // Icons
  'lucide-react': {
    name: 'lucide-react',
    displayName: 'Lucide Icons',
    version: '^0.460.0',
    category: 'ICONS',
    description: 'Beautiful & consistent icon toolkit made by the community.',
    homepage: 'https://lucide.dev',
    icon: 'smile',
    isOfficialPreset: true,
  },
  'react-icons': {
    name: 'react-icons',
    displayName: 'React Icons',
    version: '^5.3.0',
    category: 'ICONS',
    description: 'Include popular icons in your React projects easily with react-icons.',
    homepage: 'https://react-icons.github.io/react-icons',
    icon: 'grid',
    isOfficialPreset: true,
  },
};
