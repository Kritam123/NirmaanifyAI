'use client';

import React, { useState } from 'react';
import { Card, Button, useToast } from '@nirmaanify/ui';
import { Sparkles, Zap } from 'lucide-react';
import { useAuth } from '../../context/auth-context';

export const AiPlannerBar: React.FC = () => {
  const { toast } = useToast();
  const { createProject } = useAuth();
  const [aiPrompt, setAiPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const templates = [
    'Next.js 15 Luxury Fashion Store',
    'AI Video Generator SaaS Platform',
    'High-Performance Developer Docs & Tech Journal',
    'Real-time Multi-tenant Analytics Dashboard',
  ];

  const handleAiGenerate = async () => {
    if (!aiPrompt.trim()) return;
    setIsGenerating(true);

    toast({
      title: 'AI Architect Activated',
      description: `Analyzing: "${aiPrompt.slice(0, 45)}..."`,
      type: 'info',
    });

    setTimeout(async () => {
      try {
        await createProject({
          name:
            aiPrompt
              .split(' ')
              .slice(0, 3)
              .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
              .join(' ') + ' App',
          description: aiPrompt,
          type: 'SAAS',
          isBackendEnabled: true,
          framework: 'Next.js 15 App Router',
          uiLibrary: 'shadcn/ui + Tailwind CSS',
        });
        setAiPrompt('');
        toast({
          title: 'Full-Stack Project Scaffolded!',
          description: 'Next.js 15 App Router & NestJS backend generator ready.',
          type: 'success',
        });
      } catch {
        // Handled
      } finally {
        setIsGenerating(false);
      }
    }, 1000);
  };

  return (
    <Card className="p-2 bg-gradient-to-r from-[#635BFF]/10 via-[#8B5CF6]/10 to-[#22D3EE]/10 border-[#635BFF]/30 shadow-lg shadow-[#635BFF]/5">
      <div className="flex flex-col sm:flex-row items-center gap-2 p-2">
        <div className="flex items-center gap-2 px-3 py-1.5 text-xs font-bold text-[#635BFF] dark:text-[#A5AEFD] shrink-0">
          <Sparkles className="h-4 w-4 animate-pulse" />
          <span>AI Project Planner</span>
        </div>

        <input
          type="text"
          value={aiPrompt}
          onChange={(e) => setAiPrompt(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleAiGenerate()}
          placeholder="Describe what you want to build (e.g. AI-powered newsletter SaaS with Next.js 15, NestJS, Stripe)..."
          className="w-full bg-transparent border-0 text-sm focus:outline-none text-slate-900 dark:text-slate-100 placeholder:text-slate-400 px-2"
        />

        <Button
          variant="default"
          size="sm"
          isLoading={isGenerating}
          onClick={handleAiGenerate}
          leftIcon={<Zap className="h-3.5 w-3.5" />}
          className="shrink-0 w-full sm:w-auto"
        >
          Generate Project
        </Button>
      </div>

      <div className="px-4 pb-2 pt-1 flex flex-wrap items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400">
        <span>Quick templates:</span>
        {templates.map((tpl) => (
          <button
            key={tpl}
            onClick={() => setAiPrompt(tpl)}
            className="px-2.5 py-0.5 rounded-full bg-white/70 dark:bg-[#161926] hover:bg-[#635BFF]/20 text-slate-700 dark:text-slate-300 transition-colors border border-slate-200/50 dark:border-slate-800"
          >
            {tpl}
          </button>
        ))}
      </div>
    </Card>
  );
};
