'use client';

import React, { useEffect, useRef, useState } from 'react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  Badge,
  Button,
  useToast,
} from '@nirmaanify/ui';
import {
  FolderDot,
  ArrowRight,
  MoreVertical,
  Pencil,
  Copy,
  Archive,
  ArchiveRestore,
  Settings,
  Trash2,
  Layout,
} from 'lucide-react';
import { ProjectDto, ProjectType } from '@nirmaanify/types';
import { useAuth } from '../../context/auth-context';

interface ProjectCardProps {
  project: ProjectDto;
  onEdit: (project: ProjectDto) => void;
  onSettings: (project: ProjectDto) => void;
  onDelete: (project: ProjectDto) => void;
  onOpen?: (project: ProjectDto) => void;
}

const TYPE_BADGE: Record<ProjectType, { variant: 'indigo' | 'violet' | 'cyan' | 'warning' | 'success' | 'secondary' | 'destructive'; label: string }> = {
  SAAS: { variant: 'indigo', label: 'SaaS' },
  ECOMMERCE: { variant: 'violet', label: 'E-commerce' },
  BLOG: { variant: 'cyan', label: 'Blog' },
  DASHBOARD: { variant: 'warning', label: 'Dashboard' },
  PORTFOLIO: { variant: 'success', label: 'Portfolio' },
  WEBSITE: { variant: 'secondary', label: 'Marketing' },
  CUSTOM: { variant: 'secondary', label: 'Custom' },
};

export const ProjectCard: React.FC<ProjectCardProps> = ({
  project,
  onEdit,
  onSettings,
  onDelete,
  onOpen,
}) => {
  const { toast } = useToast();
  const { duplicateProject, archiveProject, unarchiveProject } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menuOpen) return;
    const onDocClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    const onEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMenuOpen(false);
    };
    document.addEventListener('mousedown', onDocClick);
    document.addEventListener('keydown', onEsc);
    return () => {
      document.removeEventListener('mousedown', onDocClick);
      document.removeEventListener('keydown', onEsc);
    };
  }, [menuOpen]);

  const badge = TYPE_BADGE[project.type];

  const handleCardOpen = () => {
    if (onOpen) onOpen(project);
  };

  const handleDuplicate = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setMenuOpen(false);
    try {
      const dup = await duplicateProject(project.id);
      toast({
        title: 'Project duplicated',
        description: `Created clone: "${dup.name}"`,
        type: 'success',
      });
    } catch {
      toast({ title: 'Duplication failed', description: 'Could not duplicate project', type: 'error' });
    }
  };

  const handleToggleArchive = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setMenuOpen(false);
    try {
      if (project.isArchived) {
        await unarchiveProject(project.id);
        toast({ title: 'Project restored', description: `"${project.name}" is now active.`, type: 'success' });
      } else {
        await archiveProject(project.id);
        toast({ title: 'Project archived', description: `"${project.name}" moved to archives.`, type: 'info' });
      }
    } catch {
      toast({ title: 'Archive failed', description: 'Could not update archive status', type: 'error' });
    }
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    setMenuOpen(false);
    onDelete(project);
  };

  const routeCount = Array.isArray(project.projectSchema?.pages)
    ? (project.projectSchema.pages as unknown[]).length
    : 0;

  return (
    <Card
      hoverable
      onClick={handleCardOpen}
      className={`relative flex flex-col justify-between overflow-visible cursor-pointer ${
        project.isArchived ? 'opacity-70' : ''
      }`}
    >
      <CardHeader className="p-5 pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <Badge variant={badge.variant} size="sm">
                {badge.label}
              </Badge>
              {project.isArchived && (
                <Badge variant="secondary" size="sm">
                  Archived
                </Badge>
              )}
              {project.aiPlan && (
                <Badge variant="indigo" size="sm">
                  AI planned
                </Badge>
              )}
            </div>
            <CardTitle className="mt-2 text-base truncate">{project.name}</CardTitle>
          </div>

          <div className="flex items-center gap-1">
            <span className="hidden sm:inline-flex h-9 w-9 items-center justify-center rounded-lg bg-slate-50 dark:bg-[#141724] border border-slate-200 dark:border-[#24293D] text-[#635BFF]">
              <FolderDot className="h-4 w-4" />
            </span>

            <div className="relative" ref={menuRef}>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setMenuOpen((v) => !v);
                }}
                aria-label="Project actions"
                aria-expanded={menuOpen}
                className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-[#161926] text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#635BFF]"
              >
                <MoreVertical className="h-4 w-4" />
              </button>

              {menuOpen && (
                <div
                  role="menu"
                  onClick={(e) => e.stopPropagation()}
                  className="absolute right-0 top-9 z-30 w-52 rounded-xl border border-slate-200 dark:border-[#24293D] bg-white dark:bg-[#0F111A] shadow-xl py-1 text-xs"
                >
                  <div className="py-1">
                    <button
                      type="button"
                      role="menuitem"
                      onClick={() => {
                        setMenuOpen(false);
                        onEdit(project);
                      }}
                      className="w-full px-3 py-1.5 text-left flex items-center gap-2 hover:bg-slate-50 dark:hover:bg-[#1E2337] text-slate-700 dark:text-slate-200"
                    >
                      <Pencil className="h-3.5 w-3.5" /> Edit project
                    </button>
                    <button
                      type="button"
                      role="menuitem"
                      onClick={handleDuplicate}
                      className="w-full px-3 py-1.5 text-left flex items-center gap-2 hover:bg-slate-50 dark:hover:bg-[#1E2337] text-slate-700 dark:text-slate-200"
                    >
                      <Copy className="h-3.5 w-3.5" /> Duplicate project
                    </button>
                    <button
                      type="button"
                      role="menuitem"
                      onClick={() => {
                        setMenuOpen(false);
                        onSettings(project);
                      }}
                      className="w-full px-3 py-1.5 text-left flex items-center gap-2 hover:bg-slate-50 dark:hover:bg-[#1E2337] text-slate-700 dark:text-slate-200"
                    >
                      <Settings className="h-3.5 w-3.5" /> Settings
                    </button>
                  </div>

                  <div className="border-t border-slate-100 dark:border-[#24293D] py-1">
                    <button
                      type="button"
                      role="menuitem"
                      onClick={handleToggleArchive}
                      className="w-full px-3 py-1.5 text-left flex items-center gap-2 hover:bg-slate-50 dark:hover:bg-[#1E2337] text-slate-700 dark:text-slate-200"
                    >
                      {project.isArchived ? (
                        <>
                          <ArchiveRestore className="h-3.5 w-3.5 text-emerald-500" /> Restore project
                        </>
                      ) : (
                        <>
                          <Archive className="h-3.5 w-3.5 text-amber-500" /> Archive project
                        </>
                      )}
                    </button>
                    <button
                      type="button"
                      role="menuitem"
                      onClick={handleDelete}
                      className="w-full px-3 py-1.5 text-left flex items-center gap-2 hover:bg-rose-500/10 text-rose-600 dark:text-rose-400"
                    >
                      <Trash2 className="h-3.5 w-3.5" /> Delete project
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <CardDescription className="line-clamp-2 mt-2 text-xs">
          {project.description || 'No description provided.'}
        </CardDescription>
      </CardHeader>

      <CardContent className="px-5 py-0 pb-3">
        <div className="p-3 rounded-lg border border-slate-200 dark:border-[#24293D] bg-slate-50 dark:bg-[#141724] space-y-1.5 text-[11px]">
          <div className="flex items-center justify-between text-slate-400">
            <span className="flex items-center gap-1.5">
              <Layout className="h-3 w-3" /> Frontend
            </span>
            <span className="font-mono font-semibold text-slate-700 dark:text-slate-200 truncate max-w-[60%] text-right">
              {project.framework}
            </span>
          </div>
          <div className="flex items-center justify-between text-slate-400">
            <span className="flex items-center gap-1.5">Server</span>
            <span className="font-semibold text-slate-700 dark:text-slate-200">
              {project.isBackendEnabled ? 'NestJS + PostgreSQL' : 'Static export'}
            </span>
          </div>
          {routeCount > 0 && (
            <div className="flex items-center justify-between text-slate-400">
              <span>Routes</span>
              <span className="font-mono font-semibold text-[#635BFF]">
                {routeCount} {routeCount === 1 ? 'page' : 'pages'}
              </span>
            </div>
          )}
        </div>
      </CardContent>

      <CardFooter className="px-5 py-3 border-t border-slate-100 dark:border-[#1E2337] flex items-center justify-between">
        <Button
          variant="ghost"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            toast({ title: 'Visual studio', description: `Loading ${project.name}...`, type: 'info' });
          }}
        >
          Open studio
        </Button>
        <Button
          variant="subtle"
          size="sm"
          rightIcon={<ArrowRight className="h-3.5 w-3.5" />}
          onClick={(e) => {
            e.stopPropagation();
            handleCardOpen();
          }}
        >
          Open
        </Button>
      </CardFooter>
    </Card>
  );
};
