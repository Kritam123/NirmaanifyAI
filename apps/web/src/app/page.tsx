'use client';

import React, { useState } from 'react';
import {
  NirmaanLogo,
  NirmaanIcon,
  NirmaanAppIcon,
  NirmaanWordmark,
} from '@nirmaanify/icons';
import {
  AppShell,
  Sidebar,
  Topbar,
  PageHeader,
  Button,
  IconButton,
  Input,
  Textarea,
  Select,
  Checkbox,
  Switch,
  Badge,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  Avatar,
  Separator,
  Skeleton,
  EmptyState,
  SuccessFeedback,
  ErrorState,
  LoadingState,
  Dialog,
  Drawer,
  Tabs,
  useToast,
} from '@nirmaanify/ui';
import {
  Sparkles,
  Palette,
  Boxes,
  Layers,
  Globe,
  Plus,
  CheckCircle2,
  FolderOpen,
  Database,
  Cloud,
  HardDrive,
  Check,
  UploadCloud,
  ExternalLink,
} from 'lucide-react';

export default function DesignSystemShowcase() {
  const { toast } = useToast();
  const [activeNav, setActiveNav] = useState('brand');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [switchState, setSwitchState] = useState(true);
  const [checkboxState, setCheckboxState] = useState(true);
  const [btnLoading, setBtnLoading] = useState(false);

  // Storage Driver Switcher State
  const [activeStorage, setActiveStorage] = useState<'local' | 's3' | 'vercel-blob'>('local');

  const navItems = [
    { id: 'brand', label: 'Brand Identity', icon: <Sparkles className="h-4 w-4" />, active: activeNav === 'brand', onClick: () => setActiveNav('brand') },
    { id: 'tokens', label: 'Design Tokens', icon: <Palette className="h-4 w-4" />, active: activeNav === 'tokens', onClick: () => setActiveNav('tokens') },
    { id: 'components', label: 'Core Components (12)', icon: <Boxes className="h-4 w-4" />, badge: '12', active: activeNav === 'components', onClick: () => setActiveNav('components') },
    { id: 'patterns', label: 'UI Patterns', icon: <Layers className="h-4 w-4" />, active: activeNav === 'patterns', onClick: () => setActiveNav('patterns') },
    { id: 'storage', label: 'Storage Engine (S3 / Vercel)', icon: <Cloud className="h-4 w-4" />, badge: 'New', active: activeNav === 'storage', onClick: () => setActiveNav('storage') },
  ];

  const storageDrivers = [
    {
      id: 'local' as const,
      name: 'Local Filesystem',
      icon: <HardDrive className="h-5 w-5 text-slate-400" />,
      tag: 'Development',
      badgeVariant: 'secondary' as const,
      description: 'Zero-config local disk storage in `.storage/`. Ideal for offline development and testing.',
      configured: true,
      features: ['Offline support', 'Direct disk reads', 'Local streaming'],
    },
    {
      id: 's3' as const,
      name: 'AWS S3 / MinIO',
      icon: <Database className="h-5 w-5 text-[#635BFF]" />,
      tag: 'Object Store',
      badgeVariant: 'indigo' as const,
      description: 'S3-compatible storage (AWS S3, MinIO, Cloudflare R2, DigitalOcean Spaces).',
      configured: true,
      features: ['Presigned URLs', 'Global replication', 'Multipart uploads'],
    },
    {
      id: 'vercel-blob' as const,
      name: 'Vercel Blob Storage',
      icon: <Cloud className="h-5 w-5 text-[#22D3EE]" />,
      tag: 'Edge CDN',
      badgeVariant: 'cyan' as const,
      description: 'High-speed edge object storage distributed across Vercel Global Edge Network.',
      configured: true,
      features: ['Global Edge CDN', 'Fast public blobs', 'Instant cache purge'],
    },
  ];

  const handleSwitchStorage = (driverId: 'local' | 's3' | 'vercel-blob') => {
    setActiveStorage(driverId);
    toast({
      title: 'Storage Driver Switched',
      description: `Active driver set to ${driverId.toUpperCase()}`,
      type: 'success',
    });
  };

  return (
    <AppShell
      sidebar={
        <Sidebar
          items={navItems}
          footer={
            <div className="flex items-center gap-3">
              <Avatar fallback="NA" size="sm" status="online" />
              <div>
                <p className="text-xs font-semibold">Nirmaanify Core</p>
                <p className="text-[10px] text-slate-400">Phase 2 Technical Foundation</p>
              </div>
            </div>
          }
        />
      }
      topbar={
        <Topbar
          breadcrumbs={['Nirmaanify Platform', 'Engineering', activeNav.toUpperCase()]}
          contextBadge="platform"
        />
      }
    >
      {/* 1. BRAND IDENTITY SECTION */}
      {activeNav === 'brand' && (
        <div className="space-y-8">
          <PageHeader
            title="Brand Identity & Assets"
            description="Week 1 Deliverable: Modular N icon, Wordmark, Horizontal Logo, App Icons and Brand Definitions."
            actions={
              <Button
                variant="default"
                leftIcon={<Plus className="h-4 w-4" />}
                onClick={() => toast({ title: 'Brand Kit Ready', description: 'Nirmaanify Brand Kit v1 is active.', type: 'success' })}
              >
                Export Brand Kit
              </Button>
            }
          />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card hoverable className="flex flex-col items-center justify-center p-8 text-center">
              <NirmaanIcon size={64} variant="gradient" />
              <h4 className="mt-4 font-bold">Modular N Icon</h4>
              <p className="text-xs text-slate-400 mt-1">Isometric geometry with gradient fill</p>
            </Card>

            <Card hoverable className="flex flex-col items-center justify-center p-8 text-center">
              <NirmaanAppIcon size={64} />
              <h4 className="mt-4 font-bold">Application Icon</h4>
              <p className="text-xs text-slate-400 mt-1">Squircle frame with subtle glow</p>
            </Card>

            <Card hoverable className="flex flex-col items-center justify-center p-8 text-center col-span-1 md:col-span-2">
              <NirmaanLogo size="lg" showTagline />
              <h4 className="mt-4 font-bold">Primary Horizontal Logo</h4>
              <p className="text-xs text-slate-400 mt-1">Modular N + High precision typography + Tagline</p>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Brand Definition & Personality</CardTitle>
              <CardDescription>Tagline: Imagine. Build. Launch.</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {['Intelligent', 'Professional', 'Creative', 'Modern', 'Precise', 'Powerful'].map((trait) => (
                <div key={trait} className="p-3 rounded-lg bg-slate-100 dark:bg-[#161926] text-center border border-slate-200 dark:border-[#24293D]">
                  <p className="text-xs font-bold text-[#635BFF] dark:text-[#A5AEFD]">{trait}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      )}

      {/* 2. DESIGN TOKENS SECTION */}
      {activeNav === 'tokens' && (
        <div className="space-y-8">
          <PageHeader
            title="Design Tokens v1"
            description="Week 2 Deliverable: Color swatches, typography scales, 4px spacing grid, shadows, and radii."
          />

          <div className="space-y-4">
            <h3 className="text-base font-bold">Brand Color Direction</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { name: 'Nirmaan Indigo', hex: '#635BFF', role: 'Primary Brand' },
                { name: 'Build Blue', hex: '#3B82F6', role: 'Primary Action' },
                { name: 'AI Violet', hex: '#8B5CF6', role: 'AI Intelligence' },
                { name: 'Launch Cyan', hex: '#22D3EE', role: 'Launch Accent' },
              ].map((c) => (
                <Card key={c.name} hoverable className="overflow-hidden">
                  <div style={{ backgroundColor: c.hex }} className="h-24 w-full flex items-end p-3">
                    <span className="text-white text-xs font-mono font-bold drop-shadow">{c.hex}</span>
                  </div>
                  <CardContent className="p-4">
                    <p className="font-bold text-sm">{c.name}</p>
                    <p className="text-xs text-slate-400">{c.role}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Typography System</CardTitle>
              <CardDescription>Poppins (Display & UI) • Geist Mono (Code)</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 rounded-lg bg-slate-50 dark:bg-[#161926] border border-slate-200 dark:border-[#24293D]">
                <p className="text-xs font-mono text-slate-400 mb-1">Display Heading (Poppins 30px SemiBold)</p>
                <h1 className="text-3xl font-semibold tracking-tight font-poppins">Imagine. Build. Launch.</h1>
              </div>
              <div className="p-4 rounded-lg bg-slate-50 dark:bg-[#161926] border border-slate-200 dark:border-[#24293D]">
                <p className="text-xs font-mono text-slate-400 mb-1">Application UI (Poppins 14px Regular)</p>
                <p className="text-sm font-poppins">Nirmaanify AI empowers developers to visually design, manage CMS records, generate NestJS backends, and deploy full-stack applications with deterministic precision.</p>
              </div>
              <div className="p-4 rounded-lg bg-slate-50 dark:bg-[#161926] border border-slate-200 dark:border-[#24293D]">
                <p className="text-xs font-mono text-slate-400 mb-1">Code & Schema (Geist Mono 13px)</p>
                <code className="text-xs font-mono text-[#22D3EE]">{`const project = { name: "Nirmaanify", context: "platform", status: "active" };`}</code>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* 3. CORE COMPONENTS SECTION */}
      {activeNav === 'components' && (
        <div className="space-y-8">
          <PageHeader
            title="Core Component System (Week 3)"
            description="12 production components supporting Light/Dark modes, loading, disabled, focus, and keyboard accessibility."
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>1. Button & Icon Button</CardTitle>
                <CardDescription>Variants, sizes, loading & icons</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-wrap gap-2.5">
                  <Button variant="default">Primary Indigo</Button>
                  <Button variant="secondary">Secondary</Button>
                  <Button variant="outline">Outline</Button>
                  <Button variant="ghost">Ghost</Button>
                  <Button variant="destructive">Destructive</Button>
                  <Button variant="subtle">Subtle</Button>
                </div>
                <div className="flex items-center gap-3 pt-2">
                  <Button
                    isLoading={btnLoading}
                    onClick={() => {
                      setBtnLoading(true);
                      setTimeout(() => setBtnLoading(false), 1500);
                    }}
                  >
                    Click to Load
                  </Button>
                  <Button disabled>Disabled Button</Button>
                  <IconButton icon={<Sparkles className="h-4 w-4" />} aria-label="AI Action" variant="subtle" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>2. Input & Textarea</CardTitle>
                <CardDescription>Form controls with icons & validation</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Input
                  label="Project Name"
                  placeholder="e.g. Acme SaaS Store"
                  startIcon={<Globe className="h-4 w-4" />}
                  helperText="Enter a unique name for your project."
                />
                <Textarea
                  label="Project Description"
                  placeholder="Describe your application features..."
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>3. Select, Checkbox & Switch</CardTitle>
                <CardDescription>Interactive selection primitives</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Select
                  label="Target UI Framework"
                  options={[
                    { label: 'Next.js 15 App Router (Recommended)', value: 'next15' },
                    { label: 'React + Vite SPA', value: 'vite' },
                    { label: 'NestJS Full-stack', value: 'nestjs' },
                  ]}
                />
                <Separator />
                <Checkbox
                  label="Generate NestJS Backend"
                  description="Automatically scaffold modules, controllers, and Prisma schemas."
                  checked={checkboxState}
                  onChange={(e) => setCheckboxState(e.target.checked)}
                />
                <Separator />
                <Switch
                  label="Enable AI Code Assistant"
                  description="Allow AI agent to make deterministic schema changes."
                  checked={switchState}
                  onChange={(e) => setSwitchState(e.target.checked)}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>4. Badge, Avatar, Skeleton & Separator</CardTitle>
                <CardDescription>Status indicators, sizes, media and placeholders (Poppins font)</CardDescription>
              </CardHeader>
              <CardContent className="space-y-5">
                <div>
                  <p className="text-xs text-slate-400 mb-2">Variants (Medium size)</p>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="indigo" dot>Active Platform</Badge>
                    <Badge variant="success" dot>Deployed</Badge>
                    <Badge variant="warning" dot>Building</Badge>
                    <Badge variant="destructive" dot>Error</Badge>
                    <Badge variant="violet">AI Agent</Badge>
                    <Badge variant="cyan">Launch Ready</Badge>
                    <Badge variant="secondary">Secondary</Badge>
                    <Badge variant="outline">Outline</Badge>
                  </div>
                </div>

                <div>
                  <p className="text-xs text-slate-400 mb-2">Sizing Scale & Padding</p>
                  <div className="flex flex-wrap items-center gap-3">
                    <Badge size="sm" variant="indigo" dot>Small (px-2.5 py-0.5)</Badge>
                    <Badge size="md" variant="indigo" dot>Medium (px-3 py-1)</Badge>
                    <Badge size="lg" variant="indigo" dot>Large (px-3.5 py-1.5)</Badge>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <Avatar fallback="NL" size="lg" status="online" />
                  <Avatar fallback="AI" size="md" status="busy" />
                  <Avatar fallback="UX" size="sm" status="away" />
                </div>
                <Separator label="Loading Skeletons" />
                <div className="space-y-2">
                  <Skeleton variant="text" className="w-3/4" />
                  <Skeleton variant="text" className="w-1/2" />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* 4. UI PATTERNS SECTION */}
      {activeNav === 'patterns' && (
        <div className="space-y-8">
          <PageHeader
            title="UI Patterns & Overlays (Week 4)"
            description="Application Shell, Modals, Drawers, Tabs, Feedback States, and Toast System."
            actions={
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setIsDrawerOpen(true)}>
                  Open Drawer
                </Button>
                <Button variant="default" onClick={() => setIsDialogOpen(true)}>
                  Open Modal
                </Button>
              </div>
            }
          />

          <Tabs
            items={[
              {
                id: 'feedback',
                label: 'Feedback States',
                icon: <CheckCircle2 className="h-4 w-4" />,
                content: (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <SuccessFeedback
                      title="Project Exported Successfully"
                      description="Your Next.js + NestJS repository is ready for deployment."
                      actionLabel="Download ZIP"
                      onAction={() => toast({ title: 'Download Started', description: 'nirmaanify-project.zip', type: 'success' })}
                    />
                    <ErrorState
                      title="Build Pipeline Failed"
                      message="Component syntax validation encountered an unclosed tag in Header.tsx."
                      code="ERR_SYNTAX_042"
                      onRetry={() => toast({ title: 'Retrying build...', type: 'info' })}
                    />
                  </div>
                ),
              },
              {
                id: 'empty',
                label: 'Empty State',
                icon: <FolderOpen className="h-4 w-4" />,
                content: (
                  <EmptyState
                    title="No CMS Collections Found"
                    description="Create your first collection schema to begin managing dynamic structured content."
                    actionLabel="Create Collection"
                    onAction={() => setIsDialogOpen(true)}
                  />
                ),
              },
              {
                id: 'loading',
                label: 'Loading State',
                icon: <Sparkles className="h-4 w-4" />,
                content: (
                  <Card className="p-8">
                    <LoadingState message="Scaffolding NestJS database models and relations..." />
                  </Card>
                ),
              },
            ]}
          />

          <Dialog
            isOpen={isDialogOpen}
            onClose={() => setIsDialogOpen(false)}
            title="Create New Nirmaanify Project"
            description="Configure your project architecture, UI library, and backend settings."
            footer={
              <>
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button
                  variant="default"
                  onClick={() => {
                    setIsDialogOpen(false);
                    toast({ title: 'Project Created', description: 'Fashion Store project generated.', type: 'success' });
                  }}
                >
                  Create Project
                </Button>
              </>
            }
          >
            <div className="space-y-4">
              <Input label="Project Name" placeholder="e.g. Modern E-commerce" />
              <Select
                label="Template"
                options={[
                  { label: 'E-commerce (Next.js + NestJS + PostgreSQL)', value: 'ecom' },
                  { label: 'SaaS Dashboard (Next.js + Prisma)', value: 'saas' },
                  { label: 'Agency Portfolio (Next.js Static)', value: 'portfolio' },
                ]}
              />
            </div>
          </Dialog>

          <Drawer
            isOpen={isDrawerOpen}
            onClose={() => setIsDrawerOpen(false)}
            title="Component Inspector"
            position="right"
          >
            <div className="space-y-4">
              <p className="text-xs text-slate-400">Configure visual component properties.</p>
              <Input label="Button Label" defaultValue="Get Started Free" />
              <Select
                label="Variant"
                options={[
                  { label: 'Primary Indigo', value: 'default' },
                  { label: 'Secondary Dark', value: 'secondary' },
                  { label: 'Destructive Red', value: 'destructive' },
                ]}
              />
              <Switch label="Full Width" defaultChecked />
              <Button
                variant="default"
                className="w-full mt-4"
                onClick={() => {
                  setIsDrawerOpen(false);
                  toast({ title: 'Properties Saved', type: 'info' });
                }}
              >
                Apply Changes
              </Button>
            </div>
          </Drawer>
        </div>
      )}

      {/* 5. STORAGE ENGINE SECTION (NEW MULTI-DRIVER SWITCHER) */}
      {activeNav === 'storage' && (
        <div className="space-y-8">
          <PageHeader
            title="Dynamic Multi-Driver Storage Engine"
            description="Switch seamlessly between AWS S3 / MinIO, Vercel Blob Storage, and Local Filesystem in one click."
            badge={<Badge variant="indigo">One-Click Switcher</Badge>}
            actions={
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  leftIcon={<ExternalLink className="h-3.5 w-3.5" />}
                  onClick={() => window.open('http://localhost:4000/api/docs', '_blank')}
                >
                  Swagger API
                </Button>
                <Button
                  variant="default"
                  size="sm"
                  leftIcon={<UploadCloud className="h-3.5 w-3.5" />}
                  onClick={() => toast({ title: 'Test Upload Succeeded', description: `Stored asset via ${activeStorage.toUpperCase()}`, type: 'success' })}
                >
                  Test Upload
                </Button>
              </div>
            }
          />

          {/* Active Storage Driver Switcher Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {storageDrivers.map((driver) => {
              const isSelected = activeStorage === driver.id;
              return (
                <Card
                  key={driver.id}
                  hoverable
                  onClick={() => handleSwitchStorage(driver.id)}
                  className={`cursor-pointer transition-all relative overflow-hidden ${
                    isSelected
                      ? 'border-2 border-[#635BFF] bg-[#635BFF]/5 shadow-lg shadow-[#635BFF]/10'
                      : 'hover:border-slate-400 dark:hover:border-[#3B4366]'
                  }`}
                >
                  {isSelected && (
                    <div className="absolute top-3 right-3 flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-[#635BFF] text-white text-[11px] font-bold">
                      <Check className="h-3 w-3" />
                      Active Driver
                    </div>
                  )}
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 rounded-xl bg-slate-100 dark:bg-[#161926] border border-slate-200 dark:border-[#24293D]">
                        {driver.icon}
                      </div>
                      <div>
                        <CardTitle className="text-base">{driver.name}</CardTitle>
                        <Badge variant={driver.badgeVariant} size="sm" className="mt-1">
                          {driver.tag}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-xs text-slate-500 dark:text-slate-400">{driver.description}</p>
                    <div className="space-y-1.5 pt-2 border-t border-slate-100 dark:border-[#1E2337]">
                      {driver.features.map((feat) => (
                        <div key={feat} className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300">
                          <span className="h-1.5 w-1.5 rounded-full bg-[#635BFF]" />
                          <span>{feat}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                  <CardFooter className="pt-0">
                    <Button
                      variant={isSelected ? 'default' : 'outline'}
                      size="sm"
                      className="w-full"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSwitchStorage(driver.id);
                      }}
                    >
                      {isSelected ? 'Active Selection' : 'Switch to this driver'}
                    </Button>
                  </CardFooter>
                </Card>
              );
            })}
          </div>

          {/* Configuration & Environment Specs */}
          <Card>
            <CardHeader>
              <CardTitle>Storage Switcher Architecture & REST API</CardTitle>
              <CardDescription>
                Unified abstraction allowing instant runtime driver transitions without rebuilding or downtime.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#161926] border border-slate-200 dark:border-[#24293D]">
                  <p className="text-xs font-bold text-[#635BFF]">POST /api/v1/storage/switch</p>
                  <p className="text-xs text-slate-400 mt-1">
                    Payload: <code className="text-[#22D3EE]">{`{ "driver": "s3" | "vercel-blob" | "local" }`}</code>
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#161926] border border-slate-200 dark:border-[#24293D]">
                  <p className="text-xs font-bold text-[#635BFF]">POST /api/v1/storage/upload</p>
                  <p className="text-xs text-slate-400 mt-1">
                    Accepts multipart files, automatically writes to active storage.
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#161926] border border-slate-200 dark:border-[#24293D]">
                  <p className="text-xs font-bold text-[#635BFF]">GET /api/v1/storage/status</p>
                  <p className="text-xs text-slate-400 mt-1">
                    Returns driver health, connection status, and list of available drivers.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </AppShell>
  );
}
