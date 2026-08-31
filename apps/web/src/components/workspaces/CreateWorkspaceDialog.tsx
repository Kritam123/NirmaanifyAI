'use client';

import React, { useState } from 'react';
import { Dialog, Input, Button, useToast } from '@nirmaanify/ui';
import { useAuth } from '../../context/auth-context';

interface CreateWorkspaceDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CreateWorkspaceDialog: React.FC<CreateWorkspaceDialogProps> = ({
  isOpen,
  onClose,
}) => {
  const { toast } = useToast();
  const { createWorkspace } = useAuth();
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleNameChange = (val: string) => {
    setName(val);
    setSlug(val.toLowerCase().replace(/[^a-z0-9]/g, '-'));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsLoading(true);
    try {
      await createWorkspace(name, slug);
      toast({
        title: 'Workspace Created',
        description: `Switched to "${name}"`,
        type: 'success',
      });
      setName('');
      setSlug('');
      onClose();
    } catch (err: any) {
      toast({
        title: 'Error Creating Workspace',
        description: err?.message || 'Could not complete request',
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
      title="Create New Workspace"
      description="Workspaces group projects, environment secrets, and collaborative team permissions."
      footer={
        <>
          <Button variant="outline" size="sm" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button variant="default" size="sm" isLoading={isLoading} onClick={handleSubmit}>
            Create Workspace
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4 py-2">
        <Input
          label="Workspace Name"
          placeholder="e.g. Acme SaaS Corporation"
          value={name}
          onChange={(e) => handleNameChange(e.target.value)}
          required
        />
        <Input
          label="Workspace URL Slug"
          placeholder="e.g. acme-saas"
          value={slug}
          onChange={(e) => setSlug(e.target.value)}
          helperText="Unique identifier used in URLs and API routes."
          required
        />
      </form>
    </Dialog>
  );
};
