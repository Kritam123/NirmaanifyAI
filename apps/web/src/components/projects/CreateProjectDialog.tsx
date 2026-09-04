'use client';

import React, { useState } from 'react';
import { Dialog, Input, Select, Button, Textarea, useToast } from '@nirmaanify/ui';
import { useAuth } from '../../context/auth-context';
import { ProjectType, StorageDriverType } from '@nirmaanify/types';
import { ProjectServerType } from '../../lib/server-architecture';

interface CreateProjectDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CreateProjectDialog: React.FC<CreateProjectDialogProps> = ({ isOpen, onClose }) => {
  const { toast } = useToast();
  const { createProject, activeWorkspace } = useAuth();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<ProjectType>('SAAS');
  const [framework, setFramework] = useState('Next.js 15 App Router');
  const [uiLibrary, setUiLibrary] = useState('shadcn/ui + Tailwind CSS');
  const [storageDriver, setStorageDriver] = useState<StorageDriverType>('local');
  const [serverType, setServerType] = useState<ProjectServerType>('cms');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsSubmitting(true);
    try {
      const isBackend = serverType === 'nestjs' || serverType === 'fullstack';
      await createProject({
        name,
        description: description || `Scaffolded ${type} application`,
        type,
        framework,
        uiLibrary,
        isBackendEnabled: isBackend,
        storageDriver,
        projectSchema: {
          pages: ['/', '/dashboard', '/settings'],
          authEnabled: true,
          serverType,
          databaseModel:
            serverType === 'static'
              ? 'None (client-side)'
              : serverType === 'cms'
              ? 'PostgreSQL CMS Store'
              : 'PostgreSQL + Prisma ORM',
        },
      });

      toast({
        title: 'Project Created Successfully',
        description: `${name} has been added to ${activeWorkspace?.name}`,
        type: 'success',
      });

      setName('');
      setDescription('');
      onClose();
    } catch (err: any) {
      toast({
        title: 'Failed to create project',
        description: err?.message || 'Please try again',
        type: 'error',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title="Create Full-Stack Project"
      description="Scaffold a modern Next.js 15 application with connected NestJS API backend."
      footer={
        <>
          <Button variant="outline" size="sm" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button
            variant="default"
            size="sm"
            isLoading={isSubmitting}
            onClick={handleSubmit}
          >
            Create Project
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4 py-2">
        <Input
          label="Project Name"
          placeholder="e.g. AI Customer Service Agent"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />

        <Textarea
          label="Description"
          placeholder="Brief description of application goals and features..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={2}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Select
            label="Application Archetype"
            value={type}
            onChange={(e) => setType(e.target.value as ProjectType)}
            options={[
              { label: 'SaaS Platform', value: 'SAAS' },
              { label: 'E-commerce Store', value: 'ECOMMERCE' },
              { label: 'Developer Blog / CMS', value: 'BLOG' },
              { label: 'Analytics Dashboard', value: 'DASHBOARD' },
              { label: 'Marketing Website', value: 'WEBSITE' },
              { label: 'Custom App', value: 'CUSTOM' },
            ]}
          />

          <Select
            label="Frontend Framework"
            value={framework}
            onChange={(e) => setFramework(e.target.value)}
            options={[
              { label: 'Next.js 15 App Router (Recommended)', value: 'Next.js 15 App Router' },
              { label: 'Next.js 15 Pages Router', value: 'Next.js 15 Pages Router' },
              { label: 'Next.js Static Export', value: 'Next.js 15 Static' },
            ]}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Select
            label="UI Component Engine"
            value={uiLibrary}
            onChange={(e) => setUiLibrary(e.target.value)}
            options={[
              { label: 'shadcn/ui + Tailwind CSS', value: 'shadcn/ui + Tailwind CSS' },
              { label: 'Framer Motion + Tailwind', value: 'shadcn/ui + Framer Motion' },
              { label: 'Tailwind Typography', value: 'Tailwind CSS Typography' },
            ]}
          />

          <Select
            label="Server Architecture"
            value={serverType}
            onChange={(e) => setServerType(e.target.value as ProjectServerType)}
            options={[
              { label: 'Headless CMS — Dynamic content collections & delivery API', value: 'cms' },
              { label: 'Full NestJS API — REST API, Prisma ORM, & PostgreSQL', value: 'nestjs' },
              { label: 'Full-Stack (NestJS + CMS) — Combined custom API & CMS engine', value: 'fullstack' },
              { label: 'Static Frontend — Client-only Next.js export, no server', value: 'static' },
            ]}
          />
        </div>

        <Select
          label="Individual Storage Engine"
          value={storageDriver}
          onChange={(e) => setStorageDriver(e.target.value as StorageDriverType)}
          options={[
            { label: 'Local Filesystem — Development & local testing', value: 'local' },
            { label: 'AWS S3 / MinIO — Production object storage', value: 's3' },
            { label: 'Vercel Blob Storage — Global edge media CDN', value: 'vercel-blob' },
          ]}
        />
      </form>
    </Dialog>
  );
};
