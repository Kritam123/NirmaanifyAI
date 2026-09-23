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
  const [type, setType] = useState<ProjectType>('SYSTEM_ARCHITECTURE');
  const [slugTouched, setSlugTouched] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (project) {
      setName(project.name);
      setSlug(project.slug);
      setDescription(project.description || '');
      setType(project.type);
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
      });
      onClose();
      toast({
        title: 'Architecture design updated',
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
      title="Edit Architecture Design"
      description={`Update the title, slug, and archetype for "${project.name}".`}
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
            label="Architecture Name"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              if (!slugTouched) setSlug(slugify(e.target.value));
            }}
            placeholder="e.g. Distributed Video Streaming Architecture"
          />
          <Input
            label="Slug (URL path)"
            value={slug}
            onChange={(e) => {
              setSlugTouched(true);
              setSlug(slugify(e.target.value));
            }}
            placeholder="distributed-video-streaming"
            helperText="Lowercase letters, digits, and hyphens only"
          />
        </div>

        <Textarea
          label="Architecture Scope & Notes"
          rows={3}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Brief description of system components, throughput requirements, or design goals..."
        />

        <Select
          label="Diagram & Canvas Type"
          value={type}
          onChange={(e) => setType(e.target.value as ProjectType)}
          options={[
            { label: 'System Architecture & Microservices (Distributed Systems)', value: 'SYSTEM_ARCHITECTURE' },
            { label: 'Cloud Infrastructure Topology (AWS / GCP / Azure / K8s)', value: 'CLOUD_INFRASTRUCTURE' },
            { label: 'UML Diagram (Class Models, Sequence Flows, Components)', value: 'UML_DIAGRAM' },
            { label: 'Database Schema & ERD (Tables, Foreign Keys, Columns)', value: 'DATABASE_ERD' },
            { label: 'Flowchart & State Transition Machine', value: 'FLOWCHART' },
            { label: 'Freeform Whiteboard & Wireframe Canvas', value: 'WHITEBOARD' },
            { label: 'Custom Architecture Canvas', value: 'CUSTOM' },
          ]}
        />
      </div>
    </Dialog>
  );
};
