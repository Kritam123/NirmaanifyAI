'use client';

import React, { useState } from 'react';
import {
  Dialog,
  Button,
  Input,
  Badge,
  Card,
  useToast,
} from '@nirmaanify/ui';
import {
  Settings,
  Layers,
  Copy,
  Archive,
  ArchiveRestore,
  Trash2,
  AlertTriangle,
  Server,
  Database,
  Globe,
  Code,
} from 'lucide-react';
import { ProjectDto } from '@nirmaanify/types';
import { useAuth } from '../context/auth-context';

interface ProjectSettingsModalProps {
  project: ProjectDto | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit: () => void;
}

export function ProjectSettingsModal({
  project,
  isOpen,
  onClose,
  onEdit,
}: ProjectSettingsModalProps) {
  const { toast } = useToast();
  const { duplicateProject, archiveProject, unarchiveProject, deleteProject } = useAuth();

  const [activeTab, setActiveTab] = useState<'general' | 'schema' | 'danger'>('general');
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');

  if (!project) return null;

  const handleDuplicate = async () => {
    try {
      const dup = await duplicateProject(project.id);
      onClose();
      toast({
        title: 'Project Duplicated',
        description: `Created copy: "${dup.name}"`,
        type: 'success',
      });
    } catch {
      toast({ title: 'Error', description: 'Could not duplicate project', type: 'error' });
    }
  };

  const handleToggleArchive = async () => {
    try {
      if (project.isArchived) {
        await unarchiveProject(project.id);
        toast({ title: 'Project Restored', description: `"${project.name}" is now active.`, type: 'success' });
      } else {
        await archiveProject(project.id);
        toast({ title: 'Project Archived', description: `"${project.name}" moved to archives.`, type: 'info' });
      }
      onClose();
    } catch {
      toast({ title: 'Error', description: 'Could not update archive status', type: 'error' });
    }
  };

  const handleDelete = async () => {
    if (deleteConfirmText !== project.slug) {
      toast({ title: 'Slug Mismatch', description: 'Please type the exact project slug to confirm deletion.', type: 'error' });
      return;
    }

    try {
      await deleteProject(project.id);
      setIsConfirmingDelete(false);
      onClose();
      toast({
        title: 'Project Deleted',
        description: `"${project.name}" has been permanently removed.`,
        type: 'success',
      });
    } catch {
      toast({ title: 'Error', description: 'Could not delete project', type: 'error' });
    }
  };

  return (
    <Dialog
      isOpen={isOpen}
      onClose={() => {
        setIsConfirmingDelete(false);
        onClose();
      }}
      title={`Settings: ${project.name}`}
      description="Manage configurations, inspect data schemas, or manage project lifecycle."
      className="max-w-3xl"
      footer={
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      }
    >
      <div className="space-y-4">
        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 border-b border-slate-200 dark:border-[#24293D] pb-2 text-xs">
          {[
            { id: 'general' as const, label: 'General & Architecture', icon: <Settings className="h-3.5 w-3.5" /> },
            { id: 'schema' as const, label: 'Schema & Endpoints', icon: <Layers className="h-3.5 w-3.5" /> },
            { id: 'danger' as const, label: 'Lifecycle & Danger Zone', icon: <AlertTriangle className="h-3.5 w-3.5 text-rose-500" /> },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition-colors ${
                activeTab === t.id
                  ? 'bg-[#635BFF] text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-[#161926]'
              }`}
            >
              {t.icon}
              {t.label}
            </button>
          ))}
        </div>

        {/* 1. GENERAL TAB */}
        {activeTab === 'general' && (
          <div className="space-y-4 text-xs">
            <div className="grid grid-cols-2 gap-4">
              <Card className="p-3 space-y-1">
                <span className="text-slate-400">Project Identifier</span>
                <p className="font-mono font-bold text-slate-800 dark:text-slate-200">{project.id}</p>
              </Card>
              <Card className="p-3 space-y-1">
                <span className="text-slate-400">Project Slug</span>
                <p className="font-mono font-bold text-slate-800 dark:text-slate-200">/{project.slug}</p>
              </Card>
              <Card className="p-3 space-y-1">
                <span className="text-slate-400">Project Type</span>
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

            <Card className="p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900 dark:text-white">Architecture & Stack</span>
                <Button size="sm" variant="outline" onClick={onEdit}>
                  Edit Configuration
                </Button>
              </div>
              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 dark:border-[#24293D] text-[11px]">
                <div>
                  <span className="text-slate-400">Frontend Framework:</span>
                  <p className="font-semibold">{project.framework}</p>
                </div>
                <div>
                  <span className="text-slate-400">UI Design System:</span>
                  <p className="font-semibold">{project.uiLibrary}</p>
                </div>
                <div>
                  <span className="text-slate-400">Backend API:</span>
                  <p className="font-semibold">{project.isBackendEnabled ? 'NestJS 11 + Prisma ORM' : 'Static Export'}</p>
                </div>
                <div>
                  <span className="text-slate-400">Target Database:</span>
                  <p className="font-semibold">{project.isBackendEnabled ? 'PostgreSQL 16' : 'None (Client-Side)'}</p>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* 2. SCHEMA TAB */}
        {activeTab === 'schema' && (
          <div className="space-y-3 text-xs">
            <Card className="p-3 space-y-2">
              <span className="font-bold text-slate-900 dark:text-white">Project Schema Definition (JSON)</span>
              <pre className="p-3 rounded-xl bg-slate-900 text-emerald-400 font-mono text-[11px] overflow-x-auto max-h-56">
                {JSON.stringify(project.projectSchema, null, 2)}
              </pre>
            </Card>
          </div>
        )}

        {/* 3. DANGER ZONE */}
        {activeTab === 'danger' && (
          <div className="space-y-4 text-xs">
            {/* Duplicate */}
            <Card className="p-4 flex items-center justify-between">
              <div>
                <h5 className="font-bold text-slate-900 dark:text-white">Duplicate Project</h5>
                <p className="text-slate-400 text-[11px] mt-0.5">
                  Clone all configuration, page routes, and schemas to a new project instance.
                </p>
              </div>
              <Button variant="outline" size="sm" leftIcon={<Copy className="h-3.5 w-3.5" />} onClick={handleDuplicate}>
                Duplicate
              </Button>
            </Card>

            {/* Archive / Unarchive */}
            <Card className="p-4 flex items-center justify-between">
              <div>
                <h5 className="font-bold text-slate-900 dark:text-white">
                  {project.isArchived ? 'Restore Project' : 'Archive Project'}
                </h5>
                <p className="text-slate-400 text-[11px] mt-0.5">
                  {project.isArchived
                    ? 'Restore project back into the active workspace view.'
                    : 'Hide project from active listings. All data and deployments remain intact.'}
                </p>
              </div>
              <Button
                variant={project.isArchived ? 'default' : 'outline'}
                size="sm"
                leftIcon={project.isArchived ? <ArchiveRestore className="h-3.5 w-3.5" /> : <Archive className="h-3.5 w-3.5" />}
                onClick={handleToggleArchive}
              >
                {project.isArchived ? 'Unarchive' : 'Archive'}
              </Button>
            </Card>

            {/* Delete Project */}
            <Card className="p-4 border-rose-500/30 bg-rose-500/5 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h5 className="font-bold text-rose-600 dark:text-rose-400">Delete Project Permanently</h5>
                  <p className="text-slate-400 text-[11px] mt-0.5">
                    This action is irreversible. All generated files, route definitions, and database schemas will be deleted.
                  </p>
                </div>
                {!isConfirmingDelete && (
                  <Button
                    variant="destructive"
                    size="sm"
                    leftIcon={<Trash2 className="h-3.5 w-3.5" />}
                    onClick={() => setIsConfirmingDelete(true)}
                  >
                    Delete Project
                  </Button>
                )}
              </div>

              {isConfirmingDelete && (
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 space-y-2 pt-2">
                  <p className="text-[11px] text-rose-600 dark:text-rose-400 font-semibold">
                    To confirm deletion, please type the project slug: <code className="bg-rose-950/20 px-1 py-0.5 rounded font-mono">{project.slug}</code>
                  </p>
                  <div className="flex gap-2">
                    <Input
                      placeholder={project.slug}
                      value={deleteConfirmText}
                      onChange={(e) => setDeleteConfirmText(e.target.value)}
                      className="text-xs"
                    />
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={handleDelete}
                      disabled={deleteConfirmText !== project.slug}
                    >
                      Confirm Delete
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setIsConfirmingDelete(false);
                        setDeleteConfirmText('');
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              )}
            </Card>
          </div>
        )}
      </div>
    </Dialog>
  );
}
