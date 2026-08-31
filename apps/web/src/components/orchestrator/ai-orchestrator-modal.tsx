'use client';

import React, { useState, useEffect } from 'react';
import {
  ProjectDto,
  AgentPlanExecution,
  AgentTaskStep,
  AiAgentMemoryStack,
  DesignContextMode,
  SpecializedAgentRole,
} from '@nirmaanify/types';
import {
  Dialog,
  Button,
  Badge,
  useToast,
} from '@nirmaanify/ui';
import {
  Sparkles,
  Bot,
  Brain,
  Layers,
  Database,
  Server,
  FileCode,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Play,
  RotateCcw,
  Check,
  X,
  Palette,
  Shield,
  Puzzle,
  Boxes,
  ArrowRight,
} from 'lucide-react';

import { orchestratorApi } from '../../core/api';

interface AiOrchestratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: ProjectDto;
  initialPrompt?: string;
  onPlanApplied?: () => void;
}

const AGENT_ROLE_ICONS: Record<SpecializedAgentRole, React.ReactNode> = {
  planner: <Brain className="h-4 w-4 text-[#635BFF]" />,
  db_architect: <Database className="h-4 w-4 text-emerald-500" />,
  backend_engineer: <Server className="h-4 w-4 text-[#8B5CF6]" />,
  cms_specialist: <FileCode className="h-4 w-4 text-[#22D3EE]" />,
  package_librarian: <Boxes className="h-4 w-4 text-amber-500" />,
  ui_designer: <Palette className="h-4 w-4 text-pink-500" />,
  plugin_integrator: <Puzzle className="h-4 w-4 text-indigo-400" />,
};

const SUGGESTED_PROMPTS = [
  'Build a fullstack e-commerce clothing store with Stripe checkout and product catalog',
  'Create a tech blog with markdown articles, category filters, and author profiles',
  'Scaffold a SaaS analytics dashboard with metric charts and user role management',
];

export function AiOrchestratorModal({
  isOpen,
  onClose,
  project,
  initialPrompt = '',
  onPlanApplied,
}: AiOrchestratorModalProps) {
  const { toast } = useToast();
  const [prompt, setPrompt] = useState(initialPrompt);
  const [designMode, setDesignMode] = useState<DesignContextMode>('platform');
  const [activePlan, setActivePlan] = useState<AgentPlanExecution | null>(null);
  const [isPlanning, setIsPlanning] = useState(false);
  const [isExecutingStep, setIsExecutingStep] = useState(false);
  const [memoryStack, setMemoryStack] = useState<AiAgentMemoryStack | null>(null);

  useEffect(() => {
    if (isOpen) {
      if (initialPrompt) setPrompt(initialPrompt);
      fetchMemoryStack();
    }
  }, [isOpen, initialPrompt, designMode]);

  const fetchMemoryStack = async () => {
    try {
      const data = await orchestratorApi.getMemory(project.id, designMode);
      if (data) setMemoryStack(data);
    } catch {
      // ignore
    }
  };

  const handleStartPlanning = async () => {
    if (!prompt.trim()) {
      toast({ title: 'Validation Error', description: 'Please enter instructions for the AI Orchestrator.', type: 'error' });
      return;
    }

    setIsPlanning(true);
    try {
      const plan = await orchestratorApi.plan(project.id, prompt, designMode);
      if (plan) {
        setActivePlan(plan);
        toast({
          title: 'Multi-Agent Plan Dispatched! 🚀',
          description: `Orchestrator created ${plan.steps.length} specialized agent tasks.`,
          type: 'success',
        });
      }
    } catch (err: any) {
      toast({ title: 'Planning Failed', description: err.message || 'Could not decompose plan.', type: 'error' });
    } finally {
      setIsPlanning(false);
    }
  };

  const handleExecuteStep = async (stepId: string) => {
    if (!activePlan) return;
    setIsExecutingStep(true);
    try {
      const updated = await orchestratorApi.executeStep(project.id, activePlan.id, stepId);
      if (updated) setActivePlan(updated);
    } catch {
      toast({ title: 'Execution Error', description: 'Could not run step simulation.', type: 'error' });
    } finally {
      setIsExecutingStep(false);
    }
  };

  const handleApproveStep = async (stepId: string) => {
    if (!activePlan) return;
    try {
      const updated = await orchestratorApi.approveStep(project.id, activePlan.id, stepId);
      if (updated) {
        setActivePlan(updated);
        toast({ title: 'Proposal Approved', description: 'AST modification applied to project.', type: 'success' });
      }
    } catch {
      toast({ title: 'Error', description: 'Could not approve step.', type: 'error' });
    }
  };

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title="Multi-Agent AI Orchestration Console"
      description="Autonomous multi-agent DAG task decomposition, specialized role dispatch, and multi-tier memory stack."
      className="max-w-4xl"
      footer={
        <div className="w-full flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <Bot className="h-4 w-4 text-[#635BFF]" />
            <span>7 Specialized Agents Connected</span>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
            {activePlan?.status === 'COMPLETED' && (
              <Button
                variant="default"
                onClick={() => {
                  onClose();
                  if (onPlanApplied) onPlanApplied();
                }}
              >
                Apply All Changes & Return to Studio
              </Button>
            )}
          </div>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Top Section: Prompt Input & Design Context Mode */}
        <div className="space-y-3 p-4 rounded-xl bg-slate-100 dark:bg-[#161926] border border-slate-200 dark:border-[#24293D]">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-[#635BFF]" />
              <span className="font-bold text-xs text-slate-900 dark:text-white">Orchestrator Directive</span>
            </div>

            {/* Design Context Mode Selector (Week 33) */}
            <div className="flex items-center gap-1.5 bg-white dark:bg-[#0E121E] p-1 rounded-lg border border-slate-200 dark:border-[#24293D]">
              <span className="text-[10px] font-semibold text-slate-400 px-1.5">Design Context:</span>
              <button
                type="button"
                onClick={() => setDesignMode('platform')}
                className={`px-2 py-0.5 rounded text-[10px] font-bold transition-all ${
                  designMode === 'platform'
                    ? 'bg-[#635BFF] text-white shadow-sm'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                Platform (Nirmaanify UI)
              </button>
              <button
                type="button"
                onClick={() => setDesignMode('project')}
                className={`px-2 py-0.5 rounded text-[10px] font-bold transition-all ${
                  designMode === 'project'
                    ? 'bg-[#635BFF] text-white shadow-sm'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                Project Theme
              </button>
            </div>
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Describe full application requirements (e.g. Build an e-commerce catalog with Stripe payments)..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="flex-1 px-3 py-2 text-xs rounded-xl bg-white dark:bg-[#0E121E] border border-slate-200 dark:border-[#24293D] focus:outline-none focus:ring-1 focus:ring-[#635BFF]"
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleStartPlanning();
              }}
            />
            <Button
              variant="default"
              isLoading={isPlanning}
              leftIcon={<Brain className="h-4 w-4" />}
              onClick={handleStartPlanning}
            >
              Orchestrate Plan
            </Button>
          </div>

          {/* Prompt Suggestions */}
          {!activePlan && (
            <div className="flex flex-wrap gap-1.5 pt-1">
              {SUGGESTED_PROMPTS.map((pText) => (
                <button
                  key={pText}
                  type="button"
                  onClick={() => setPrompt(pText)}
                  className="px-2.5 py-1 rounded-lg text-[10px] bg-white dark:bg-[#0E121E] border border-slate-200 dark:border-[#24293D] text-slate-600 dark:text-slate-400 hover:border-[#635BFF] transition-colors"
                >
                  {pText}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Multi-Tier Memory Stack Inspector (Week 33) */}
        {memoryStack && (
          <div className="space-y-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Brain className="h-3.5 w-3.5 text-[#635BFF]" />
              Active Multi-Tier Memory Stack
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[10px]">
              <div className="p-2 rounded-lg bg-white dark:bg-[#161926] border border-slate-200 dark:border-[#24293D]">
                <span className="text-slate-400 block font-semibold">Design Mode</span>
                <span className="font-bold text-[#635BFF]">{memoryStack.designContext.mode.toUpperCase()}</span>
              </div>
              <div className="p-2 rounded-lg bg-white dark:bg-[#161926] border border-slate-200 dark:border-[#24293D]">
                <span className="text-slate-400 block font-semibold">Architecture</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">NestJS 11 + PG</span>
              </div>
              <div className="p-2 rounded-lg bg-white dark:bg-[#161926] border border-slate-200 dark:border-[#24293D]">
                <span className="text-slate-400 block font-semibold">DB Models</span>
                <span className="font-bold text-emerald-500">{memoryStack.databaseContext.modelCount} Tables</span>
              </div>
              <div className="p-2 rounded-lg bg-white dark:bg-[#161926] border border-slate-200 dark:border-[#24293D]">
                <span className="text-slate-400 block font-semibold">Backend APIs</span>
                <span className="font-bold text-purple-400">{memoryStack.backendContext.endpointCount} Endpoints</span>
              </div>
            </div>
          </div>
        )}

        {/* Multi-Agent Stepper (Week 32) */}
        {activePlan && (
          <div className="space-y-3 pt-2 border-t border-slate-200 dark:border-[#24293D]">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-bold text-xs text-slate-900 dark:text-white">
                  Multi-Agent Execution Pipeline ({activePlan.steps.length} Steps)
                </h4>
                <p className="text-[11px] text-slate-400">Specialized agents working concurrently to fulfill directive.</p>
              </div>
              <Badge
                size="sm"
                variant={
                  activePlan.status === 'COMPLETED'
                    ? 'cyan'
                    : activePlan.status === 'WAITING_USER'
                    ? 'indigo'
                    : 'secondary'
                }
              >
                Pipeline: {activePlan.status}
              </Badge>
            </div>

            <div className="space-y-3">
              {activePlan.steps.map((step, idx) => {
                const icon = AGENT_ROLE_ICONS[step.agentRole] || <Bot className="h-4 w-4" />;
                const isWaitingApproval = step.status === 'WAITING_APPROVAL';

                return (
                  <div
                    key={step.id}
                    className={`p-4 rounded-xl border transition-all ${
                      isWaitingApproval
                        ? 'border-[#635BFF] bg-[#635BFF]/5 shadow-sm'
                        : step.status === 'COMPLETED'
                        ? 'border-emerald-500/30 bg-emerald-500/5'
                        : 'border-slate-200 dark:border-[#24293D] bg-white dark:bg-[#161926]'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-3">
                        <div className="p-2 rounded-xl bg-slate-100 dark:bg-[#0E121E] shrink-0 mt-0.5">
                          {icon}
                        </div>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-xs text-slate-900 dark:text-white">{step.title}</span>
                            <Badge size="sm" variant="secondary" className="font-mono text-[9px]">
                              {step.agentName}
                            </Badge>
                            <Badge
                              size="sm"
                              variant={
                                step.status === 'COMPLETED'
                                  ? 'cyan'
                                  : step.status === 'WAITING_APPROVAL'
                                  ? 'indigo'
                                  : 'secondary'
                              }
                              className="text-[9px]"
                            >
                              {step.status}
                            </Badge>
                          </div>
                          <p className="text-[11px] text-slate-500 leading-relaxed">{step.description}</p>
                          {step.outputSummary && (
                            <p className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 pt-1">
                              ✓ {step.outputSummary}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Step Actions */}
                      <div className="shrink-0">
                        {step.status === 'QUEUED' || step.status === 'RUNNING' ? (
                          <Button
                            size="sm"
                            variant="default"
                            isLoading={isExecutingStep}
                            leftIcon={<Play className="h-3 w-3" />}
                            onClick={() => handleExecuteStep(step.id)}
                          >
                            Run Agent
                          </Button>
                        ) : null}
                      </div>
                    </div>

                    {/* Proposal & Approval Checkpoint */}
                    {isWaitingApproval && step.generatedChanges && (
                      <div className="mt-3 p-3 rounded-lg bg-white dark:bg-[#0E121E] border border-[#635BFF]/30 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold text-[#635BFF] uppercase tracking-wider">
                            AST Change Proposal ({step.generatedChanges.target})
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono">Requires Approval</span>
                        </div>
                        <p className="text-[11px] text-slate-600 dark:text-slate-300 font-medium">
                          {step.generatedChanges.diffDescription}
                        </p>
                        <div className="flex justify-end gap-2 pt-1">
                          <Button
                            size="sm"
                            variant="default"
                            leftIcon={<Check className="h-3 w-3" />}
                            onClick={() => handleApproveStep(step.id)}
                          >
                            Approve Proposal
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </Dialog>
  );
}
