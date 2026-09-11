'use client';

import React, { useState } from 'react';
import {
  Card,
  Input,
  Button,
  Badge,
  Switch,
  useToast,
} from '@nirmaanify/ui';
import {
  Search,
  Star,
  Download,
  Settings,
  ShieldCheck,
  CreditCard,
  Lock,
  BarChart2,
  Globe,
  ShoppingBag,
  Palette,
  Sparkles,
  Cloud,
  CheckCircle2,
  Trash2,
} from 'lucide-react';
import { usePlugins } from '../../hooks/use-plugins';
import { PluginDto, PluginCategory, PluginPermission } from '@nirmaanify/types';
import { PermissionsConsentModal } from './PermissionsConsentModal';
import { PluginSettingsModal } from './PluginSettingsModal';

interface MarketplaceGalleryProps {
  projectId: string;
}

const CATEGORIES: Array<{ id: PluginCategory | 'ALL'; label: string; icon: React.ReactNode }> = [
  { id: 'ALL', label: 'All Plugins', icon: <Globe className="h-3.5 w-3.5" /> },
  { id: 'PAYMENTS', label: 'Payments', icon: <CreditCard className="h-3.5 w-3.5" /> },
  { id: 'AUTHENTICATION', label: 'Auth', icon: <Lock className="h-3.5 w-3.5" /> },
  { id: 'ANALYTICS', label: 'Analytics', icon: <BarChart2 className="h-3.5 w-3.5" /> },
  { id: 'SEO', label: 'SEO', icon: <Globe className="h-3.5 w-3.5" /> },
  { id: 'CMS', label: 'CMS Sync', icon: <ShoppingBag className="h-3.5 w-3.5" /> },
  { id: 'UI', label: 'UI Effects', icon: <Palette className="h-3.5 w-3.5" /> },
  { id: 'ANIMATION', label: 'Animation', icon: <Sparkles className="h-3.5 w-3.5" /> },
  { id: 'DEPLOYMENT', label: 'Deploy', icon: <Cloud className="h-3.5 w-3.5" /> },
];

export const MarketplaceGallery: React.FC<MarketplaceGalleryProps> = ({ projectId }) => {
  const {
    marketplacePlugins,
    projectPlugins,
    isLoading,
    fetchProjectPlugins,
    updatePlugin,
    uninstallPlugin,
  } = usePlugins(projectId);
  const { toast } = useToast();

  const [selectedCategory, setSelectedCategory] = useState<PluginCategory | 'ALL'>('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [consentPlugin, setConsentPlugin] = useState<PluginDto | null>(null);
  const [settingsPlugin, setSettingsPlugin] = useState<PluginDto | null>(null);
  const [grantedPerms, setGrantedPerms] = useState<PluginPermission[]>([]);

  // Filter plugins
  const filteredPlugins = marketplacePlugins.filter((p) => {
    const matchesCategory = selectedCategory === 'ALL' || p.category === selectedCategory;
    const matchesSearch =
      !searchTerm ||
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const installedMap = new Map(projectPlugins.map((p) => [p.pluginId, p]));

  const handleStartInstall = (plugin: PluginDto) => {
    setConsentPlugin(plugin);
  };

  const handleConsentApproved = (permissions: PluginPermission[]) => {
    setGrantedPerms(permissions);
    const p = consentPlugin;
    setConsentPlugin(null);
    setSettingsPlugin(p);
  };

  const handleTogglePlugin = async (projectPluginId: string, currentEnabled: boolean) => {
    try {
      await updatePlugin(projectPluginId, { isEnabled: !currentEnabled });
      toast({
        title: currentEnabled ? 'Plugin Disabled' : 'Plugin Enabled',
        description: 'Updated plugin runtime status.',
        type: 'info',
      });
    } catch (err: any) {
      toast({
        title: 'Error',
        description: err.message || 'Could not update status',
        type: 'error',
      });
    }
  };

  const handleUninstall = async (projectPluginId: string, name: string) => {
    if (!confirm(`Are you sure you want to uninstall ${name}?`)) return;
    try {
      await uninstallPlugin(projectPluginId);
      toast({
        title: 'Plugin Uninstalled',
        description: `Successfully removed ${name} from this project.`,
        type: 'success',
      });
    } catch (err: any) {
      toast({
        title: 'Uninstall Failed',
        description: err.message || 'Could not uninstall plugin',
        type: 'error',
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Search & Filter */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <Input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Filter marketplace plugins..."
            className="pl-9 text-xs"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`py-1.5 px-3 rounded-lg text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                selectedCategory === cat.id
                  ? 'bg-[#635BFF] text-white shadow-sm'
                  : 'bg-slate-100 dark:bg-[#161926] text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {cat.icon}
              <span>{cat.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Grid of Plugins */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredPlugins.map((plugin) => {
          const installedInstance =
            installedMap.get(plugin.id) ||
            projectPlugins.find(
              (pp) => pp.plugin?.slug === plugin.slug || pp.pluginId === plugin.slug
            );
          const isInstalled = !!installedInstance;

          return (
            <Card
              key={plugin.slug}
              className={`p-5 flex flex-col justify-between border-2 transition-all ${
                isInstalled
                  ? 'border-[#635BFF]/60 bg-[#635BFF]/5 shadow-sm'
                  : 'border-slate-200 dark:border-[#24293D] hover:border-slate-300 dark:hover:border-slate-700'
              }`}
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                        {plugin.name}
                      </h4>
                      {plugin.isOfficial && (
                        <Badge variant="indigo" size="sm" className="text-[9px] gap-0.5">
                          <ShieldCheck className="h-2.5 w-2.5 text-white" />
                          <span>Official</span>
                        </Badge>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-400">
                      by <span className="font-semibold text-slate-500">{plugin.author}</span> • v{plugin.version}
                    </p>
                  </div>

                  <Badge variant="secondary" size="sm" className="text-[10px] font-mono">
                    {plugin.category}
                  </Badge>
                </div>

                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed min-h-[48px]">
                  {plugin.description}
                </p>

                <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-100 dark:border-[#1E2337]">
                  <div className="flex items-center gap-1 text-amber-500 font-semibold">
                    <Star className="h-3 w-3 fill-amber-500 text-amber-500" />
                    <span>{plugin.rating.toFixed(1)}</span>
                  </div>
                  <span>{plugin.downloadCount.toLocaleString()} installs</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 mt-2 border-t border-slate-100 dark:border-[#1E2337] flex items-center justify-between gap-2">
                {isInstalled ? (
                  <>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={installedInstance.isEnabled}
                        onChange={() =>
                          handleTogglePlugin(installedInstance.id, installedInstance.isEnabled)
                        }
                      />
                      <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-300">
                        {installedInstance.isEnabled ? 'Enabled' : 'Disabled'}
                      </span>
                    </div>

                    <div className="flex items-center gap-1">
                      <Button
                        variant="outline"
                        size="xs"
                        className="text-xs"
                        onClick={() => {
                          setSettingsPlugin(plugin);
                        }}
                      >
                        <Settings className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="xs"
                        className="text-rose-500 hover:bg-rose-500/10 text-xs"
                        onClick={() => handleUninstall(installedInstance.id, plugin.name)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </>
                ) : (
                  <Button
                    variant="default"
                    size="xs"
                    className="w-full text-xs shadow-md shadow-[#635BFF]/10"
                    leftIcon={<Download className="h-3.5 w-3.5" />}
                    onClick={() => handleStartInstall(plugin)}
                  >
                    Install Plugin
                  </Button>
                )}
              </div>
            </Card>
          );
        })}
      </div>

      {/* Permissions Consent Sheet */}
      <PermissionsConsentModal
        plugin={consentPlugin}
        isOpen={!!consentPlugin}
        onClose={() => setConsentPlugin(null)}
        onGrantAndContinue={handleConsentApproved}
      />

      {/* Dynamic Settings Sheet */}
      <PluginSettingsModal
        projectId={projectId}
        plugin={settingsPlugin}
        projectPlugin={
          settingsPlugin
            ? projectPlugins.find(
                (pp) => pp.pluginId === settingsPlugin.id || pp.plugin?.slug === settingsPlugin.slug
              )
            : null
        }
        grantedPermissions={grantedPerms}
        isOpen={!!settingsPlugin}
        onClose={() => setSettingsPlugin(null)}
        onSaved={fetchProjectPlugins}
      />
    </div>
  );
};
