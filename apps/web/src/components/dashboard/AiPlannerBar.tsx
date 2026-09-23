'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, Button, Input, useToast } from '@nirmaanify/ui';
import { Sparkles, ArrowRight, Layers, Workflow, Cloud, Database } from 'lucide-react';
import { ProjectType, DiagramType } from '@nirmaanify/types';
import { useAuth } from '../../context/auth-context';
import { apiClient } from '../../lib/api';
import { ROUTES } from '../../lib/routes';

interface ArchitectureTemplate {
  code: string;
  label: string;
  hint: string;
  diagramType: DiagramType;
  prompt: string;
}

const TEMPLATES: ArchitectureTemplate[] = [
  {
    code: 'MICRO',
    label: 'E-Commerce Microservices',
    hint: 'Kafka · Redis · Gateway',
    diagramType: 'SYSTEM_ARCHITECTURE',
    prompt:
      'Event-driven e-commerce microservices with Kafka event streaming, Redis caching, Envoy API Gateway, and PostgreSQL sharding.',
  },
  {
    code: 'SVR',
    label: 'AWS Serverless',
    hint: 'Lambda · DynamoDB · S3',
    diagramType: 'CLOUD_INFRASTRUCTURE',
    prompt:
      'Production AWS serverless cloud architecture with Route 53, CloudFront, API Gateway, Lambda, and DynamoDB.',
  },
  {
    code: 'UML',
    label: 'Clean Architecture',
    hint: 'DDD · UseCases · Entities',
    diagramType: 'UML_CLASS',
    prompt:
      'Clean Architecture UML class diagram with Domain Entities, Use Cases, Repositories, and Infrastructure Adapters.',
  },
  {
    code: 'ERD',
    label: 'SaaS Relational ERD',
    hint: 'Users · Workspaces · Billing',
    diagramType: 'DATABASE_ERD',
    prompt:
      'Multi-tenant SaaS relational database ERD with Users, Workspaces, Memberships, Subscriptions, and Invoices.',
  },
  {
    code: 'STREAM',
    label: 'Realtime Stream Pipeline',
    hint: 'Kafka · Flink · ClickHouse',
    diagramType: 'SYSTEM_ARCHITECTURE',
    prompt:
      'High-throughput event streaming pipeline with Kafka Connect, Apache Flink processor, ClickHouse analytics, and Grafana.',
  },
  {
    code: 'SEQ',
    label: 'OAuth2 Sequence Flow',
    hint: 'Auth · Tokens · Handshake',
    diagramType: 'UML_SEQUENCE',
    prompt:
      'OAuth 2.0 Authorization Code flow with PKCE sequence diagram between User, SPA Client, Auth Server, and Resource API.',
  },
];

export const AiPlannerBar: React.FC = () => {
  const router = useRouter();
  const { toast } = useToast();
  const { activeWorkspace, refreshData } = useAuth();
  const [prompt, setPrompt] = useState('');
  const [isScaffolding, setIsScaffolding] = useState(false);

  const handleContinue = async () => {
    if (!prompt.trim()) {
      toast({
        title: 'Describe what you want to design',
        description: 'Describe an architecture or select a template to scaffold instantly.',
        type: 'info',
      });
      return;
    }
    if (!activeWorkspace) {
      toast({
        title: 'No active workspace',
        description: 'Select or create a workspace before designing an architecture.',
        type: 'error',
      });
      return;
    }

    setIsScaffolding(true);
    try {
      // 1. Create Architecture Project
      const projectName = prompt.slice(0, 35).trim().replace(/[^a-zA-Z0-9 ]/g, '') || 'Architecture Design';
      const selectedTemplate = TEMPLATES.find((t) => t.prompt === prompt);
      const diagramType = selectedTemplate?.diagramType || 'SYSTEM_ARCHITECTURE';

      const project = await apiClient.projects.createProject({
        workspaceId: activeWorkspace.id,
        name: projectName,
        type: diagramType as any,
        description: prompt.trim(),
      });

      // 2. Scaffold Diagram Canvas using AI Architect Service
      const scaffold = await apiClient.diagrams.scaffoldWithAi({
        projectId: project.id,
        prompt: prompt.trim(),
        diagramType,
      });

      // 3. Update the default diagram with AI AST
      const diagrams = await apiClient.diagrams.listProjectDiagrams(project.id);
      if (diagrams.length > 0) {
        await apiClient.diagrams.updateDiagram(diagrams[0].id, {
          name: scaffold.name || projectName,
          nodes: scaffold.nodes,
          edges: scaffold.edges,
          document: scaffold.document,
        });
      }

      await refreshData();

      toast({
        title: 'Architecture Scaffolded ✨',
        description: `Created "${projectName}". Launching Vector Canvas...`,
        type: 'success',
      });

      // 4. Navigate directly into the interactive canvas
      router.push(ROUTES.DASHBOARD.PROJECT_DETAIL(project.id));
    } catch (err: any) {
      console.error('Failed to scaffold architecture:', err);
      toast({
        title: 'Scaffolding Failed',
        description: err.message || 'Could not generate architecture.',
        type: 'error',
      });
    } finally {
      setIsScaffolding(false);
    }
  };

  const activeTemplate = TEMPLATES.find((t) => t.prompt === prompt);

  return (
    <Card className="relative overflow-hidden border-slate-200 dark:border-[#24293D] bg-white dark:bg-[#0F111A]">
      <span
        aria-hidden="true"
        className="absolute inset-y-0 left-0 w-1 bg-gradient-to-b from-fuchsia-500 to-[#635BFF]"
      />

      <div className="p-5 sm:p-6 space-y-4">
        {/* Header / Input Row */}
        <div className="flex flex-col lg:flex-row lg:items-center gap-3">
          <div className="flex items-center gap-2.5 shrink-0 lg:min-w-[280px]">
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 dark:border-[#24293D] bg-gradient-to-tr from-fuchsia-600/10 to-[#635BFF]/10 text-[#635BFF]">
              <Sparkles className="h-4 w-4" />
            </span>
            <div className="leading-tight">
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">
                AI Architecture Scaffolder
              </p>
              <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                Design system architectures & UML diagrams
              </p>
            </div>
          </div>

          <div className="flex-1 min-w-0">
            <Input
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleContinue()}
              placeholder="e.g. Event-driven e-commerce microservices with Kafka, Redis, and API Gateway"
              aria-label="Architecture description"
              disabled={isScaffolding}
            />
          </div>

          <Button
            variant="default"
            size="md"
            disabled={isScaffolding}
            onClick={handleContinue}
            rightIcon={
              isScaffolding ? (
                <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <ArrowRight className="h-4 w-4" />
              )
            }
            className="shrink-0 lg:w-auto w-full bg-gradient-to-r from-fuchsia-600 to-[#635BFF] hover:from-fuchsia-500 hover:to-[#5249e0]"
          >
            {isScaffolding ? 'Generating...' : 'Scaffold Canvas'}
          </Button>
        </div>

        {/* Divider */}
        <div className="h-px bg-slate-100 dark:bg-[#1E2337]" />

        {/* Templates Row */}
        <div className="flex flex-col gap-2.5">
          <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">
            <span>Start from an architecture boilerplate</span>
            <span className="text-slate-300 dark:text-[#3B4366]">·</span>
            <span className="font-medium normal-case tracking-normal text-slate-500 dark:text-slate-400">
              Click a template to load blueprint
            </span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
            {TEMPLATES.map((tpl) => {
              const isActive = activeTemplate?.code === tpl.code;
              return (
                <button
                  key={tpl.code}
                  type="button"
                  onClick={() => setPrompt(tpl.prompt)}
                  className={[
                    'group flex flex-col items-start gap-1 rounded-lg border p-2.5 text-left transition-colors',
                    isActive
                      ? 'border-[#635BFF] bg-[#635BFF]/5 ring-1 ring-[#635BFF]'
                      : 'border-slate-200 dark:border-[#24293D] bg-slate-50 dark:bg-[#141724] hover:border-slate-300 dark:hover:border-[#3B4366] hover:bg-white dark:hover:bg-[#1E2337]',
                  ].join(' ')}
                >
                  <span className="font-mono text-[10px] font-bold tracking-[0.18em] text-[#635BFF]">
                    {tpl.code}
                  </span>
                  <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 leading-tight">
                    {tpl.label}
                  </span>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 leading-tight">
                    {tpl.hint}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </Card>
  );
};
