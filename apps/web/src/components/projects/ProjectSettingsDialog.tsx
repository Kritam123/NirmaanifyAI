'use client';

import React, { useState } from 'react';
import { Dialog, Button, Card, Badge, useToast } from '@nirmaanify/ui';
import { Settings, Layers, AlertTriangle, Copy, Archive, ArchiveRestore } from 'lucide-react';
import { ProjectDto } from '@nirmaanify/types';
import { useAuth } from '../../context/auth-context';

interface ProjectSettingsDialogProps {
  project: ProjectDto | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit: () => void;
}

type TabId = 'general' | 'schema' | 'danger';

export const ProjectSettingsDialog: React.FC<ProjectSettingsDialogProps> = ({
  project,
  isOpen,
  onClose,
  onEdit,
}) => {
  const { toast } = useToast();
  const { duplicateProject, archiveProject, unarchiveProject } = useAuth();
  const [tab, setTab] = useState<TabId>('general');

  if (!project) return null;

  const handleDuplicate = async () => {
    try {
      const dup = await duplicateProject(project.id);
      onClose();
      toast({
        title: 'Project duplicated',
        description: `Created copy: "${dup.name}"`,
        type: 'success',
      });
    } catch {
      toast({ title: 'Could not duplicate', description: 'Try again later.', type: 'error' });
    }
  };

  const handleToggleArchive = async () => {
    try {
      if (project.isArchived) {
        await unarchiveProject(project.id);
        toast({ title: 'Project restored', description: `"${project.name}" is now active.`, type: 'success' });
      } else {
        await archiveProject(project.id);
        toast({ title: 'Project archived', description: `"${project.name}" moved to archives.`, type: 'info' });
      }
      onClose();
    } catch {
      toast({ title: 'Could not update archive status', type: 'error' });
    }
  };

  const aiPlan = project.aiPlan as Record<string, any> | null;

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title="Project settings"
      description={`Manage configuration, inspect the live schema, and handle lifecycle actions for "${project.name}".`}
      className="max-w-3xl"
      footer={
        <Button variant="outline" onClick={onClose}>
          Close
        </Button>
      }
    >
      <div className="space-y-4">
        {/* Tabs */}
        <div
          role="tablist"
          aria-label="Project settings"
          className="flex items-center gap-1 border-b border-slate-200 dark:border-[#24293D] text-xs"
        >
          {(
            [
              { id: 'general', label: 'General', icon: <Settings className="h-3.5 w-3.5" /> },
              { id: 'schema', label: 'Schema inspector', icon: <Layers className="h-3.5 w-3.5" /> },
              { id: 'danger', label: 'Danger zone', icon: <AlertTriangle className="h-3.5 w-3.5 text-rose-500" /> },
            ] as { id: TabId; label: string; icon: React.ReactNode }[]
          ).map((t) => (
            <button
              key={t.id}
              role="tab"
              aria-selected={tab === t.id}
              onClick={() => setTab(t.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-t-lg font-semibold border-b-2 transition-colors ${
                tab === t.id
                  ? 'border-[#635BFF] text-[#635BFF] dark:text-[#A5AEFD]'
                  : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              {t.icon}
              {t.label}
            </button>
          ))}
        </div>

        {/* General */}
        {tab === 'general' && (
          <div className="space-y-4 text-xs">
            <div className="grid grid-cols-2 gap-3">
              <Card className="p-3 space-y-1">
                <span className="text-slate-400">Project ID</span>
                <p className="font-mono text-[11px] font-bold text-slate-800 dark:text-slate-200 break-all">
                  {project.id}
                </p>
              </Card>
              <Card className="p-3 space-y-1">
                <span className="text-slate-400">Slug</span>
                <p className="font-mono font-bold text-slate-800 dark:text-slate-200">
                  /{project.slug}
                </p>
              </Card>
              <Card className="p-3 space-y-1">
                <span className="text-slate-400">Type</span>
                <div className="pt-1">
                  <Badge variant="indigo">{project.type}</Badge>
                </div>
              </Card>
              <Card className="p-3 space-y-1">
                <span className="text-slate-400">Status</span>
                <div className="pt-1">
                  <Badge variant={project.isArchived ? 'secondary' : 'cyan'}>
                    {project.isArchived ? 'ARCHIVED' : 'ACTIVE'}
                  </Badge>
                </div>
              </Card>
            </div>

            <Card className="p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900 dark:text-white">Architecture & stack</span>
                <Button size="sm" variant="outline" onClick={onEdit}>
                  Edit configuration
                </Button>
              </div>
              <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-100 dark:border-[#24293D] text-[11px]">
                <div>
                  <span className="text-slate-400">Frontend framework</span>
                  <p className="font-semibold text-slate-800 dark:text-slate-100">{project.framework}</p>
                </div>
                <div>
                  <span className="text-slate-400">UI design system</span>
                  <p className="font-semibold text-slate-800 dark:text-slate-100">{project.uiLibrary}</p>
                </div>
                <div>
                  <span className="text-slate-400">Backend API</span>
                  <p className="font-semibold text-slate-800 dark:text-slate-100">
                    {project.isBackendEnabled ? 'NestJS 11 + Prisma ORM' : 'Static export'}
                  </p>
                </div>
                <div>
                  <span className="text-slate-400">Database</span>
                  <p className="font-semibold text-slate-800 dark:text-slate-100">
                    {project.isBackendEnabled ? 'PostgreSQL 16' : 'None (client-side)'}
                  </p>
                </div>
              </div>
            </Card>

            <Card className="p-3 text-[11px] text-slate-500 dark:text-slate-400">
              <p className="font-semibold text-slate-700 dark:text-slate-200">Created</p>
              <p className="mt-0.5">{new Date(project.createdAt as any).toLocaleString()}</p>
              <p className="mt-2 font-semibold text-slate-700 dark:text-slate-200">Last updated</p>
              <p className="mt-0.5">{new Date(project.updatedAt as any).toLocaleString()}</p>
            </Card>
          </div>
        )}

        {/* Schema inspector */}
        {tab === 'schema' && (
          <div className="space-y-3 text-xs">
            <Card className="p-3 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900 dark:text-white">Live project schema</span>
                <Badge variant="cyan" size="sm">
                  {project.projectSchema && Object.keys(project.projectSchema).length} keys
                </Badge>
              </div>
              <pre className="p-3 rounded-lg bg-slate-900 dark:bg-black text-emerald-400 font-mono text-[11px] overflow-x-auto max-h-72">
                {JSON.stringify(project.projectSchema ?? {}, null, 2)}
              </pre>
            </Card>

            {aiPlan && (
              <Card className="p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 dark:text-white">AI blueprint</span>
                  <Badge variant="indigo" size="sm">
                    {aiPlan.type || project.type}
                  </Badge>
                </div>
                <pre className="p-3 rounded-lg bg-slate-900 dark:bg-black text-cyan-300 font-mono text-[11px] overflow-x-auto max-h-72">
                  {JSON.stringify(aiPlan, null, 2)}
                </pre>
              </Card>
            )}
          </div>
        )}

        {/* Danger zone */}
        {tab === 'danger' && (
          <div className="space-y-3 text-xs">
            <Card className="p-4 flex items-center justify-between">
              <div>
                <h5 className="font-bold text-slate-900 dark:text-white">Duplicate project</h5>
                <p className="text-slate-500 dark:text-slate-400 text-[11px] mt-0.5 max-w-md">
                  Clone all configuration, page routes, schemas, and the AI blueprint into a new project record.
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                leftIcon={<Copy className="h-3.5 w-3.5" />}
                onClick={handleDuplicate}
              >
                Duplicate
              </Button>
            </Card>

            <Card className="p-4 flex items-center justify-between">
              <div>
                <h5 className="font-bold text-slate-900 dark:text-white">
                  {project.isArchived ? 'Restore project' : 'Archive project'}
                </h5>
                <p className="text-slate-500 dark:text-slate-400 text-[11px] mt-0.5 max-w-md">
                  {project.isArchived
                    ? 'Restore this project to the active workspace view.'
                    : 'Hide from the active listing. All data and configurations remain intact.'}
                </p>
              </div>
              <Button
                variant={project.isArchived ? 'default' : 'outline'}
                size="sm"
                leftIcon={
                  project.isArchived ? (
                    <ArchiveRestore className="h-3.5 w-3.5" />
                  ) : (
                    <Archive className="h-3.5 w-3.5" />
                  )
                }
                onClick={handleToggleArchive}
              >
                {project.isArchived ? 'Unarchive' : 'Archive'}
              </Button>
            </Card>

            <Card className="p-4 border border-rose-500/30 bg-rose-500/5">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-rose-500 shrink-0 mt-0.5" />
                <div className="text-xs">
                  <h5 className="font-bold text-rose-600 dark:text-rose-400">
                    Delete project permanently
                  </h5>
                  <p className="mt-1 text-slate-500 dark:text-slate-400 max-w-md">
                    Use the card menu's "Delete project" action to start a slug-typed confirmation dialog.
                    Deletion is irreversible and removes all generated files, schemas, and AI blueprints.
                  </p>
                </div>
              </div>
            </Card>
          </div>
        )}
      </div>
    </Dialog>
  );
};
