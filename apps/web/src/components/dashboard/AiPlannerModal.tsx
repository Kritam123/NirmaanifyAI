'use client';

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  Button,
  Badge,
  Card,
  CardContent,
  Input,
  Select,
  useToast,
} from '@nirmaanify/ui';
import {
  Sparkles,
  CheckCircle2,
  Layers,
  Server,
  Database,
  Code2,
  Plus,
  Trash2,
  Edit2,
  Check,
  ArrowRight,
  ShieldCheck,
  PackageCheck,
  Cpu,
  FolderTree,
} from 'lucide-react';
import {
  AIProjectPlan,
  PlanPage,
  ProjectType,
} from '@nirmaanify/types';
import { useAuth } from '../../context/auth-context';

interface AiPlannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialPrompt?: string;
  initialPreferredType?: ProjectType;
}

const GENERATION_STEPS = [
  { id: 1, label: 'Analyzing prompt & inferring domain', icon: <Cpu className="h-4 w-4" /> },
  { id: 2, label: 'Architecting system & tech stack', icon: <Layers className="h-4 w-4" /> },
  { id: 3, label: 'Generating page routes & component tree', icon: <FolderTree className="h-4 w-4" /> },
  { id: 4, label: 'Specifying backend modules & REST APIs', icon: <Server className="h-4 w-4" /> },
  { id: 5, label: 'Designing PostgreSQL relational schema', icon: <Database className="h-4 w-4" /> },
  { id: 6, label: 'Assembling plugins & finalizing blueprint', icon: <PackageCheck className="h-4 w-4" /> },
];

export function AiPlannerModal({ isOpen, onClose, initialPrompt = '', initialPreferredType }: AiPlannerModalProps) {
  const { toast } = useToast();
  const { generateAiPlan, approveAiPlan, activeWorkspace } = useAuth();

  const [prompt, setPrompt] = useState(initialPrompt);
  const [preferredType, setPreferredType] = useState<ProjectType>(initialPreferredType ?? 'SAAS');
  const [step, setStep] = useState<'prompt' | 'generating' | 'review' | 'approving'>('prompt');
  const [currentGenStep, setCurrentGenStep] = useState(0);
  const [plan, setPlan] = useState<AIProjectPlan | null>(null);
  const [activeReviewTab, setActiveReviewTab] = useState<
    'overview' | 'pages' | 'backend' | 'database' | 'features' | 'plugins'
  >('overview');

  const [isEditing, setIsEditing] = useState(false);
  const [customName, setCustomName] = useState('');
  const [customSlug, setCustomSlug] = useState('');
  const [newPageName, setNewPageName] = useState('');
  const [newPagePath, setNewPagePath] = useState('');

  useEffect(() => {
    if (initialPrompt) setPrompt(initialPrompt);
    if (initialPreferredType) setPreferredType(initialPreferredType);
  }, [initialPrompt, initialPreferredType]);

  useEffect(() => {
    if (!isOpen) {
      setStep('prompt');
      setPlan(null);
      setPrompt(initialPrompt);
      setIsEditing(false);
      setNewPageName('');
      setNewPagePath('');
    }
  }, [isOpen, initialPrompt]);

  const handleStartGeneration = async () => {
    if (!prompt.trim()) return;
    setStep('generating');
    setCurrentGenStep(0);

    const stepInterval = setInterval(() => {
      setCurrentGenStep((prev) => (prev < GENERATION_STEPS.length - 1 ? prev + 1 : prev));
    }, 450);

    try {
      const generatedPlan = await generateAiPlan({
        prompt: prompt.trim(),
        workspaceId: activeWorkspace?.id,
        preferredType,
      });

      clearInterval(stepInterval);
      setCurrentGenStep(GENERATION_STEPS.length - 1);
      setTimeout(() => {
        setPlan(generatedPlan);
        setCustomName(generatedPlan.name);
        setCustomSlug(generatedPlan.slug);
        setStep('review');
        toast({
          title: 'Blueprint generated',
          description: `Ready for review: "${generatedPlan.name}"`,
          type: 'success',
        });
      }, 500);
    } catch (err: any) {
      clearInterval(stepInterval);
      setStep('prompt');
      toast({
        title: 'Generation failed',
        description: err.message || 'Could not generate plan',
        type: 'error',
      });
    }
  };

  const handleAddPage = () => {
    if (!plan || !newPageName.trim() || !newPagePath.trim()) return;
    const path = newPagePath.trim().startsWith('/')
      ? newPagePath.trim()
      : `/${newPagePath.trim()}`;
    const updatedPages: PlanPage[] = [
      ...plan.pages,
      {
        name: newPageName.trim(),
        path,
        description: 'Custom user-defined route',
        isProtected: false,
        components: ['CustomComponent'],
      },
    ];
    setPlan({ ...plan, pages: updatedPages });
    setNewPageName('');
    setNewPagePath('');
    toast({ title: 'Page added', description: `Added ${path}`, type: 'info' });
  };

  const handleDeletePage = (index: number) => {
    if (!plan) return;
    setPlan({ ...plan, pages: plan.pages.filter((_, i) => i !== index) });
  };

  const handleTogglePlugin = (pluginIndex: number) => {
    if (!plan) return;
    const updated = [...plan.pluginRecommendations];
    updated[pluginIndex] = { ...updated[pluginIndex], isRecommended: !updated[pluginIndex].isRecommended };
    setPlan({ ...plan, pluginRecommendations: updated });
  };

  const handleApprove = async () => {
    if (!plan) return;
    if (!activeWorkspace) {
      toast({
        title: 'No active workspace',
        description: 'Select or create a workspace before approving the blueprint.',
        type: 'error',
      });
      return;
    }
    setStep('approving');

    try {
      const finalPlan: AIProjectPlan = {
        ...plan,
        name: customName || plan.name,
        slug: customSlug || plan.slug,
      };

      const project = await approveAiPlan({
        plan: finalPlan,
        workspaceId: activeWorkspace.id,
        customName: customName || plan.name,
        customSlug: customSlug || plan.slug,
      });

      onClose();
      toast({
        title: 'Project scaffolded',
        description: `"${project.name}" has been created with all routes, backend modules & database schema.`,
        type: 'success',
      });
    } catch (err: any) {
      setStep('review');
      toast({
        title: 'Approval error',
        description: err.message || 'Could not approve project plan',
        type: 'error',
      });
    }
  };

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title={
        step === 'prompt'
          ? 'AI project planner'
          : step === 'generating'
            ? 'Synthesizing architecture blueprint'
            : `Review blueprint: ${plan?.name || 'Project plan'}`
      }
      description={
        step === 'prompt'
          ? 'Describe your idea in natural language. The architect will design pages, features, backend modules, and database schemas for your review.'
          : step === 'generating'
            ? 'Synthesizing full-stack system architecture...'
            : 'Carefully review and customize the generated blueprint before confirming.'
      }
      className={step === 'review' ? 'max-w-4xl' : 'max-w-xl'}
      footer={
        step === 'prompt' ? (
          <>
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              variant="default"
              leftIcon={<Cpu className="h-4 w-4" />}
              onClick={handleStartGeneration}
              disabled={!prompt.trim()}
            >
              Architect project
            </Button>
          </>
        ) : step === 'review' ? (
          <div className="w-full flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
            <div className="flex items-center gap-2 text-xs text-amber-500 font-medium">
              <ShieldCheck className="h-4 w-4 text-[#635BFF]" />
              <span>Human approval required — confirmation needed before scaffolding.</span>
            </div>
            <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
              <Button variant="outline" size="sm" onClick={() => setStep('prompt')}>
                Regenerate
              </Button>
              <Button
                variant="default"
                size="sm"
                leftIcon={<Check className="h-4 w-4" />}
                onClick={handleApprove}
              >
                Approve &amp; scaffold
              </Button>
            </div>
          </div>
        ) : null
      }
    >
      {step === 'prompt' && (
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Project description
            </label>
            <textarea
              rows={4}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="e.g. I want to create an online luxury clothing boutique with Next.js 15, Stripe checkout, product search, reviews, and customer order history."
              className="w-full rounded-xl p-3 text-sm bg-slate-50 dark:bg-[#161926] border border-slate-200 dark:border-[#24293D] focus:outline-none focus:ring-2 focus:ring-[#635BFF] text-slate-900 dark:text-slate-100 placeholder:text-slate-400"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Select
              label="Preferred type"
              value={preferredType}
              onChange={(e) => setPreferredType(e.target.value as ProjectType)}
              options={[
                { label: 'E-commerce Platform', value: 'ECOMMERCE' },
                { label: 'SaaS Platform', value: 'SAAS' },
                { label: 'Editorial / Tech Blog', value: 'BLOG' },
                { label: 'Executive Dashboard', value: 'DASHBOARD' },
                { label: 'Portfolio / Agency', value: 'PORTFOLIO' },
                { label: 'Landing / Website', value: 'WEBSITE' },
                { label: 'Custom Application', value: 'CUSTOM' },
              ]}
            />
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Target workspace
              </label>
              <div className="px-3 py-2.5 rounded-xl bg-slate-100 dark:bg-[#161926] border border-slate-200 dark:border-[#24293D] text-xs font-semibold text-slate-700 dark:text-slate-300 truncate">
                {activeWorkspace?.name || 'Personal studio'}
              </div>
            </div>
          </div>

          <div>
            <span className="text-xs font-semibold text-slate-400">Quick templates:</span>
            <div className="flex flex-wrap gap-2 mt-2">
              {[
                {
                  title: 'Clothing store',
                  prompt: 'Online clothing store with Next.js 15, Stripe checkout, variant selector, and cart.',
                  type: 'ECOMMERCE' as const,
                },
                {
                  title: 'AI video SaaS',
                  prompt: 'Generative AI video studio platform with subscription tiers, BullMQ workers, and credit metering.',
                  type: 'SAAS' as const,
                },
                {
                  title: 'Dev tech blog',
                  prompt: 'Engineering blog with MDX support, syntax highlighting, author profiles, and newsletter capture.',
                  type: 'BLOG' as const,
                },
                {
                  title: 'Analytics dashboard',
                  prompt: 'Executive KPI dashboard with Recharts, date filters, TanStack table, and CSV export.',
                  type: 'DASHBOARD' as const,
                },
              ].map((tmpl) => (
                <button
                  key={tmpl.title}
                  type="button"
                  onClick={() => {
                    setPrompt(tmpl.prompt);
                    setPreferredType(tmpl.type);
                  }}
                  className="px-2.5 py-1 rounded-lg text-xs bg-slate-100 dark:bg-[#161926] hover:bg-[#635BFF]/15 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-[#24293D] transition-colors"
                >
                  {tmpl.title}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {step === 'generating' && (
        <div className="py-6 space-y-6">
          <div className="flex flex-col items-center justify-center text-center space-y-3">
            <div className="h-14 w-14 rounded-2xl border-2 border-[#635BFF] border-t-transparent animate-spin" />
            <div>
              <h4 className="text-base font-bold">Synthesizing project blueprint</h4>
              <p className="text-xs text-slate-400 mt-1 max-w-sm">
                Evaluating prompt requirements and constructing production-ready architecture...
              </p>
            </div>
          </div>

          <div className="space-y-2.5 max-w-md mx-auto">
            {GENERATION_STEPS.map((s, idx) => {
              const isDone = idx < currentGenStep;
              const isCurrent = idx === currentGenStep;
              return (
                <div
                  key={s.id}
                  className={`flex items-center justify-between p-2.5 rounded-xl border text-xs transition-all duration-300 ${
                    isDone
                      ? 'bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800/40 text-emerald-600 dark:text-emerald-400'
                      : isCurrent
                        ? 'bg-[#635BFF]/10 border-[#635BFF]/30 text-[#635BFF] font-semibold'
                        : 'bg-slate-50 dark:bg-[#161926] border-slate-200 dark:border-[#24293D] text-slate-400 opacity-60'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    {s.icon}
                    <span>{s.label}</span>
                  </div>
                  {isDone ? (
                    <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                  ) : isCurrent ? (
                    <div className="h-2 w-2 rounded-full bg-[#635BFF] animate-ping" />
                  ) : null}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {step === 'review' && plan && (
        <div className="space-y-5">
          <div className="p-4 rounded-xl border border-[#635BFF]/30 bg-[#635BFF]/5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <Badge variant="indigo">{plan.type}</Badge>
                <Badge variant="secondary">{plan.framework}</Badge>
                {plan.backendRequirements.enabled && (
                  <Badge variant="violet">Backend enabled</Badge>
                )}
              </div>
              <div className="flex items-center gap-2 mt-2">
                {isEditing ? (
                  <div className="flex items-center gap-2">
                    <Input
                      value={customName}
                      onChange={(e) => setCustomName(e.target.value)}
                      placeholder="Project name"
                      className="text-sm font-bold"
                    />
                    <Button size="sm" variant="default" onClick={() => setIsEditing(false)}>
                      Done
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">{plan.name}</h3>
                    <button
                      onClick={() => setIsEditing(true)}
                      className="p-1 hover:bg-slate-200 dark:hover:bg-[#24293D] rounded text-slate-400"
                    >
                      <Edit2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                )}
              </div>
              <p className="text-xs text-slate-500 mt-1 max-w-xl">{plan.description}</p>
            </div>
            <div className="text-right shrink-0">
              <span className="text-[11px] font-mono text-slate-400">
                slug: /{customSlug || plan.slug}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1 border-b border-slate-200 dark:border-[#24293D] overflow-x-auto pb-1 text-xs">
            {[
              { id: 'overview' as const, label: 'Overview & stack', icon: <Cpu className="h-3.5 w-3.5" /> },
              { id: 'pages' as const, label: `Pages (${plan.pages.length})`, icon: <FolderTree className="h-3.5 w-3.5" /> },
              { id: 'backend' as const, label: `Backend (${plan.backendRequirements.modules.length})`, icon: <Server className="h-3.5 w-3.5" /> },
              { id: 'database' as const, label: `Database (${plan.databaseRequirements.models.length})`, icon: <Database className="h-3.5 w-3.5" /> },
              { id: 'features' as const, label: `Features (${plan.features.length})`, icon: <CheckCircle2 className="h-3.5 w-3.5" /> },
              { id: 'plugins' as const, label: 'Plugins', icon: <PackageCheck className="h-3.5 w-3.5" /> },
            ].map((t) => (
              <button
                key={t.id}
                onClick={() => setActiveReviewTab(t.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition-colors whitespace-nowrap ${
                  activeReviewTab === t.id
                    ? 'bg-[#635BFF] text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-[#161926]'
                }`}
              >
                {t.icon}
                {t.label}
              </button>
            ))}
          </div>

          {activeReviewTab === 'overview' && (
            <div className="space-y-4 max-h-[380px] overflow-y-auto pr-1">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <Card className="p-3">
                  <span className="font-semibold text-slate-400">Frontend stack</span>
                  <div className="mt-2 space-y-1">
                    {plan.architecturePlan.frontendStack.map((item) => (
                      <div key={item} className="flex items-center gap-1.5 font-medium">
                        <Check className="h-3 w-3 text-[#635BFF]" /> {item}
                      </div>
                    ))}
                  </div>
                </Card>
                <Card className="p-3">
                  <span className="font-semibold text-slate-400">Backend API</span>
                  <div className="mt-2 space-y-1">
                    {plan.architecturePlan.backendStack.map((item) => (
                      <div key={item} className="flex items-center gap-1.5 font-medium">
                        <Check className="h-3 w-3 text-[#8B5CF6]" /> {item}
                      </div>
                    ))}
                  </div>
                </Card>
                <Card className="p-3">
                  <span className="font-semibold text-slate-400">Database &amp; cache</span>
                  <div className="mt-2 space-y-1">
                    {plan.architecturePlan.databaseStack.map((item) => (
                      <div key={item} className="flex items-center gap-1.5 font-medium">
                        <Check className="h-3 w-3 text-[#22D3EE]" /> {item}
                      </div>
                    ))}
                  </div>
                </Card>
              </div>

              <Card className="p-3 text-xs space-y-2">
                <span className="font-semibold text-slate-400">Architecture summary</span>
                <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                  {plan.architecturePlan.summary}
                </p>
                <div className="pt-2 border-t border-slate-100 dark:border-[#24293D] flex items-center justify-between text-slate-400">
                  <span>
                    Deploy: <strong className="text-slate-700 dark:text-slate-200">{plan.architecturePlan.deploymentTarget}</strong>
                  </span>
                  <span>
                    Scale: <strong className="text-slate-700 dark:text-slate-200">{plan.architecturePlan.scalabilityNotes}</strong>
                  </span>
                </div>
              </Card>
            </div>
          )}

          {activeReviewTab === 'pages' && (
            <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
              <div className="flex items-center gap-2 p-2 rounded-xl bg-slate-50 dark:bg-[#161926] border border-slate-200 dark:border-[#24293D]">
                <Input
                  placeholder="Page name (e.g. Analytics)"
                  value={newPageName}
                  onChange={(e) => setNewPageName(e.target.value)}
                  className="text-xs"
                />
                <Input
                  placeholder="Route path (e.g. /analytics)"
                  value={newPagePath}
                  onChange={(e) => setNewPagePath(e.target.value)}
                  className="text-xs"
                />
                <Button size="sm" variant="default" onClick={handleAddPage} leftIcon={<Plus className="h-3.5 w-3.5" />}>
                  Add route
                </Button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {plan.pages.map((p, idx) => (
                  <Card key={p.path} className="p-3 text-xs space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 dark:text-white">{p.name}</span>
                        {p.isProtected && <Badge variant="violet" size="sm">Protected</Badge>}
                      </div>
                      <button
                        onClick={() => handleDeletePage(idx)}
                        className="text-slate-400 hover:text-rose-500 p-1 transition-colors"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                    <p className="font-mono text-[11px] text-[#635BFF]">{p.path}</p>
                    <p className="text-slate-500 text-[11px]">{p.description}</p>
                    <div className="flex flex-wrap gap-1 pt-1">
                      {p.components.map((comp, idx) => {
                        const label = typeof comp === 'string' ? comp : comp.name;
                        return (
                          <span
                            key={`${label}-${idx}`}
                            className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-[#161926] text-[10px] text-slate-600 dark:text-slate-300 font-mono"
                          >
                            {label}
                          </span>
                        );
                      })}
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {activeReviewTab === 'backend' && (
            <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
              {!plan.backendRequirements.enabled ? (
                <div className="p-6 text-center text-xs text-slate-400">
                  Backend API disabled for this static architecture plan.
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-between p-3 rounded-xl bg-slate-100 dark:bg-[#161926] text-xs">
                    <div className="flex items-center gap-2">
                      <Server className="h-4 w-4 text-[#635BFF]" />
                      <span className="font-bold">{plan.backendRequirements.framework}</span>
                    </div>
                    <div className="text-slate-400 text-[11px]">
                      Auth: {plan.backendRequirements.auth.type.toUpperCase()} · {plan.backendRequirements.auth.providers.join(', ')}
                    </div>
                  </div>

                  <div className="space-y-3">
                    {plan.backendRequirements.modules.map((mod) => (
                      <Card key={mod.name} className="p-3 text-xs space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-slate-900 dark:text-white">{mod.name}</span>
                          <span className="text-[11px] text-slate-400">{mod.description}</span>
                        </div>
                        <div className="divide-y divide-slate-100 dark:divide-[#24293D] pt-1">
                          {mod.endpoints.map((ep) => (
                            <div key={ep.path} className="py-1.5 flex items-center justify-between text-[11px]">
                              <div className="flex items-center gap-2 font-mono">
                                <Badge
                                  size="sm"
                                  variant={
                                    ep.method === 'GET'
                                      ? 'cyan'
                                      : ep.method === 'POST'
                                        ? 'indigo'
                                        : ep.method === 'PUT'
                                          ? 'violet'
                                          : 'secondary'
                                  }
                                >
                                  {ep.method}
                                </Badge>
                                <span>{ep.path}</span>
                              </div>
                              <span className="text-slate-400 text-[10px]">{ep.description}</span>
                            </div>
                          ))}
                        </div>
                      </Card>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}

          {activeReviewTab === 'database' && (
            <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
              <div className="p-2.5 rounded-xl bg-slate-100 dark:bg-[#161926] text-xs flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Database className="h-4 w-4 text-[#22D3EE]" />
                  <span className="font-bold">Engine: {plan.databaseRequirements.engine}</span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {plan.databaseRequirements.models.map((model) => (
                  <Card key={model.name} className="p-3 text-xs space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-[#635BFF]">{model.name}</span>
                      <span className="text-[10px] text-slate-400">{model.description}</span>
                    </div>
                    <div className="divide-y divide-slate-100 dark:divide-[#24293D] font-mono text-[11px]">
                      {model.fields.map((field) => (
                        <div key={field.name} className="py-1 flex items-center justify-between">
                          <div className="flex items-center gap-1.5">
                            <span>{field.name}</span>
                            {field.isPrimary && <Badge size="sm" variant="indigo">PK</Badge>}
                            {field.isUnique && <Badge size="sm" variant="cyan">UQ</Badge>}
                          </div>
                          <span className="text-slate-400 text-[10px]">{field.type}</span>
                        </div>
                      ))}
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {activeReviewTab === 'features' && (
            <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
              <div className="grid grid-cols-1 gap-2.5">
                {plan.features.map((feat) => (
                  <Card key={feat.title} className="p-3 text-xs flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <Badge
                          size="sm"
                          variant={
                            feat.category === 'auth'
                              ? 'violet'
                              : feat.category === 'billing'
                                ? 'indigo'
                                : 'cyan'
                          }
                        >
                          {feat.category.toUpperCase()}
                        </Badge>
                        <span className="font-bold text-slate-900 dark:text-white">{feat.title}</span>
                      </div>
                      <p className="text-slate-500 mt-1 text-[11px]">{feat.description}</p>
                    </div>
                    <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-1" />
                  </Card>
                ))}
              </div>
            </div>
          )}

          {activeReviewTab === 'plugins' && (
            <div className="space-y-4 max-h-[380px] overflow-y-auto pr-1">
              <div>
                <span className="text-xs font-bold text-slate-400">Plugin recommendations:</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2">
                  {plan.pluginRecommendations.map((plugin, idx) => (
                    <Card
                      key={plugin.name}
                      hoverable
                      onClick={() => handleTogglePlugin(idx)}
                      className={`p-3 text-xs cursor-pointer transition-all ${
                        plugin.isRecommended ? 'border-[#635BFF] bg-[#635BFF]/5' : 'opacity-60'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold">{plugin.name}</span>
                        <Badge size="sm" variant={plugin.isRecommended ? 'indigo' : 'secondary'}>
                          {plugin.isRecommended ? 'Enabled' : 'Disabled'}
                        </Badge>
                      </div>
                      <p className="text-slate-500 text-[11px] mt-1">{plugin.reason}</p>
                    </Card>
                  ))}
                </div>
              </div>

              <div>
                <span className="text-xs font-bold text-slate-400">Required packages:</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2 font-mono text-[11px]">
                  {plan.requiredPackages.map((pkg) => (
                    <div
                      key={pkg.name}
                      className="p-2 rounded-lg bg-slate-50 dark:bg-[#161926] border border-slate-200 dark:border-[#24293D] flex items-center justify-between"
                    >
                      <div>
                        <span className="font-semibold text-slate-800 dark:text-slate-200">{pkg.name}</span>
                        <p className="text-[10px] text-slate-400 font-sans">{pkg.purpose}</p>
                      </div>
                      <span className="text-slate-400 text-[10px]">{pkg.version || 'latest'}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {step === 'approving' && (
        <div className="py-12 flex flex-col items-center justify-center text-center space-y-4">
          <div className="h-14 w-14 rounded-full border-4 border-[#635BFF] border-t-transparent animate-spin" />
          <h4 className="text-base font-bold">Scaffolding project architecture...</h4>
          <p className="text-xs text-slate-400 max-w-sm">
            Writing routes, registering NestJS API modules, configuring Prisma schema, and creating project records in workspace.
          </p>
        </div>
      )}
    </Dialog>
  );
}
