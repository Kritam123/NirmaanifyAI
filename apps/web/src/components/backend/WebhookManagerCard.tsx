'use client';

import React, { useState, useEffect } from 'react';
import { WebhookSubscriptionDto, CreateWebhookDto } from '@nirmaanify/types';
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
  Webhook,
  Plus,
  Trash2,
  Activity,
  CheckCircle2,
  XCircle,
  ExternalLink,
  Send,
} from 'lucide-react';

interface WebhookManagerCardProps {
  workspaceId: string;
}

const AVAILABLE_EVENTS = [
  { id: 'content.published', label: 'content.published', description: 'Triggered when any content item is published' },
  { id: 'content.updated', label: 'content.updated', description: 'Triggered when content item data is saved' },
  { id: 'content.deleted', label: 'content.deleted', description: 'Triggered when a content item is deleted' },
];

export const WebhookManagerCard: React.FC<WebhookManagerCardProps> = ({ workspaceId }) => {
  const { toast } = useToast();
  const [webhooks, setWebhooks] = useState<WebhookSubscriptionDto[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  // Form state
  const [name, setName] = useState('');
  const [targetUrl, setTargetUrl] = useState('');
  const [secret, setSecret] = useState('');
  const [events, setEvents] = useState<string[]>(['content.published']);

  // Ping test state
  const [testingId, setTestingId] = useState<string | null>(null);
  const [testResults, setTestResults] = useState<Record<string, { success: boolean; latency?: number; status?: number; error?: string }>>({});

  const fetchWebhooks = async () => {
    if (!workspaceId) return;
    setIsLoading(true);
    try {
      const res = await apiClient.baas.listWebhooks(workspaceId);
      setWebhooks(res || []);
    } catch (err: any) {
      console.error('Failed to load webhooks:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchWebhooks();
  }, [workspaceId]);

  const handleCreateWebhook = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !targetUrl.trim()) return;

    setIsCreating(true);
    try {
      const dto: CreateWebhookDto = {
        name: name.trim(),
        targetUrl: targetUrl.trim(),
        secret: secret.trim() || undefined,
        events,
      };

      const res = await apiClient.baas.createWebhook(workspaceId, dto);
      setWebhooks((prev) => [res, ...prev]);
      setIsCreateOpen(false);
      setName('');
      setTargetUrl('');
      setSecret('');
      setEvents(['content.published']);

      toast({
        title: 'Webhook Registered',
        description: `Endpoint "${res.name}" will receive event payloads.`,
        type: 'success',
      });
    } catch (err: any) {
      toast({
        title: 'Failed to create webhook',
        description: err.message || 'An error occurred',
        type: 'error',
      });
    } finally {
      setIsCreating(false);
    }
  };

  const handleDeleteWebhook = async (webhookId: string) => {
    if (!confirm('Are you sure you want to delete this webhook subscription?')) return;

    try {
      await apiClient.baas.deleteWebhook(workspaceId, webhookId);
      setWebhooks((prev) => prev.filter((w) => w.id !== webhookId));
      toast({
        title: 'Webhook Deleted',
        description: 'Endpoint was successfully removed.',
        type: 'info',
      });
    } catch (err: any) {
      toast({
        title: 'Failed to delete webhook',
        description: err.message || 'An error occurred',
        type: 'error',
      });
    }
  };

  const handleTestPing = async (webhookId: string) => {
    setTestingId(webhookId);
    try {
      const res = await apiClient.baas.testWebhook(workspaceId, webhookId);
      setTestResults((prev) => ({
        ...prev,
        [webhookId]: {
          success: res.success,
          latency: res.responseTimeMs,
          status: res.statusCode,
          error: res.error,
        },
      }));

      toast({
        title: res.success ? 'Ping Successful' : 'Ping Failed',
        description: res.success
          ? `HTTP ${res.statusCode || 200} in ${res.responseTimeMs}ms`
          : (res.error || 'Connection failed'),
        type: res.success ? 'success' : 'error',
      });
    } catch (err: any) {
      toast({
        title: 'Ping Failed',
        description: err.message || 'Network error',
        type: 'error',
      });
    } finally {
      setTestingId(null);
    }
  };

  const toggleEvent = (eventId: string) => {
    if (events.includes(eventId)) {
      setEvents(events.filter((e) => e !== eventId));
    } else {
      setEvents([...events, eventId]);
    }
  };

  return (
    <div className="space-y-4">
      {/* Card Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-white dark:bg-[#161926] border border-slate-200 dark:border-[#24293D] shadow-xs">
        <div className="flex items-start gap-3">
          <div className="p-2.5 rounded-xl bg-pink-50 dark:bg-pink-950/40 text-pink-600 dark:text-pink-400 border border-pink-100 dark:border-pink-900/40">
            <Webhook className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              Webhooks &amp; Event Subscriptions
              <Badge variant="secondary" size="sm">
                {webhooks.length} Endpoints
              </Badge>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Automatically trigger external build hooks (e.g. Vercel On-Demand ISR, Netlify rebuilds, Slack alerts) when content publishes.
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
          Add Webhook
        </Button>
      </div>

      {/* Webhooks Table / List */}
      <div className="rounded-2xl bg-white dark:bg-[#161926] border border-slate-200 dark:border-[#24293D] overflow-hidden shadow-xs">
        {isLoading ? (
          <div className="p-6 space-y-3">
            <Skeleton className="h-10 w-full rounded-xl" />
            <Skeleton className="h-10 w-full rounded-xl" />
          </div>
        ) : webhooks.length === 0 ? (
          <div className="p-12 text-center max-w-md mx-auto space-y-3">
            <div className="inline-flex p-3 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400">
              <Activity className="h-6 w-6" />
            </div>
            <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">
              No Webhook Subscriptions Configured
            </h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              Add your Next.js revalidation endpoint or CI/CD build hook to instantly purge cache when your team publishes new content.
            </p>
            <Button
              size="xs"
              variant="outline"
              leftIcon={<Plus className="h-3.5 w-3.5" />}
              onClick={() => setIsCreateOpen(true)}
            >
              Add First Webhook
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-[#12141F] text-slate-400 border-b border-slate-200 dark:border-[#24293D] font-semibold uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="px-5 py-3.5">Name</th>
                  <th className="px-5 py-3.5">Target URL</th>
                  <th className="px-5 py-3.5">Events</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-[#1F2437]">
                {webhooks.map((w) => {
                  const result = testResults[w.id];
                  const isTesting = testingId === w.id;

                  return (
                    <tr key={w.id} className="hover:bg-slate-50/70 dark:hover:bg-[#1B2032] transition-colors">
                      <td className="px-5 py-4 font-bold text-slate-800 dark:text-slate-100">
                        {w.name}
                      </td>
                      <td className="px-5 py-4 font-mono text-[11px] text-slate-600 dark:text-slate-400 max-w-xs truncate">
                        {w.targetUrl}
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex flex-wrap gap-1">
                          {w.events.map((e) => (
                            <span
                              key={e}
                              className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-pink-50 dark:bg-pink-950/50 text-pink-600 dark:text-pink-400 border border-pink-100/60 dark:border-pink-900/40"
                            >
                              {e}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        {result ? (
                          <div className="flex items-center gap-1.5">
                            {result.success ? (
                              <span className="flex items-center gap-1 text-[11px] text-emerald-500 font-semibold">
                                <CheckCircle2 className="h-3.5 w-3.5" /> {result.latency}ms
                              </span>
                            ) : (
                              <span className="flex items-center gap-1 text-[11px] text-red-500 font-semibold" title={result.error}>
                                <XCircle className="h-3.5 w-3.5" /> Failed
                              </span>
                            )}
                          </div>
                        ) : (
                          <Badge variant="secondary" size="sm">
                            Active
                          </Badge>
                        )}
                      </td>
                      <td className="px-5 py-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            size="xs"
                            variant="outline"
                            isLoading={isTesting}
                            leftIcon={<Send className="h-3 w-3" />}
                            onClick={() => handleTestPing(w.id)}
                          >
                            Ping Test
                          </Button>
                          <button
                            onClick={() => handleDeleteWebhook(w.id)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                            title="Delete Webhook"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Webhook Dialog */}
      <Dialog
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="Register Webhook Target"
        description="Provide an HTTPS endpoint that will receive real-time JSON payloads when actions occur."
        footer={
          <div className="flex items-center gap-2">
            <Button type="button" variant="ghost" onClick={() => setIsCreateOpen(false)}>
              Cancel
            </Button>
            <Button
              type="button"
              variant="default"
              isLoading={isCreating}
              onClick={handleCreateWebhook}
            >
              Save Webhook
            </Button>
          </div>
        }
      >
        <div className="space-y-4 py-2">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Target Name
            </label>
            <Input
              placeholder="e.g. Next.js Vercel Revalidation"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Destination URL (HTTPS)
            </label>
            <Input
              type="url"
              placeholder="https://my-app.vercel.app/api/revalidate"
              value={targetUrl}
              onChange={(e) => setTargetUrl(e.target.value)}
              required
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Secret Token (Optional)
            </label>
            <Input
              placeholder="whsec_... (leave empty to generate)"
              value={secret}
              onChange={(e) => setSecret(e.target.value)}
            />
            <p className="text-[10px] text-slate-400">
              Used to generate an HMAC SHA-256 signature in the <code className="font-bold">x-nirmaanify-signature</code> header.
            </p>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block">
              Event Triggers
            </label>
            <div className="space-y-2">
              {AVAILABLE_EVENTS.map((event) => {
                const checked = events.includes(event.id);
                return (
                  <label
                    key={event.id}
                    className={`flex items-start gap-3 p-2.5 rounded-xl border transition-colors cursor-pointer ${
                      checked
                        ? 'bg-pink-50/50 border-pink-200 dark:bg-pink-950/20 dark:border-pink-900/40'
                        : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-[#161926]'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggleEvent(event.id)}
                      className="mt-0.5 rounded border-slate-300 text-pink-600 focus:ring-pink-500"
                    />
                    <div className="text-xs">
                      <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                        {event.label}
                      </span>
                      <p className="text-[11px] text-slate-400 mt-0.5 leading-tight">
                        {event.description}
                      </p>
                    </div>
                  </label>
                );
              })}
            </div>
          </div>
        </div>
      </Dialog>
    </div>
  );
};
