'use client';

import React, { useEffect, useState, use } from 'react';
import { apiClient } from '@nirmaanify/api-client';
import { Sparkles, RefreshCw, CheckCircle, Server, ExternalLink, Code2 } from 'lucide-react';
import { ProjectDto, ProjectSandboxDto } from '@nirmaanify/types';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function SandboxPreviewPage({ params }: PageProps) {
  const resolvedParams = use(params);
  const projectId = resolvedParams.id;

  const [project, setProject] = useState<ProjectDto | null>(null);
  const [sandbox, setSandbox] = useState<ProjectSandboxDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<string>('');
  const [iframeKey, setIframeKey] = useState(0);

  const fetchProjectData = async () => {
    try {
      setLoading(true);

      // 1. Fetch project details
      const proj = await apiClient.projects.getProject(projectId).catch(() => null);
      if (proj) {
        setProject(proj);
      }

      // 2. Fetch sandbox runtime status
      const sb = await apiClient.agent.getSandboxStatus(projectId).catch(() => null);
      if (sb) {
        setSandbox(sb);
      }

      setLastUpdated(new Date().toLocaleTimeString());
    } catch {
      setLastUpdated(new Date().toLocaleTimeString());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjectData();
    const interval = setInterval(fetchProjectData, 5000);
    return () => clearInterval(interval);
  }, [projectId]);

  const handleRefresh = () => {
    setIframeKey((k) => k + 1);
    fetchProjectData();
  };

  const previewUrl = sandbox?.hostUrl && sandbox.hostUrl !== `/preview/${projectId}`
    ? sandbox.hostUrl
    : null;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Status Bar */}
      <div className="sticky top-0 z-50 bg-[#0E101A]/90 backdrop-blur border-b border-[#24293D] px-4 py-2 flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="font-semibold text-slate-200 flex items-center gap-1.5">
            <Server className="h-3.5 w-3.5 text-indigo-400" />
            Nirmaanify Sandbox Runtime · {project?.name || projectId.substring(0, 8)}
          </span>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 font-medium flex items-center gap-1">
            <CheckCircle className="h-3 w-3" />
            {sandbox?.status || 'READY'}
          </span>
        </div>

        <div className="flex items-center gap-3 text-slate-400">
          <span className="text-[11px] font-mono">Updated: {lastUpdated || 'Just now'}</span>
          <button
            onClick={handleRefresh}
            title="Refresh Sandbox Preview"
            className="p-1 hover:text-white transition-colors"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin text-indigo-400' : ''}`} />
          </button>
          {previewUrl && (
            <a
              href={previewUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="p-1 hover:text-white transition-colors"
              title="Open Sandbox in New Window"
            >
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          )}
        </div>
      </div>

      {/* Main Preview Container */}
      <div className="flex-1 w-full flex flex-col items-center justify-center p-4">
        {previewUrl ? (
          <iframe
            key={iframeKey}
            src={previewUrl}
            title="Live Sandbox Application"
            className="w-full h-full min-h-[calc(100vh-60px)] rounded-xl border border-[#24293D] bg-white shadow-2xl"
            allow="accelerometer; camera; encrypted-media; geolocation; gyroscope; microphone; midi; clipboard-read; clipboard-write;"
          />
        ) : (
          <div className="max-w-2xl mx-auto py-24 px-6 text-center space-y-5">
            <div className="h-14 w-14 rounded-2xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center mx-auto border border-indigo-500/20 shadow-lg shadow-indigo-500/10">
              <Sparkles className="h-7 w-7" />
            </div>
            <h2 className="text-2xl font-bold text-white tracking-tight">
              {project?.name || 'Project Sandbox Runtime'}
            </h2>
            <p className="text-slate-400 text-sm max-w-md mx-auto leading-relaxed">
              Sandbox container is active and live synchronized. Prompt the Autonomous AI Agent in the AI Studio to generate and test full-stack features.
            </p>
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900 border border-[#24293D] text-xs font-mono text-slate-300">
              <Code2 className="w-3.5 h-3.5 text-indigo-400" />
              <span>Provider: {sandbox?.provider || 'E2B_CLOUD'} · Port 3000 Active</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
