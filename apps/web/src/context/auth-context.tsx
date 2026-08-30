'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  UserDto,
  WorkspaceDto,
  ProjectDto,
  UserRole,
  AIProjectPlan,
  GeneratePlanDto,
  ApprovePlanDto,
} from '@nirmaanify/types';

interface AuthContextType {
  user: UserDto | null;
  activeWorkspace: WorkspaceDto | null;
  workspaces: WorkspaceDto[];
  projects: ProjectDto[];
  isAuthenticated: boolean;
  login: (email: string, pass?: string) => Promise<void>;
  register: (name: string, email: string, pass?: string) => Promise<void>;
  logout: () => void;
  switchWorkspace: (workspaceId: string) => void;
  createWorkspace: (name: string) => Promise<void>;
  createProject: (project: Partial<ProjectDto>) => Promise<ProjectDto>;
  updateProject: (id: string, updates: Partial<ProjectDto>) => Promise<ProjectDto>;
  deleteProject: (id: string) => Promise<void>;
  duplicateProject: (id: string) => Promise<ProjectDto>;
  archiveProject: (id: string) => Promise<ProjectDto>;
  unarchiveProject: (id: string) => Promise<ProjectDto>;
  generateAiPlan: (dto: GeneratePlanDto) => Promise<AIProjectPlan>;
  modifyAiPlan: (planId: string, updates: Partial<AIProjectPlan>) => Promise<AIProjectPlan>;
  approveAiPlan: (dto: ApprovePlanDto) => Promise<ProjectDto>;
  inviteMember: (email: string, role: UserRole) => Promise<void>;
}

const DEFAULT_USER: UserDto = {
  id: 'usr-alex-001',
  name: 'Alex Developer',
  email: 'alex@nirmaanify.ai',
  avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
  role: 'OWNER',
  isEmailVerified: true,
  isActive: true,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

const DEFAULT_WORKSPACES: WorkspaceDto[] = [
  {
    id: 'ws-personal-001',
    name: "Alex's Personal Studio",
    slug: 'alex-personal',
    isPersonal: true,
    ownerId: 'usr-alex-001',
    role: 'OWNER',
    projectCount: 3,
    memberCount: 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'ws-team-002',
    name: 'Acme SaaS Corp',
    slug: 'acme-saas',
    isPersonal: false,
    ownerId: 'usr-alex-001',
    role: 'OWNER',
    projectCount: 6,
    memberCount: 5,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

const INITIAL_PROJECTS: ProjectDto[] = [
  {
    id: 'proj-ecom-001',
    name: 'Fashion Hub Store',
    slug: 'fashion-hub',
    description: 'Modern luxury clothing boutique with Next.js App Router, NestJS API, and PostgreSQL.',
    type: 'ECOMMERCE',
    workspaceId: 'ws-personal-001',
    framework: 'Next.js 15 App Router',
    uiLibrary: 'shadcn/ui + Tailwind CSS',
    isBackendEnabled: true,
    isArchived: false,
    status: 'ACTIVE',
    projectSchema: {
      pages: ['/', '/products', '/products/[slug]', '/cart', '/checkout'],
      modules: ['Products', 'Orders', 'Payments'],
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'proj-saas-002',
    name: 'Nirmaan AI Video Studio',
    slug: 'ai-video-studio',
    description: 'Generative video SaaS platform with real-time preview and BullMQ background workers.',
    type: 'SAAS',
    workspaceId: 'ws-personal-001',
    framework: 'Next.js 15 App Router',
    uiLibrary: 'shadcn/ui + Framer Motion',
    isBackendEnabled: true,
    isArchived: false,
    status: 'ACTIVE',
    projectSchema: {
      pages: ['/dashboard', '/studio', '/team', '/billing'],
      modules: ['Generation', 'Billing', 'Storage'],
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'proj-blog-003',
    name: 'Engineering Tech Blog',
    slug: 'engineering-blog',
    description: 'High-performance developer documentation and engineering journal with dynamic CMS.',
    type: 'BLOG',
    workspaceId: 'ws-personal-001',
    framework: 'Next.js 15 Static',
    uiLibrary: 'Tailwind CSS Typography',
    isBackendEnabled: false,
    isArchived: false,
    status: 'ACTIVE',
    projectSchema: {
      pages: ['/', '/blog/[slug]', '/category/[slug]', '/authors/[slug]'],
      cms: ['Articles', 'Authors'],
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserDto | null>(DEFAULT_USER);
  const [workspaces, setWorkspaces] = useState<WorkspaceDto[]>(DEFAULT_WORKSPACES);
  const [activeWorkspace, setActiveWorkspace] = useState<WorkspaceDto | null>(DEFAULT_WORKSPACES[0]);
  const [projects, setProjects] = useState<ProjectDto[]>(INITIAL_PROJECTS);

  const login = async (email: string) => {
    const u: UserDto = {
      id: `usr-${Date.now()}`,
      name: email.split('@')[0],
      email,
      role: 'OWNER',
      isEmailVerified: true,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setUser(u);
  };

  const register = async (name: string, email: string) => {
    const u: UserDto = {
      id: `usr-${Date.now()}`,
      name,
      email,
      role: 'OWNER',
      isEmailVerified: true,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    const ws: WorkspaceDto = {
      id: `ws-${Date.now()}`,
      name: `${name}'s Workspace`,
      slug: `${name.toLowerCase().replace(/[^a-z0-9]/g, '-')}-personal`,
      isPersonal: true,
      ownerId: u.id,
      role: 'OWNER',
      projectCount: 0,
      memberCount: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setUser(u);
    setWorkspaces([ws]);
    setActiveWorkspace(ws);
  };

  const logout = () => {
    setUser(null);
    setActiveWorkspace(null);
  };

  const switchWorkspace = (workspaceId: string) => {
    const ws = workspaces.find((w) => w.id === workspaceId);
    if (ws) setActiveWorkspace(ws);
  };

  const createWorkspace = async (name: string) => {
    const newWs: WorkspaceDto = {
      id: `ws-${Date.now()}`,
      name,
      slug: name.toLowerCase().replace(/[^a-z0-9]/g, '-'),
      isPersonal: false,
      ownerId: user?.id || 'usr-alex-001',
      role: 'OWNER',
      projectCount: 0,
      memberCount: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setWorkspaces((prev) => [...prev, newWs]);
    setActiveWorkspace(newWs);
  };

  const createProject = async (data: Partial<ProjectDto>): Promise<ProjectDto> => {
    try {
      const res = await fetch(`${API_BASE}/projects`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          workspaceId: activeWorkspace?.id || 'ws-personal-001',
        }),
      });
      if (res.ok) {
        const created = await res.json();
        setProjects((prev) => [created, ...prev.filter((p) => p.id !== created.id)]);
        return created;
      }
    } catch {
      // Fallback
    }

    const fallback: ProjectDto = {
      id: `proj-${Date.now()}`,
      name: data.name || 'Untitled Project',
      slug: data.slug || (data.name || 'untitled').toLowerCase().replace(/[^a-z0-9]/g, '-'),
      description: data.description || 'Generated with Nirmaanify AI',
      type: data.type || 'WEBSITE',
      workspaceId: activeWorkspace?.id || 'ws-personal-001',
      framework: data.framework || 'Next.js 15 App Router',
      uiLibrary: data.uiLibrary || 'shadcn/ui + Tailwind CSS',
      isBackendEnabled: Boolean(data.isBackendEnabled),
      isArchived: false,
      status: 'ACTIVE',
      projectSchema: data.projectSchema || { pages: ['/'] },
      aiPlan: data.aiPlan,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setProjects((prev) => [fallback, ...prev]);
    return fallback;
  };

  const updateProject = async (id: string, updates: Partial<ProjectDto>): Promise<ProjectDto> => {
    try {
      const res = await fetch(`${API_BASE}/projects/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      if (res.ok) {
        const updated = await res.json();
        setProjects((prev) => prev.map((p) => (p.id === id ? updated : p)));
        return updated;
      }
    } catch {
      // Fallback
    }

    let updatedProject: ProjectDto | null = null;
    setProjects((prev) =>
      prev.map((p) => {
        if (p.id === id) {
          updatedProject = { ...p, ...updates, updatedAt: new Date().toISOString() };
          return updatedProject;
        }
        return p;
      }),
    );
    return updatedProject!;
  };

  const deleteProject = async (id: string): Promise<void> => {
    try {
      await fetch(`${API_BASE}/projects/${id}`, { method: 'DELETE' });
    } catch {
      // Fallback
    }
    setProjects((prev) => prev.filter((p) => p.id !== id));
  };

  const duplicateProject = async (id: string): Promise<ProjectDto> => {
    try {
      const res = await fetch(`${API_BASE}/projects/${id}/duplicate`, { method: 'POST' });
      if (res.ok) {
        const duplicated = await res.json();
        setProjects((prev) => [duplicated, ...prev]);
        return duplicated;
      }
    } catch {
      // Fallback
    }

    const source = projects.find((p) => p.id === id);
    const duplicated: ProjectDto = {
      ...(source || INITIAL_PROJECTS[0]),
      id: `proj-${Date.now()}`,
      name: `${source?.name || 'Project'} (Copy)`,
      slug: `${source?.slug || 'project'}-copy-${Math.floor(Math.random() * 1000)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setProjects((prev) => [duplicated, ...prev]);
    return duplicated;
  };

  const archiveProject = async (id: string): Promise<ProjectDto> => {
    try {
      const res = await fetch(`${API_BASE}/projects/${id}/archive`, { method: 'PATCH' });
      if (res.ok) {
        const updated = await res.json();
        setProjects((prev) => prev.map((p) => (p.id === id ? updated : p)));
        return updated;
      }
    } catch {
      // Fallback
    }
    return updateProject(id, { isArchived: true, status: 'ARCHIVED' });
  };

  const unarchiveProject = async (id: string): Promise<ProjectDto> => {
    try {
      const res = await fetch(`${API_BASE}/projects/${id}/unarchive`, { method: 'PATCH' });
      if (res.ok) {
        const updated = await res.json();
        setProjects((prev) => prev.map((p) => (p.id === id ? updated : p)));
        return updated;
      }
    } catch {
      // Fallback
    }
    return updateProject(id, { isArchived: false, status: 'ACTIVE' });
  };

  const generateAiPlan = async (dto: GeneratePlanDto): Promise<AIProjectPlan> => {
    try {
      const res = await fetch(`${API_BASE}/projects/ai/plan`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dto),
      });
      if (res.ok) {
        return await res.json();
      }
    } catch {
      // Fallback
    }

    // Client-side fallback if server is unreachable
    const words = dto.prompt.split(/\s+/).slice(0, 3).map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
    const title = words || 'AI Application';
    return {
      id: `plan-${Date.now()}`,
      prompt: dto.prompt,
      name: title,
      slug: title.toLowerCase().replace(/[^a-z0-9]/g, '-'),
      description: dto.prompt,
      type: dto.preferredType || 'SAAS',
      framework: 'Next.js 15 App Router (React 19)',
      uiLibrary: 'shadcn/ui + Tailwind CSS',
      pages: [
        { name: 'Home Landing', path: '/', description: 'Hero and overview', isProtected: false, components: ['HeroSection', 'FeatureGrid'] },
        { name: 'Dashboard', path: '/dashboard', description: 'Main application portal', isProtected: true, components: ['StatsOverview', 'RecentActivity'] },
      ],
      features: [
        { title: 'Core Functionality', description: 'Primary user workflow', category: 'core' },
        { title: 'Auth & Profile', description: 'JWT Authentication', category: 'auth' },
      ],
      components: [
        { name: 'AppNavbar', type: 'layout', source: 'shadcn', description: 'Navigation bar' },
        { name: 'DashboardCard', type: 'ui', source: 'shadcn', description: 'Metric card' },
      ],
      requiredPackages: [
        { name: 'lucide-react', version: '^0.475.0', scope: 'dependencies', purpose: 'Icons' },
        { name: 'zod', version: '^3.24.2', scope: 'dependencies', purpose: 'Validation' },
      ],
      backendRequirements: {
        enabled: true,
        framework: 'NestJS 11',
        modules: [{ name: 'AppModule', description: 'Main controller', endpoints: [{ method: 'GET', path: '/api/v1/data', description: 'Fetch data' }] }],
        auth: { type: 'jwt', providers: ['Email/Password'] },
      },
      databaseRequirements: {
        engine: 'PostgreSQL 16 with Prisma ORM',
        models: [{ name: 'Record', description: 'App data model', fields: [{ name: 'id', type: 'UUID', isPrimary: true }] }],
      },
      cmsRequirements: { enabled: false, type: 'None', collections: [] },
      pluginRecommendations: [
        { name: 'BullMQ Queue', category: 'Queue', reason: 'Asynchronous workers', isRecommended: true },
      ],
      architecturePlan: {
        summary: 'Scalable Next.js + NestJS microservices',
        frontendStack: ['Next.js 15', 'Tailwind CSS'],
        backendStack: ['NestJS 11'],
        databaseStack: ['PostgreSQL 16'],
        deploymentTarget: 'Vercel + Docker',
        scalabilityNotes: 'Decoupled API gateway',
      },
      status: 'DRAFT',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  };

  const modifyAiPlan = async (planId: string, updates: Partial<AIProjectPlan>): Promise<AIProjectPlan> => {
    try {
      const res = await fetch(`${API_BASE}/projects/ai/plan/${planId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      if (res.ok) {
        return await res.json();
      }
    } catch {
      // Fallback
    }
    return updates as AIProjectPlan;
  };

  const approveAiPlan = async (dto: ApprovePlanDto): Promise<ProjectDto> => {
    try {
      const res = await fetch(`${API_BASE}/projects/ai/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dto),
      });
      if (res.ok) {
        const project = await res.json();
        setProjects((prev) => [project, ...prev.filter((p) => p.id !== project.id)]);
        return project;
      }
    } catch {
      // Fallback
    }

    const created = await createProject({
      name: dto.customName || dto.plan.name,
      slug: dto.customSlug || dto.plan.slug,
      description: dto.plan.description,
      type: dto.plan.type,
      framework: dto.plan.framework,
      uiLibrary: dto.plan.uiLibrary,
      isBackendEnabled: dto.plan.backendRequirements.enabled,
      projectSchema: {
        pages: dto.plan.pages.map((p) => p.path),
        modules: dto.plan.backendRequirements.modules.map((m) => m.name),
      },
      aiPlan: { ...dto.plan, status: 'APPROVED' },
    });
    return created;
  };

  const inviteMember = async () => {
    // Member invited
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        activeWorkspace,
        workspaces,
        projects,
        isAuthenticated: user !== null,
        login,
        register,
        logout,
        switchWorkspace,
        createWorkspace,
        createProject,
        updateProject,
        deleteProject,
        duplicateProject,
        archiveProject,
        unarchiveProject,
        generateAiPlan,
        modifyAiPlan,
        approveAiPlan,
        inviteMember,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
}
