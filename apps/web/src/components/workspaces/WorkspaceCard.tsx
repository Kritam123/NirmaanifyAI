'use client';

import React from 'react';
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
import { Building2, Users, Check, ArrowRight } from 'lucide-react';
import { WorkspaceDto } from '@nirmaanify/types';
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
  return (
    <Card
      hoverable
      className={`flex flex-col justify-between ${
        isActive ? 'border-2 border-[#635BFF] bg-[#635BFF]/5 dark:bg-[#635BFF]/5' : ''
      }`}
    >
      <CardHeader className="p-6">
        <div className="flex items-center justify-between">
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
        </div>

        <CardDescription className="mt-3 text-xs">
          {workspace.isPersonal ? 'Personal Developer Studio' : 'Collaborative Team Workspace'} • Role:{' '}
          <span className="font-semibold text-slate-700 dark:text-slate-300">
            {workspace.role || 'OWNER'}
          </span>
        </CardDescription>
      </CardHeader>

      <CardFooter className="p-6 pt-2 flex items-center justify-between border-t border-slate-100 dark:border-[#1E2337]">
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
  );
};
