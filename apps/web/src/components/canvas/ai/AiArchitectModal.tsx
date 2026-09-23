'use client';

import React, { useState } from 'react';
import {
  Sparkles,
  X,
  Zap,
  Layers,
  Cloud,
  Database,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { apiClient } from '../../../lib/api';
import {
  DiagramType,
  CloudProvider,
  CanvasNode,
  CanvasEdge,
  ArchitectureTemplateDto,
} from '@nirmaanify/types';

interface AiArchitectModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
  diagramId?: string;
  onApplyScaffold: (result: {
    nodes: CanvasNode[];
    edges: CanvasEdge[];
    document: string;
    title: string;
  }) => void;
}

export const AiArchitectModal: React.FC<AiArchitectModalProps> = ({
  isOpen,
  onClose,
  projectId,
  diagramId,
  onApplyScaffold,
}) => {
  const [prompt, setPrompt] = useState('');
  const [diagramType, setDiagramType] = useState<DiagramType>('SYSTEM_ARCHITECTURE');
  const [cloudProvider, setCloudProvider] = useState<CloudProvider>('generic');
  const [isLoading, setIsLoading] = useState(false);
  const [templates, setTemplates] = useState<ArchitectureTemplateDto[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Fetch boilerplate templates on open
  React.useEffect(() => {
    if (isOpen) {
      apiClient.diagrams.getTemplates().then((tpls) => {
        setTemplates(tpls);
      }).catch(() => {});
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      setError('Please describe your system or select a starter template.');
      return;
    }
    setError(null);
    setIsLoading(true);

    try {
      const res = await apiClient.diagrams.scaffoldWithAi({
        projectId,
        diagramId,
        prompt: prompt.trim(),
        diagramType,
        cloudProvider,
      });

      onApplyScaffold({
        nodes: res.nodes,
        edges: res.edges,
        document: res.document,
        title: res.name,
      });

      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to generate architecture diagram.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleApplyTemplate = (tpl: ArchitectureTemplateDto) => {
    onApplyScaffold({
      nodes: tpl.nodes,
      edges: tpl.edges,
      document: tpl.document,
      title: tpl.name,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-2xl rounded-2xl border border-slate-200 dark:border-[#24293D] bg-white dark:bg-[#0F111A] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-[#24293D] flex items-center justify-between bg-gradient-to-r from-fuchsia-500/10 via-[#635BFF]/10 to-transparent">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-gradient-to-tr from-fuchsia-600 to-[#635BFF] text-white shadow-md">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
                AI System Architecture Scaffolder
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Generate production-ready system designs, cloud topologies, and UML diagrams in seconds
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          {error && (
            <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs flex items-center gap-2">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Prompt Input */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Describe your System Architecture or UML Diagram
            </label>
            <textarea
              rows={3}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="e.g. Design a fault-tolerant microservice architecture for ride hailing with driver dispatch, WebSocket tracking, Redis geo-queries, Kafka event streaming, and PostgreSQL"
              className="w-full p-3 rounded-xl border border-slate-200 dark:border-[#24293D] bg-slate-50 dark:bg-[#141724] text-slate-900 dark:text-slate-100 text-xs focus:outline-none focus:ring-2 focus:ring-[#635BFF] resize-none leading-relaxed"
            />
          </div>

          {/* Configuration Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Diagram Category
              </label>
              <select
                value={diagramType}
                onChange={(e) => setDiagramType(e.target.value as any)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-[#24293D] bg-slate-50 dark:bg-[#141724] text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-[#635BFF]"
              >
                <option value="SYSTEM_ARCHITECTURE">System Architecture & Microservices</option>
                <option value="CLOUD_INFRASTRUCTURE">Cloud Infrastructure Topology</option>
                <option value="UML_CLASS">UML Class Diagram</option>
                <option value="DATABASE_ERD">Database Schema & Relational ERD</option>
                <option value="FLOWCHART">System Flowchart</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Target Cloud Ecosystem
              </label>
              <select
                value={cloudProvider}
                onChange={(e) => setCloudProvider(e.target.value as any)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-[#24293D] bg-slate-50 dark:bg-[#141724] text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-[#635BFF]"
              >
                <option value="generic">Cloud-Agnostic / Open Source</option>
                <option value="aws">Amazon Web Services (AWS)</option>
                <option value="gcp">Google Cloud Platform (GCP)</option>
                <option value="azure">Microsoft Azure</option>
                <option value="k8s">Kubernetes Native</option>
              </select>
            </div>
          </div>

          {/* Starter Boilerplates */}
          {templates.length > 0 && (
            <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-[#1E2337]">
              <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                Or start instantly from a production template:
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {templates.map((tpl) => (
                  <button
                    key={tpl.id}
                    type="button"
                    onClick={() => handleApplyTemplate(tpl)}
                    className="p-3 rounded-xl border border-slate-200 dark:border-[#24293D] bg-slate-50/50 dark:bg-[#141724]/50 hover:border-[#635BFF] hover:bg-white dark:hover:bg-[#1C2033] text-left transition-all group"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-200 group-hover:text-[#635BFF] transition-colors">
                        {tpl.name}
                      </span>
                      <ArrowRight className="h-3.5 w-3.5 text-slate-400 group-hover:text-[#635BFF] group-hover:translate-x-0.5 transition-all" />
                    </div>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 line-clamp-2">
                      {tpl.description}
                    </p>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-200 dark:border-[#24293D] bg-slate-50/50 dark:bg-[#141724]/50 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={isLoading || !prompt.trim()}
            onClick={handleGenerate}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-fuchsia-600 to-[#635BFF] hover:from-fuchsia-500 hover:to-[#5249e0] text-white text-xs font-bold shadow-md transition-all disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Scaffolding Architecture...</span>
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                <span>Generate Architecture Canvas</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
