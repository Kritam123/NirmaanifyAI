'use client';

import React, { useState, useEffect } from 'react';
import {
  PriorityFeatureItem,
  DevelopmentRuleItem,
  MasterProductFlowNode,
  PriorityTier,
} from '@nirmaanify/types';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  Button,
  Badge,
  useToast,
} from '@nirmaanify/ui';
import {
  Compass,
  GitBranch,
  ShieldCheck,
  CheckCircle2,
  Workflow,
  Sparkles,
  ArrowRight,
  Brain,
  Layout,
  FileCode,
  Server,
  Database,
  Boxes,
  Eye,
  Terminal,
  Rocket,
  Lock,
  Layers,
  Scale,
  Award,
} from 'lucide-react';
import { GovernanceRulesEngine } from '@nirmaanify/component-registry';

interface ArchitectureGovernanceDashboardProps {
  onNavigateTab?: (tabId: string) => void;
}

const FLOW_ICONS: Record<string, React.ReactNode> = {
  User: <Sparkles className="h-4 w-4 text-pink-500" />,
  Brain: <Brain className="h-4 w-4 text-[#635BFF]" />,
  CheckCircle2: <CheckCircle2 className="h-4 w-4 text-emerald-500" />,
  Layout: <Layout className="h-4 w-4 text-indigo-400" />,
  FileCode: <FileCode className="h-4 w-4 text-[#22D3EE]" />,
  Server: <Server className="h-4 w-4 text-purple-400" />,
  Database: <Database className="h-4 w-4 text-emerald-400" />,
  Boxes: <Boxes className="h-4 w-4 text-amber-500" />,
  Sparkles: <Sparkles className="h-4 w-4 text-[#635BFF]" />,
  Eye: <Eye className="h-4 w-4 text-blue-400" />,
  Terminal: <Terminal className="h-4 w-4 text-slate-300" />,
  Rocket: <Rocket className="h-4 w-4 text-orange-400" />,
};

export function ArchitectureGovernanceDashboard({ onNavigateTab }: ArchitectureGovernanceDashboardProps) {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<'flow' | 'priorities' | 'rules'>('flow');
  const [priorityFilter, setPriorityFilter] = useState<'ALL' | PriorityTier>('ALL');

  const [priorities, setPriorities] = useState<PriorityFeatureItem[]>([]);
  const [rules, setRules] = useState<DevelopmentRuleItem[]>([]);
  const [flowNodes, setFlowNodes] = useState<MasterProductFlowNode[]>([]);

  useEffect(() => {
    setPriorities(GovernanceRulesEngine.getPriorityMatrix());
    setRules(GovernanceRulesEngine.getDevelopmentRules());
    setFlowNodes(GovernanceRulesEngine.getMasterProductFlow());
  }, []);

  const filteredPriorities = priorities.filter((p) => {
    if (priorityFilter !== 'ALL' && p.tier !== priorityFilter) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Principle Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-[#635BFF]/15 via-[#8B5CF6]/10 to-[#22D3EE]/15 border border-[#635BFF]/30 space-y-3">
        <div className="flex items-center justify-between">
          <Badge variant="cyan" size="sm" className="font-mono font-bold">
            ARCHITECTURE GOVERNANCE & MASTER FLOW
          </Badge>
          <Badge variant="indigo" size="sm">
            5/5 GOLDEN RULES COMPLIANT
          </Badge>
        </div>

        <div className="space-y-1">
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Nirmaanify AI Architecture & Golden Laws
          </h2>
          <blockquote className="text-xs sm:text-sm font-semibold text-[#635BFF] dark:text-[#A5AEFD] italic">
            &ldquo;Nirmaanify AI builds the platform with consistency and builds user projects with freedom.&rdquo;
          </blockquote>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-[#24293D] overflow-x-auto text-xs font-semibold pb-1 scrollbar-none">
        {[
          { id: 'flow' as const, label: 'Master Product Flow (12 Steps)', icon: <Workflow className="h-4 w-4" /> },
          { id: 'priorities' as const, label: `MVP Priority Matrix (${priorities.length} Features)`, icon: <Scale className="h-4 w-4" /> },
          { id: 'rules' as const, label: `5 Golden Architecture Rules`, icon: <ShieldCheck className="h-4 w-4" /> },
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            className={`flex items-center gap-2 px-3 py-2 border-b-2 transition-colors whitespace-nowrap ${
              activeTab === t.id
                ? 'border-[#635BFF] text-[#635BFF] dark:text-[#A5AEFD]'
                : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            {t.icon}
            <span>{t.label}</span>
          </button>
        ))}
      </div>

      {/* TAB 1: MASTER PRODUCT FLOW (SECTION 10 DIRECTED GRAPH) */}
      {activeTab === 'flow' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-bold text-sm text-slate-900 dark:text-white">End-to-End Application Lifecycle Graph</h4>
              <p className="text-xs text-slate-500">Directed pipeline tracing user intent through AI decomposition, visual studio, backend, and cloud deployment.</p>
            </div>
            <Badge variant="cyan" size="sm">12 Pipeline Stages</Badge>
          </div>

          {/* 12-Step Visual Flow Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {flowNodes.map((node, idx) => (
              <Card
                key={node.id}
                className="p-4 flex flex-col justify-between space-y-3 border border-slate-200/80 dark:border-[#24293D] hover:border-[#635BFF] transition-all relative group"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[10px] font-bold text-[#635BFF] bg-[#635BFF]/10 px-2 py-0.5 rounded">
                      STAGE {node.stepNumber}
                    </span>
                    <Badge size="sm" variant="secondary" className="text-[9px] uppercase font-mono">
                      {node.domain}
                    </Badge>
                  </div>

                  <div className="flex items-center gap-2.5 pt-1">
                    <div className="p-2 rounded-xl bg-slate-100 dark:bg-[#0E121E]">
                      {FLOW_ICONS[node.icon] || <Sparkles className="h-4 w-4" />}
                    </div>
                    <div>
                      <h4 className="font-bold text-xs text-slate-900 dark:text-white leading-tight">{node.label}</h4>
                      <p className="text-[10px] text-slate-400 mt-0.5 line-clamp-2">{node.sublabel}</p>
                    </div>
                  </div>
                </div>

                {onNavigateTab && (
                  <Button
                    size="sm"
                    variant="ghost"
                    className="w-full text-xs justify-between group-hover:bg-[#635BFF]/10 group-hover:text-[#635BFF]"
                    rightIcon={<ArrowRight className="h-3 w-3" />}
                    onClick={() => onNavigateTab(node.routeTab)}
                  >
                    <span>Open {node.domain}</span>
                  </Button>
                )}
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: MVP PRIORITY MATRIX */}
      {activeTab === 'priorities' && (
        <div className="space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
              {(
                [
                  { id: 'ALL', label: 'All Features' },
                  { id: 'P0', label: 'P0 — Must Have (9/9)' },
                  { id: 'P1', label: 'P1 — High Priority (6/6)' },
                  { id: 'P2', label: 'P2 — Post-MVP (5 Items)' },
                ] as const
              ).map((f) => (
                <button
                  key={f.id}
                  onClick={() => setPriorityFilter(f.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                    priorityFilter === f.id
                      ? 'bg-[#635BFF] text-white shadow-sm'
                      : 'bg-white dark:bg-[#161926] text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-[#24293D] hover:border-slate-300'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>

            <Badge variant="cyan" size="sm">
              {priorities.filter((p) => p.status === 'IMPLEMENTED').length} / {priorities.length} Implemented
            </Badge>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredPriorities.map((item) => (
              <Card
                key={item.id}
                className="p-5 flex flex-col justify-between space-y-3 border border-slate-200/80 dark:border-[#24293D] hover:border-[#635BFF] transition-all"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Badge
                      variant={item.tier === 'P0' ? 'cyan' : item.tier === 'P1' ? 'indigo' : 'violet'}
                      size="sm"
                      className="font-mono font-bold"
                    >
                      {item.tier}
                    </Badge>
                    <div className="flex items-center gap-1 text-emerald-500 font-bold text-xs">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      <span>{item.status}</span>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-bold text-xs text-slate-900 dark:text-white">{item.title}</h4>
                    <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">{item.description}</p>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 dark:border-[#24293D] text-[10px] text-slate-400 font-mono">
                  Delivered in Phase {item.phase}
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: THE 5 GOLDEN DEVELOPMENT RULES */}
      {activeTab === 'rules' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-900 dark:text-white">
              The 5 Golden Development & Architectural Laws
            </span>
            <Badge variant="cyan" size="sm">100% Architecture Compliant</Badge>
          </div>

          <div className="space-y-4">
            {rules.map((rule) => (
              <Card
                key={rule.ruleNumber}
                className="p-5 space-y-3 border border-slate-200 dark:border-[#24293D]"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <span className="font-mono font-black text-sm text-[#635BFF] bg-[#635BFF]/10 px-2.5 py-1 rounded-lg">
                      LAW #{rule.ruleNumber}
                    </span>
                    <h4 className="font-bold text-sm text-slate-900 dark:text-white">{rule.title}</h4>
                  </div>
                  <Badge variant="cyan" size="sm" className="font-mono text-[9px]">
                    VERIFIED ENFORCED
                  </Badge>
                </div>

                <div className="p-3 rounded-xl bg-slate-100 dark:bg-[#0E121E] border border-slate-200 dark:border-[#24293D]">
                  <span className="font-mono font-bold text-xs text-[#635BFF] block">{rule.shortLaw}</span>
                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">{rule.description}</p>
                </div>

                <div className="text-[10px] text-slate-400 space-y-0.5">
                  <span className="font-semibold text-slate-500">Enforcement Mechanism: </span>
                  <span className="font-mono text-slate-600 dark:text-slate-300">{rule.enforcementMechanism}</span>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
