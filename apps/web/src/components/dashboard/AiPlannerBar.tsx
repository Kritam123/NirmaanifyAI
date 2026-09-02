'use client';

import React, { useState } from 'react';
import { Card, Button, Input, useToast } from '@nirmaanify/ui';
import { Layers, ArrowRight } from 'lucide-react';
import { ProjectType } from '@nirmaanify/types';
import { useAuth } from '../../context/auth-context';
import { AiPlannerModal } from './AiPlannerModal';

interface ScaffoldTemplate {
  code: string;
  label: string;
  hint: string;
  preferredType: ProjectType;
  prompt: string;
}

const TEMPLATES: ScaffoldTemplate[] = [
  {
    code: 'ECOM',
    label: 'Clothing boutique',
    hint: 'Catalog · Stripe · Orders',
    preferredType: 'ECOMMERCE',
    prompt:
      'Online clothing boutique with Next.js 15, Stripe checkout, variant selector, and order history.',
  },
  {
    code: 'SAAS',
    label: 'AI video studio',
    hint: 'Multi-tenant · Stripe · Workers',
    preferredType: 'SAAS',
    prompt:
      'Generative AI video studio platform with subscription tiers, BullMQ workers, and credit metering.',
  },
  {
    code: 'BLOG',
    label: 'Engineering journal',
    hint: 'MDX · Syntax · Newsletter',
    preferredType: 'BLOG',
    prompt:
      'Engineering blog with MDX, syntax highlighting, author profiles, and newsletter capture.',
  },
  {
    code: 'DASH',
    label: 'Analytics hub',
    hint: 'Recharts · TanStack · CSV',
    preferredType: 'DASHBOARD',
    prompt:
      'Executive KPI dashboard with Recharts, date filters, TanStack table, and CSV export.',
  },
  {
    code: 'PORT',
    label: 'Agency portfolio',
    hint: 'Case studies · MDX · Leads',
    preferredType: 'PORTFOLIO',
    prompt:
      'Agency portfolio with case studies, MDX content, image galleries, and project intake form.',
  },
  {
    code: 'SITE',
    label: 'Marketing landing',
    hint: 'Hero · Pricing · Lead form',
    preferredType: 'WEBSITE',
    prompt:
      'High-conversion marketing landing page with hero, feature sections, pricing cards, and lead capture.',
  },
];

export const AiPlannerBar: React.FC = () => {
  const { toast } = useToast();
  const { activeWorkspace } = useAuth();
  const [prompt, setPrompt] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleContinue = () => {
    if (!prompt.trim()) {
      toast({
        title: 'Describe what you want to build',
        description: 'A short sentence is enough — the planner handles the rest.',
        type: 'info',
      });
      return;
    }
    if (!activeWorkspace) {
      toast({
        title: 'No active workspace',
        description: 'Create or select a workspace before scaffolding a project.',
        type: 'error',
      });
      return;
    }
    setIsModalOpen(true);
  };

  const activeTemplate = TEMPLATES.find((t) => t.prompt === prompt);

  return (
    <>
      <Card className="relative overflow-hidden border-slate-200 dark:border-[#24293D] bg-white dark:bg-[#0F111A]">
        <span
          aria-hidden="true"
          className="absolute inset-y-0 left-0 w-1 bg-[#635BFF]"
        />

        <div className="p-5 sm:p-6 space-y-4">
          {/* Header / Input Row */}
          <div className="flex flex-col lg:flex-row lg:items-center gap-3">
            <div className="flex items-center gap-2.5 shrink-0 lg:min-w-[260px]">
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 dark:border-[#24293D] bg-slate-50 dark:bg-[#141724] text-[#635BFF]">
                <Layers className="h-4 w-4" />
              </span>
              <div className="leading-tight">
                <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">
                  Project scaffolder
                </p>
                <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                  Scaffold a new full-stack application
                </p>
              </div>
            </div>

            <div className="flex-1 min-w-0">
              <Input
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleContinue()}
                placeholder="e.g. AI-powered newsletter SaaS with Next.js 15, NestJS, and Stripe billing"
                aria-label="Project description"
              />
            </div>

            <Button
              variant="default"
              size="md"
              onClick={handleContinue}
              rightIcon={<ArrowRight className="h-4 w-4" />}
              className="shrink-0 lg:w-auto w-full"
            >
              Continue
            </Button>
          </div>

          {/* Divider */}
          <div className="h-px bg-slate-100 dark:bg-[#1E2337]" />

          {/* Templates Row */}
          <div className="flex flex-col gap-2.5">
            <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">
              <span>Start from a template</span>
              <span className="text-slate-300 dark:text-[#3B4366]">·</span>
              <span className="font-medium normal-case tracking-normal text-slate-500 dark:text-slate-400">
                Click a tile to prefill the description
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
                        ? 'border-[#635BFF] bg-[#635BFF]/5'
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

      <AiPlannerModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        initialPrompt={prompt}
        initialPreferredType={activeTemplate?.preferredType}
      />
    </>
  );
};
