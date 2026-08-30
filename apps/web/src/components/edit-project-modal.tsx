'use client';

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  Button,
  Input,
  Select,
  useToast,
} from '@nirmaanify/ui';
import { ProjectDto, ProjectType } from '@nirmaanify/types';
import { useAuth } from '../context/auth-context';

interface EditProjectModalProps {
  project: ProjectDto | null;
  isOpen: boolean;
  onClose: () => void;
}

export function EditProjectModal({ project, isOpen, onClose }: EditProjectModalProps) {
  const { toast } = useToast();
  const { updateProject } = useAuth();

  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<ProjectType>('SAAS');
  const [framework, setFramework] = useState('');
  const [uiLibrary, setUiLibrary] = useState('');
  const [isBackendEnabled, setIsBackendEnabled] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (project) {
      setName(project.name);
      setSlug(project.slug);
      setDescription(project.description || '');
      setType(project.type);
      setFramework(project.framework);
      setUiLibrary(project.uiLibrary);
      setIsBackendEnabled(project.isBackendEnabled);
    }
  }, [project]);

  const handleSubmit = async () => {
    if (!project || !name.trim()) return;

    setIsLoading(true);
    try {
      await updateProject(project.id, {
        name: name.trim(),
        slug: slug.trim() || name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        description: description.trim(),
        type,
        framework,
        uiLibrary,
        isBackendEnabled,
      });

      onClose();
      toast({
        title: 'Project Updated',
        description: `Changes saved for "${name}"`,
        type: 'success',
      });
    } catch (err: any) {
      toast({
        title: 'Update Failed',
        description: err.message || 'Could not update project',
        type: 'error',
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!project) return null;

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title={`Edit Project: ${project.name}`}
      description="Update project metadata, architecture configuration, and system parameters."
      footer={
        <>
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button variant="default" onClick={handleSubmit} isLoading={isLoading}>
            Save Changes
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <Input
          label="Project Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <Input
          label="Project Slug (URL Path)"
          value={slug}
          onChange={(e) => setSlug(e.target.value)}
        />

        <Input
          label="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        <Select
          label="Project Type"
          value={type}
          onChange={(e) => setType(e.target.value as ProjectType)}
          options={[
            { label: 'E-commerce Platform', value: 'ECOMMERCE' },
            { label: 'SaaS Platform', value: 'SAAS' },
            { label: 'Website Showcase', value: 'WEBSITE' },
            { label: 'Blog & Publication', value: 'BLOG' },
            { label: 'Dashboard & Analytics', value: 'DASHBOARD' },
            { label: 'Portfolio & Agency', value: 'PORTFOLIO' },
            { label: 'Custom Application', value: 'CUSTOM' },
          ]}
        />

        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Frontend Framework"
            value={framework}
            onChange={(e) => setFramework(e.target.value)}
          />
          <Input
            label="UI System"
            value={uiLibrary}
            onChange={(e) => setUiLibrary(e.target.value)}
          />
        </div>

        <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-[#161926] border border-slate-200 dark:border-[#24293D]">
          <div>
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Backend API Enabled</span>
            <p className="text-[11px] text-slate-400">Connect to NestJS REST API and PostgreSQL database.</p>
          </div>
          <input
            type="checkbox"
            checked={isBackendEnabled}
            onChange={(e) => setIsBackendEnabled(e.target.checked)}
            className="h-4 w-4 text-[#635BFF] rounded focus:ring-[#635BFF]"
          />
        </div>
      </div>
    </Dialog>
  );
}
