'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../context/auth-context';
import { apiClient } from '../../../lib/api';
import { ExternalServiceStatusDto } from '@nirmaanify/types';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  Button,
  Badge,
  Skeleton,
  Tabs,
  useToast,
} from '@nirmaanify/ui';
import {
  Server,
  Key,
  Webhook,
  Code,
  Database,
  Shield,
  HardDrive,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  ExternalLink,
  Activity,
  Copy,
  Check,
  Radio,
} from 'lucide-react';
import { ApiKeyManagerCard } from '../../../components/backend/ApiKeyManagerCard';
import { WebhookManagerCard } from '../../../components/backend/WebhookManagerCard';
import { DeveloperIntegrationHub } from '../../../components/backend/DeveloperIntegrationHub';

export default function GlobalBackendPage() {
  const { activeWorkspace, isLoading: authLoading } = useAuth();
  const { toast } = useToast();

  const [status, setStatus] = useState<ExternalServiceStatusDto | null>(null);
  const [isLoadingStatus, setIsLoadingStatus] = useState(false);
  const [copiedEndpoint, setCopiedEndpoint] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('sdk');

  const fetchStatus = async () => {
    if (!activeWorkspace?.id) return;
    setIsLoadingStatus(true);
    try {
      const res = await apiClient.baas.getStatus(activeWorkspace.id);
      setStatus(res);
    } catch (err: any) {
      console.error('Failed to fetch BaaS status:', err);
      toast({
        title: 'Status Check Failed',
        description: err?.message || 'Unable to query backend service status.',
        type: 'error',
      });
    } finally {
      setIsLoadingStatus(false);
    }
  };

  useEffect(() => {
    if (activeWorkspace?.id) {
      fetchStatus();
    }
  }, [activeWorkspace?.id]);

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedEndpoint(label);
    toast({
      title: 'Copied to clipboard',
      description: text,
    });
    setTimeout(() => setCopiedEndpoint(null), 2000);
  };

  if (authLoading || !activeWorkspace) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-16 w-full rounded-2xl" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Skeleton className="h-32 rounded-2xl" />
          <Skeleton className="h-32 rounded-2xl" />
          <Skeleton className="h-32 rounded-2xl" />
          <Skeleton className="h-32 rounded-2xl" />
        </div>
        <Skeleton className="h-96 w-full rounded-2xl" />
      </div>
    );
  }

  const formatUptime = (seconds?: number) => {
    if (!seconds) return '0m';
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    if (hrs > 0) return `${hrs}h ${mins}m`;
    return `${mins}m`;
  };

  const ENDPOINTS = [
    {
      method: 'GET',
      path: `/api/v1/cms/delivery/workspaces/${activeWorkspace.slug}/:collectionSlug`,
      scope: 'cms:read',
      description: 'Fetch published content entries for any collection with filtering, sorting, and pagination.',
    },
    {
      method: 'POST',
      path: '/api/v1/external/auth/signup',
      scope: 'auth:manage',
      description: 'Register an external end-user account directly via BaaS.',
    },
    {
      method: 'POST',
      path: '/api/v1/external/auth/login',
      scope: 'auth:manage',
      description: 'Authenticate an external end-user and issue a verified JWT session.',
    },
    {
      method: 'POST',
      path: '/api/v1/external/storage/presigned-url',
      scope: 'storage:upload',
      description: 'Generate temporary presigned upload URL for direct-to-cloud asset transfers.',
    },
    {
      method: 'GET',
      path: `/api/v1/workspaces/${activeWorkspace.id}/services/status`,
      scope: 'cms:read',
      description: 'Query real-time health, database telemetry, and service latency.',
    },
  ];

  const tabItems = [
    {
      id: 'sdk',
      label: 'SDK & Quickstart',
      icon: <Code className="w-4 h-4" />,
      content: (
        <DeveloperIntegrationHub
          workspaceSlug={activeWorkspace.slug}
          apiBaseUrl={status?.gateway.apiUrl}
        />
      ),
    },
    {
      id: 'keys',
      label: 'API Keys',
      icon: <Key className="w-4 h-4" />,
      content: <ApiKeyManagerCard workspaceId={activeWorkspace.id} />,
    },
    {
      id: 'webhooks',
      label: 'Webhooks',
      icon: <Webhook className="w-4 h-4" />,
      content: <WebhookManagerCard workspaceId={activeWorkspace.id} />,
    },
    {
      id: 'gateway',
      label: 'Endpoints & Gateway',
      icon: <Server className="w-4 h-4" />,
      content: (
        <div className="space-y-4">
          <Card className="border border-slate-200 dark:border-[#24293D] shadow-sm">
            <CardHeader className="pb-3 border-b border-slate-100 dark:border-[#24293D]">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-sm font-semibold text-slate-900 dark:text-white">
                    Workspace REST API Endpoints
                  </CardTitle>
                  <CardDescription className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Production endpoints callable from your external frontend or backend using your API key.
                  </CardDescription>
                </div>
                {status?.gateway.docsUrl && (
                  <a
                    href={status.gateway.docsUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
                  >
                    Interactive Docs
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
              </div>
            </CardHeader>
            <CardContent className="p-0 divide-y divide-slate-100 dark:divide-[#24293D]">
              {ENDPOINTS.map((ep, idx) => (
                <div
                  key={idx}
                  className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/50 dark:hover:bg-[#1C2130]/50 transition-colors"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-2xs font-bold px-2 py-0.5 rounded font-mono ${
                          ep.method === 'GET'
                            ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                            : 'bg-blue-500/10 text-blue-600 dark:text-blue-400'
                        }`}
                      >
                        {ep.method}
                      </span>
                      <code className="text-xs font-mono font-medium text-slate-800 dark:text-slate-200">
                        {ep.path}
                      </code>
                      <Badge variant="outline" className="text-3xs font-mono text-slate-500 border-slate-200 dark:border-slate-700">
                        {ep.scope}
                      </Badge>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 pl-1">
                      {ep.description}
                    </p>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => copyToClipboard(ep.path, ep.path)}
                    className="h-8 text-xs shrink-0 self-end sm:self-center gap-1.5"
                  >
                    {copiedEndpoint === ep.path ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-500" />
                        <span className="text-emerald-600 dark:text-emerald-400">Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy Path</span>
                      </>
                    )}
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-[#24293D]">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              Backend & APIs
            </h1>
            <Badge variant="outline" className="bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800 text-xs">
              BaaS Engine
            </Badge>
            <Badge variant="secondary" className="text-xs font-mono">
              {activeWorkspace.name}
            </Badge>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Workspace-level headless API gateway, PostgreSQL models, API key auth, and real-time webhook events for your external applications.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={fetchStatus}
            disabled={isLoadingStatus}
            className="text-xs gap-1.5"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoadingStatus ? 'animate-spin' : ''}`} />
            <span>Refresh Status</span>
          </Button>

          {status?.gateway.docsUrl && (
            <a
              href={status.gateway.docsUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg bg-slate-900 text-white dark:bg-white dark:text-slate-900 hover:opacity-90 transition-opacity"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>API Reference</span>
            </a>
          )}
        </div>
      </div>

      {/* Telemetry Status Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Gateway Status */}
        <Card className="border border-slate-200 dark:border-[#24293D] shadow-2xs">
          <CardContent className="p-4 flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <Radio className="w-3.5 h-3.5 text-indigo-500" />
                API Gateway
              </span>
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold text-slate-900 dark:text-white capitalize">
                  {status?.gateway.status || 'Active'}
                </span>
                <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              </div>
              <p className="text-2xs text-slate-400">
                Uptime: {formatUptime(status?.gateway.uptime)} • v{status?.gateway.version || '1.0'}
              </p>
            </div>
            <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
              <Server className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        {/* Database & Models */}
        <Card className="border border-slate-200 dark:border-[#24293D] shadow-2xs">
          <CardContent className="p-4 flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <Database className="w-3.5 h-3.5 text-emerald-500" />
                Database Engine
              </span>
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold text-slate-900 dark:text-white">
                  PostgreSQL
                </span>
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              </div>
              <p className="text-2xs text-slate-400">
                {status?.database.totalCollections ?? 0} Collections • {status?.database.totalItems ?? 0} Items
              </p>
            </div>
            <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <Database className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        {/* Authentication & JWT */}
        <Card className="border border-slate-200 dark:border-[#24293D] shadow-2xs">
          <CardContent className="p-4 flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-amber-500" />
                Auth Service
              </span>
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold text-slate-900 dark:text-white">
                  {status?.auth.enabled ? 'Enabled' : 'Active'}
                </span>
                <Badge variant="outline" className="text-3xs text-amber-600 dark:text-amber-400 border-amber-300">
                  JWT
                </Badge>
              </div>
              <p className="text-2xs text-slate-400 truncate max-w-[150px]">
                Issuer: {status?.auth.jwtIssuer || 'nirmaanify-baas'}
              </p>
            </div>
            <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
              <Shield className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        {/* Media & Storage */}
        <Card className="border border-slate-200 dark:border-[#24293D] shadow-2xs">
          <CardContent className="p-4 flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <HardDrive className="w-3.5 h-3.5 text-purple-500" />
                Media & Storage
              </span>
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold text-slate-900 dark:text-white capitalize">
                  {status?.storage.driver || 'Local / S3'}
                </span>
              </div>
              <p className="text-2xs text-slate-400">
                Presigned Uploads Ready
              </p>
            </div>
            <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400">
              <HardDrive className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Tabs Section */}
      <Tabs
        items={tabItems}
        defaultTab={activeTab}
        onChange={setActiveTab}
        variant="pills"
      />
    </div>
  );
}
