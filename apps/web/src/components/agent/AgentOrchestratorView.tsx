'use client';

import React, { useState } from 'react';
import {
  Card,
  Badge,
  Button,
  useToast,
} from '@nirmaanify/ui';
import {
  Sparkles,
  Layers,
  Database,
  Server,
  LayoutGrid,
  Package,
  Puzzle,
  Palette,
  CheckCircle2,
  Clock,
  AlertCircle,
  Cpu,
  ChevronDown,
  ChevronRight,
  Info,
  ShieldCheck,
} from 'lucide-react';
import {
  SpecializedAgentType,
  OrchestrationTask,
  AgentOrchestrationRunDto,
  AgentMemoryContext,
} from '@nirmaanify/types';

interface AgentOrchestratorViewProps {
  activeRun: AgentOrchestrationRunDto | null;
  onApproveTask?: (taskId: string) => void;
}

const AGENT_META: Record<
  SpecializedAgentType,
  { name: string; role: string; icon: React.ReactNode; color: string }
> = {
  ORCHESTRATOR: {
    name: 'Master Orchestrator',
    role: 'Coordinator & Task Router',
    icon: <Cpu className="h-3.5 w-3.5" />,
    color: 'text-[#635BFF]',
  },
  PROJECT_PLANNER: {
    name: 'Planner Agent',
    role: 'Architecture & Sitemap',
    icon: <Layers className="h-3.5 w-3.5" />,
    color: 'text-blue-500',
  },
  DATABASE_AGENT: {
    name: 'Database Agent',
    role: 'Prisma Models & PostgreSQL',
    icon: <Database className="h-3.5 w-3.5" />,
    color: 'text-emerald-500',
  },
  BACKEND_AGENT: {
    name: 'Backend Agent',
    role: 'NestJS REST APIs',
    icon: <Server className="h-3.5 w-3.5" />,
    color: 'text-amber-500',
  },
  CMS_AGENT: {
    name: 'CMS Agent',
    role: 'Headless Content Schemas',
    icon: <LayoutGrid className="h-3.5 w-3.5" />,
    color: 'text-cyan-500',
  },
  PACKAGE_AGENT: {
    name: 'Package Agent',
    role: 'NPM Compatibility & Providers',
    icon: <Package className="h-3.5 w-3.5" />,
    color: 'text-violet-500',
  },
  PLUGIN_AGENT: {
    name: 'Plugin Agent',
    role: 'Third-Party SDKs & Secrets',
    icon: <Puzzle className="h-3.5 w-3.5" />,
    color: 'text-rose-500',
  },
  UI_AGENT: {
    name: 'UI Agent',
    role: 'Next.js 15 & React 19',
    icon: <Palette className="h-3.5 w-3.5" />,
    color: 'text-indigo-400',
  },
};

export const AgentOrchestratorView: React.FC<AgentOrchestratorViewProps> = ({
  activeRun,
  onApproveTask,
}) => {
  const [showMemory, setShowMemory] = useState(false);
  const [expandedTasks, setExpandedTasks] = useState<Record<string, boolean>>({});

  if (!activeRun) {
    return null;
  }

  const toggleTask = (taskId: string) => {
    setExpandedTasks((prev) => ({ ...prev, [taskId]: !prev[taskId] }));
  };

  const plan = activeRun.plan || [];
  const memory = activeRun.contextSnapshot as AgentMemoryContext;

  return (
    <div className="p-4 space-y-4 bg-slate-50 dark:bg-[#121522] border-b border-slate-200 dark:border-[#24293D]">
      {/* Top Header: Orchestration Status & Memory Toggle */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="h-6 w-6 rounded-lg bg-[#635BFF] flex items-center justify-center text-white shadow-sm shadow-[#635BFF]/30">
            <Cpu className="h-3.5 w-3.5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
              <span>Multi-Agent Orchestrator</span>
              <Badge
                variant={
                  activeRun.status === 'COMPLETED'
                    ? 'cyan'
                    : activeRun.status === 'FAILED'
                    ? 'destructive'
                    : 'indigo'
                }
                size="sm"
                className="text-[9px]"
              >
                {activeRun.status}
              </Badge>
            </h4>
          </div>
        </div>

        <button
          onClick={() => setShowMemory(!showMemory)}
          className="text-[11px] font-semibold text-[#635BFF] hover:underline flex items-center gap-1"
        >
          <Info className="h-3 w-3" />
          <span>{showMemory ? 'Hide Context' : 'Inspect 6-Layer Memory'}</span>
        </button>
      </div>

      {/* 6-Layer Memory Inspector Panel */}
      {showMemory && memory && (
        <Card className="p-3 text-[11px] space-y-2 bg-white dark:bg-[#161926] border-slate-200 dark:border-[#24293D]">
          <h5 className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
            <span>Active 6-Layer Memory Snapshot</span>
          </h5>
          <div className="grid grid-cols-2 gap-2 text-slate-500 dark:text-slate-400">
            <div>
              <span className="font-semibold text-slate-700 dark:text-slate-300">Project:</span>{' '}
              {memory.project?.name} ({memory.project?.serverType})
            </div>
            <div>
              <span className="font-semibold text-slate-700 dark:text-slate-300">Framework:</span>{' '}
              {memory.project?.framework}
            </div>
            <div>
              <span className="font-semibold text-slate-700 dark:text-slate-300">UI Library:</span>{' '}
              {memory.designContext?.uiFramework}
            </div>
            <div>
              <span className="font-semibold text-slate-700 dark:text-slate-300">Animation:</span>{' '}
              {memory.designContext?.animationEngine}
            </div>
            <div>
              <span className="font-semibold text-slate-700 dark:text-slate-300">Form Engine:</span>{' '}
              {memory.designContext?.formEngine}
            </div>
            <div>
              <span className="font-semibold text-slate-700 dark:text-slate-300">Routes:</span>{' '}
              {memory.architecture?.routes?.join(', ')}
            </div>
          </div>
        </Card>
      )}

      {/* Specialized Agent Roster Horizontal Bar */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
        {Object.entries(AGENT_META).map(([key, meta]) => {
          const isCurrent = activeRun.currentAgent === key;
          const isExecuted = plan.some((t) => t.agent === key && t.status === 'COMPLETED');

          return (
            <div
              key={key}
              className={`py-1 px-2.5 rounded-lg border text-[10px] font-semibold flex items-center gap-1.5 whitespace-nowrap transition-all ${
                isCurrent
                  ? 'border-[#635BFF] bg-[#635BFF]/10 text-[#635BFF]'
                  : isExecuted
                  ? 'border-emerald-500/30 bg-emerald-500/5 text-emerald-600 dark:text-emerald-400'
                  : 'border-slate-200 dark:border-[#24293D] text-slate-400 opacity-60'
              }`}
            >
              <span className={meta.color}>{meta.icon}</span>
              <span>{meta.name}</span>
              {isExecuted && <CheckCircle2 className="h-2.5 w-2.5 text-emerald-500" />}
            </div>
          );
        })}
      </div>

      {/* Task DAG List */}
      <div className="space-y-1.5">
        {plan.map((task, idx) => {
          const meta = AGENT_META[task.agent] || AGENT_META.ORCHESTRATOR;
          const isExpanded = !!expandedTasks[task.id];

          return (
            <div
              key={task.id}
              className="p-2.5 rounded-xl border border-slate-200 dark:border-[#24293D] bg-white dark:bg-[#161926] space-y-1.5 text-xs"
            >
              <div
                className="flex items-center justify-between cursor-pointer"
                onClick={() => toggleTask(task.id)}
              >
                <div className="flex items-center gap-2">
                  <span className="text-slate-400 font-mono text-[10px]">#{idx + 1}</span>
                  <span className={meta.color}>{meta.icon}</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">{task.title}</span>
                </div>

                <div className="flex items-center gap-2">
                  <Badge
                    variant={
                      task.status === 'COMPLETED'
                        ? 'cyan'
                        : task.status === 'IN_PROGRESS'
                        ? 'indigo'
                        : task.status === 'FAILED'
                        ? 'destructive'
                        : 'secondary'
                    }
                    size="sm"
                    className="text-[9px]"
                  >
                    {task.status}
                  </Badge>
                  {isExpanded ? (
                    <ChevronDown className="h-3 w-3 text-slate-400" />
                  ) : (
                    <ChevronRight className="h-3 w-3 text-slate-400" />
                  )}
                </div>
              </div>

              {isExpanded && (
                <div className="pt-2 border-t border-slate-100 dark:border-[#1E2337] space-y-1.5 text-[11px] text-slate-500">
                  <p>{task.description}</p>
                  {task.outputSummary && (
                    <p className="font-semibold text-emerald-500">
                      Result: {task.outputSummary}
                    </p>
                  )}
                  {task.affectedFiles && task.affectedFiles.length > 0 && (
                    <div className="flex items-center gap-1.5 flex-wrap pt-1 font-mono text-[10px]">
                      <span className="text-slate-400 font-sans">Files:</span>
                      {task.affectedFiles.map((f) => (
                        <Badge key={f} variant="secondary" size="sm" className="font-mono">
                          {f}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
