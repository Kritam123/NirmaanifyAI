'use client';

import React, { useState } from 'react';
import { Dialog, Input, Select, Button, Textarea, useToast } from '@nirmaanify/ui';
import { useAuth } from '../../context/auth-context';
import { ProjectType } from '@nirmaanify/types';

interface CreateProjectDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CreateProjectDialog: React.FC<CreateProjectDialogProps> = ({ isOpen, onClose }) => {
  const { toast } = useToast();
  const { createProject, activeWorkspace } = useAuth();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<ProjectType>('SYSTEM_ARCHITECTURE');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsSubmitting(true);
    try {
      await createProject({
        name: name.trim(),
        description: description.trim() || `${type} system design architecture`,
        type,
        framework: 'React Flow Vector Canvas',
        uiLibrary: 'Tailwind CSS + SVG Stencils',
        isBackendEnabled: true,
        storageDriver: 'local',
      });

      toast({
        title: 'Architecture Canvas Created',
        description: `"${name}" is ready for system design and diagramming.`,
        type: 'success',
      });

      setName('');
      setDescription('');
      onClose();
    } catch (err: any) {
      toast({
        title: 'Failed to create system design',
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
      title="Create System Design Architecture"
      description="Create a new visual architecture canvas with UML, cloud stencils, and spec sidecars."
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
            Create Architecture
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4 py-2">
        <Input
          label="Architecture Title"
          placeholder="e.g. Distributed Video Streaming Architecture"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />

        <Textarea
          label="Architecture Scope & Notes"
          placeholder="Brief description of system components, throughput requirements, or design goals..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
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
          ]}
        />
      </form>
    </Dialog>
  );
};
