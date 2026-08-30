'use client';

import React, { useState } from 'react';
import {
  NirmaanLogo,
  NirmaanIcon,
  NirmaanAppIcon,
} from '@nirmaanify/icons';
import {
  AppShell,
  Sidebar,
  Topbar,
  PageHeader,
  Button,
  IconButton,
  Input,
  Select,
  Badge,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  Avatar,
  Separator,
  Dialog,
  Drawer,
  useToast,
} from '@nirmaanify/ui';
import {
  Sparkles,
  LayoutDashboard,
  Boxes,
  Users,
  HardDrive,
  Plus,
  ArrowRight,
  ExternalLink,
  ChevronDown,
  Building2,
  FolderDot,
  Server,
  Zap,
  Globe,
  Check,
  Send,
  Cloud,
  Database,
  Layers,
  Palette,
} from 'lucide-react';
import { useAuth } from '../context/auth-context';

export default function PlatformDashboard() {
  const { toast } = useToast();
  const {
    user,
    activeWorkspace,
    workspaces,
    projects,
    switchWorkspace,
    createWorkspace,
    createProject,
  } = useAuth();

  const [activeTab, setActiveTab] = useState<'dashboard' | 'projects' | 'team' | 'storage' | 'brand'>('dashboard');
  const [aiPrompt, setAiPrompt] = useState('');
  const [isCreatingProject, setIsCreatingProject] = useState(false);
  const [newProjectModal, setNewProjectModal] = useState(false);
  const [newWorkspaceModal, setNewWorkspaceModal] = useState(false);
  const [inviteModal, setInviteModal] = useState(false);

  // Form states
  const [projName, setProjName] = useState('');
  const [projType, setProjType] = useState('SAAS');
  const [wsName, setWsName] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('DEVELOPER');

  // Storage Driver State
  const [activeStorage, setActiveStorage] = useState<'local' | 's3' | 'vercel-blob'>('local');

  const navItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: <LayoutDashboard className="h-4 w-4" />,
      active: activeTab === 'dashboard',
      onClick: () => setActiveTab('dashboard'),
    },
    {
      id: 'projects',
      label: 'Projects',
      icon: <Boxes className="h-4 w-4" />,
      badge: String(projects.length),
      active: activeTab === 'projects',
      onClick: () => setActiveTab('projects'),
    },
    {
      id: 'team',
      label: 'Team & Workspaces',
      icon: <Users className="h-4 w-4" />,
      active: activeTab === 'team',
      onClick: () => setActiveTab('team'),
    },
    {
      id: 'storage',
      label: 'Storage & S3 / Vercel',
      icon: <HardDrive className="h-4 w-4" />,
      active: activeTab === 'storage',
      onClick: () => setActiveTab('storage'),
    },
    {
      id: 'brand',
      label: 'Design System',
      icon: <Palette className="h-4 w-4" />,
      active: activeTab === 'brand',
      onClick: () => setActiveTab('brand'),
    },
  ];

  const handleAiGenerate = async () => {
    if (!aiPrompt.trim()) return;
    setIsCreatingProject(true);
    toast({
      title: 'AI Planning Project',
      description: `Analyzing: "${aiPrompt.slice(0, 45)}..."`,
      type: 'info',
    });

    setTimeout(() => {
      const generated = createProject({
        name: aiPrompt.split(' ').slice(0, 3).map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ') + ' App',
        description: aiPrompt,
        type: 'SAAS',
        isBackendEnabled: true,
        framework: 'Next.js 15 App Router',
        uiLibrary: 'shadcn/ui + Tailwind CSS',
      });
      setIsCreatingProject(false);
      setAiPrompt('');
      toast({
        title: 'Project Created via AI!',
        description: 'Scaffolded architecture with Next.js 15 & NestJS API.',
        type: 'success',
      });
    }, 1200);
  };

  const handleCreateProjectSubmit = () => {
    if (!projName.trim()) return;
    createProject({
      name: projName,
      type: projType as any,
      isBackendEnabled: true,
    });
    setProjName('');
    setNewProjectModal(false);
    toast({
      title: 'Project Created',
      description: `${projName} is ready in ${activeWorkspace?.name}`,
      type: 'success',
    });
  };

  const handleCreateWorkspaceSubmit = () => {
    if (!wsName.trim()) return;
    createWorkspace(wsName);
    setWsName('');
    setNewWorkspaceModal(false);
    toast({
      title: 'Workspace Created',
      description: `Switched to ${wsName}`,
      type: 'success',
    });
  };

  return (
    <AppShell
      sidebar={
        <Sidebar
          items={navItems}
          footer={
            <div className="space-y-3">
              {/* Workspace Switcher Selector */}
              <div className="p-2.5 rounded-xl bg-slate-100 dark:bg-[#161926] border border-slate-200 dark:border-[#24293D]">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 overflow-hidden">
                    <Building2 className="h-4 w-4 text-[#635BFF] shrink-0" />
                    <span className="text-xs font-bold truncate">{activeWorkspace?.name}</span>
                  </div>
                  <Badge variant="indigo" size="sm">
                    {activeWorkspace?.role || 'OWNER'}
                  </Badge>
                </div>
                <div className="mt-2 pt-2 border-t border-slate-200 dark:border-[#24293D] flex items-center justify-between text-[11px] text-slate-400">
                  <button
                    onClick={() => setNewWorkspaceModal(true)}
                    className="hover:text-[#635BFF] transition-colors flex items-center gap-1"
                  >
                    <Plus className="h-3 w-3" /> New Workspace
                  </button>
                </div>
              </div>

              {/* User Profile */}
              <div className="flex items-center justify-between pt-1">
                <div className="flex items-center gap-2.5">
                  <Avatar fallback={user?.name?.slice(0, 2) || 'AD'} size="sm" status="online" />
                  <div className="overflow-hidden">
                    <p className="text-xs font-semibold truncate">{user?.name}</p>
                    <p className="text-[10px] text-slate-400 truncate">{user?.email}</p>
                  </div>
                </div>
              </div>
            </div>
          }
        />
      }
      topbar={
        <Topbar
          breadcrumbs={[
            'Nirmaanify',
            activeWorkspace?.name || 'Workspace',
            activeTab.toUpperCase(),
          ]}
          contextBadge="platform"
        />
      }
    >
      {/* 1. DASHBOARD VIEW (WEEK 9 DELIVERABLE) */}
      {activeTab === 'dashboard' && (
        <div className="space-y-8">
          <PageHeader
            title={`Welcome back, ${user?.name?.split(' ')[0] || 'Developer'}`}
            description="Manage your full-stack applications, trigger AI generations, and orchestrate workspace members."
            actions={
              <div className="flex items-center gap-2.5">
                <Button
                  variant="outline"
                  size="sm"
                  leftIcon={<Building2 className="h-4 w-4" />}
                  onClick={() => setNewWorkspaceModal(true)}
                >
                  New Workspace
                </Button>
                <Button
                  variant="default"
                  size="sm"
                  leftIcon={<Plus className="h-4 w-4" />}
                  onClick={() => setNewProjectModal(true)}
                >
                  Create Project
                </Button>
              </div>
            }
          />

          {/* AI Project Planning Bar */}
          <Card className="p-1.5 bg-gradient-to-r from-[#635BFF]/10 via-[#8B5CF6]/10 to-[#22D3EE]/10 border-[#635BFF]/30 shadow-lg shadow-[#635BFF]/5">
            <div className="flex flex-col sm:flex-row items-center gap-2 p-2">
              <div className="flex items-center gap-2.5 px-3 py-1.5 text-xs font-bold text-[#635BFF] dark:text-[#A5AEFD] shrink-0">
                <Sparkles className="h-4 w-4 animate-pulse" />
                AI Project Planner
              </div>
              <input
                type="text"
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAiGenerate()}
                placeholder="Describe what you want to build (e.g. AI-powered newsletter SaaS with Next.js 15, NestJS, and Stripe)..."
                className="w-full bg-transparent border-0 text-sm focus:outline-none text-slate-900 dark:text-slate-100 placeholder:text-slate-400 px-2"
              />
              <Button
                variant="default"
                size="sm"
                isLoading={isCreatingProject}
                onClick={handleAiGenerate}
                leftIcon={<Zap className="h-3.5 w-3.5" />}
                className="shrink-0 w-full sm:w-auto"
              >
                Generate Project
              </Button>
            </div>
            <div className="px-4 pb-2 pt-1 flex flex-wrap gap-2 text-[11px] text-slate-500">
              <span>Quick templates:</span>
              {[
                'Next.js 15 Luxury Fashion Store',
                'AI Video Generator SaaS',
                'Developer Docs & Tech Journal',
              ].map((template) => (
                <button
                  key={template}
                  onClick={() => setAiPrompt(template)}
                  className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-[#161926] hover:bg-[#635BFF]/20 text-slate-600 dark:text-slate-300 transition-colors"
                >
                  {template}
                </button>
              ))}
            </div>
          </Card>

          {/* Quick Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: 'Active Projects', val: projects.length, icon: <Boxes className="h-5 w-5 text-[#635BFF]" />, sub: 'In current workspace' },
              { label: 'Cloud Deployments', val: '2 Live', icon: <Globe className="h-5 w-5 text-[#22D3EE]" />, sub: 'Vercel & Docker' },
              { label: 'Workspace Members', val: activeWorkspace?.isPersonal ? '1 (Personal)' : '5 Members', icon: <Users className="h-5 w-5 text-[#8B5CF6]" />, sub: 'Role: OWNER' },
              { label: 'Storage Driver', val: activeStorage.toUpperCase(), icon: <HardDrive className="h-5 w-5 text-emerald-400" />, sub: '1-Click Switchable' },
            ].map((m) => (
              <Card key={m.label} hoverable className="p-5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-400">{m.label}</span>
                  <div className="p-2 rounded-lg bg-slate-100 dark:bg-[#161926]">{m.icon}</div>
                </div>
                <div className="mt-3">
                  <p className="text-2xl font-black">{m.val}</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">{m.sub}</p>
                </div>
              </Card>
            ))}
          </div>

          {/* Recent Projects Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold">Recent Projects</h3>
                <p className="text-xs text-slate-400">Applications inside {activeWorkspace?.name}</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setNewProjectModal(true)}
                leftIcon={<Plus className="h-3.5 w-3.5" />}
              >
                New Project
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {projects.map((proj) => (
                <Card key={proj.id} hoverable className="flex flex-col justify-between overflow-hidden">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <Badge
                          variant={proj.type === 'SAAS' ? 'indigo' : proj.type === 'ECOMMERCE' ? 'violet' : 'cyan'}
                          size="sm"
                        >
                          {proj.type}
                        </Badge>
                        <CardTitle className="mt-2 text-base">{proj.name}</CardTitle>
                      </div>
                      <div className="p-2 rounded-lg bg-slate-100 dark:bg-[#161926] text-slate-400">
                        <FolderDot className="h-4 w-4 text-[#635BFF]" />
                      </div>
                    </div>
                    <CardDescription className="line-clamp-2 mt-1">
                      {proj.description}
                    </CardDescription>
                  </CardHeader>

                  <CardContent className="space-y-3">
                    <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-[#161926] border border-slate-100 dark:border-[#24293D] space-y-1 text-xs">
                      <div className="flex items-center justify-between text-slate-400">
                        <span>Frontend:</span>
                        <span className="font-semibold text-slate-700 dark:text-slate-200">{proj.framework}</span>
                      </div>
                      <div className="flex items-center justify-between text-slate-400">
                        <span>Backend:</span>
                        <span className="font-semibold text-slate-700 dark:text-slate-200">
                          {proj.isBackendEnabled ? 'NestJS API + PostgreSQL' : 'Static Export'}
                        </span>
                      </div>
                    </div>
                  </CardContent>

                  <CardFooter className="pt-0 flex items-center justify-between border-t border-slate-100 dark:border-[#1E2337]">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toast({ title: 'Opening Visual Studio', description: `Loaded ${proj.name}`, type: 'info' })}
                    >
                      Open Studio
                    </Button>
                    <Button
                      variant="subtle"
                      size="sm"
                      rightIcon={<ArrowRight className="h-3.5 w-3.5" />}
                      onClick={() => toast({ title: 'Export Ready', description: `${proj.slug}.zip generated.`, type: 'success' })}
                    >
                      Export
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 2. PROJECTS TAB */}
      {activeTab === 'projects' && (
        <div className="space-y-6">
          <PageHeader
            title="Projects Directory"
            description="Manage all full-stack applications within your active workspace."
            actions={
              <Button variant="default" onClick={() => setNewProjectModal(true)} leftIcon={<Plus className="h-4 w-4" />}>
                Create Project
              </Button>
            }
          />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((proj) => (
              <Card key={proj.id} hoverable>
                <CardHeader>
                  <Badge variant="indigo" size="sm">{proj.type}</Badge>
                  <CardTitle className="mt-2">{proj.name}</CardTitle>
                  <CardDescription>{proj.description}</CardDescription>
                </CardHeader>
                <CardFooter>
                  <Button variant="default" size="sm" className="w-full">
                    Launch Studio
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* 3. TEAM & WORKSPACES TAB */}
      {activeTab === 'team' && (
        <div className="space-y-8">
          <PageHeader
            title="Workspaces & Team Management"
            description="Invite developers, manage role permissions (Owner, Admin, Developer, Editor, Viewer)."
            actions={
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setNewWorkspaceModal(true)}>
                  New Workspace
                </Button>
                <Button variant="default" onClick={() => setInviteModal(true)} leftIcon={<Plus className="h-4 w-4" />}>
                  Invite Member
                </Button>
              </div>
            }
          />

          {/* Workspace List */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {workspaces.map((ws) => {
              const isCurrent = ws.id === activeWorkspace?.id;
              return (
                <Card
                  key={ws.id}
                  hoverable
                  className={`${isCurrent ? 'border-2 border-[#635BFF]' : ''}`}
                >
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Building2 className="h-5 w-5 text-[#635BFF]" />
                        <CardTitle>{ws.name}</CardTitle>
                      </div>
                      {isCurrent && <Badge variant="indigo">Active</Badge>}
                    </div>
                    <CardDescription>Slug: {ws.slug} • {ws.isPersonal ? 'Personal Workspace' : 'Organization Workspace'}</CardDescription>
                  </CardHeader>
                  <CardFooter className="flex justify-between">
                    <span className="text-xs text-slate-400">Role: {ws.role || 'OWNER'}</span>
                    {!isCurrent && (
                      <Button variant="secondary" size="sm" onClick={() => switchWorkspace(ws.id)}>
                        Switch to this
                      </Button>
                    )}
                  </CardFooter>
                </Card>
              );
            })}
          </div>

          {/* Member Roster */}
          <Card>
            <CardHeader>
              <CardTitle>Workspace Members ({activeWorkspace?.name})</CardTitle>
              <CardDescription>Configured role-based access control (RBAC)</CardDescription>
            </CardHeader>
            <CardContent className="divide-y divide-slate-100 dark:divide-[#24293D]">
              {[
                { name: user?.name, email: user?.email, role: 'OWNER', avatar: 'AD' },
                { name: 'Sarah Chen', email: 'sarah.chen@acme.com', role: 'DEVELOPER', avatar: 'SC' },
                { name: 'David Miller', email: 'david.miller@acme.com', role: 'EDITOR', avatar: 'DM' },
                { name: 'Elena Rostova', email: 'elena@acme.com', role: 'VIEWER', avatar: 'ER' },
              ].map((m) => (
                <div key={m.email} className="py-3.5 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar fallback={m.avatar} size="sm" />
                    <div>
                      <p className="text-sm font-bold">{m.name}</p>
                      <p className="text-xs text-slate-400">{m.email}</p>
                    </div>
                  </div>
                  <Badge variant={m.role === 'OWNER' ? 'indigo' : m.role === 'DEVELOPER' ? 'cyan' : 'secondary'}>
                    {m.role}
                  </Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      )}

      {/* 4. STORAGE TAB */}
      {activeTab === 'storage' && (
        <div className="space-y-8">
          <PageHeader
            title="Multi-Driver Storage Engine"
            description="Switch between AWS S3 / MinIO, Vercel Blob Storage, and Local Filesystem in one click."
            badge={<Badge variant="indigo">One-Click Switcher</Badge>}
            actions={
              <Button
                variant="outline"
                size="sm"
                leftIcon={<ExternalLink className="h-3.5 w-3.5" />}
                onClick={() => window.open('http://localhost:4000/api/docs', '_blank')}
              >
                Swagger API
              </Button>
            }
          />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { id: 'local' as const, name: 'Local Filesystem', icon: <HardDrive className="h-5 w-5 text-slate-400" />, tag: 'Development' },
              { id: 's3' as const, name: 'AWS S3 / MinIO', icon: <Database className="h-5 w-5 text-[#635BFF]" />, tag: 'Object Store' },
              { id: 'vercel-blob' as const, name: 'Vercel Blob Storage', icon: <Cloud className="h-5 w-5 text-[#22D3EE]" />, tag: 'Edge CDN' },
            ].map((d) => (
              <Card
                key={d.id}
                hoverable
                onClick={() => {
                  setActiveStorage(d.id);
                  toast({ title: 'Storage Driver Switched', description: `Active: ${d.name}`, type: 'success' });
                }}
                className={`cursor-pointer ${activeStorage === d.id ? 'border-2 border-[#635BFF] bg-[#635BFF]/5' : ''}`}
              >
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-slate-100 dark:bg-[#161926]">{d.icon}</div>
                    <div>
                      <CardTitle className="text-base">{d.name}</CardTitle>
                      <Badge variant="indigo" size="sm">{d.tag}</Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardFooter>
                  <Button variant={activeStorage === d.id ? 'default' : 'outline'} size="sm" className="w-full">
                    {activeStorage === d.id ? 'Active Driver' : 'Switch to this'}
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* 5. DESIGN SYSTEM TAB */}
      {activeTab === 'brand' && (
        <div className="space-y-8">
          <PageHeader
            title="Design System Foundation"
            description="Brand kit, design tokens, and core components established in Phase 1."
          />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="flex flex-col items-center p-8 text-center">
              <NirmaanIcon size={64} variant="gradient" />
              <h4 className="mt-4 font-bold">Modular N Mark</h4>
            </Card>
            <Card className="flex flex-col items-center p-8 text-center">
              <NirmaanAppIcon size={64} />
              <h4 className="mt-4 font-bold">App Squircle</h4>
            </Card>
            <Card className="flex flex-col items-center p-8 text-center">
              <NirmaanLogo size="md" showTagline />
              <h4 className="mt-4 font-bold">Logo Lockup</h4>
            </Card>
          </div>
        </div>
      )}

      {/* CREATE PROJECT MODAL */}
      <Dialog
        isOpen={newProjectModal}
        onClose={() => setNewProjectModal(false)}
        title="Create New Project"
        description="Scaffold a new full-stack application inside this workspace."
        footer={
          <>
            <Button variant="outline" onClick={() => setNewProjectModal(false)}>Cancel</Button>
            <Button variant="default" onClick={handleCreateProjectSubmit}>Create Project</Button>
          </>
        }
      >
        <div className="space-y-4">
          <Input
            label="Project Name"
            placeholder="e.g. AI Customer Support Bot"
            value={projName}
            onChange={(e) => setProjName(e.target.value)}
          />
          <Select
            label="Project Architecture"
            value={projType}
            onChange={(e) => setProjType(e.target.value)}
            options={[
              { label: 'SaaS Dashboard (Next.js 15 + NestJS + PostgreSQL)', value: 'SAAS' },
              { label: 'E-commerce Platform (Next.js + NestJS + Stripe)', value: 'ECOMMERCE' },
              { label: 'Content Management Blog (Next.js Static)', value: 'BLOG' },
              { label: 'Custom Full-stack App', value: 'CUSTOM' },
            ]}
          />
        </div>
      </Dialog>

      {/* CREATE WORKSPACE MODAL */}
      <Dialog
        isOpen={newWorkspaceModal}
        onClose={() => setNewWorkspaceModal(false)}
        title="Create Workspace"
        description="Workspaces group projects, team members, and custom domains."
        footer={
          <>
            <Button variant="outline" onClick={() => setNewWorkspaceModal(false)}>Cancel</Button>
            <Button variant="default" onClick={handleCreateWorkspaceSubmit}>Create Workspace</Button>
          </>
        }
      >
        <div className="space-y-4">
          <Input
            label="Workspace Name"
            placeholder="e.g. CyberVanguard Studios"
            value={wsName}
            onChange={(e) => setWsName(e.target.value)}
          />
        </div>
      </Dialog>

      {/* INVITE MEMBER MODAL */}
      <Dialog
        isOpen={inviteModal}
        onClose={() => setInviteModal(false)}
        title="Invite Team Member"
        description="Add a collaborator with role-based permissions."
        footer={
          <>
            <Button variant="outline" onClick={() => setInviteModal(false)}>Cancel</Button>
            <Button
              variant="default"
              onClick={() => {
                setInviteModal(false);
                toast({ title: 'Invitation Sent', description: `Sent invite to ${inviteEmail}`, type: 'success' });
              }}
            >
              Send Invitation
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <Input
            label="Email Address"
            placeholder="colleague@company.com"
            value={inviteEmail}
            onChange={(e) => setInviteEmail(e.target.value)}
          />
          <Select
            label="Workspace Role"
            value={inviteRole}
            onChange={(e) => setInviteRole(e.target.value)}
            options={[
              { label: 'Developer (Full access to create & edit projects)', value: 'DEVELOPER' },
              { label: 'Admin (Manage team, settings, and projects)', value: 'ADMIN' },
              { label: 'Editor (Update CMS content and preview)', value: 'EDITOR' },
              { label: 'Viewer (Read-only access to projects)', value: 'VIEWER' },
            ]}
          />
        </div>
      </Dialog>
    </AppShell>
  );
}
