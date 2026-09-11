'use client';

import React, { useState } from 'react';
import {
  Card,
  Input,
  Button,
  Badge,
  useToast,
} from '@nirmaanify/ui';
import {
  Search,
  Download,
  ExternalLink,
  ShieldCheck,
  AlertCircle,
  Package,
  Check,
} from 'lucide-react';
import { usePackages } from '../../hooks/use-packages';
import { NpmRegistrySearchResult, CompatibilityCheckResponse } from '@nirmaanify/types';

interface NpmPackageExplorerProps {
  projectId: string;
  onPackageInstalled?: () => void;
}

export const NpmPackageExplorer: React.FC<NpmPackageExplorerProps> = ({
  projectId,
  onPackageInstalled,
}) => {
  const { searchNpm, npmSearchResults, isSearchingNpm, checkCompatibility, installPackage } =
    usePackages(projectId);
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [installingPackage, setInstallingPackage] = useState<string | null>(null);
  const [compatCheckResult, setCompatCheckResult] = useState<Record<string, CompatibilityCheckResponse>>({});

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim().length >= 2) {
      searchNpm(searchTerm);
    }
  };

  const handleInspectCompatibility = async (pkgName: string, version: string) => {
    try {
      const res = await checkCompatibility(pkgName, version);
      setCompatCheckResult((prev) => ({ ...prev, [pkgName]: res }));
    } catch (err: any) {
      toast({
        title: 'Check Failed',
        description: err.message || 'Could not verify compatibility',
        type: 'error',
      });
    }
  };

  const handleInstall = async (pkg: NpmRegistrySearchResult) => {
    setInstallingPackage(pkg.name);
    try {
      await installPackage({
        name: pkg.name,
        version: `^${pkg.version}`,
        category: 'CUSTOM_NPM',
      });
      toast({
        title: 'Package Installed',
        description: `Successfully added ${pkg.name}@^${pkg.version} to project.`,
        type: 'success',
      });
      if (onPackageInstalled) {
        onPackageInstalled();
      }
    } catch (err: any) {
      toast({
        title: 'Installation Failed',
        description: err.message || 'Error occurred while installing package.',
        type: 'error',
      });
    } finally {
      setInstallingPackage(null);
    }
  };

  return (
    <div className="space-y-4">
      {/* Search Input */}
      <form onSubmit={handleSearch} className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <Input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search 2M+ NPM packages (e.g. zod, lucide-react, axios, recharts)..."
            className="pl-9 text-xs"
          />
        </div>
        <Button
          type="submit"
          variant="default"
          size="sm"
          isLoading={isSearchingNpm}
          className="text-xs"
        >
          Search NPM
        </Button>
      </form>

      {/* Results List */}
      <div className="space-y-3">
        {npmSearchResults.length === 0 && !isSearchingNpm && searchTerm.length > 1 && (
          <div className="p-8 text-center border border-dashed border-slate-200 dark:border-[#24293D] rounded-xl text-xs text-slate-400">
            No NPM packages found matching &quot;{searchTerm}&quot;.
          </div>
        )}

        {npmSearchResults.map((pkg) => {
          const compat = compatCheckResult[pkg.name];
          const isInstalling = installingPackage === pkg.name;

          return (
            <div
              key={pkg.name}
              className="p-4 rounded-xl border border-slate-200 dark:border-[#24293D] bg-white dark:bg-[#161926] hover:border-slate-300 dark:hover:border-slate-700 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              <div className="space-y-1.5 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-bold text-slate-900 dark:text-white font-mono">
                    {pkg.name}
                  </span>
                  <Badge variant="secondary" size="sm" className="font-mono text-[10px]">
                    v{pkg.version}
                  </Badge>
                  {pkg.isOfficial && (
                    <Badge variant="indigo" size="sm" className="text-[10px]">
                      Verified Preset
                    </Badge>
                  )}
                  {compat && (
                    <Badge
                      variant={compat.compatible ? 'cyan' : 'destructive'}
                      size="sm"
                      className="text-[10px] flex items-center gap-1"
                    >
                      {compat.compatible ? (
                        <ShieldCheck className="h-3 w-3 text-emerald-500" />
                      ) : (
                        <AlertCircle className="h-3 w-3 text-rose-500" />
                      )}
                      <span>Score: {compat.score}/100</span>
                    </Badge>
                  )}
                </div>

                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed line-clamp-2">
                  {pkg.description || 'No description available.'}
                </p>

                <div className="flex items-center gap-3 text-[11px] text-slate-400">
                  <span>Publisher: {pkg.publisher.username}</span>
                  {pkg.links.homepage && (
                    <a
                      href={pkg.links.homepage}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 hover:text-[#635BFF] transition-colors"
                    >
                      <span>Docs</span>
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  )}
                  {pkg.links.npm && (
                    <a
                      href={pkg.links.npm}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 hover:text-[#635BFF] transition-colors"
                    >
                      <span>NPM</span>
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  )}
                </div>

                {compat && !compat.compatible && (
                  <div className="p-2 mt-2 bg-rose-500/10 border border-rose-500/20 rounded-lg text-[11px] text-rose-500">
                    {compat.issues.map((iss, idx) => (
                      <p key={idx}>• {iss.message}</p>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2 self-start md:self-center">
                {!compat && (
                  <Button
                    variant="outline"
                    size="xs"
                    className="text-xs"
                    onClick={() => handleInspectCompatibility(pkg.name, pkg.version)}
                  >
                    Check
                  </Button>
                )}
                <Button
                  variant="default"
                  size="xs"
                  className="text-xs"
                  isLoading={isInstalling}
                  leftIcon={<Download className="h-3.5 w-3.5" />}
                  onClick={() => handleInstall(pkg)}
                >
                  Install
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
