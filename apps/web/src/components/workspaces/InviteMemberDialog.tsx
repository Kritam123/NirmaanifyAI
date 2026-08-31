'use client';

import React, { useState } from 'react';
import { Dialog, Input, Select, Button, useToast } from '@nirmaanify/ui';
import { UserRole } from '@nirmaanify/types';

interface InviteMemberDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onInvite: (email: string, role: UserRole) => Promise<void>;
  workspaceName?: string;
}

export const InviteMemberDialog: React.FC<InviteMemberDialogProps> = ({
  isOpen,
  onClose,
  onInvite,
  workspaceName,
}) => {
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<UserRole>('DEVELOPER');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setIsLoading(true);
    try {
      await onInvite(email, role);
      setEmail('');
      onClose();
    } catch {
      // Handled in caller
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title="Invite Team Collaborator"
      description={`Add a developer or editor to ${workspaceName || 'this workspace'}.`}
      footer={
        <>
          <Button variant="outline" size="sm" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button variant="default" size="sm" isLoading={isLoading} onClick={handleSubmit}>
            Send Invitation
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4 py-2">
        <Input
          label="Colleague Email Address"
          type="email"
          placeholder="colleague@company.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <Select
          label="Role & Access Permission"
          value={role}
          onChange={(e) => setRole(e.target.value as UserRole)}
          options={[
            { label: 'Developer (Full access to create, edit, export projects)', value: 'DEVELOPER' },
            { label: 'Admin (Manage team members, settings, and billing)', value: 'ADMIN' },
            { label: 'Editor (Update CMS data and preview)', value: 'EDITOR' },
            { label: 'Viewer (Read-only observation)', value: 'VIEWER' },
          ]}
        />
      </form>
    </Dialog>
  );
};
