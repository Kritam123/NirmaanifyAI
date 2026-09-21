'use client';

import React, { useState, useEffect } from 'react';
import { ApiKeyDto, CreateApiKeyDto } from '@nirmaanify/types';
import { apiClient } from '../../lib/api';
import {
  Button,
  Badge,
  Input,
  Dialog,
  useToast,
  Skeleton,
} from '@nirmaanify/ui';
import {
  Key,
  Plus,
  Trash2,
  Copy,
  Check,
  Shield,
  Clock,
  AlertTriangle,
  Lock,
} from 'lucide-react';

interface ApiKeyManagerCardProps {
  workspaceId: string;
}

const AVAILABLE_SCOPES = [
  { id: 'cms:read', label: 'cms:read', description: 'Read collections and published items' },
  { id: 'cms:write', label: 'cms:write', description: 'Create, update and publish content' },
  { id: 'storage:upload', label: 'storage:upload', description: 'Upload assets directly to media storage' },
  { id: 'auth:manage', label: 'auth:manage', description: 'Manage external authenticated users' },
];

export const ApiKeyManagerCard: React.FC<ApiKeyManagerCardProps> = ({ workspaceId }) => {
  const { toast } = useToast();
  const [keys, setKeys] = useState<ApiKeyDto[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  // Form state
  const [name, setName] = useState('');
  const [scopes, setScopes] = useState<string[]>(['cms:read', 'cms:write', 'storage:upload']);
  const [expiresInDays, setExpiresInDays] = useState<number>(0);

  // Created key reveal modal state
  const [createdKeySecret, setCreatedKeySecret] = useState<string | null>(null);
  const [isCopied, setIsCopied] = useState(false);

  const fetchKeys = async () => {
    if (!workspaceId) return;
    setIsLoading(true);
    try {
      const res = await apiClient.baas.listApiKeys(workspaceId);
      setKeys(res || []);
    } catch (err: any) {
      console.error('Failed to load API keys:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchKeys();
  }, [workspaceId]);

  const handleCreateKey = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsCreating(true);
    try {
      const dto: CreateApiKeyDto = {
        name: name.trim(),
        scopes,
        expiresInDays: expiresInDays > 0 ? expiresInDays : undefined,
      };

      const res = await apiClient.baas.createApiKey(workspaceId, dto);
      setKeys((prev) => [res, ...prev]);
      setIsCreateOpen(false);
      setName('');
      setScopes(['cms:read', 'cms:write', 'storage:upload']);

      if (res.secretKey) {
        setCreatedKeySecret(res.secretKey);
      }

      toast({
        title: 'API Key Generated',
        description: `API key "${res.name}" has been created.`,
        type: 'success',
      });
    } catch (err: any) {
      toast({
        title: 'Failed to create API key',
        description: err.message || 'An error occurred',
        type: 'error',
      });
    } finally {
      setIsCreating(false);
    }
  };

  const handleDeleteKey = async (keyId: string) => {
    if (!confirm('Are you sure you want to revoke this API key? External apps using it will immediately lose access.')) {
      return;
    }

    try {
      await apiClient.baas.deleteApiKey(workspaceId, keyId);
      setKeys((prev) => prev.filter((k) => k.id !== keyId));
      toast({
        title: 'API Key Revoked',
        description: 'The key has been deleted permanently.',
        type: 'info',
      });
    } catch (err: any) {
      toast({
        title: 'Failed to revoke API key',
        description: err.message || 'Could not delete key',
        type: 'error',
      });
    }
  };

  const handleCopySecret = () => {
    if (!createdKeySecret) return;
    navigator.clipboard.writeText(createdKeySecret);
    setIsCopied(true);
    toast({
      title: 'Secret Key Copied',
      description: 'API key copied to clipboard.',
      type: 'success',
    });
    setTimeout(() => setIsCopied(false), 2000);
  };

  const toggleScope = (scopeId: string) => {
    if (scopes.includes(scopeId)) {
      setScopes(scopes.filter((s) => s !== scopeId));
    } else {
      setScopes([...scopes, scopeId]);
    }
  };

  return (
    <div className="space-y-4">
      {/* Card Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-white dark:bg-[#161926] border border-slate-200 dark:border-[#24293D] shadow-xs">
        <div className="flex items-start gap-3">
          <div className="p-2.5 rounded-xl bg-violet-50 dark:bg-violet-950/40 text-violet-600 dark:text-violet-400 border border-violet-100 dark:border-violet-900/40">
            <Key className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              API Keys &amp; Credentials
              <Badge variant="secondary" size="sm">
                {keys.length} Active
              </Badge>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Securely authenticate your external applications (Next.js, React Native, Astro, Python) to this workspace.
            </p>
          </div>
        </div>

        <Button
          size="sm"
          variant="default"
          leftIcon={<Plus className="h-4 w-4" />}
          onClick={() => setIsCreateOpen(true)}
          className="shadow-sm"
        >
          Create API Key
        </Button>
      </div>

      {/* Keys Table / List */}
      <div className="rounded-2xl bg-white dark:bg-[#161926] border border-slate-200 dark:border-[#24293D] overflow-hidden shadow-xs">
        {isLoading ? (
          <div className="p-6 space-y-3">
            <Skeleton className="h-10 w-full rounded-xl" />
            <Skeleton className="h-10 w-full rounded-xl" />
          </div>
        ) : keys.length === 0 ? (
          <div className="p-12 text-center max-w-md mx-auto space-y-3">
            <div className="inline-flex p-3 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400">
              <Lock className="h-6 w-6" />
            </div>
            <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">
              No API Keys Created Yet
            </h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              Create your first API key to query published content or trigger backend operations from external frontends.
            </p>
            <Button
              size="xs"
              variant="outline"
              leftIcon={<Plus className="h-3.5 w-3.5" />}
              onClick={() => setIsCreateOpen(true)}
            >
              Generate First Key
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-[#12141F] text-slate-400 border-b border-slate-200 dark:border-[#24293D] font-semibold uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="px-5 py-3.5">Name</th>
                  <th className="px-5 py-3.5">Key Prefix</th>
                  <th className="px-5 py-3.5">Scopes</th>
                  <th className="px-5 py-3.5">Last Used</th>
                  <th className="px-5 py-3.5">Created</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-[#1F2437]">
                {keys.map((k) => (
                  <tr key={k.id} className="hover:bg-slate-50/70 dark:hover:bg-[#1B2032] transition-colors">
                    <td className="px-5 py-4 font-bold text-slate-800 dark:text-slate-100">
                      {k.name}
                    </td>
                    <td className="px-5 py-4">
                      <code className="px-2 py-1 rounded bg-slate-100 dark:bg-slate-800 font-mono text-[11px] text-slate-700 dark:text-slate-300">
                        {k.keyPrefix}
                      </code>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex flex-wrap gap-1">
                        {k.scopes.map((s) => (
                          <span
                            key={s}
                            className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-indigo-50 dark:bg-indigo-950/50 text-[#635BFF] dark:text-[#A5AEFD] border border-indigo-100/60 dark:border-indigo-900/40"
                          >
                            {s}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-5 py-4 text-slate-400">
                      {k.lastUsedAt ? new Date(k.lastUsedAt).toLocaleDateString() : 'Never'}
                    </td>
                    <td className="px-5 py-4 text-slate-400">
                      {new Date(k.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-5 py-4 text-right">
                      <button
                        onClick={() => handleDeleteKey(k.id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                        title="Revoke Key"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create Key Dialog */}
      <Dialog
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="Generate New API Key"
        description="Create a scoped credential for external websites, mobile apps, or backend servers."
        footer={
          <div className="flex items-center gap-2">
            <Button type="button" variant="ghost" onClick={() => setIsCreateOpen(false)}>
              Cancel
            </Button>
            <Button
              type="button"
              variant="default"
              isLoading={isCreating}
              onClick={handleCreateKey}
            >
              Generate Key
            </Button>
          </div>
        }
      >
        <div className="space-y-4 py-2">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Key Name
            </label>
            <Input
              placeholder="e.g. Next.js Production, Mobile App iOS"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block">
              Permissions &amp; Scopes
            </label>
            <div className="space-y-2">
              {AVAILABLE_SCOPES.map((scope) => {
                const checked = scopes.includes(scope.id);
                return (
                  <label
                    key={scope.id}
                    className={`flex items-start gap-3 p-2.5 rounded-xl border transition-colors cursor-pointer ${
                      checked
                        ? 'bg-[#635BFF]/5 border-[#635BFF]/30 dark:bg-[#635BFF]/10 dark:border-[#635BFF]/40'
                        : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-[#161926]'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggleScope(scope.id)}
                      className="mt-0.5 rounded border-slate-300 text-[#635BFF] focus:ring-[#635BFF]"
                    />
                    <div className="text-xs">
                      <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                        {scope.label}
                      </span>
                      <p className="text-[11px] text-slate-400 mt-0.5 leading-tight">
                        {scope.description}
                      </p>
                    </div>
                  </label>
                );
              })}
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Expiration
            </label>
            <select
              value={expiresInDays}
              onChange={(e) => setExpiresInDays(Number(e.target.value))}
              className="w-full h-9 px-3 rounded-lg border border-slate-200 dark:border-[#24293D] bg-white dark:bg-[#161926] text-xs text-slate-800 dark:text-slate-200 focus:outline-hidden focus:border-[#635BFF]"
            >
              <option value={0}>Never expires</option>
              <option value={30}>30 Days</option>
              <option value={90}>90 Days</option>
              <option value={365}>1 Year</option>
            </select>
          </div>
        </div>
      </Dialog>

      {/* Secret Reveal Modal (Shown once on key creation) */}
      <Dialog
        isOpen={Boolean(createdKeySecret)}
        onClose={() => setCreatedKeySecret(null)}
        title="Save Your API Key"
        description="This secret key will never be shown again. Please copy and store it securely in your environment variables."
        footer={
          <Button
            type="button"
            variant="default"
            onClick={() => setCreatedKeySecret(null)}
            className="w-full"
          >
            I Have Saved My Secret Key
          </Button>
        }
      >
        <div className="py-2 space-y-3">
          <div className="flex items-center gap-2 p-3 rounded-xl bg-slate-900 text-white font-mono text-xs border border-slate-800">
            <span className="flex-1 select-all break-all">{createdKeySecret}</span>
            <Button
              type="button"
              size="xs"
              variant="outline"
              className="shrink-0 bg-slate-800 border-slate-700 text-white hover:bg-slate-700"
              onClick={handleCopySecret}
              leftIcon={isCopied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
            >
              {isCopied ? 'Copied' : 'Copy'}
            </Button>
          </div>

          <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/50 text-amber-800 dark:text-amber-300 text-xs flex items-start gap-2">
            <Shield className="h-4 w-4 shrink-0 mt-0.5" />
            <span>
              Use this key in your HTTP headers as <code className="font-bold">x-api-key: {createdKeySecret?.substring(0, 14)}...</code>
            </span>
          </div>
        </div>
      </Dialog>
    </div>
  );
};
