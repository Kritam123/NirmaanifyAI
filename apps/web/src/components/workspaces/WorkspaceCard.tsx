'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
  Badge,
  Button,
} from '@nirmaanify/ui';
import { Building2, Check, ExternalLink, Trash2 } from 'lucide-react';
import { WorkspaceDto } from '@nirmaanify/types';
import { DeleteWorkspaceDialog } from './DeleteWorkspaceDialog';
import { ROUTES } from '../../lib/routes';

interface WorkspaceCardProps {
  workspace: WorkspaceDto;
  isActive: boolean;
  onSwitch: (id: string) => void;
}

export const WorkspaceCard: React.FC<WorkspaceCardProps> = ({
  workspace,
  isActive,
  onSwitch,
}) => {
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const workspaceUrl = `/workspaces/${workspace.id}`;
  const isOwnerOrAdmin = workspace.role === 'OWNER' || workspace.role === 'ADMIN';

  return (
    <>
      <Card
        hoverable
        className={`flex flex-col justify-between transition-all ${
          isActive ? 'border-2 border-[#635BFF] bg-[#635BFF]/5 dark:bg-[#635BFF]/5 shadow-md shadow-[#635BFF]/5' : ''
        }`}
      >
        <CardHeader className="p-6">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-slate-100 dark:bg-[#161926] text-[#635BFF]">
                <Building2 className="h-5 w-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <CardTitle className="text-base text-slate-900 dark:text-white">{workspace.name}</CardTitle>
                  {isActive && (
                    <Badge variant="indigo" size="sm">
                      Active
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-slate-400 font-mono mt-0.5">/{workspace.slug}</p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              {/* Single Clean Redirect Link to Open Organization in New Tab */}
              <a
                href={workspaceUrl}
                target="_blank"
                rel="noopener noreferrer"
                title="Open workspace in new tab"
                className="p-2 rounded-xl text-slate-400 hover:text-[#635BFF] hover:bg-[#635BFF]/10 transition-colors border border-transparent hover:border-[#635BFF]/20"
              >
                <ExternalLink className="h-4 w-4" />
              </a>

              {/* Delete Workspace Button (Owner/Admin only) */}
              {isOwnerOrAdmin && (
                <button
                  type="button"
                  onClick={() => setDeleteModalOpen(true)}
                  title="Delete workspace"
                  className="p-2 rounded-xl text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 transition-colors border border-transparent hover:border-rose-500/20"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>

          <CardDescription className="mt-3 text-xs">
            {workspace.isPersonal ? 'Personal Developer Studio' : 'Collaborative Team Workspace'} • Role:{' '}
            <span className="font-semibold text-slate-700 dark:text-slate-300">
              {workspace.role || 'OWNER'}
            </span>
          </CardDescription>
        </CardHeader>

        <CardFooter className="p-6 pt-3 flex items-center justify-between gap-2 border-t border-slate-100 dark:border-[#1E2337]">
          <Link href={ROUTES.DASHBOARD.WORKSPACE_DETAIL(workspace.id)}>
            <Button variant="ghost" size="sm" className="text-xs">
              Manage Members
            </Button>
          </Link>

          {isActive ? (
            <span className="flex items-center gap-1.5 text-xs font-semibold text-[#635BFF] dark:text-[#A5AEFD]">
              <Check className="h-4 w-4" /> Current Workspace
            </span>
          ) : (
            <Button variant="secondary" size="sm" onClick={() => onSwitch(workspace.id)} className="text-xs">
              Switch Workspace
            </Button>
          )}
        </CardFooter>
      </Card>

      {/* Delete Workspace Confirmation Dialog */}
      <DeleteWorkspaceDialog
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        workspace={workspace}
      />
    </>
  );
};
