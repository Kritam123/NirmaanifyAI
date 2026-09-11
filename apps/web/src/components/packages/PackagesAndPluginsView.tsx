'use client';

import React, { useState } from 'react';
import {
  Card,
  CardTitle,
  CardDescription,
  Badge,
} from '@nirmaanify/ui';
import {
  Boxes,
  Palette,
  Package,
  Puzzle,
  Download,
} from 'lucide-react';
import { LibrarySwitcherDrawer } from './LibrarySwitcherDrawer';
import { NpmPackageExplorer } from './NpmPackageExplorer';
import { InstalledPackagesTable } from './InstalledPackagesTable';
import { MarketplaceGallery } from '../plugins/MarketplaceGallery';

interface PackagesAndPluginsViewProps {
  projectId: string;
  projectName: string;
  currentUiLibrary?: string;
  onUiLibraryChanged?: (newLib: string) => void;
}

export const PackagesAndPluginsView: React.FC<PackagesAndPluginsViewProps> = ({
  projectId,
  projectName,
  currentUiLibrary = 'shadcn/ui',
  onUiLibraryChanged,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'presets' | 'npm' | 'installed' | 'plugins'>('presets');

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <Card className="p-6 bg-gradient-to-r from-[#635BFF]/10 via-[#3B82F6]/5 to-transparent border-[#635BFF]/20">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Boxes className="h-5 w-5 text-[#635BFF]" />
              <CardTitle className="text-lg">Package &amp; Plugin Ecosystem</CardTitle>
              <Badge variant="indigo" size="sm">
                Phase 10
              </Badge>
            </div>
            <CardDescription className="text-xs">
              Configure core UI libraries, animation engines, custom NPM packages, and third-party plugins with zero-trust sandboxing and automated compatibility resolution.
            </CardDescription>
          </div>

          {/* Sub-Tab Pill Navigation */}
          <div className="flex items-center gap-1.5 p-1 bg-white/80 dark:bg-[#161926]/80 backdrop-blur rounded-xl border border-slate-200 dark:border-[#24293D] self-start md:self-auto overflow-x-auto">
            <button
              onClick={() => setActiveSubTab('presets')}
              className={`py-1.5 px-3 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 whitespace-nowrap ${
                activeSubTab === 'presets'
                  ? 'bg-[#635BFF] text-white shadow-sm'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Palette className="h-3.5 w-3.5" />
              <span>Library Presets</span>
            </button>

            <button
              onClick={() => setActiveSubTab('npm')}
              className={`py-1.5 px-3 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 whitespace-nowrap ${
                activeSubTab === 'npm'
                  ? 'bg-[#635BFF] text-white shadow-sm'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Download className="h-3.5 w-3.5" />
              <span>NPM Explorer</span>
            </button>

            <button
              onClick={() => setActiveSubTab('installed')}
              className={`py-1.5 px-3 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 whitespace-nowrap ${
                activeSubTab === 'installed'
                  ? 'bg-[#635BFF] text-white shadow-sm'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Package className="h-3.5 w-3.5" />
              <span>Installed Manifest</span>
            </button>

            <button
              onClick={() => setActiveSubTab('plugins')}
              className={`py-1.5 px-3 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 whitespace-nowrap ${
                activeSubTab === 'plugins'
                  ? 'bg-[#635BFF] text-white shadow-sm'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Puzzle className="h-3.5 w-3.5" />
              <span>Plugin Marketplace</span>
            </button>
          </div>
        </div>
      </Card>

      {/* Content Rendering */}
      {activeSubTab === 'presets' && (
        <LibrarySwitcherDrawer
          projectId={projectId}
          currentUiLibrary={currentUiLibrary}
          onPresetChanged={(cat, newLib) => {
            if (cat === 'UI_FRAMEWORK' && onUiLibraryChanged) {
              onUiLibraryChanged(newLib);
            }
          }}
        />
      )}

      {activeSubTab === 'npm' && (
        <Card className="p-6 space-y-4">
          <div className="space-y-1">
            <CardTitle className="text-base flex items-center gap-2">
              <Download className="h-4 w-4 text-[#3B82F6]" />
              <span>NPM Registry Search &amp; Install</span>
            </CardTitle>
            <CardDescription className="text-xs">
              Search the global NPM registry. The 4-tier compatibility engine will inspect React 19, Next.js 15, and styling compatibility before installation.
            </CardDescription>
          </div>
          <NpmPackageExplorer projectId={projectId} />
        </Card>
      )}

      {activeSubTab === 'installed' && (
        <Card className="p-6 space-y-4">
          <div className="space-y-1">
            <CardTitle className="text-base flex items-center gap-2">
              <Package className="h-4 w-4 text-emerald-500" />
              <span>Project Package Manifest</span>
            </CardTitle>
            <CardDescription className="text-xs">
              Direct dependencies synced into the project&apos;s virtual and physical <code className="font-mono text-[#635BFF]">package.json</code> container.
            </CardDescription>
          </div>
          <InstalledPackagesTable projectId={projectId} />
        </Card>
      )}

      {activeSubTab === 'plugins' && (
        <Card className="p-6 space-y-4">
          <div className="space-y-1">
            <CardTitle className="text-base flex items-center gap-2">
              <Puzzle className="h-4 w-4 text-[#8B5CF6]" />
              <span>Nirmaanify Plugin Marketplace</span>
            </CardTitle>
            <CardDescription className="text-xs">
              Extend your application with turnkey integrations (Stripe payments, Clerk/Supabase auth, PostHog analytics, Next SEO, and Shopify headless sync).
            </CardDescription>
          </div>
          <MarketplaceGallery projectId={projectId} />
        </Card>
      )}
    </div>
  );
};
