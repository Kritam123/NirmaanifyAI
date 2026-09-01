'use client';

import React, { useState } from 'react';
import { Dialog, Input, Button, Badge } from '@nirmaanify/ui';
import { UserRole } from '@nirmaanify/types';
import { Mail, Shield, Code, Edit3, Eye, Check, Sparkles } from 'lucide-react';

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
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<UserRole>('DEVELOPER');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setIsLoading(true);
    try {
      await onInvite(email.trim(), role);
      setEmail('');
      onClose();
    } catch {
      // Handled in caller toast
    } finally {
      setIsLoading(false);
    }
  };

  const roleOptions: { role: UserRole; title: string; desc: string; icon: React.ReactNode; color: string }[] = [
    {
      role: 'DEVELOPER',
      title: 'Developer',
      desc: 'Full access to scaffold, create, edit, and deploy projects.',
      icon: <Code className="h-4 w-4" />,
      color: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20',
    },
    {
      role: 'ADMIN',
      title: 'Admin',
      desc: 'Manage workspace members, invite collaborators, and settings.',
      icon: <Shield className="h-4 w-4" />,
      color: 'text-purple-500 bg-purple-500/10 border-purple-500/20',
    },
    {
      role: 'EDITOR',
      title: 'Editor',
      desc: 'Edit application templates, design schemas, and CMS content.',
      icon: <Edit3 className="h-4 w-4" />,
      color: 'text-amber-500 bg-amber-500/10 border-amber-500/20',
    },
    {
      role: 'VIEWER',
      title: 'Viewer',
      desc: 'Read-only observation of workspace projects and metrics.',
      icon: <Eye className="h-4 w-4" />,
      color: 'text-slate-500 bg-slate-500/10 border-slate-500/20',
    },
  ];

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title="Invite Team Collaborator"
      description={`Send a Gmail invitation to join "${workspaceName || 'this workspace'}".`}
      footer={
        <div className="flex items-center justify-end gap-2.5 w-full">
          <Button variant="outline" size="sm" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button
            variant="default"
            size="sm"
            isLoading={isLoading}
            onClick={handleSubmit}
            className="bg-gradient-to-r from-[#635BFF] to-[#22D3EE] text-white shadow-md shadow-[#635BFF]/20 font-bold"
            leftIcon={<Mail className="h-4 w-4" />}
          >
            Send Gmail Invitation
          </Button>
        </div>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4 py-2 text-slate-900 dark:text-slate-100">
        {/* Email Input with icon */}
        <div>
          <Input
            label="Colleague Email Address"
            type="email"
            placeholder="colleague@company.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            startIcon={<Mail className="h-4 w-4 text-slate-400" />}
            required
            disabled={isLoading}
            autoFocus
          />
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-1">
            An email with a secure 7-day acceptance link will be sent to this address.
          </p>
        </div>

        {/* Visual Role Cards Selector */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
            Assign Access Role & Permissions
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {roleOptions.map((opt) => {
              const isSelected = role === opt.role;
              return (
                <button
                  key={opt.role}
                  type="button"
                  onClick={() => setRole(opt.role)}
                  className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                    isSelected
                      ? 'border-[#635BFF] bg-[#635BFF]/5 dark:bg-[#635BFF]/10 ring-1 ring-[#635BFF] shadow-sm'
                      : 'border-slate-200 dark:border-[#24293D] hover:border-slate-300 dark:hover:border-slate-700 bg-slate-50/50 dark:bg-[#141724]'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <div className={`p-1 rounded-lg border ${opt.color}`}>
                        {opt.icon}
                      </div>
                      <span className="text-xs font-bold text-slate-900 dark:text-white">{opt.title}</span>
                    </div>
                    {isSelected && <Check className="h-4 w-4 text-[#635BFF]" />}
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-tight line-clamp-2">
                    {opt.desc}
                  </p>
                </button>
              );
            })}
          </div>
        </div>
      </form>
    </Dialog>
  );
};
