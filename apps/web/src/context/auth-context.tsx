'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserDto, WorkspaceDto, ProjectDto, UserRole } from '@nirmaanify/types';

interface AuthContextType {
  user: UserDto | null;
  activeWorkspace: WorkspaceDto | null;
  workspaces: WorkspaceDto[];
  projects: ProjectDto[];
  isAuthenticated: boolean;
  login: (email: string, pass: string) => Promise<void>;
  register: (name: string, email: string, pass: string) => Promise<void>;
  logout: () => void;
  switchWorkspace: (workspaceId: string) => void;
  createWorkspace: (name: string) => Promise<void>;
  createProject: (project: Partial<ProjectDto>) => Promise<ProjectDto>;
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
    projectSchema: { pages: ['/', '/products', '/cart', '/checkout'] },
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
    projectSchema: { pages: ['/dashboard', '/studio', '/editor'] },
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
    projectSchema: { pages: ['/', '/blog', '/about'] },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

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
    const newProj: ProjectDto = {
      id: `proj-${Date.now()}`,
      name: data.name || 'Untitled App',
      slug: (data.name || 'untitled').toLowerCase().replace(/[^a-z0-9]/g, '-'),
      description: data.description || 'Generated with Nirmaanify AI',
      type: data.type || 'WEBSITE',
      workspaceId: activeWorkspace?.id || 'ws-personal-001',
      framework: data.framework || 'Next.js 15 App Router',
      uiLibrary: data.uiLibrary || 'shadcn/ui + Tailwind CSS',
      isBackendEnabled: Boolean(data.isBackendEnabled),
      projectSchema: data.projectSchema || { pages: ['/'] },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setProjects((prev) => [newProj, ...prev]);
    return newProj;
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
