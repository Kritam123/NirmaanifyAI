'use client';

import React, { useState, useEffect } from 'react';
import {
  InstalledPlugin,
  PluginManifest,
} from '@nirmaanify/types';
import {
  Dialog,
  Button,
  Input,
  useToast,
} from '@nirmaanify/ui';
import { Shield, Sparkles } from 'lucide-react';

interface PluginConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (config: Record<string, any>) => Promise<void>;
  plugin: InstalledPlugin | null;
}

export function PluginConfigModal({
  isOpen,
  onClose,
  onSave,
  plugin,
}: PluginConfigModalProps) {
  const { toast } = useToast();
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (plugin) {
      setFormData(plugin.config || {});
    }
  }, [plugin, isOpen]);

  if (!plugin) return null;

  const schema = plugin.manifest.configSchema || {};

  const handleFieldChange = (key: string, val: any) => {
    setFormData((prev) => ({ ...prev, [key]: val }));
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      await onSave(formData);
      onClose();
      toast({ title: 'Plugin Configured', description: `Saved settings for ${plugin.manifest.name}.`, type: 'success' });
    } catch {
      toast({ title: 'Error', description: 'Could not save configuration.', type: 'error' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title={`Configure Plugin: ${plugin.manifest.name}`}
      description={plugin.manifest.description}
      className="max-w-xl"
      footer={
        <>
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button variant="default" onClick={handleSubmit} isLoading={isSubmitting}>
            Save Configuration
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        {/* Permissions transparency info */}
        <div className="p-3 rounded-xl bg-slate-100 dark:bg-[#161926] border border-slate-200 dark:border-[#24293D] space-y-1.5">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
            <Shield className="h-3 w-3 text-[#635BFF]" />
            Granted Sandbox Capabilities
          </span>
          <div className="flex flex-wrap gap-1">
            {plugin.manifest.permissions.map((p) => (
              <span key={p} className="px-2 py-0.5 rounded text-[10px] font-mono bg-white dark:bg-[#0E121E] border border-slate-200 dark:border-[#24293D] text-slate-600 dark:text-slate-300">
                {p}
              </span>
            ))}
          </div>
        </div>

        {/* Dynamic Config Fields */}
        <div className="space-y-3 pt-2">
          {Object.keys(schema).length === 0 ? (
            <p className="text-xs text-slate-400 italic">This plugin does not require any additional configuration parameters.</p>
          ) : (
            Object.entries(schema).map(([key, field]) => {
              const val = formData[key] !== undefined ? formData[key] : field.defaultValue;

              return (
                <div key={key} className="space-y-1">
                  <label className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center justify-between">
                    <span>{field.label}</span>
                    <span className="text-[10px] text-slate-400 font-mono">{field.type}</span>
                  </label>

                  {field.type === 'boolean' ? (
                    <div className="flex items-center gap-2 pt-1">
                      <input
                        type="checkbox"
                        checked={Boolean(val)}
                        onChange={(e) => handleFieldChange(key, e.target.checked)}
                        className="h-4 w-4 text-[#635BFF] rounded"
                      />
                      <span className="text-xs text-slate-500">{val ? 'Enabled' : 'Disabled'}</span>
                    </div>
                  ) : field.type === 'secret' ? (
                    <Input
                      type="password"
                      placeholder="sk_test_..."
                      value={val || ''}
                      onChange={(e) => handleFieldChange(key, e.target.value)}
                    />
                  ) : field.type === 'number' ? (
                    <Input
                      type="number"
                      value={val || 0}
                      onChange={(e) => handleFieldChange(key, Number(e.target.value))}
                    />
                  ) : (
                    <Input
                      type="text"
                      value={val || ''}
                      onChange={(e) => handleFieldChange(key, e.target.value)}
                    />
                  )}

                  {field.description && (
                    <p className="text-[10px] text-slate-400">{field.description}</p>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </Dialog>
  );
}
