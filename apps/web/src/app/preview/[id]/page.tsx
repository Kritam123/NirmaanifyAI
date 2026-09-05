'use client';

import React, { useEffect, useState, use } from 'react';
import { apiClient } from '@nirmaanify/api-client';
import { Sparkles, RefreshCw, CheckCircle, Server } from 'lucide-react';
import { DynamicRenderer, CodeToAstParser } from '@nirmaanify/component-registry';
import { ProjectDto, ComponentNode } from '@nirmaanify/types';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function SandboxPreviewPage({ params }: PageProps) {
  const resolvedParams = use(params);
  const projectId = resolvedParams.id;

  const [project, setProject] = useState<ProjectDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<string>('');
  const [generatedNode, setGeneratedNode] = useState<ComponentNode | null>(null);

  const fetchProjectData = async () => {
    try {
      setLoading(true);

      // 1. Fetch project details
      const proj = await apiClient.projects.getProject(projectId).catch(() => null);
      if (proj) {
        setProject(proj);
      }

      // 2. Fetch latest agent messages & code fragments
      const messages = await apiClient.agent.getMessages(projectId).catch(() => []);
      const lastWithFragment = [...messages].reverse().find((m) => m.fragment?.files);

      if (lastWithFragment?.fragment?.files) {
        const files = lastWithFragment.fragment.files as Record<string, string>;
        const pageCode =
          files['src/app/page.tsx'] ||
          files['app/page.tsx'] ||
          files['src/pages/index.tsx'] ||
          files['pages/index.tsx'];

        if (pageCode) {
          try {
            const parsed = CodeToAstParser.parsePage(pageCode, 'Page', '/');
            if (parsed.rootNode) {
              setGeneratedNode(parsed.rootNode);
            }
          } catch {
            // AST parser fallback if complex custom JSX
          }
        }
      } else if (proj?.projectSchema) {
        const schema = proj.projectSchema as any;
        if (schema?.pages?.[0]?.rootNode) {
          setGeneratedNode(schema.pages[0].rootNode);
        }
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
    const interval = setInterval(fetchProjectData, 4000);
    return () => clearInterval(interval);
  }, [projectId]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#07090F] text-slate-900 dark:text-slate-100 flex flex-col font-sans">
      {/* Status Bar */}
      <div className="sticky top-0 z-50 bg-white/90 dark:bg-[#0E101A]/90 backdrop-blur border-b border-slate-200 dark:border-[#24293D] px-4 py-2 flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-1.5">
            <Server className="h-3.5 w-3.5 text-indigo-500" />
            Nirmaanify Preview · {project?.name || projectId.substring(0, 8)}
          </span>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 font-medium flex items-center gap-1">
            <CheckCircle className="h-3 w-3" />
            Live Synced
          </span>
        </div>

        <div className="flex items-center gap-3 text-slate-500">
          <span className="text-[11px] font-mono">Updated: {lastUpdated || 'Just now'}</span>
          <button
            onClick={fetchProjectData}
            title="Refresh Preview"
            className="p-1 hover:text-slate-900 dark:hover:text-white transition-colors"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin text-indigo-500' : ''}`} />
          </button>
        </div>
      </div>

      {/* Main Preview Container */}
      <div className="flex-1 w-full">
        {generatedNode ? (
          <DynamicRenderer
            node={generatedNode}
            mode="preview"
            selectedNodeId={null}
            hoveredNodeId={null}
          />
        ) : (
          <div className="max-w-2xl mx-auto py-24 px-6 text-center space-y-4">
            <div className="h-12 w-12 rounded-2xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center mx-auto">
              <Sparkles className="h-6 w-6" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
              {project?.name || 'Project Workspace Initialized'}
            </h2>
            <p className="text-slate-500 text-sm max-w-md mx-auto">
              No UI components generated yet. Prompt the AI Agent in the Visual Studio to build your full-stack application.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
