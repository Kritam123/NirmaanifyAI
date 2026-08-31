'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { NirmaanLogo } from '@nirmaanify/icons';
import { Avatar, Badge, Button, Dialog, Input, useToast } from '@nirmaanify/ui';
import {
  LayoutDashboard,
  Boxes,
  Users,
  HardDrive,
  Plus,
  Building2,
  LogOut,
  ChevronRight,
} from 'lucide-react';
import { useAuth } from '../../context/auth-context';
import { ROUTES } from '../../lib/routes';

export const NavigationSidebar: React.FC = () => {
  const pathname = usePathname();
  const router = useRouter();
  const { toast } = useToast();
  const {
    user,
    activeWorkspace,
    workspaces,
    switchWorkspace,
    createWorkspace,
    projects,
    logout,
  } = useAuth();

  const [createWsModal, setCreateWsModal] = useState(false);
  const [newWsName, setNewWsName] = useState('');

  const navItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      href: ROUTES.DASHBOARD.OVERVIEW,
      icon: <LayoutDashboard className="h-4 w-4" />,
      active: pathname === ROUTES.DASHBOARD.OVERVIEW || pathname === ROUTES.HOME,
    },
    {
      id: 'projects',
      label: 'Projects',
      href: ROUTES.DASHBOARD.PROJECTS,
      icon: <Boxes className="h-4 w-4" />,
      badge: String(projects.length),
      active: pathname.startsWith(ROUTES.DASHBOARD.PROJECTS),
    },
    {
      id: 'workspaces',
      label: 'Workspaces & Team',
      href: ROUTES.DASHBOARD.WORKSPACES,
      icon: <Users className="h-4 w-4" />,
      active: pathname.startsWith(ROUTES.DASHBOARD.WORKSPACES),
    },
    {
      id: 'storage',
      label: 'Storage Engine',
      href: ROUTES.DASHBOARD.STORAGE,
      icon: <HardDrive className="h-4 w-4" />,
      badge: 'Multi-Driver',
      active: pathname.startsWith(ROUTES.DASHBOARD.STORAGE),
    },
  ];

  const handleCreateWorkspace = async () => {
    if (!newWsName.trim()) return;
    try {
      await createWorkspace(newWsName);
      setNewWsName('');
      setCreateWsModal(false);
      toast({
        title: 'Workspace Created',
        description: `Switched to "${newWsName}"`,
        type: 'success',
      });
    } catch {
      // Handled in hook
    }
  };

  const handleLogout = () => {
    logout();
    toast({
      title: 'Logged Out',
      description: 'You have been safely signed out.',
      type: 'info',
    });
    router.push(ROUTES.AUTH.LOGIN);
  };

  return (
    <>
      <aside className="w-64 shrink-0 border-r border-slate-200 dark:border-[#24293D] bg-white dark:bg-[#0F111A] flex flex-col h-screen select-none transition-colors duration-200">
        {/* Brand Header */}
        <div className="h-16 px-6 flex items-center justify-between border-b border-slate-200 dark:border-[#24293D]">
          <Link href={ROUTES.DASHBOARD.OVERVIEW}>
            <NirmaanLogo size="sm" />
          </Link>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 px-3 py-4 space-y-1.5 overflow-y-auto">
          {navItems.map((item) => (
            <Link
              key={item.id}
              href={item.href}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                item.active
                  ? 'bg-[#635BFF]/10 text-[#635BFF] dark:text-[#A5AEFD]'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-[#161926] hover:text-slate-900 dark:hover:text-slate-100'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className={item.active ? 'text-[#635BFF]' : 'text-slate-400'}>{item.icon}</span>
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-[#635BFF]/15 text-[#635BFF] dark:text-[#A5AEFD]">
                  {item.badge}
                </span>
              )}
            </Link>
          ))}
        </nav>

        {/* Sidebar Footer: Workspace Switcher & User Profile */}
        <div className="p-3 border-t border-slate-200 dark:border-[#24293D] space-y-2.5">
          {/* Workspace Switcher Selector */}
          <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-[#161926] border border-slate-200 dark:border-[#24293D]">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 overflow-hidden">
                <Building2 className="h-4 w-4 text-[#635BFF] shrink-0" />
                <span className="text-xs font-bold truncate text-slate-800 dark:text-slate-200">
                  {activeWorkspace?.name || 'My Studio'}
                </span>
              </div>
              <Badge variant="indigo" size="sm">
                {activeWorkspace?.role || 'OWNER'}
              </Badge>
            </div>
            <div className="mt-2 pt-2 border-t border-slate-200 dark:border-[#24293D] flex items-center justify-between text-[11px] text-slate-400">
              <button
                onClick={() => setCreateWsModal(true)}
                className="hover:text-[#635BFF] transition-colors flex items-center gap-1 font-medium"
              >
                <Plus className="h-3 w-3" /> New Workspace
              </button>
              <Link
                href={ROUTES.DASHBOARD.WORKSPACES}
                className="hover:text-[#635BFF] transition-colors flex items-center gap-0.5"
              >
                <span>Manage</span>
                <ChevronRight className="h-3 w-3" />
              </Link>
            </div>
          </div>

          {/* User Profile */}
          <div className="flex items-center justify-between pt-1">
            <div className="flex items-center gap-2.5 overflow-hidden">
              <Avatar fallback={user?.name?.slice(0, 2).toUpperCase() || 'AD'} size="sm" status="online" />
              <div className="overflow-hidden">
                <p className="text-xs font-bold truncate text-slate-900 dark:text-white leading-tight">
                  {user?.name || 'Developer'}
                </p>
                <p className="text-[10px] text-slate-400 truncate">{user?.email || 'dev@nirmaanify.ai'}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              title="Sign Out"
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 transition-colors"
            >
              <LogOut className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </aside>

      {/* Create Workspace Modal */}
      <Dialog
        isOpen={createWsModal}
        onClose={() => setCreateWsModal(false)}
        title="Create New Workspace"
        description="Organize distinct applications, microservices, and collaborators."
        footer={
          <>
            <Button variant="outline" size="sm" onClick={() => setCreateWsModal(false)}>
              Cancel
            </Button>
            <Button variant="default" size="sm" onClick={handleCreateWorkspace}>
              Create Workspace
            </Button>
          </>
        }
      >
        <div className="space-y-4 py-2">
          <Input
            label="Workspace Name"
            placeholder="e.g. Acme Cloud Systems"
            value={newWsName}
            onChange={(e) => setNewWsName(e.target.value)}
            required
          />
        </div>
      </Dialog>
    </>
  );
};
