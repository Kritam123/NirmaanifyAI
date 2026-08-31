'use client';

import React, { useState, useMemo } from 'react';
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
  Dialog,
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
  Building2,
  FolderDot,
  Server,
  Zap,
  Globe,
  Database,
  Cloud,
  Palette,
  Search,
  Filter,
  Archive,
  Layers,
  FolderPlus,
} from 'lucide-react';
import { ProjectDto, ProjectType } from '@nirmaanify/types';
import { useAuth } from '../context/auth-context';
import { AiPlannerModal } from '../components/ai-planner-modal';
import { CreateProjectModal } from '../components/create-project-modal';
import { EditProjectModal } from '../components/edit-project-modal';
import { ProjectSettingsModal } from '../components/project-settings-modal';
import { VisualStudioModal } from '../components/studio/visual-studio-modal';
import { CmsDashboard } from '../components/cms/cms-dashboard';
import { BackendDashboard } from '../components/backend/backend-dashboard';
import { ProjectCard } from '../components/project-card';

export default function PlatformDashboard() {
  const { toast } = useToast();
  const {
    user,
    activeWorkspace,
    workspaces,
    projects,
    switchWorkspace,
    createWorkspace,
  } = useAuth();

  const [activeTab, setActiveTab] = useState<'dashboard' | 'projects' | 'cms' | 'backend' | 'team' | 'storage' | 'brand'>('dashboard');

  // AI Planner Modal state
  const [aiPlannerModalOpen, setAiPlannerModalOpen] = useState(false);
  const [aiInitialPrompt, setAiInitialPrompt] = useState('');
  const [dashboardAiPrompt, setDashboardAiPrompt] = useState('');

  // Project Modals & Visual Studio state
  const [visualStudioModalOpen, setVisualStudioModalOpen] = useState(false);
  const [createProjectModalOpen, setCreateProjectModalOpen] = useState(false);
  const [editProjectModalOpen, setEditProjectModalOpen] = useState(false);
  const [projectSettingsModalOpen, setProjectSettingsModalOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<ProjectDto | null>(null);

  // Workspace & Team Modals
  const [newWorkspaceModal, setNewWorkspaceModal] = useState(false);
  const [inviteModal, setInviteModal] = useState(false);
  const [wsName, setWsName] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('DEVELOPER');

  // Project Filter & Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<'ALL' | ProjectType>('ALL');
  const [statusFilter, setStatusFilter] = useState<'ACTIVE' | 'ARCHIVED' | 'ALL'>('ACTIVE');

  // Storage Driver State
  const [activeStorage, setActiveStorage] = useState<'local' | 's3' | 'vercel-blob'>('local');

  const filteredProjects = useMemo(() => {
    return projects.filter((p) => {
      // Workspace filter
      if (activeWorkspace && p.workspaceId && p.workspaceId !== activeWorkspace.id) {
        // show all if personal fallback
      }

      // Status filter
      if (statusFilter === 'ACTIVE' && p.isArchived) return false;
      if (statusFilter === 'ARCHIVED' && !p.isArchived) return false;

      // Type filter
      if (typeFilter !== 'ALL' && p.type !== typeFilter) return false;

      // Search filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          p.name.toLowerCase().includes(q) ||
          p.slug.toLowerCase().includes(q) ||
          (p.description && p.description.toLowerCase().includes(q))
        );
      }

      return true;
    });
  }, [projects, activeWorkspace, statusFilter, typeFilter, searchQuery]);

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
      badge: String(projects.filter((p) => !p.isArchived).length),
      active: activeTab === 'projects',
      onClick: () => setActiveTab('projects'),
    },
    {
      id: 'cms',
      label: 'CMS Collections',
      icon: <Database className="h-4 w-4" />,
      active: activeTab === 'cms',
      onClick: () => setActiveTab('cms'),
    },
    {
      id: 'backend',
      label: 'Backend & NestJS',
      icon: <Server className="h-4 w-4" />,
      active: activeTab === 'backend',
      onClick: () => setActiveTab('backend'),
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

  const handleLaunchAiPlanner = (promptText?: string) => {
    const p = promptText !== undefined ? promptText : dashboardAiPrompt;
    setAiInitialPrompt(p);
    setAiPlannerModalOpen(true);
  };

  const handleOpenEdit = (project: ProjectDto) => {
    setSelectedProject(project);
    setEditProjectModalOpen(true);
  };

  const handleOpenSettings = (project: ProjectDto) => {
    setSelectedProject(project);
    setProjectSettingsModalOpen(true);
  };

  const handleOpenStudio = (project: ProjectDto) => {
    setSelectedProject(project);
    setVisualStudioModalOpen(true);
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
      {/* 1. DASHBOARD VIEW */}
      {activeTab === 'dashboard' && (
        <div className="space-y-8">
          <PageHeader
            title={`Welcome back, ${user?.name?.split(' ')[0] || 'Developer'}`}
            description="Manage your full-stack applications, generate blueprints with AI, and oversee workspace projects."
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
                  variant="outline"
                  size="sm"
                  leftIcon={<FolderPlus className="h-4 w-4" />}
                  onClick={() => setCreateProjectModalOpen(true)}
                >
                  Create Project
                </Button>
                <Button
                  variant="default"
                  size="sm"
                  leftIcon={<Sparkles className="h-4 w-4" />}
                  onClick={() => handleLaunchAiPlanner()}
                >
                  AI Project Planner
                </Button>
              </div>
            }
          />

          {/* AI Project Planning Bar (Week 11 & 12 Feature) */}
          <Card className="p-1.5 bg-gradient-to-r from-[#635BFF]/10 via-[#8B5CF6]/10 to-[#22D3EE]/10 border-[#635BFF]/30 shadow-lg shadow-[#635BFF]/5">
            <div className="flex flex-col sm:flex-row items-center gap-2 p-2">
              <div className="flex items-center gap-2.5 px-3 py-1.5 text-xs font-bold text-[#635BFF] dark:text-[#A5AEFD] shrink-0">
                <Sparkles className="h-4 w-4 animate-pulse" />
                AI Project Planner
              </div>
              <input
                type="text"
                value={dashboardAiPrompt}
                onChange={(e) => setDashboardAiPrompt(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleLaunchAiPlanner()}
                placeholder='e.g. "I want to create an online clothing store" or "AI video generation SaaS platform"...'
                className="w-full bg-transparent border-0 text-sm focus:outline-none text-slate-900 dark:text-slate-100 placeholder:text-slate-400 px-2"
              />
              <Button
                variant="default"
                size="sm"
                onClick={() => handleLaunchAiPlanner()}
                leftIcon={<Zap className="h-3.5 w-3.5" />}
                className="shrink-0 w-full sm:w-auto"
              >
                Architect Blueprint
              </Button>
            </div>
            <div className="px-4 pb-2 pt-1 flex flex-wrap gap-2 text-[11px] text-slate-500">
              <span className="font-semibold text-slate-400">Inspiration:</span>
              {[
                { label: '🛍️ Online Clothing Store', prompt: 'I want to create an online clothing store with Next.js, Stripe checkout, variant selector, and cart.' },
                { label: '🎬 AI Video Generator SaaS', prompt: 'Generative AI video studio SaaS platform with subscription tiers, BullMQ workers, and credit system.' },
                { label: '📝 Developer Docs & Tech Blog', prompt: 'Engineering blog with MDX support, syntax highlighting, author profiles, and newsletter capture.' },
                { label: '📊 Executive Analytics Hub', prompt: 'Executive KPI dashboard with Recharts, date filters, TanStack table, and CSV export.' },
              ].map((template) => (
                <button
                  key={template.label}
                  onClick={() => {
                    setDashboardAiPrompt(template.prompt);
                    handleLaunchAiPlanner(template.prompt);
                  }}
                  className="px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-[#161926] hover:bg-[#635BFF]/20 text-slate-600 dark:text-slate-300 transition-colors border border-slate-200 dark:border-[#24293D]"
                >
                  {template.label}
                </button>
              ))}
            </div>
          </Card>

          {/* Quick Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: 'Active Projects', val: projects.filter((p) => !p.isArchived).length, icon: <Boxes className="h-5 w-5 text-[#635BFF]" />, sub: `${projects.filter((p) => p.isArchived).length} Archived` },
              { label: 'Cloud Deployments', val: '2 Live', icon: <Globe className="h-5 w-5 text-[#22D3EE]" />, sub: 'Vercel & Docker' },
              { label: 'Workspace Members', val: activeWorkspace?.isPersonal ? '1 (Personal)' : '5 Members', icon: <Users className="h-5 w-5 text-[#8B5CF6]" />, sub: `Role: ${activeWorkspace?.role || 'OWNER'}` },
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
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCreateProjectModalOpen(true)}
                  leftIcon={<Plus className="h-3.5 w-3.5" />}
                >
                  New Project
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setActiveTab('projects')}
                >
                  View All ({projects.length})
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {projects.filter((p) => !p.isArchived).slice(0, 6).map((proj) => (
                <ProjectCard
                  key={proj.id}
                  project={proj}
                  onOpenStudio={handleOpenStudio}
                  onEdit={handleOpenEdit}
                  onSettings={handleOpenSettings}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 2. PROJECTS MANAGEMENT DIRECTORY (WEEK 10 DELIVERABLE) */}
      {activeTab === 'projects' && (
        <div className="space-y-6">
          <PageHeader
            title="Projects Management"
            description="Create, edit, duplicate, archive, and configure project settings across all supported architectures."
            actions={
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  onClick={() => setCreateProjectModalOpen(true)}
                  leftIcon={<Plus className="h-4 w-4" />}
                >
                  Create Project
                </Button>
                <Button
                  variant="default"
                  onClick={() => handleLaunchAiPlanner()}
                  leftIcon={<Sparkles className="h-4 w-4" />}
                >
                  AI Project Planner
                </Button>
              </div>
            }
          />

          {/* Filter, Search & Status Bar */}
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 p-3 rounded-2xl bg-slate-100/70 dark:bg-[#161926] border border-slate-200 dark:border-[#24293D]">
            <div className="flex items-center gap-2 flex-1 max-w-md">
              <div className="relative w-full">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search projects by name, slug or description..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-white dark:bg-[#0E121E] border border-slate-200 dark:border-[#24293D] focus:outline-none focus:ring-2 focus:ring-[#635BFF] text-slate-900 dark:text-slate-100"
                />
              </div>
            </div>

            <div className="flex items-center gap-2 flex-wrap text-xs">
              {/* Status Toggle Tabs */}
              <div className="flex items-center bg-white dark:bg-[#0E121E] p-1 rounded-xl border border-slate-200 dark:border-[#24293D]">
                {(['ACTIVE', 'ARCHIVED', 'ALL'] as const).map((status) => (
                  <button
                    key={status}
                    onClick={() => setStatusFilter(status)}
                    className={`px-3 py-1 rounded-lg font-semibold transition-colors ${
                      statusFilter === status
                        ? 'bg-[#635BFF] text-white'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    {status === 'ACTIVE' ? 'Active' : status === 'ARCHIVED' ? 'Archived' : 'All'}
                  </button>
                ))}
              </div>

              {/* Type Filter Select */}
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value as any)}
                className="px-3 py-2 rounded-xl bg-white dark:bg-[#0E121E] border border-slate-200 dark:border-[#24293D] text-xs font-semibold text-slate-700 dark:text-slate-300 focus:outline-none"
              >
                <option value="ALL">All Architectures</option>
                <option value="ECOMMERCE">E-commerce</option>
                <option value="SAAS">SaaS Platform</option>
                <option value="WEBSITE">Website</option>
                <option value="BLOG">Blog & News</option>
                <option value="DASHBOARD">Dashboard</option>
                <option value="PORTFOLIO">Portfolio</option>
                <option value="CUSTOM">Custom App</option>
              </select>
            </div>
          </div>

          {/* Projects Grid */}
          {filteredProjects.length === 0 ? (
            <Card className="p-12 text-center space-y-3">
              <FolderDot className="h-10 w-10 text-slate-400 mx-auto" />
              <h4 className="font-bold text-base">No projects match your filter</h4>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Try adjusting your search criteria, switching between Active/Archived, or create a new project.
              </p>
              <div className="pt-2 flex justify-center gap-2">
                <Button size="sm" variant="outline" onClick={() => { setSearchQuery(''); setTypeFilter('ALL'); setStatusFilter('ALL'); }}>
                  Clear Filters
                </Button>
                <Button size="sm" variant="default" onClick={() => setCreateProjectModalOpen(true)}>
                  Create Project
                </Button>
              </div>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProjects.map((proj) => (
                <ProjectCard
                  key={proj.id}
                  project={proj}
                  onOpenStudio={handleOpenStudio}
                  onEdit={handleOpenEdit}
                  onSettings={handleOpenSettings}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* 3. DYNAMIC CMS & HEADLESS CONTENT MANAGEMENT TAB (Phase 7) */}
      {activeTab === 'cms' && (
        <CmsDashboard
          projects={projects}
          activeProjectId={selectedProject?.id || projects[0]?.id}
        />
      )}

      {/* 4. BACKEND BUILDER & NESTJS GENERATION TAB (Phase 8) */}
      {activeTab === 'backend' && (
        <BackendDashboard
          projects={projects}
          activeProjectId={selectedProject?.id || projects[0]?.id}
        />
      )}

      {/* 5. TEAM & WORKSPACES TAB */}
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

      {/* --- ALL MODALS --- */}

      {/* AI PROJECT PLANNER & APPROVAL MODAL (Week 11 & 12) */}
      <AiPlannerModal
        isOpen={aiPlannerModalOpen}
        onClose={() => setAiPlannerModalOpen(false)}
        initialPrompt={aiInitialPrompt}
      />

      {/* CREATE PROJECT MODAL (Week 10) */}
      <CreateProjectModal
        isOpen={createProjectModalOpen}
        onClose={() => setCreateProjectModalOpen(false)}
      />

      {/* VISUAL STUDIO CANVAS MODAL (Phase 5 Deliverable) */}
      <VisualStudioModal
        project={selectedProject}
        isOpen={visualStudioModalOpen}
        onClose={() => {
          setVisualStudioModalOpen(false);
          setSelectedProject(null);
        }}
      />

      {/* EDIT PROJECT MODAL (Week 10) */}
      <EditProjectModal
        project={selectedProject}
        isOpen={editProjectModalOpen}
        onClose={() => {
          setEditProjectModalOpen(false);
          setSelectedProject(null);
        }}
      />

      {/* PROJECT SETTINGS & DANGER ZONE MODAL (Week 10) */}
      <ProjectSettingsModal
        project={selectedProject}
        isOpen={projectSettingsModalOpen}
        onClose={() => {
          setProjectSettingsModalOpen(false);
          setSelectedProject(null);
        }}
        onEdit={() => {
          setProjectSettingsModalOpen(false);
          setEditProjectModalOpen(true);
        }}
      />

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
