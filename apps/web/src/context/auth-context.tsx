'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useSession, signOut as nextAuthSignOut } from 'next-auth/react';
import {
  UserDto,
  WorkspaceDto,
  ProjectDto,
  UserRole,
  AIProjectPlan,
  GeneratePlanDto,
  ApprovePlanDto,
  AuthResponseDto,
} from '@nirmaanify/types';
import { apiClient, getStoredToken, setStoredToken } from '../lib/api';

const ACTIVE_WS_KEY = 'nirmaanify_active_ws';

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
  logout: () => Promise<void>;
  switchWorkspace: (workspaceId: string) => Promise<void>;
  createWorkspace: (name: string, slug?: string, isPersonal?: boolean) => Promise<WorkspaceDto>;
  deleteWorkspace: (workspaceId: string) => Promise<void>;
  leaveWorkspace: (workspaceId: string) => Promise<void>;
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
  updateMemberRole: (userId: string, role: UserRole) => Promise<void>;
  removeMember: (userId: string) => Promise<void>;
  forgotPassword: (email: string) => Promise<{ message: string }>;
  resetPassword: (token: string, newPassword: string) => Promise<{ message: string }>;
  verifyEmail: (dtoOrToken: string | { token?: string; otp?: string; email?: string }) => Promise<{ success: boolean; message: string; user?: UserDto; accessToken?: string }>;
  resendVerification: (email: string) => Promise<{ success: boolean; message: string }>;
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
        const nextToken = (nextAuthSession as any).accessToken;
        setTokenState(nextToken);
        setStoredToken(nextToken);
        apiClient.setToken(nextToken);

        // Fetch workspaces from PostgreSQL for social user
        apiClient.workspaces
          .listWorkspaces()
          .then(async (wsList) => {
            if (Array.isArray(wsList) && wsList.length > 0) {
              setWorkspaces(wsList);
              const savedWsId = typeof window !== 'undefined' ? localStorage.getItem(ACTIVE_WS_KEY) : null;
              const matched = wsList.find((w) => w.id === savedWsId) || wsList[0];
              setActiveWorkspace(matched);
              if (typeof window !== 'undefined' && matched) {
                localStorage.setItem(ACTIVE_WS_KEY, matched.id);
              }
              try {
                const projList = await apiClient.projects.listProjects(matched.id);
                if (Array.isArray(projList)) setProjects(projList);
              } catch {
                // Ignored
              }
            } else {
              setWorkspaces([]);
              setActiveWorkspace(null);
              setProjects([]);
              if (typeof window !== 'undefined') {
                localStorage.removeItem(ACTIVE_WS_KEY);
              }
            }
          })
          .catch(() => {
            setWorkspaces([]);
            setActiveWorkspace(null);
            setProjects([]);
          })
          .finally(() => setIsLoading(false));
      } else {
        setIsLoading(false);
      }
    }
  }, [nextAuthSession]);

  // Initialize auth state on mount from stored token and reload workspaces + profile
  useEffect(() => {
    const savedToken = getStoredToken();
    if (savedToken) {
      setTokenState(savedToken);
      apiClient.setToken(savedToken);

      // Concurrently fetch profile and real workspaces from PostgreSQL
      Promise.allSettled([
        apiClient.auth.getProfile(),
        apiClient.workspaces.listWorkspaces(),
      ])
        .then(async ([profileRes, wsRes]) => {
          if (profileRes.status === 'fulfilled' && profileRes.value) {
            setUser(profileRes.value);
          }

          let currentWs: WorkspaceDto | null = null;
          if (wsRes.status === 'fulfilled' && Array.isArray(wsRes.value)) {
            const realWorkspaces = wsRes.value;
            setWorkspaces(realWorkspaces);

            if (realWorkspaces.length > 0) {
              const savedWsId = typeof window !== 'undefined' ? localStorage.getItem(ACTIVE_WS_KEY) : null;
              currentWs = realWorkspaces.find((w) => w.id === savedWsId) || realWorkspaces[0];
              setActiveWorkspace(currentWs);
              if (typeof window !== 'undefined' && currentWs) {
                localStorage.setItem(ACTIVE_WS_KEY, currentWs.id);
              }
            } else {
              // Real DB returned 0 workspaces: clear active workspace & projects
              setActiveWorkspace(null);
              setProjects([]);
              if (typeof window !== 'undefined') {
                localStorage.removeItem(ACTIVE_WS_KEY);
              }
            }
          }

          // Fetch projects for the real active workspace
          if (currentWs) {
            try {
              const projList = await apiClient.projects.listProjects(currentWs.id);
              if (Array.isArray(projList)) {
                setProjects(projList);
              }
            } catch {
              setProjects([]);
            }
          } else {
            setProjects([]);
          }
        })
        .catch(() => {
          // If token verification fails, clear invalid token
          setTokenState(null);
          setStoredToken(null);
          apiClient.setToken(null);
          setUser(null);
          setWorkspaces([]);
          setActiveWorkspace(null);
          setProjects([]);
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

      if (fetchedWs.status === 'fulfilled' && Array.isArray(fetchedWs.value)) {
        const wsList = fetchedWs.value;
        setWorkspaces(wsList);

        if (wsList.length === 0) {
          setActiveWorkspace(null);
          setProjects([]);
          if (typeof window !== 'undefined') {
            localStorage.removeItem(ACTIVE_WS_KEY);
          }
        } else if (!activeWorkspace || !wsList.some((w) => w.id === activeWorkspace.id)) {
          const savedWsId = typeof window !== 'undefined' ? localStorage.getItem(ACTIVE_WS_KEY) : null;
          const fallback = wsList.find((w) => w.id === savedWsId) || wsList[0];
          setActiveWorkspace(fallback);
          if (typeof window !== 'undefined' && fallback) {
            localStorage.setItem(ACTIVE_WS_KEY, fallback.id);
          }
        }
      }

      if (fetchedProjects.status === 'fulfilled' && Array.isArray(fetchedProjects.value)) {
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

    if (Array.isArray(res.workspaces) && res.workspaces.length > 0) {
      setWorkspaces(res.workspaces);
      const ws = res.activeWorkspace || res.workspaces[0];
      setActiveWorkspace(ws);
      if (typeof window !== 'undefined' && ws) {
        localStorage.setItem(ACTIVE_WS_KEY, ws.id);
      }
      try {
        const projList = await apiClient.projects.listProjects(ws.id);
        if (Array.isArray(projList)) setProjects(projList);
      } catch {
        // Ignored
      }
    } else {
      setWorkspaces([]);
      setActiveWorkspace(null);
      setProjects([]);
      if (typeof window !== 'undefined') {
        localStorage.removeItem(ACTIVE_WS_KEY);
      }
    }

    return res;
  };

  const register = async (name: string, email: string, pass: string): Promise<AuthResponseDto> => {
    const res = await apiClient.auth.register({ name, email, password: pass });
    setUser(res.user);
    setTokenState(res.accessToken);
    setStoredToken(res.accessToken);
    apiClient.setToken(res.accessToken);

    if (Array.isArray(res.workspaces) && res.workspaces.length > 0) {
      setWorkspaces(res.workspaces);
      const ws = res.activeWorkspace || res.workspaces[0];
      setActiveWorkspace(ws);
      if (typeof window !== 'undefined' && ws) {
        localStorage.setItem(ACTIVE_WS_KEY, ws.id);
      }
    } else {
      setWorkspaces([]);
      setActiveWorkspace(null);
      setProjects([]);
      if (typeof window !== 'undefined') {
        localStorage.removeItem(ACTIVE_WS_KEY);
      }
    }

    return res;
  };

  const logout = async () => {
    setUser(null);
    setTokenState(null);
    setStoredToken(null);
    apiClient.setToken(null);
    setActiveWorkspace(null);
    setWorkspaces([]);
    setProjects([]);
    if (typeof window !== 'undefined') {
      localStorage.removeItem(ACTIVE_WS_KEY);
      localStorage.removeItem('nirmaanify_auth_token');
    }
    if (nextAuthSession) {
      try {
        await nextAuthSignOut({ redirect: false });
      } catch {
        // Ignored
      }
    }
    if (typeof window !== 'undefined') {
      window.location.href = '/login';
    }
  };

  const switchWorkspace = async (workspaceId: string) => {
    const ws = workspaces.find((w) => w.id === workspaceId);
    if (ws) {
      setActiveWorkspace(ws);
      if (typeof window !== 'undefined') {
        localStorage.setItem(ACTIVE_WS_KEY, ws.id);
      }
      try {
        const projList = await apiClient.projects.listProjects(ws.id);
        if (Array.isArray(projList)) setProjects(projList);
      } catch {
        // Ignored
      }
    }
  };

  const createWorkspace = async (
    name: string,
    slug?: string,
    isPersonal?: boolean
  ): Promise<WorkspaceDto> => {
    const created = await apiClient.workspaces.createWorkspace({
      name,
      slug: slug || name.toLowerCase().replace(/[^a-z0-9]/g, '-'),
      isPersonal: Boolean(isPersonal),
    });
    setWorkspaces((prev) => [created, ...prev.filter((w) => w.id !== created.id)]);
    setActiveWorkspace(created);
    if (typeof window !== 'undefined') {
      localStorage.setItem(ACTIVE_WS_KEY, created.id);
    }
    return created;
  };

  const createProject = async (data: Partial<ProjectDto>): Promise<ProjectDto> => {
    const created = await apiClient.projects.createProject({
      ...data,
      workspaceId: data.workspaceId || activeWorkspace?.id || '',
    });
    setProjects((prev) => [created, ...prev.filter((p) => p.id !== created.id)]);
    return created;
  };

  const updateProject = async (id: string, updates: Partial<ProjectDto>): Promise<ProjectDto> => {
    const updated = await apiClient.projects.updateProject(id, updates);
    setProjects((prev) => prev.map((p) => (p.id === id ? updated : p)));
    return updated;
  };

  const deleteProject = async (id: string): Promise<void> => {
    await apiClient.projects.deleteProject(id);
    setProjects((prev) => prev.filter((p) => p.id !== id));
  };

  const duplicateProject = async (id: string): Promise<ProjectDto> => {
    const duplicated = await apiClient.projects.duplicateProject(id);
    setProjects((prev) => [duplicated, ...prev]);
    return duplicated;
  };

  const archiveProject = async (id: string): Promise<ProjectDto> => {
    const archived = await apiClient.projects.archiveProject(id);
    setProjects((prev) => prev.map((p) => (p.id === id ? archived : p)));
    return archived;
  };

  const unarchiveProject = async (id: string): Promise<ProjectDto> => {
    const unarchived = await apiClient.projects.unarchiveProject(id);
    setProjects((prev) => prev.map((p) => (p.id === id ? unarchived : p)));
    return unarchived;
  };

  const generateAiPlan = async (dto: GeneratePlanDto): Promise<AIProjectPlan> => {
    return await apiClient.projects.generateAiPlan(dto);
  };

  const modifyAiPlan = async (planId: string, updates: Partial<AIProjectPlan>): Promise<AIProjectPlan> => {
    return await apiClient.projects.modifyAiPlan(planId, updates);
  };

  const approveAiPlan = async (dto: ApprovePlanDto): Promise<ProjectDto> => {
    const created = await apiClient.projects.approveAiPlan({
      ...dto,
      workspaceId: dto.workspaceId || activeWorkspace?.id || '',
    });
    setProjects((prev) => [created, ...prev.filter((p) => p.id !== created.id)]);
    return created;
  };

  const inviteMember = async (email: string, role: UserRole): Promise<void> => {
    if (!activeWorkspace) throw new Error('No active workspace selected');
    await apiClient.workspaces.inviteMember(activeWorkspace.id, { email, role });
    await refreshData();
  };

  const updateMemberRole = async (userId: string, role: UserRole): Promise<void> => {
    if (!activeWorkspace) throw new Error('No active workspace selected');
    await apiClient.workspaces.updateMemberRole(activeWorkspace.id, userId, role);
    await refreshData();
  };

  const removeMember = async (userId: string): Promise<void> => {
    if (!activeWorkspace) throw new Error('No active workspace selected');
    await apiClient.workspaces.removeMember(activeWorkspace.id, userId);
    await refreshData();
  };

  const deleteWorkspace = async (workspaceId: string): Promise<void> => {
    await apiClient.workspaces.deleteWorkspace(workspaceId);

    const updatedWorkspaces = workspaces.filter((w) => w.id !== workspaceId);
    setWorkspaces(updatedWorkspaces);

    // If the deleted workspace was the active one, smoothly switch to the next workspace or null
    if (activeWorkspace?.id === workspaceId) {
      if (updatedWorkspaces.length > 0) {
        const nextWs = updatedWorkspaces[0];
        setActiveWorkspace(nextWs);
        if (typeof window !== 'undefined') {
          localStorage.setItem(ACTIVE_WS_KEY, nextWs.id);
        }
        try {
          const projList = await apiClient.projects.listProjects(nextWs.id);
          if (Array.isArray(projList)) {
            setProjects(projList);
          } else {
            setProjects([]);
          }
        } catch {
          setProjects([]);
        }
      } else {
        // No workspaces left: smoothly reset active state without UI crashes
        setActiveWorkspace(null);
        setProjects([]);
        if (typeof window !== 'undefined') {
          localStorage.removeItem(ACTIVE_WS_KEY);
        }
      }
    }
  };

  const leaveWorkspace = async (workspaceId: string): Promise<void> => {
    await apiClient.workspaces.leaveWorkspace(workspaceId);

    const updatedWorkspaces = workspaces.filter((w) => w.id !== workspaceId);
    setWorkspaces(updatedWorkspaces);

    // If the left workspace was the active one, smoothly switch to next workspace or null
    if (activeWorkspace?.id === workspaceId) {
      if (updatedWorkspaces.length > 0) {
        const nextWs = updatedWorkspaces[0];
        setActiveWorkspace(nextWs);
        if (typeof window !== 'undefined') {
          localStorage.setItem(ACTIVE_WS_KEY, nextWs.id);
        }
        try {
          const projList = await apiClient.projects.listProjects(nextWs.id);
          if (Array.isArray(projList)) {
            setProjects(projList);
          } else {
            setProjects([]);
          }
        } catch {
          setProjects([]);
        }
      } else {
        setActiveWorkspace(null);
        setProjects([]);
        if (typeof window !== 'undefined') {
          localStorage.removeItem(ACTIVE_WS_KEY);
        }
      }
    }
  };

  const forgotPassword = async (email: string) => {
    return await apiClient.auth.forgotPassword({ email });
  };

  const resetPassword = async (token: string, newPassword: string) => {
    return await apiClient.auth.resetPassword({ token, newPassword });
  };

  const verifyEmail = async (
    dtoOrToken: string | { token?: string; otp?: string; email?: string }
  ) => {
    const payload = typeof dtoOrToken === 'string' ? { token: dtoOrToken } : dtoOrToken;
    const res = await apiClient.auth.verifyEmail(payload);
    if (res.user) {
      setUser(res.user);
    }
    if (res.accessToken) {
      setTokenState(res.accessToken);
      setStoredToken(res.accessToken);
      apiClient.setToken(res.accessToken);
    }
    await refreshData();
    return res;
  };

  const resendVerification = async (email: string) => {
    return await apiClient.auth.resendVerification(email);
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
        deleteWorkspace,
        leaveWorkspace,
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
        updateMemberRole,
        removeMember,
        forgotPassword,
        resetPassword,
        verifyEmail,
        resendVerification,
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
