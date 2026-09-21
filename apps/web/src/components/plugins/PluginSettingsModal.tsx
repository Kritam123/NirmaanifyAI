'use client';

import React, { useState } from 'react';
import {
  Dialog,
  Button,
  Input,
  Switch,
  Badge,
  useToast,
} from '@nirmaanify/ui';
import { Settings, Lock } from 'lucide-react';
import { PluginDto, ProjectPluginDto, PluginPermission } from '@nirmaanify/types';
import { usePlugins } from '../../hooks/use-plugins';

interface PluginSettingsModalProps {
  projectId: string;
  plugin: PluginDto | null;
  projectPlugin?: ProjectPluginDto | null;
  grantedPermissions?: PluginPermission[];
  isOpen: boolean;
  onClose: () => void;
  onSaved?: () => void;
}

export const PluginSettingsModal: React.FC<PluginSettingsModalProps> = ({
  projectId,
  plugin,
  projectPlugin,
  grantedPermissions = [],
  isOpen,
  onClose,
  onSaved,
}) => {
  const { installPlugin, updatePlugin } = usePlugins(projectId);
  const { toast } = useToast();
  const [formValues, setFormValues] = useState<Record<string, any>>(
    projectPlugin?.configValues || {}
  );
  const [secrets, setSecrets] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);

  if (!plugin) return null;

  const schema = plugin.manifest.configurationSchema?.properties || {};

  const handleInputChange = (key: string, value: any, isSecret: boolean = false) => {
    if (isSecret) {
      setSecrets((prev) => ({ ...prev, [key]: value }));
    } else {
      setFormValues((prev) => ({ ...prev, [key]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      if (projectPlugin) {
        // Update existing plugin installation
        await updatePlugin(projectPlugin.id, {
          configValues: formValues,
          secrets: Object.keys(secrets).length > 0 ? secrets : undefined,
        });
        toast({
          title: 'Configuration Saved',
          description: `Updated settings for ${plugin.name}.`,
          type: 'success',
        });
      } else {
        // First-time installation
        await installPlugin({
          pluginId: plugin.id,
          version: plugin.version,
          grantedPermissions,
          configValues: formValues,
          secrets: Object.keys(secrets).length > 0 ? secrets : undefined,
        });
        toast({
          title: 'Plugin Installed Successfully',
          description: `${plugin.name} is now active in your project.`,
          type: 'success',
        });
      }
      if (onSaved) onSaved();
      onClose();
    } catch (err: any) {
      toast({
        title: 'Save Failed',
        description: err.message || 'Error occurred while saving configuration',
        type: 'error',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const modalFooter = (
    <>
      <Button variant="outline" size="sm" type="button" onClick={onClose} className="text-xs">
        Cancel
      </Button>
      <Button
        variant="default"
        size="sm"
        type="button"
        isLoading={isSaving}
        onClick={handleSubmit}
        className="text-xs shadow-md shadow-[#635BFF]/20"
      >
        Save Configuration
      </Button>
    </>
  );

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title={`Configure ${plugin.name}`}
      description="Manage settings, API credentials, and runtime parameters."
      footer={modalFooter}
      className="max-w-lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4 max-h-[380px] overflow-y-auto pr-1">
        {Object.entries(schema).map(([key, prop]) => {
          const isSecret = !!prop.isSecret;
          const currentValue = isSecret ? secrets[key] || '' : formValues[key] ?? prop.default ?? '';

          return (
            <div key={key} className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                  <span>{prop.title || key}</span>
                  {isSecret && (
                    <Badge variant="secondary" size="sm" className="text-[9px] flex items-center gap-1">
                      <Lock className="h-2.5 w-2.5 text-amber-500" />
                      <span>Encrypted Secret</span>
                    </Badge>
                  )}
                </label>
              </div>

              {prop.type === 'boolean' ? (
                <div className="flex items-center gap-2 pt-1">
                  <Switch
                    checked={!!currentValue}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      handleInputChange(key, e.target.checked, isSecret)
                    }
                  />
                  <span className="text-xs text-slate-500">{prop.description}</span>
                </div>
              ) : (
                <Input
                  type={isSecret ? 'password' : 'text'}
                  value={currentValue}
                  placeholder={prop.description || `Enter ${prop.title}`}
                  onChange={(e) => handleInputChange(key, e.target.value, isSecret)}
                  className="text-xs"
                />
              )}

              {prop.description && prop.type !== 'boolean' && (
                <p className="text-[11px] text-slate-400">{prop.description}</p>
              )}
            </div>
          );
        })}
      </form>
    </Dialog>
  );
};
