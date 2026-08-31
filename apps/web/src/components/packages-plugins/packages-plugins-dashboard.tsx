'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  ProjectDto,
  PackageDefinition,
  PluginManifest,
  InstalledPlugin,
  InstalledPackageRecord,
  ProjectPackagesAndPlugins,
  getDefaultPackagesAndPlugins,
  PackageCategory,
  PluginCategory,
} from '@nirmaanify/types';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  Button,
  Badge,
  Input,
  useToast,
} from '@nirmaanify/ui';
import {
  Boxes,
  Puzzle,
  PackageCheck,
  Search,
  Plus,
  Trash2,
  Settings,
  Shield,
  Download,
  Star,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Code2,
  Copy,
  Check,
  Zap,
  Sparkles,
  Palette,
  Layout,
  Play,
  FileText,
  Database,
  BarChart3,
  Calendar,
  CreditCard,
  UploadCloud,
} from 'lucide-react';
import {
  CURATED_PACKAGES_CATALOG,
  CURATED_PLUGINS_MARKETPLACE,
  PackageCompatibilityEngine,
} from '@nirmaanify/component-registry';
import { PluginConfigModal } from './plugin-config-modal';

import { pluginsApi } from '../../core/api';

interface PackagesPluginsDashboardProps {
  projects: ProjectDto[];
  activeProjectId?: string;
}

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  ui: <Palette className="h-4 w-4" />,
  animation: <Zap className="h-4 w-4" />,
  forms: <FileText className="h-4 w-4" />,
  state: <Database className="h-4 w-4" />,
  charts: <BarChart3 className="h-4 w-4" />,
  utils: <Code2 className="h-4 w-4" />,
  UI: <Palette className="h-4 w-4" />,
  Animation: <Zap className="h-4 w-4" />,
  Payments: <CreditCard className="h-4 w-4" />,
  Authentication: <Shield className="h-4 w-4" />,
  Analytics: <BarChart3 className="h-4 w-4" />,
  SEO: <Sparkles className="h-4 w-4" />,
  Forms: <FileText className="h-4 w-4" />,
  CMS: <Boxes className="h-4 w-4" />,
  Deployment: <UploadCloud className="h-4 w-4" />,
};

export function PackagesPluginsDashboard({ projects, activeProjectId }: PackagesPluginsDashboardProps) {
  const { toast } = useToast();
  const [selectedProjectId, setSelectedProjectId] = useState<string>(
    activeProjectId || projects[0]?.id || ''
  );

  const activeProject = useMemo(() => {
    return projects.find((p) => p.id === selectedProjectId) || projects[0] || null;
  }, [projects, selectedProjectId]);

  const [ecosystemData, setEcosystemData] = useState<ProjectPackagesAndPlugins>(getDefaultPackagesAndPlugins());
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'packages' | 'marketplace' | 'installed-plugins' | 'manifest'>('packages');

  // Package Filters
  const [packageCategory, setPackageCategory] = useState<'all' | PackageCategory>('all');
  const [packageSearch, setPackageSearch] = useState('');

  // Plugin Filters
  const [pluginCategory, setPluginCategory] = useState<'all' | PluginCategory>('all');
  const [pluginSearch, setPluginSearch] = useState('');

  // Plugin Config Modal
  const [configModalOpen, setConfigModalOpen] = useState(false);
  const [selectedPluginToConfig, setSelectedPluginToConfig] = useState<InstalledPlugin | null>(null);
  const [copiedManifest, setCopiedManifest] = useState(false);

  // Fetch ecosystem data
  useEffect(() => {
    if (!activeProject) return;

    const fetchData = async () => {
      setIsLoading(true);
      try {
        const data = await pluginsApi.getEcosystem(activeProject.id);
        if (data) {
          setEcosystemData(data);
        }
      } catch (err) {
        console.error('Error fetching package and plugin data:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [activeProject]);

  // Install NPM Package
  const handleInstallPackage = async (pkg: PackageDefinition) => {
    if (!activeProject) return;
    try {
      const updated = await pluginsApi.installPackage(activeProject.id, pkg);
      setEcosystemData(updated);
      toast({
        title: 'Package Installed! 📦',
        description: `Added "${pkg.npmPackage}@${pkg.version}" to project dependencies.`,
        type: 'success',
      });
    } catch {
      toast({ title: 'Install Failed', description: 'Could not install package.', type: 'error' });
    }
  };

  // Uninstall NPM Package
  const handleUninstallPackage = async (npmPackage: string) => {
    if (!activeProject) return;
    try {
      const updated = await pluginsApi.uninstallPackage(activeProject.id, npmPackage);
      setEcosystemData(updated);
      toast({ title: 'Package Removed', description: `Removed "${npmPackage}".`, type: 'info' });
    } catch {
      toast({ title: 'Error', description: 'Could not uninstall package.', type: 'error' });
    }
  };

  // Install Plugin
  const handleInstallPlugin = async (manifest: PluginManifest) => {
    if (!activeProject) return;
    try {
      const updated = await pluginsApi.installPlugin(activeProject.id, manifest);
      setEcosystemData(updated);
      toast({
        title: 'Plugin Activated! 🧩',
        description: `Installed "${manifest.name}" into project sandbox.`,
        type: 'success',
      });
    } catch {
      toast({ title: 'Plugin Error', description: 'Could not install plugin.', type: 'error' });
    }
  };

  // Toggle Plugin Status
  const handleTogglePluginStatus = async (plugin: InstalledPlugin) => {
    if (!activeProject) return;
    const newStatus = plugin.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    try {
      const updated = await pluginsApi.togglePlugin(activeProject.id, plugin.pluginId, newStatus);
      setEcosystemData(updated);
    } catch {
      toast({ title: 'Error', description: 'Could not toggle plugin status.', type: 'error' });
    }
  };

  // Save Plugin Config
  const handleSavePluginConfig = async (config: Record<string, any>) => {
    if (!selectedPluginToConfig || !activeProject) return;
    try {
      const updated = await pluginsApi.configurePlugin(activeProject.id, selectedPluginToConfig.pluginId, config);
      setEcosystemData(updated);
    } catch {
      // ignore
    }
  };

  // Uninstall Plugin
  const handleUninstallPlugin = async (pluginId: string) => {
    if (!confirm('Are you sure you want to remove this plugin?')) return;
    if (!activeProject) return;
    try {
      const updated = await pluginsApi.uninstallPlugin(activeProject.id, pluginId);
      setEcosystemData(updated);
      toast({ title: 'Plugin Removed', description: 'Plugin uninstalled from project.', type: 'info' });
    } catch {
      toast({ title: 'Error', description: 'Could not remove plugin.', type: 'error' });
    }
  };

  // Filtered packages
  const filteredPackages = useMemo(() => {
    return CURATED_PACKAGES_CATALOG.filter((p) => {
      if (packageCategory !== 'all' && p.category !== packageCategory) return false;
      if (!packageSearch.trim()) return true;
      const q = packageSearch.toLowerCase();
      return p.name.toLowerCase().includes(q) || p.npmPackage.toLowerCase().includes(q) || p.description.toLowerCase().includes(q);
    });
  }, [packageCategory, packageSearch]);

  // Filtered plugins
  const filteredPlugins = useMemo(() => {
    return CURATED_PLUGINS_MARKETPLACE.filter((p) => {
      if (pluginCategory !== 'all' && p.category !== pluginCategory) return false;
      if (!pluginSearch.trim()) return true;
      const q = pluginSearch.toLowerCase();
      return p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q);
    });
  }, [pluginCategory, pluginSearch]);

  // Merged package.json dependencies
  const mergedDependenciesJson = useMemo(() => {
    const deps = PackageCompatibilityEngine.buildMergedPackageJson(ecosystemData.installedPackages);
    return JSON.stringify({ name: activeProject?.slug || 'my-app', dependencies: deps }, null, 2);
  }, [ecosystemData.installedPackages, activeProject]);

  if (!activeProject) {
    return (
      <Card className="p-12 text-center space-y-3">
        <Boxes className="h-10 w-10 text-slate-400 mx-auto" />
        <h4 className="font-bold text-base">No Active Projects</h4>
        <p className="text-xs text-slate-400">Create a project first to manage packages and plugins.</p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-[#24293D]">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Boxes className="h-5 w-5 text-[#635BFF]" />
            <span>Package Library & Plugin Ecosystem</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Install curated NPM libraries with conflict resolution and extend platform capabilities via the sandboxed Plugin SDK.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-slate-100 dark:bg-[#161926] px-3 py-1.5 rounded-xl border border-slate-200 dark:border-[#24293D]">
            <span className="text-[11px] font-semibold text-slate-400">Project:</span>
            <select
              value={selectedProjectId}
              onChange={(e) => setSelectedProjectId(e.target.value)}
              className="bg-transparent text-xs font-bold text-[#635BFF] focus:outline-none cursor-pointer"
            >
              {projects.map((p) => (
                <option key={p.id} value={p.id} className="bg-white dark:bg-[#161926] text-slate-900 dark:text-white">
                  {p.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-[#24293D] overflow-x-auto text-xs font-semibold pb-1 scrollbar-none">
        {[
          { id: 'packages' as const, label: `Package Library (${CURATED_PACKAGES_CATALOG.length})`, icon: <Boxes className="h-4 w-4" /> },
          { id: 'marketplace' as const, label: `Plugin Marketplace (${CURATED_PLUGINS_MARKETPLACE.length})`, icon: <Puzzle className="h-4 w-4" /> },
          { id: 'installed-plugins' as const, label: `Installed Plugins (${ecosystemData.installedPlugins.length})`, icon: <PackageCheck className="h-4 w-4" /> },
          { id: 'manifest' as const, label: 'package.json Manifest', icon: <Code2 className="h-4 w-4" /> },
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            className={`flex items-center gap-2 px-3 py-2 border-b-2 transition-colors whitespace-nowrap ${
              activeTab === t.id
                ? 'border-[#635BFF] text-[#635BFF] dark:text-[#A5AEFD]'
                : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            {t.icon}
            <span>{t.label}</span>
          </button>
        ))}
      </div>

      {/* TAB 1: PACKAGE LIBRARY (WEEK 30 DELIVERABLE) */}
      {activeTab === 'packages' && (
        <div className="space-y-6">
          {/* Filters Bar */}
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
              {(
                [
                  { id: 'all', label: 'All Packages' },
                  { id: 'ui', label: 'UI Libraries' },
                  { id: 'animation', label: 'Animation' },
                  { id: 'forms', label: 'Forms & Validation' },
                  { id: 'state', label: 'State & Cache' },
                  { id: 'charts', label: 'Charts' },
                  { id: 'utils', label: 'Utilities' },
                ] as const
              ).map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setPackageCategory(cat.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                    packageCategory === cat.id
                      ? 'bg-[#635BFF] text-white shadow-sm'
                      : 'bg-white dark:bg-[#161926] text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-[#24293D] hover:border-slate-300'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            <div className="relative w-64">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search packages..."
                value={packageSearch}
                onChange={(e) => setPackageSearch(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg bg-white dark:bg-[#161926] border border-slate-200 dark:border-[#24293D] focus:outline-none focus:ring-1 focus:ring-[#635BFF]"
              />
            </div>
          </div>

          {/* Packages Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredPackages.map((pkg) => {
              const isInstalled = ecosystemData.installedPackages.some((p) => p.npmPackage === pkg.npmPackage);
              const compat = PackageCompatibilityEngine.checkCompatibility(pkg, ecosystemData.installedPackages);

              return (
                <Card
                  key={pkg.id}
                  className={`p-5 flex flex-col justify-between space-y-4 border transition-all ${
                    isInstalled
                      ? 'border-[#635BFF] bg-[#635BFF]/5 dark:bg-[#635BFF]/10'
                      : 'border-slate-200/80 dark:border-[#24293D] hover:border-slate-300'
                  }`}
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        <div className={`p-2 rounded-xl ${isInstalled ? 'bg-[#635BFF] text-white' : 'bg-slate-100 dark:bg-[#0E121E] text-slate-500'}`}>
                          {CATEGORY_ICONS[pkg.category] || <Boxes className="h-4 w-4" />}
                        </div>
                        <div>
                          <h4 className="font-bold text-xs text-slate-900 dark:text-white leading-tight">{pkg.name}</h4>
                          <span className="text-[10px] text-slate-400 font-mono">{pkg.npmPackage}</span>
                        </div>
                      </div>

                      <Badge size="sm" variant={isInstalled ? 'cyan' : 'secondary'} className="font-mono text-[9px]">
                        {pkg.version}
                      </Badge>
                    </div>

                    <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
                      {pkg.description}
                    </p>
                  </div>

                  <div className="space-y-3 pt-3 border-t border-slate-100 dark:border-[#24293D]">
                    <div className="flex items-center justify-between text-[10px] text-slate-400">
                      <span>{pkg.downloads}</span>
                      <span className="flex items-center gap-1 text-emerald-500 font-semibold">
                        <CheckCircle2 className="h-3 w-3" />
                        Next.js 15 Ready
                      </span>
                    </div>

                    {isInstalled ? (
                      <Button
                        size="sm"
                        variant="outline"
                        className="w-full text-rose-500 hover:bg-rose-500 hover:text-white border-rose-500/30"
                        onClick={() => handleUninstallPackage(pkg.npmPackage)}
                      >
                        Uninstall
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        variant="default"
                        className="w-full"
                        leftIcon={<Plus className="h-3.5 w-3.5" />}
                        onClick={() => handleInstallPackage(pkg)}
                      >
                        Install Package
                      </Button>
                    )}
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 2: PLUGIN MARKETPLACE (WEEK 31 DELIVERABLE) */}
      {activeTab === 'marketplace' && (
        <div className="space-y-6">
          {/* Plugin Filters */}
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
              {(
                [
                  { id: 'all', label: 'All Plugins' },
                  { id: 'SEO', label: 'SEO' },
                  { id: 'Payments', label: 'Payments' },
                  { id: 'Authentication', label: 'Auth' },
                  { id: 'Analytics', label: 'Analytics' },
                  { id: 'Animation', label: 'Animation' },
                  { id: 'Deployment', label: 'Deployment' },
                ] as const
              ).map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setPluginCategory(cat.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                    pluginCategory === cat.id
                      ? 'bg-[#635BFF] text-white shadow-sm'
                      : 'bg-white dark:bg-[#161926] text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-[#24293D] hover:border-slate-300'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            <div className="relative w-64">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search plugins..."
                value={pluginSearch}
                onChange={(e) => setPluginSearch(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg bg-white dark:bg-[#161926] border border-slate-200 dark:border-[#24293D] focus:outline-none focus:ring-1 focus:ring-[#635BFF]"
              />
            </div>
          </div>

          {/* Plugins Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPlugins.map((plugin) => {
              const isInstalled = ecosystemData.installedPlugins.some((p) => p.pluginId === plugin.id);

              return (
                <Card
                  key={plugin.id}
                  className="p-5 flex flex-col justify-between space-y-4 border border-slate-200/80 dark:border-[#24293D] hover:border-[#635BFF] transition-all group"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="p-2.5 rounded-xl bg-[#635BFF]/10 text-[#635BFF]">
                          {CATEGORY_ICONS[plugin.category] || <Puzzle className="h-5 w-5" />}
                        </div>
                        <div>
                          <h4 className="font-bold text-xs text-slate-900 dark:text-white leading-tight">{plugin.name}</h4>
                          <span className="text-[10px] text-slate-400">{plugin.author}</span>
                        </div>
                      </div>
                      <Badge variant="indigo" size="sm">v{plugin.version}</Badge>
                    </div>

                    <p className="text-[11px] text-slate-500 leading-relaxed">
                      {plugin.description}
                    </p>

                    {/* Permissions list */}
                    <div className="space-y-1">
                      <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Required Permissions</span>
                      <div className="flex flex-wrap gap-1">
                        {plugin.permissions.map((perm) => (
                          <span key={perm} className="px-1.5 py-0.5 rounded text-[9px] font-mono bg-slate-100 dark:bg-[#0E121E] text-slate-500">
                            {perm}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3 pt-3 border-t border-slate-100 dark:border-[#24293D]">
                    <div className="flex items-center justify-between text-[11px] text-slate-400">
                      <div className="flex items-center gap-1 text-amber-500 font-bold">
                        <Star className="h-3.5 w-3.5 fill-amber-500" />
                        <span>{plugin.rating}</span>
                      </div>
                      <span>{plugin.downloads} downloads</span>
                    </div>

                    {isInstalled ? (
                      <Button size="sm" variant="subtle" className="w-full font-bold" disabled>
                        <Check className="h-3.5 w-3.5 mr-1" />
                        Installed
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        variant="default"
                        className="w-full"
                        leftIcon={<Plus className="h-3.5 w-3.5" />}
                        onClick={() => handleInstallPlugin(plugin)}
                      >
                        Install Plugin
                      </Button>
                    )}
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 3: INSTALLED PLUGINS (WEEK 31 DELIVERABLE) */}
      {activeTab === 'installed-plugins' && (
        <Card className="p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-bold text-sm text-slate-900 dark:text-white">Active Project Plugins</h4>
              <p className="text-xs text-slate-500">Configure parameters and permissions for installed sandbox extensions.</p>
            </div>
            <Badge variant="indigo" size="sm">{ecosystemData.installedPlugins.length} Active</Badge>
          </div>

          {ecosystemData.installedPlugins.length === 0 ? (
            <div className="p-12 text-center space-y-3 border border-dashed border-slate-200 dark:border-[#24293D] rounded-xl">
              <Puzzle className="h-8 w-8 text-slate-400 mx-auto" />
              <h5 className="font-bold text-xs">No Plugins Installed</h5>
              <p className="text-[11px] text-slate-400">Explore the Plugin Marketplace to install SEO, Payments, or Analytics tools.</p>
              <Button size="sm" variant="default" onClick={() => setActiveTab('marketplace')}>
                Open Marketplace
              </Button>
            </div>
          ) : (
            <div className="border border-slate-200 dark:border-[#24293D] rounded-xl overflow-hidden divide-y divide-slate-100 dark:divide-[#24293D]">
              {ecosystemData.installedPlugins.map((plugin) => (
                <div
                  key={plugin.pluginId}
                  className="p-4 bg-white dark:bg-[#161926] flex flex-wrap sm:flex-nowrap items-center justify-between gap-4 text-xs"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-[#635BFF]/10 text-[#635BFF]">
                      {CATEGORY_ICONS[plugin.manifest.category] || <Puzzle className="h-4 w-4" />}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 dark:text-white">{plugin.manifest.name}</span>
                        <Badge
                          size="sm"
                          variant={plugin.status === 'ACTIVE' ? 'cyan' : 'secondary'}
                          className="text-[9px] uppercase font-mono"
                        >
                          {plugin.status}
                        </Badge>
                      </div>
                      <p className="text-[10px] text-slate-400 mt-0.5">{plugin.manifest.description}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleTogglePluginStatus(plugin)}
                    >
                      {plugin.status === 'ACTIVE' ? 'Disable' : 'Enable'}
                    </Button>
                    <Button
                      size="sm"
                      variant="subtle"
                      leftIcon={<Settings className="h-3.5 w-3.5" />}
                      onClick={() => {
                        setSelectedPluginToConfig(plugin);
                        setConfigModalOpen(true);
                      }}
                    >
                      Configure
                    </Button>
                    <button
                      onClick={() => handleUninstallPlugin(plugin.pluginId)}
                      className="p-1.5 text-slate-400 hover:text-rose-500 rounded hover:bg-rose-500/10"
                      title="Uninstall Plugin"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      )}

      {/* TAB 4: COMPILED PACKAGE.JSON MANIFEST */}
      {activeTab === 'manifest' && (
        <Card className="p-5 space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-bold text-sm text-slate-900 dark:text-white">Auto-Generated package.json Dependencies</h4>
            <Button
              size="sm"
              variant="outline"
              leftIcon={copiedManifest ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
              onClick={() => {
                navigator.clipboard.writeText(mergedDependenciesJson);
                setCopiedManifest(true);
                setTimeout(() => setCopiedManifest(false), 2000);
                toast({ title: 'Copied', description: 'Dependencies JSON copied to clipboard.', type: 'info' });
              }}
            >
              {copiedManifest ? 'Copied!' : 'Copy Manifest'}
            </Button>
          </div>

          <pre className="p-4 rounded-xl bg-slate-950 text-cyan-300 font-mono text-[11px] overflow-auto max-h-[500px]">
            {mergedDependenciesJson}
          </pre>
        </Card>
      )}

      {/* PLUGIN CONFIGURATION MODAL */}
      <PluginConfigModal
        isOpen={configModalOpen}
        onClose={() => {
          setConfigModalOpen(false);
          setSelectedPluginToConfig(null);
        }}
        onSave={handleSavePluginConfig}
        plugin={selectedPluginToConfig}
      />
    </div>
  );
}
