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
  Palette,
  Sparkles,
  FileText,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Layers,
  Zap,
} from 'lucide-react';
import { usePackages } from '../../hooks/use-packages';

interface LibrarySwitcherDrawerProps {
  projectId: string;
  currentUiLibrary?: string;
  onPresetChanged?: (category: string, newPreset: string) => void;
}

export const LibrarySwitcherDrawer: React.FC<LibrarySwitcherDrawerProps> = ({
  projectId,
  currentUiLibrary = 'shadcn/ui',
  onPresetChanged,
}) => {
  const { presets, packages, switchPreset, checkCompatibility } = usePackages(projectId);
  const { toast } = useToast();
  const [activeCategory, setActiveCategory] = useState<'UI_FRAMEWORK' | 'ANIMATION_ENGINE' | 'FORM_ENGINE'>('UI_FRAMEWORK');
  const [switchingTo, setSwitchingTo] = useState<string | null>(null);

  // Group presets by category
  const uiPresets = Object.values(presets).filter((p) => p.category === 'UI_FRAMEWORK');
  const animPresets = Object.values(presets).filter((p) => p.category === 'ANIMATION_ENGINE');
  const formPresets = Object.values(presets).filter((p) => p.category === 'FORM_ENGINE');

  // Currently active presets in project
  const installedNames = new Set(packages.map((p) => p.name));
  const activeUi = uiPresets.find((p) => installedNames.has(p.name))?.name || currentUiLibrary;
  const activeAnim = animPresets.find((p) => installedNames.has(p.name))?.name || 'framer-motion';
  const activeForm = formPresets.find((p) => installedNames.has(p.name))?.name || 'react-hook-form';

  const handleSwitch = async (presetName: string, category: 'UI_FRAMEWORK' | 'ANIMATION_ENGINE' | 'FORM_ENGINE') => {
    setSwitchingTo(presetName);
    try {
      // Run compatibility check first
      const compat = await checkCompatibility(presetName);
      if (!compat.compatible) {
        const errorMsg = compat.issues.filter((i) => i.severity === 'error').map((i) => i.message).join(' ');
        toast({
          title: 'Compatibility Conflict',
          description: errorMsg || 'This library conflicts with existing project configuration.',
          type: 'error',
        });
        setSwitchingTo(null);
        return;
      }

      await switchPreset({ category, targetPreset: presetName });
      toast({
        title: 'Library Switched Successfully',
        description: `Project has been reconfigured to use ${presets[presetName]?.displayName || presetName}.`,
        type: 'success',
      });
      if (onPresetChanged) {
        onPresetChanged(category, presetName);
      }
    } catch (err: any) {
      toast({
        title: 'Failed to switch library',
        description: err.message || 'Error occurred during preset switch.',
        type: 'error',
      });
    } finally {
      setSwitchingTo(null);
    }
  };

  const currentList =
    activeCategory === 'UI_FRAMEWORK'
      ? uiPresets
      : activeCategory === 'ANIMATION_ENGINE'
      ? animPresets
      : formPresets;

  const currentActiveName =
    activeCategory === 'UI_FRAMEWORK'
      ? activeUi
      : activeCategory === 'ANIMATION_ENGINE'
      ? activeAnim
      : activeForm;

  return (
    <div className="space-y-6">
      {/* Category Tabs */}
      <div className="flex gap-2 p-1 bg-slate-100 dark:bg-[#161926] rounded-xl border border-slate-200 dark:border-[#24293D]">
        <button
          onClick={() => setActiveCategory('UI_FRAMEWORK')}
          className={`flex-1 py-2 px-3 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-2 ${
            activeCategory === 'UI_FRAMEWORK'
              ? 'bg-white dark:bg-[#202538] text-[#635BFF] shadow-sm'
              : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <Palette className="h-3.5 w-3.5" />
          <span>UI Framework</span>
          <Badge variant="secondary" size="sm" className="ml-1 text-[10px]">
            {activeUi}
          </Badge>
        </button>

        <button
          onClick={() => setActiveCategory('ANIMATION_ENGINE')}
          className={`flex-1 py-2 px-3 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-2 ${
            activeCategory === 'ANIMATION_ENGINE'
              ? 'bg-white dark:bg-[#202538] text-[#635BFF] shadow-sm'
              : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <Sparkles className="h-3.5 w-3.5" />
          <span>Animation Engine</span>
          <Badge variant="secondary" size="sm" className="ml-1 text-[10px]">
            {activeAnim}
          </Badge>
        </button>

        <button
          onClick={() => setActiveCategory('FORM_ENGINE')}
          className={`flex-1 py-2 px-3 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-2 ${
            activeCategory === 'FORM_ENGINE'
              ? 'bg-white dark:bg-[#202538] text-[#635BFF] shadow-sm'
              : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <FileText className="h-3.5 w-3.5" />
          <span>Form Engine</span>
          <Badge variant="secondary" size="sm" className="ml-1 text-[10px]">
            {activeForm}
          </Badge>
        </button>
      </div>

      {/* Preset Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {currentList.map((preset) => {
          const isActive = currentActiveName === preset.name;
          const isPending = switchingTo === preset.name;

          return (
            <Card
              key={preset.name}
              className={`p-5 relative transition-all border-2 ${
                isActive
                  ? 'border-[#635BFF] bg-[#635BFF]/5 shadow-md shadow-[#635BFF]/10'
                  : 'border-slate-200 dark:border-[#24293D] hover:border-slate-300 dark:hover:border-slate-700'
              }`}
            >
              {isActive && (
                <div className="absolute top-3 right-3 flex items-center gap-1 text-[11px] font-bold text-[#635BFF]">
                  <CheckCircle2 className="h-4 w-4" />
                  <span>Active</span>
                </div>
              )}

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-slate-100 dark:bg-[#1E2337] text-[#635BFF]">
                    {activeCategory === 'UI_FRAMEWORK' ? (
                      <Palette className="h-4 w-4" />
                    ) : activeCategory === 'ANIMATION_ENGINE' ? (
                      <Sparkles className="h-4 w-4" />
                    ) : (
                      <FileText className="h-4 w-4" />
                    )}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                      {preset.displayName}
                    </h4>
                    <p className="text-[11px] font-mono text-slate-400">
                      {preset.name}@{preset.version}
                    </p>
                  </div>
                </div>

                <p className="text-xs text-slate-500 dark:text-slate-400 min-h-[36px]">
                  {preset.description}
                </p>

                {preset.incompatibleWith && preset.incompatibleWith.length > 0 && (
                  <div className="flex items-center gap-1.5 text-[10px] text-amber-500 font-medium">
                    <AlertTriangle className="h-3 w-3" />
                    <span>Incompatible with {preset.incompatibleWith.join(', ')}</span>
                  </div>
                )}

                <div className="pt-3">
                  {isActive ? (
                    <Button variant="secondary" size="xs" disabled className="w-full text-xs">
                      Currently Configured
                    </Button>
                  ) : (
                    <Button
                      variant="outline"
                      size="xs"
                      className="w-full text-xs hover:border-[#635BFF] hover:text-[#635BFF]"
                      isLoading={isPending}
                      onClick={() => handleSwitch(preset.name, activeCategory)}
                    >
                      <span>Switch to {preset.displayName.split(' ')[0]}</span>
                      <ArrowRight className="h-3.5 w-3.5 ml-1" />
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
