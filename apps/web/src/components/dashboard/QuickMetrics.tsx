'use client';

import React from 'react';
import Link from 'next/link';
import { Card } from '@nirmaanify/ui';
import { Boxes, Globe, Users, Building2, ArrowUpRight } from 'lucide-react';
import { useAuth } from '../../context/auth-context';
import { ROUTES } from '../../lib/routes';

export const QuickMetrics: React.FC = () => {
  const { projects, activeWorkspace, workspaces } = useAuth();

  const activeBackends = projects.filter((p) => p.isBackendEnabled).length;
  const memberCount = activeWorkspace?.isPersonal
    ? 1
    : activeWorkspace?.memberCount || 1;

  const metrics = [
    {
      label: 'Active Projects',
      val: projects.length,
      icon: <Boxes className="h-5 w-5 text-[#635BFF]" />,
      sub: `${projects.length} application${projects.length === 1 ? '' : 's'} in workspace`,
      href: ROUTES.DASHBOARD.PROJECTS,
    },
    {
      label: 'Backends & Services',
      val: activeBackends,
      icon: <Globe className="h-5 w-5 text-[#22D3EE]" />,
      sub: `${activeBackends} NestJS / PostgreSQL backend${activeBackends === 1 ? '' : 's'}`,
      href: ROUTES.DASHBOARD.PROJECTS,
    },
    {
      label: 'Workspace Members',
      val: `${memberCount} Member${memberCount === 1 ? '' : 's'}`,
      icon: <Users className="h-5 w-5 text-[#8B5CF6]" />,
      sub: `Role: ${activeWorkspace?.role || 'OWNER'}`,
      href: ROUTES.DASHBOARD.WORKSPACES,
    },
    {
      label: 'Workspaces',
      val: workspaces.length,
      icon: <Building2 className="h-5 w-5 text-emerald-400" />,
      sub: `${workspaces.length} workspace${workspaces.length === 1 ? '' : 's'} available`,
      href: ROUTES.DASHBOARD.WORKSPACES,
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {metrics.map((m) => (
        <Link key={m.label} href={m.href}>
          <Card hoverable className="p-5 h-full flex flex-col justify-between group cursor-pointer">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{m.label}</span>
              <div className="p-2 rounded-lg bg-slate-100 dark:bg-[#161926] text-slate-700 dark:text-slate-300 group-hover:scale-110 transition-transform">
                {m.icon}
              </div>
            </div>
            <div className="mt-4 flex items-end justify-between">
              <div>
                <p className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">{m.val}</p>
                <p className="text-[11px] text-slate-400 mt-0.5">{m.sub}</p>
              </div>
              <ArrowUpRight className="h-4 w-4 text-slate-300 dark:text-slate-600 group-hover:text-[#635BFF] transition-colors" />
            </div>
          </Card>
        </Link>
      ))}
    </div>
  );
};
