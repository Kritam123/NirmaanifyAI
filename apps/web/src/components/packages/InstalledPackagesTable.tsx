'use client';

import React, { useState } from 'react';
import {
  Card,
  CardTitle,
  CardDescription,
  Badge,
  Button,
  useToast,
} from '@nirmaanify/ui';
import {
  Trash2,
  Package,
  Layers,
  Sparkles,
  FileText,
  Boxes,
  ExternalLink,
} from 'lucide-react';
import { usePackages } from '../../hooks/use-packages';
import { ProjectPackageDto } from '@nirmaanify/types';

interface InstalledPackagesTableProps {
  projectId: string;
}

export const InstalledPackagesTable: React.FC<InstalledPackagesTableProps> = ({ projectId }) => {
  const { packages, isLoading, removePackage } = usePackages(projectId);
  const { toast } = useToast();
  const [removingPkg, setRemovingPkg] = useState<string | null>(null);

  const handleRemove = async (pkgName: string) => {
    if (!confirm(`Are you sure you want to remove "${pkgName}" from this project?`)) {
      return;
    }
    setRemovingPkg(pkgName);
    try {
      await removePackage(pkgName);
      toast({
        title: 'Package Removed',
        description: `Removed "${pkgName}" from project manifest.`,
        type: 'success',
      });
    } catch (err: any) {
      toast({
        title: 'Removal Failed',
        description: err.message || 'Could not remove package',
        type: 'error',
      });
    } finally {
      setRemovingPkg(null);
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'UI_FRAMEWORK':
        return <Layers className="h-3.5 w-3.5 text-[#635BFF]" />;
      case 'ANIMATION_ENGINE':
        return <Sparkles className="h-3.5 w-3.5 text-amber-500" />;
      case 'FORM_ENGINE':
        return <FileText className="h-3.5 w-3.5 text-emerald-500" />;
      default:
        return <Boxes className="h-3.5 w-3.5 text-cyan-500" />;
    }
  };

  if (isLoading) {
    return (
      <div className="p-8 text-center text-xs text-slate-400">
        Loading configured dependencies...
      </div>
    );
  }

  if (packages.length === 0) {
    return (
      <div className="p-8 text-center border border-dashed border-slate-200 dark:border-[#24293D] rounded-xl text-xs text-slate-400">
        No packages explicitly configured yet. Select a curated preset or search NPM above.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-[#24293D]">
      <table className="w-full text-left text-xs">
        <thead className="bg-slate-50 dark:bg-[#161926] text-slate-400 font-semibold border-b border-slate-200 dark:border-[#24293D]">
          <tr>
            <th className="py-3 px-4">Package Name</th>
            <th className="py-3 px-4">Version</th>
            <th className="py-3 px-4">Category</th>
            <th className="py-3 px-4">Status</th>
            <th className="py-3 px-4 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 dark:divide-[#1E2337] bg-white dark:bg-[#111420]">
          {packages.map((pkg) => (
            <tr key={pkg.id} className="hover:bg-slate-50/50 dark:hover:bg-[#161926]/50 transition-colors">
              <td className="py-3 px-4">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-slate-100 dark:bg-[#1E2337]">
                    {getCategoryIcon(pkg.category)}
                  </div>
                  <span className="font-bold text-slate-800 dark:text-slate-200 font-mono">
                    {pkg.name}
                  </span>
                </div>
              </td>
              <td className="py-3 px-4 font-mono text-slate-500">
                {pkg.version}
              </td>
              <td className="py-3 px-4">
                <Badge variant="secondary" size="sm" className="text-[10px]">
                  {pkg.category.replace('_', ' ')}
                </Badge>
              </td>
              <td className="py-3 px-4">
                <Badge variant="cyan" size="sm" className="text-[10px]">
                  {pkg.status}
                </Badge>
              </td>
              <td className="py-3 px-4 text-right">
                <Button
                  variant="ghost"
                  size="xs"
                  className="text-rose-500 hover:text-rose-600 hover:bg-rose-500/10 text-xs"
                  isLoading={removingPkg === pkg.name}
                  onClick={() => handleRemove(pkg.name)}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
