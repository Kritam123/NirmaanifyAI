'use client';

import React, { useState } from 'react';
import {
  Dialog,
  Button,
  Badge,
} from '@nirmaanify/ui';
import {
  ShieldAlert,
  ShieldCheck,
  Lock,
  Globe,
  Database,
  Cpu,
  Layers,
} from 'lucide-react';
import { PluginDto, PluginPermission } from '@nirmaanify/types';

interface PermissionsConsentModalProps {
  plugin: PluginDto | null;
  isOpen: boolean;
  onClose: () => void;
  onGrantAndContinue: (grantedPermissions: PluginPermission[]) => void;
}

const PERMISSION_METADATA: Record<
  PluginPermission,
  { label: string; description: string; risk: 'low' | 'medium' | 'high'; icon: React.ReactNode }
> = {
  'ui:render_slot': {
    label: 'Render Studio UI Slots',
    description: 'Allows plugin to display custom controls in Studio toolbar, sidebar, and inspector panels.',
    risk: 'low',
    icon: <Layers className="h-4 w-4 text-[#635BFF]" />,
  },
  'cms:read': {
    label: 'Read CMS Content',
    description: 'Allows plugin to read collection schemas and content records in this project.',
    risk: 'medium',
    icon: <Database className="h-4 w-4 text-cyan-500" />,
  },
  'cms:write': {
    label: 'Modify CMS Content',
    description: 'Allows plugin to create or mutate collections and content entries.',
    risk: 'high',
    icon: <Database className="h-4 w-4 text-amber-500" />,
  },
  'backend:register_routes': {
    label: 'Inject Backend Controller Routes',
    description: 'Allows plugin to register custom NestJS REST API endpoints.',
    risk: 'medium',
    icon: <Cpu className="h-4 w-4 text-violet-500" />,
  },
  'ai:inject_context': {
    label: 'Inject AI Planning Context',
    description: 'Injects domain-specific guidelines into AI assistant prompts.',
    risk: 'low',
    icon: <ShieldCheck className="h-4 w-4 text-emerald-500" />,
  },
  'network:outbound': {
    label: 'Outbound HTTP Network Calls',
    description: 'Allows plugin sandbox to communicate with external APIs and services.',
    risk: 'medium',
    icon: <Globe className="h-4 w-4 text-blue-500" />,
  },
  'storage:access': {
    label: 'Project Storage Access',
    description: 'Allows reading and writing uploaded assets and media.',
    risk: 'medium',
    icon: <Database className="h-4 w-4 text-indigo-500" />,
  },
  'env:read_secrets': {
    label: 'Decrypted Environment Secrets',
    description: 'Grants access to plugin-scoped encrypted API keys and webhook secrets.',
    risk: 'high',
    icon: <Lock className="h-4 w-4 text-rose-500" />,
  },
};

export const PermissionsConsentModal: React.FC<PermissionsConsentModalProps> = ({
  plugin,
  isOpen,
  onClose,
  onGrantAndContinue,
}) => {
  const [selectedPermissions, setSelectedPermissions] = useState<Set<PluginPermission>>(
    new Set(plugin?.permissions || [])
  );

  if (!plugin) return null;

  const togglePermission = (perm: PluginPermission) => {
    const next = new Set(selectedPermissions);
    if (next.has(perm)) {
      next.delete(perm);
    } else {
      next.add(perm);
    }
    setSelectedPermissions(next);
  };

  const handleConfirm = () => {
    onGrantAndContinue(Array.from(selectedPermissions));
  };

  const modalFooter = (
    <>
      <Button variant="outline" size="sm" onClick={onClose} className="text-xs">
        Cancel
      </Button>
      <Button
        variant="default"
        size="sm"
        onClick={handleConfirm}
        className="text-xs shadow-md shadow-[#635BFF]/20"
      >
        Grant Permissions &amp; Continue
      </Button>
    </>
  );

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title="Review Plugin Permissions"
      description={`"${plugin.name}" requests access to the following project scopes:`}
      footer={modalFooter}
      className="max-w-md"
    >
      <div className="space-y-2.5 max-h-[340px] overflow-y-auto pr-1">
        {plugin.permissions.map((perm) => {
          const meta = PERMISSION_METADATA[perm] || {
            label: perm,
            description: 'Requested permission scope',
            risk: 'low',
            icon: <Lock className="h-4 w-4 text-slate-400" />,
          };
          const isSelected = selectedPermissions.has(perm);

          return (
            <div
              key={perm}
              onClick={() => togglePermission(perm)}
              className={`p-3 rounded-xl border cursor-pointer transition-all flex items-start gap-3 ${
                isSelected
                  ? 'border-[#635BFF] bg-[#635BFF]/5 dark:bg-[#635BFF]/10'
                  : 'border-slate-200 dark:border-[#24293D] opacity-60'
              }`}
            >
              <div className="mt-0.5">{meta.icon}</div>
              <div className="space-y-1 flex-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900 dark:text-white">
                    {meta.label}
                  </span>
                  <Badge
                    variant={
                      meta.risk === 'high'
                        ? 'destructive'
                        : meta.risk === 'medium'
                        ? 'warning'
                        : 'secondary'
                    }
                    size="sm"
                    className="text-[9px] uppercase tracking-wider"
                  >
                    {meta.risk} risk
                  </Badge>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug">
                  {meta.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </Dialog>
  );
};
