'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useSession, signOut as nextAuthSignOut } from 'next-auth/react';
import {
  UserDto,
  WorkspaceDto,
  ProjectDto,
  UserRole,
  AuthResponseDto,
} from '@nirmaanify/types';
import { apiClient, getStoredToken, setStoredToken } from '../lib/api';

interface AuthContextType {
  user: UserDto | null;
  activeWorkspace: WorkspaceDto | null;
  workspaces: WorkspaceDto[];
  projects: ProjectDto[];
  isAuthenticated: boolean;
  isLoading: boolean;
  token: string | null;
  login: (email: string, pass: string) => Promise<AuthResponseDto>;
  register: (name: string, email: string, pass: string) => Promise<AuthResponseDto>;
  logout: () => void;
  switchWorkspace: (workspaceId: string) => void;
  createWorkspace: (name: string, slug?: string) => Promise<WorkspaceDto>;
  createProject: (project: Partial<ProjectDto>) => Promise<ProjectDto>;
  inviteMember: (email: string, role: UserRole) => Promise<void>;
  removeMember: (userId: string) => Promise<void>;
  forgotPassword: (email: string) => Promise<{ message: string; mockResetToken?: string }>;
  resetPassword: (token: string, newPassword: string) => Promise<{ message: string }>;
  verifyEmail: (token: string) => Promise<{ message: string }>;
  refreshData: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { data: nextAuthSession, status: nextAuthStatus } = useSession();
  const [user, setUser] = useState<UserDto | null>(null);
  const [token, setTokenState] = useState<string | null>(null);
  const [workspaces, setWorkspaces] = useState<WorkspaceDto[]>([]);
  const [activeWorkspace, setActiveWorkspace] = useState<WorkspaceDto | null>(null);
  const [projects, setProjects] = useState<ProjectDto[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Sync NextAuth social auth session with AuthContext
  useEffect(() => {
    if (nextAuthSession?.user) {
      const socialUser = nextAuthSession.user as any;
      const providerName = (socialUser.provider || 'GOOGLE') as 'GOOGLE' | 'GITHUB' | 'CREDENTIALS';

      const syncedUser: UserDto = {
        id: socialUser.id || user?.id || `usr-${Date.now()}`,
        name: socialUser.name || user?.name || 'Developer',
        email: socialUser.email || user?.email || '',
        avatarUrl: socialUser.image || user?.avatarUrl,
        role: (socialUser.role as UserRole) || 'OWNER',
        primaryProvider: providerName,
        socialAccounts: socialUser.socialAccount ? [socialUser.socialAccount] : undefined,
        isEmailVerified: true,
        isActive: true,
        createdAt: user?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      setUser(syncedUser);

      if ((nextAuthSession as any).accessToken) {
        setTokenState((nextAuthSession as any).accessToken);
        setStoredToken((nextAuthSession as any).accessToken);
        apiClient.setToken((nextAuthSession as any).accessToken);
      }

      if (socialUser.activeWorkspace) {
        setActiveWorkspace(socialUser.activeWorkspace);
      }
      setIsLoading(false);
    }
  }, [nextAuthSession]);

  // Initialize auth state on mount from stored token
  useEffect(() => {
    const savedToken = getStoredToken();
    if (savedToken) {
      setTokenState(savedToken);
      apiClient.setToken(savedToken);
      // Fetch fresh profile from API
      apiClient.auth
        .getProfile()
        .then((profile) => {
          if (profile) setUser(profile);
        })
        .catch(() => {
          // If token verification fails, clear invalid token
          setTokenState(null);
          setStoredToken(null);
          apiClient.setToken(null);
          setUser(null);
        })
        .finally(() => setIsLoading(false));
    } else {
      if (nextAuthStatus !== 'loading') {
        setIsLoading(false);
      }
    }
  }, [nextAuthStatus]);

  const refreshData = useCallback(async () => {
    try {
      const [fetchedWs, fetchedProjects] = await Promise.allSettled([
        apiClient.workspaces.listWorkspaces(),
        apiClient.projects.listProjects(activeWorkspace?.id),
      ]);

      if (fetchedWs.status === 'fulfilled' && fetchedWs.value?.length) {
        setWorkspaces(fetchedWs.value);
        if (!activeWorkspace || !fetchedWs.value.some((w) => w.id === activeWorkspace.id)) {
          setActiveWorkspace(fetchedWs.value[0]);
        }
      }

      if (fetchedProjects.status === 'fulfilled' && fetchedProjects.value?.length) {
        setProjects(fetchedProjects.value);
      }
    } catch {
      // Ignored for refresh polling
    }
  }, [activeWorkspace]);

  const login = async (email: string, pass: string): Promise<AuthResponseDto> => {
    const res = await apiClient.auth.login({ email, password: pass });
    setUser(res.user);
    setTokenState(res.accessToken);
    setStoredToken(res.accessToken);
    apiClient.setToken(res.accessToken);

    if (res.workspaces?.length) {
      setWorkspaces(res.workspaces);
    }
    if (res.activeWorkspace) {
      setActiveWorkspace(res.activeWorkspace);
    }
    return res;
  };

  const register = async (name: string, email: string, pass: string): Promise<AuthResponseDto> => {
    const res = await apiClient.auth.register({ name, email, password: pass });
    setUser(res.user);
    setTokenState(res.accessToken);
    setStoredToken(res.accessToken);
    apiClient.setToken(res.accessToken);

    if (res.workspaces?.length) {
      setWorkspaces(res.workspaces);
    }
    if (res.activeWorkspace) {
      setActiveWorkspace(res.activeWorkspace);
    }
    return res;
  };

  const logout = () => {
    setUser(null);
    setTokenState(null);
    setStoredToken(null);
    apiClient.setToken(null);
    setActiveWorkspace(null);
    setWorkspaces([]);
    setProjects([]);
    try {
      nextAuthSignOut({ redirect: false });
    } catch {
      // Ignore if next-auth not initialized
    }
  };

  const switchWorkspace = (workspaceId: string) => {
    const ws = workspaces.find((w) => w.id === workspaceId);
    if (ws) {
      setActiveWorkspace(ws);
    }
  };

  const createWorkspace = async (name: string, slug?: string): Promise<WorkspaceDto> => {
    const created = await apiClient.workspaces.createWorkspace({
      name,
      slug: slug || name.toLowerCase().replace(/[^a-z0-9]/g, '-'),
      isPersonal: false,
    });
    setWorkspaces((prev) => [...prev, created]);
    setActiveWorkspace(created);
    return created;
  };

  const createProject = async (data: Partial<ProjectDto>): Promise<ProjectDto> => {
    const created = await apiClient.projects.createProject({
      ...data,
      workspaceId: activeWorkspace?.id || '',
    });
    setProjects((prev) => [created, ...prev]);
    return created;
  };

  const inviteMember = async (email: string, role: UserRole): Promise<void> => {
    if (!activeWorkspace) throw new Error('No active workspace selected');
    await apiClient.workspaces.inviteMember(activeWorkspace.id, { email, role });
  };

  const removeMember = async (userId: string): Promise<void> => {
    if (!activeWorkspace) throw new Error('No active workspace selected');
    await apiClient.workspaces.removeMember(activeWorkspace.id, userId);
  };

  const forgotPassword = async (email: string) => {
    return await apiClient.auth.forgotPassword({ email });
  };

  const resetPassword = async (token: string, newPassword: string) => {
    return await apiClient.auth.resetPassword({ token, newPassword });
  };

  const verifyEmail = async (token: string) => {
    return await apiClient.auth.verifyEmail({ token });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        activeWorkspace,
        workspaces,
        projects,
        isAuthenticated: user !== null,
        isLoading,
        token,
        login,
        register,
        logout,
        switchWorkspace,
        createWorkspace,
        createProject,
        inviteMember,
        removeMember,
        forgotPassword,
        resetPassword,
        verifyEmail,
        refreshData,
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
