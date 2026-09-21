/**
 * Clean Next.js 15 App Router starter project template.
 * Replaces the legacy canvas component registry AST generator.
 */

export interface StarterProjectOptions {
  name: string;
  type?: string;
  description?: string;
}

export function getStarterProjectFiles(options: StarterProjectOptions): Record<string, string> {
  const projectName = options.name || 'Nirmaanify App';
  const projectType = options.type || 'WEBSITE';
  const projectDesc = options.description || 'Built with Nirmaanify AI Autonomous Coding Studio';

  return {
    'package.json': JSON.stringify(
      {
        name: projectName.toLowerCase().replace(/[^a-z0-9-]/g, '-'),
        version: '0.1.0',
        private: true,
        scripts: {
          dev: 'next dev --port 3000',
          build: 'next build',
          start: 'next start',
          lint: 'next lint',
        },
        dependencies: {
          next: '^15.1.0',
          react: '^19.0.0',
          'react-dom': '^19.0.0',
          'lucide-react': '^0.475.0',
          clsx: '^2.1.1',
          'tailwind-merge': '^3.0.1',
        },
        devDependencies: {
          typescript: '^5.7.0',
          '@types/node': '^20.0.0',
          '@types/react': '^19.0.0',
          '@types/react-dom': '^19.0.0',
          postcss: '^8.4.49',
          tailwindcss: '^3.4.17',
          autoprefixer: '^10.4.20',
        },
      },
      null,
      2,
    ),

    'tsconfig.json': JSON.stringify(
      {
        compilerOptions: {
          target: 'es5',
          lib: ['dom', 'dom.iterable', 'esnext'],
          allowJs: true,
          skipLibCheck: true,
          strict: true,
          noEmit: true,
          esModuleInterop: true,
          module: 'esnext',
          moduleResolution: 'bundler',
          resolveJsonModule: true,
          isolatedModules: true,
          jsx: 'preserve',
          incremental: true,
          plugins: [{ name: 'next' }],
          paths: { '@/*': ['./src/*'] },
        },
        include: ['next-env.d.ts', '**/*.ts', '**/*.tsx', '.next/types/**/*.ts'],
        exclude: ['node_modules'],
      },
      null,
      2,
    ),

    'next.config.js': `/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
};

module.exports = nextConfig;
`,

    'tailwind.config.ts': `import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        background: 'var(--background)',
        foreground: 'var(--foreground)',
        brand: {
          50: '#f5f3ff',
          100: '#ede9fe',
          500: '#635bff',
          600: '#5347e8',
          700: '#4338ca',
        },
      },
    },
  },
  plugins: [],
};

export default config;
`,

    'postcss.config.js': `module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};
`,

    'src/app/globals.css': `@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  --background: #ffffff;
  --foreground: #090d16;
}

@media (prefers-color-scheme: dark) {
  :root {
    --background: #090d16;
    --foreground: #f8fafc;
  }
}

body {
  color: var(--foreground);
  background: var(--background);
  font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
}
`,

    'src/app/layout.tsx': `import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: '${projectName}',
  description: '${projectDesc}',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased min-h-screen bg-slate-950 text-slate-100 flex flex-col">
        {children}
      </body>
    </html>
  );
}
`,

    'src/app/page.tsx': `import React from 'react';
import { Sparkles, Code2, Rocket, ArrowRight } from 'lucide-react';

export default function HomePage() {
  return (
    <main className="flex-1 flex flex-col items-center justify-center p-6 sm:p-12 text-center bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
      <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold mb-6">
        <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
        <span>Nirmaanify Autonomous AI Studio · ${projectType}</span>
      </div>

      <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white max-w-3xl mb-4 leading-tight">
        ${projectName}
      </h1>

      <p className="text-base sm:text-lg text-slate-400 max-w-xl mb-8">
        ${projectDesc}
      </p>

      <div className="flex flex-wrap items-center justify-center gap-4">
        <div className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium transition-all shadow-lg shadow-indigo-600/30">
          <Rocket className="w-4 h-4" />
          <span>Prompt the AI Agent to build your features</span>
        </div>
      </div>

      <div className="mt-16 grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-3xl text-left">
        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 backdrop-blur">
          <div className="flex items-center gap-2 text-white font-semibold text-sm mb-1">
            <Code2 className="w-4 h-4 text-indigo-400" /> Full-Stack Code
          </div>
          <p className="text-xs text-slate-400">Real Next.js 15 App Router code generated directly by Gemini.</p>
        </div>
        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 backdrop-blur">
          <div className="flex items-center gap-2 text-white font-semibold text-sm mb-1">
            <Sparkles className="w-4 h-4 text-purple-400" /> Fast Iteration
          </div>
          <p className="text-xs text-slate-400">Sub-second multi-file edits with instant sandbox hot-reloading.</p>
        </div>
        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 backdrop-blur">
          <div className="flex items-center gap-2 text-white font-semibold text-sm mb-1">
            <Rocket className="w-4 h-4 text-emerald-400" /> Live Sandbox
          </div>
          <p className="text-xs text-slate-400">Isolated E2B Cloud, Docker, and WebContainer runtimes.</p>
        </div>
      </div>
    </main>
  );
}
`,
  };
}
