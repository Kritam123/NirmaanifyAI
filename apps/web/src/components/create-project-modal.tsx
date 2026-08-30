'use client';

import React, { useState } from 'react';
import {
  Dialog,
  Button,
  Input,
  Select,
  Switch,
  useToast,
} from '@nirmaanify/ui';
import { ProjectType } from '@nirmaanify/types';
import { useAuth } from '../context/auth-context';

interface CreateProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CreateProjectModal({ isOpen, onClose }: CreateProjectModalProps) {
  const { toast } = useToast();
  const { createProject, activeWorkspace } = useAuth();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<ProjectType>('SAAS');
  const [framework, setFramework] = useState('Next.js 15 App Router');
  const [uiLibrary, setUiLibrary] = useState('shadcn/ui + Tailwind CSS');
  const [isBackendEnabled, setIsBackendEnabled] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async () => {
    if (!name.trim()) {
      toast({ title: 'Validation Error', description: 'Project name is required', type: 'error' });
      return;
    }

    setIsLoading(true);
    try {
      const created = await createProject({
        name: name.trim(),
        description: description.trim() || `Fullstack ${type} application`,
        type,
        framework,
        uiLibrary,
        isBackendEnabled,
        workspaceId: activeWorkspace?.id,
      });

      setName('');
      setDescription('');
      onClose();

      toast({
        title: 'Project Created',
        description: `"${created.name}" is now ready in ${activeWorkspace?.name}`,
        type: 'success',
      });
    } catch (err: any) {
      toast({
        title: 'Creation Failed',
        description: err.message || 'Could not create project',
        type: 'error',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title="Create New Project"
      description="Scaffold a new full-stack application inside your active workspace."
      footer={
        <>
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button variant="default" onClick={handleSubmit} isLoading={isLoading}>
            Create Project
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <Input
          label="Project Name"
          placeholder="e.g. Enterprise Analytics Platform"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <Input
          label="Description (Optional)"
          placeholder="Brief summary of what this application does..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        <Select
          label="Project Type"
          value={type}
          onChange={(e) => setType(e.target.value as ProjectType)}
          options={[
            { label: 'E-commerce (Online boutique, catalog, Stripe checkout)', value: 'ECOMMERCE' },
            { label: 'SaaS Platform (Multi-tenant, subscription tiers, AI tools)', value: 'SAAS' },
            { label: 'Website (Brand landing page, marketing showcase)', value: 'WEBSITE' },
            { label: 'Blog & Editorial (MDX content, technical journal)', value: 'BLOG' },
            { label: 'Dashboard & Analytics (Data tables, metrics, charts)', value: 'DASHBOARD' },
            { label: 'Portfolio & Agency (Work showcase, case studies)', value: 'PORTFOLIO' },
            { label: 'Custom Application (Custom architecture)', value: 'CUSTOM' },
          ]}
        />

        <div className="grid grid-cols-2 gap-3">
          <Select
            label="Frontend Framework"
            value={framework}
            onChange={(e) => setFramework(e.target.value)}
            options={[
              { label: 'Next.js 15 App Router (React 19)', value: 'Next.js 15 App Router' },
              { label: 'Next.js 15 Static (SSG / ISR)', value: 'Next.js 15 Static' },
              { label: 'React 19 + Vite SPA', value: 'React 19 + Vite' },
            ]}
          />

          <Select
            label="UI System"
            value={uiLibrary}
            onChange={(e) => setUiLibrary(e.target.value)}
            options={[
              { label: 'shadcn/ui + Tailwind CSS', value: 'shadcn/ui + Tailwind CSS' },
              { label: 'shadcn/ui + Framer Motion', value: 'shadcn/ui + Framer Motion' },
              { label: 'Tailwind CSS Typography', value: 'Tailwind CSS Typography' },
            ]}
          />
        </div>

        <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-[#161926] border border-slate-200 dark:border-[#24293D]">
          <div>
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Enable NestJS Backend API</span>
            <p className="text-[11px] text-slate-400">Scaffold REST controllers, Prisma ORM, and PostgreSQL database.</p>
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
