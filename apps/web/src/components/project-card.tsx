'use client';

import React, { useState } from 'react';
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
  Edit,
  Copy,
  Archive,
  ArchiveRestore,
  Settings,
  Trash2,
  ExternalLink,
  Layers,
  Sparkles,
} from 'lucide-react';
import { ProjectDto } from '@nirmaanify/types';
import { useAuth } from '../context/auth-context';

interface ProjectCardProps {
  project: ProjectDto;
  onEdit: (project: ProjectDto) => void;
  onSettings: (project: ProjectDto) => void;
  onViewPlan?: (project: ProjectDto) => void;
}

export function ProjectCard({
  project,
  onEdit,
  onSettings,
  onViewPlan,
}: ProjectCardProps) {
  const { toast } = useToast();
  const { duplicateProject, archiveProject, unarchiveProject, deleteProject } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleDuplicate = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setMenuOpen(false);
    try {
      const dup = await duplicateProject(project.id);
      toast({
        title: 'Project Duplicated',
        description: `Created clone: "${dup.name}"`,
        type: 'success',
      });
    } catch {
      toast({ title: 'Error', description: 'Could not duplicate', type: 'error' });
    }
  };

  const handleToggleArchive = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setMenuOpen(false);
    try {
      if (project.isArchived) {
        await unarchiveProject(project.id);
        toast({ title: 'Project Restored', description: `"${project.name}" is now active.`, type: 'success' });
      } else {
        await archiveProject(project.id);
        toast({ title: 'Project Archived', description: `"${project.name}" moved to archives.`, type: 'info' });
      }
    } catch {
      toast({ title: 'Error', description: 'Could not update archive status', type: 'error' });
    }
  };

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setMenuOpen(false);
    try {
      await deleteProject(project.id);
      toast({ title: 'Project Deleted', description: `"${project.name}" removed.`, type: 'success' });
    } catch {
      toast({ title: 'Error', description: 'Could not delete', type: 'error' });
    }
  };

  const typeVariant =
    project.type === 'SAAS'
      ? 'indigo'
      : project.type === 'ECOMMERCE'
      ? 'violet'
      : project.type === 'DASHBOARD'
      ? 'cyan'
      : project.type === 'BLOG'
      ? 'amber'
      : 'secondary';

  return (
    <Card
      hoverable
      className={`flex flex-col justify-between overflow-visible relative transition-all ${
        project.isArchived ? 'opacity-70 border-dashed' : ''
      }`}
    >
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-1.5 flex-wrap">
              <Badge variant={typeVariant as any} size="sm">
                {project.type}
              </Badge>
              {project.isArchived && (
                <Badge variant="secondary" size="sm">
                  Archived
                </Badge>
              )}
              {project.aiPlan && (
                <Badge variant="indigo" size="sm" className="bg-[#635BFF]/15 text-[#635BFF]">
                  <Sparkles className="h-3 w-3 mr-0.5 inline" /> AI Planned
                </Badge>
              )}
            </div>
            <CardTitle className="mt-2 text-base">{project.name}</CardTitle>
          </div>

          <div className="relative">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setMenuOpen(!menuOpen);
              }}
              className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-[#161926] text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
            >
              <MoreVertical className="h-4 w-4" />
            </button>

            {menuOpen && (
              <div
                className="absolute right-0 top-8 z-30 w-48 rounded-xl bg-white dark:bg-[#161926] border border-slate-200 dark:border-[#24293D] shadow-xl py-1 text-xs divide-y divide-slate-100 dark:divide-[#24293D]"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="py-1">
                  <button
                    onClick={() => {
                      setMenuOpen(false);
                      onEdit(project);
                    }}
                    className="w-full px-3 py-1.5 text-left flex items-center gap-2 hover:bg-slate-50 dark:hover:bg-[#1E2337] text-slate-700 dark:text-slate-200"
                  >
                    <Edit className="h-3.5 w-3.5" /> Edit Project
                  </button>
                  <button
                    onClick={handleDuplicate}
                    className="w-full px-3 py-1.5 text-left flex items-center gap-2 hover:bg-slate-50 dark:hover:bg-[#1E2337] text-slate-700 dark:text-slate-200"
                  >
                    <Copy className="h-3.5 w-3.5" /> Duplicate Project
                  </button>
                  <button
                    onClick={() => {
                      setMenuOpen(false);
                      onSettings(project);
                    }}
                    className="w-full px-3 py-1.5 text-left flex items-center gap-2 hover:bg-slate-50 dark:hover:bg-[#1E2337] text-slate-700 dark:text-slate-200"
                  >
                    <Settings className="h-3.5 w-3.5" /> Project Settings
                  </button>
                </div>

                <div className="py-1">
                  <button
                    onClick={handleToggleArchive}
                    className="w-full px-3 py-1.5 text-left flex items-center gap-2 hover:bg-slate-50 dark:hover:bg-[#1E2337] text-slate-700 dark:text-slate-200"
                  >
                    {project.isArchived ? (
                      <>
                        <ArchiveRestore className="h-3.5 w-3.5 text-emerald-500" /> Restore Project
                      </>
                    ) : (
                      <>
                        <Archive className="h-3.5 w-3.5 text-amber-500" /> Archive Project
                      </>
                    )}
                  </button>
                  <button
                    onClick={handleDelete}
                    className="w-full px-3 py-1.5 text-left flex items-center gap-2 hover:bg-rose-500/10 text-rose-600 dark:text-rose-400"
                  >
                    <Trash2 className="h-3.5 w-3.5" /> Delete Project
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        <CardDescription className="line-clamp-2 mt-1.5 text-xs">
          {project.description || 'No description provided.'}
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-3">
        <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-[#161926] border border-slate-100 dark:border-[#24293D] space-y-1.5 text-xs">
          <div className="flex items-center justify-between text-slate-400 text-[11px]">
            <span>Frontend:</span>
            <span className="font-semibold text-slate-700 dark:text-slate-200 truncate max-w-[150px]">
              {project.framework}
            </span>
          </div>
          <div className="flex items-center justify-between text-slate-400 text-[11px]">
            <span>Backend:</span>
            <span className="font-semibold text-slate-700 dark:text-slate-200">
              {project.isBackendEnabled ? 'NestJS API + PostgreSQL' : 'Static Export'}
            </span>
          </div>
          {project.projectSchema?.pages && (
            <div className="flex items-center justify-between text-slate-400 text-[11px]">
              <span>Routes:</span>
              <span className="font-semibold text-[#635BFF]">
                {Array.isArray(project.projectSchema.pages) ? project.projectSchema.pages.length : 1} Pages
              </span>
            </div>
          )}
        </div>
      </CardContent>

      <CardFooter className="pt-0 flex items-center justify-between border-t border-slate-100 dark:border-[#1E2337]">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => toast({ title: 'Opening Visual Studio', description: `Loaded ${project.name}`, type: 'info' })}
        >
          Open Studio
        </Button>
        <Button
          variant="subtle"
          size="sm"
          rightIcon={<ArrowRight className="h-3.5 w-3.5" />}
          onClick={() => toast({ title: 'Export Ready', description: `${project.slug}.zip generated.`, type: 'success' })}
        >
          Export
        </Button>
      </CardFooter>
    </Card>
  );
}
