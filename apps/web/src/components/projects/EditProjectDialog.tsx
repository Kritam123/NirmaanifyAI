'use client';

import React, { useEffect, useState } from 'react';
import { Dialog, Button, Input, Select, Textarea, useToast } from '@nirmaanify/ui';
import { ProjectDto, ProjectType } from '@nirmaanify/types';
import { useAuth } from '../../context/auth-context';

interface EditProjectDialogProps {
  project: ProjectDto | null;
  isOpen: boolean;
  onClose: () => void;
}

const slugify = (s: string) =>
  s
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

export const EditProjectDialog: React.FC<EditProjectDialogProps> = ({
  project,
  isOpen,
  onClose,
}) => {
  const { toast } = useToast();
  const { updateProject } = useAuth();

  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<ProjectType>('SAAS');
  const [framework, setFramework] = useState('');
  const [uiLibrary, setUiLibrary] = useState('');
  const [isBackendEnabled, setIsBackendEnabled] = useState(true);
  const [slugTouched, setSlugTouched] = useState(false);
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
      setSlugTouched(true);
    }
  }, [project]);

  const handleSubmit = async () => {
    if (!project || !name.trim()) return;

    const finalSlug = slugTouched && slug.trim() ? slug.trim() : slugify(name) || project.slug;
    setIsLoading(true);
    try {
      await updateProject(project.id, {
        name: name.trim(),
        slug: finalSlug,
        description: description.trim(),
        type,
        framework,
        uiLibrary,
        isBackendEnabled,
      });
      onClose();
      toast({
        title: 'Project updated',
        description: `Changes saved for "${name}"`,
        type: 'success',
      });
    } catch (err: any) {
      toast({
        title: 'Update failed',
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
      title="Edit project"
      description={`Update the metadata, architecture configuration, and stack for "${project.name}".`}
      className="max-w-xl"
      footer={
        <>
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button variant="default" onClick={handleSubmit} isLoading={isLoading}>
            Save changes
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Project name"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              if (!slugTouched) setSlug(slugify(e.target.value));
            }}
            placeholder="e.g. AI Video Studio"
          />
          <Input
            label="Slug (URL path)"
            value={slug}
            onChange={(e) => {
              setSlugTouched(true);
              setSlug(slugify(e.target.value));
            }}
            placeholder="ai-video-studio"
            helperText="Lowercase letters, digits, and hyphens only"
          />
        </div>

        <Textarea
          label="Description"
          rows={3}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Short description of the project's purpose and scope."
        />

        <Select
          label="Project type"
          value={type}
          onChange={(e) => setType(e.target.value as ProjectType)}
          options={[
            { label: 'SaaS Platform', value: 'SAAS' },
            { label: 'E-commerce Store', value: 'ECOMMERCE' },
            { label: 'Blog & Publication', value: 'BLOG' },
            { label: 'Analytics Dashboard', value: 'DASHBOARD' },
            { label: 'Agency Portfolio', value: 'PORTFOLIO' },
            { label: 'Marketing Website', value: 'WEBSITE' },
            { label: 'Custom Application', value: 'CUSTOM' },
          ]}
        />

        <div className="grid grid-cols-2 gap-3">
          <Select
            label="Frontend framework"
            value={framework}
            onChange={(e) => setFramework(e.target.value)}
            options={[
              { label: 'Next.js 15 App Router (Recommended)', value: 'Next.js 15 App Router' },
              { label: 'Next.js 15 Pages Router', value: 'Next.js 15 Pages Router' },
              { label: 'Next.js 15 Static Export', value: 'Next.js 15 Static' },
            ]}
          />
          <Select
            label="UI library"
            value={uiLibrary}
            onChange={(e) => setUiLibrary(e.target.value)}
            options={[
              { label: 'shadcn/ui + Tailwind CSS', value: 'shadcn/ui + Tailwind CSS' },
              { label: 'Framer Motion + Tailwind', value: 'shadcn/ui + Framer Motion' },
              { label: 'Tailwind Typography', value: 'Tailwind CSS Typography' },
            ]}
          />
        </div>

        <label className="flex items-start gap-3 p-3 rounded-lg border border-slate-200 dark:border-[#24293D] bg-slate-50 dark:bg-[#141724] cursor-pointer">
          <input
            type="checkbox"
            checked={isBackendEnabled}
            onChange={(e) => setIsBackendEnabled(e.target.checked)}
            className="mt-0.5 h-4 w-4 rounded border-slate-300 text-[#635BFF] focus:ring-[#635BFF] focus-visible:outline-none"
          />
          <div>
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
              Backend API &amp; database
            </span>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
              Connect to the NestJS REST API, PostgreSQL, and BullMQ workers.
            </p>
          </div>
        </label>
      </div>
    </Dialog>
  );
};
