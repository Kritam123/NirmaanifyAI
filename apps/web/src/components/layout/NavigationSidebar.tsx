'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { NirmaanLogo, NirmaanIcon } from '@nirmaanify/icons';
import { Avatar, Badge, useToast } from '@nirmaanify/ui';
import {
  LayoutDashboard,
  Boxes,
  Users,
  Plus,
  Building2,
  LogOut,
  ChevronRight,
} from 'lucide-react';
import { useAuth } from '../../context/auth-context';
import { useWorkspaceModal } from '../../context/workspace-modal-context';
import { ROUTES } from '../../lib/routes';

export interface NavigationSidebarProps {
  isCollapsed?: boolean;
  onClose?: () => void;
  className?: string;
}

export const NavigationSidebar: React.FC<NavigationSidebarProps> = ({
  isCollapsed = false,
  onClose,
  className,
}) => {
  const pathname = usePathname();
  const router = useRouter();
  const { toast } = useToast();
  const {
    user,
    activeWorkspace,
    projects,
    logout,
  } = useAuth();
  const { openCreateWorkspaceModal } = useWorkspaceModal();

  const navItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      href: ROUTES.DASHBOARD.OVERVIEW,
      icon: <LayoutDashboard className="h-4 w-4 shrink-0" />,
      active: pathname === ROUTES.DASHBOARD.OVERVIEW || pathname === ROUTES.HOME,
    },
    {
      id: 'projects',
      label: 'Projects',
      href: ROUTES.DASHBOARD.PROJECTS,
      icon: <Boxes className="h-4 w-4 shrink-0" />,
      badge: String(projects.length),
      active: pathname.startsWith(ROUTES.DASHBOARD.PROJECTS),
    },
    {
      id: 'workspaces',
      label: 'Workspaces & Team',
      href: ROUTES.DASHBOARD.WORKSPACES,
      icon: <Users className="h-4 w-4 shrink-0" />,
      active: pathname.startsWith(ROUTES.DASHBOARD.WORKSPACES),
    },
  ];

  const handleLogout = async () => {
    await logout();
    toast({
      title: 'Logged Out',
      description: 'You have been safely signed out.',
      type: 'info',
    });
    router.push(ROUTES.AUTH.LOGIN);
  };

  return (
    <aside
      className={`shrink-0 border-r border-slate-200 dark:border-[#24293D] bg-white dark:bg-[#0F111A] flex flex-col h-screen select-none transition-all duration-300 ease-in-out ${
        isCollapsed ? 'w-20' : 'w-64'
      } ${className || ''}`}
    >
      {/* Brand Header */}
      <div
        className={`h-16 flex items-center border-b border-slate-200 dark:border-[#24293D] ${
          isCollapsed ? 'justify-center px-2' : 'justify-between px-6'
        }`}
      >
        <Link
          href={ROUTES.DASHBOARD.OVERVIEW}
          onClick={onClose}
          className="flex items-center justify-center overflow-hidden"
          title="Nirmaanify AI"
        >
          {isCollapsed ? <NirmaanIcon size={28} /> : <NirmaanLogo size="sm" />}
        </Link>
      </div>

      {/* Navigation Items */}
      <nav className={`flex-1 space-y-1.5 overflow-y-auto overflow-x-hidden ${isCollapsed ? 'px-2 py-4' : 'px-3 py-4'}`}>
        {navItems.map((item) => (
          <Link
            key={item.id}
            href={item.href}
            onClick={onClose}
            title={isCollapsed ? item.label : undefined}
            className={`w-full flex items-center rounded-lg text-xs font-semibold transition-all group relative ${
              isCollapsed
                ? 'justify-center p-2.5'
                : 'justify-between px-3 py-2'
            } ${
              item.active
                ? 'bg-[#635BFF]/10 text-[#635BFF] dark:text-[#A5AEFD]'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-[#161926] hover:text-slate-900 dark:hover:text-slate-100'
            }`}
          >
            <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'gap-3'}`}>
              <span className={item.active ? 'text-[#635BFF]' : 'text-slate-400'}>
                {item.icon}
              </span>
              {!isCollapsed && <span>{item.label}</span>}
            </div>

            {!isCollapsed && item.badge && (
              <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-[#635BFF]/15 text-[#635BFF] dark:text-[#A5AEFD]">
                {item.badge}
              </span>
            )}

            {isCollapsed && item.badge && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#635BFF] animate-pulse" />
            )}
          </Link>
        ))}
      </nav>

      {/* Sidebar Footer: Workspace Switcher & User Profile */}
      <div className={`border-t border-slate-200 dark:border-[#24293D] ${isCollapsed ? 'p-2 space-y-2' : 'p-3 space-y-2.5'}`}>
        {/* Workspace Switcher Selector */}
        {activeWorkspace ? (
          isCollapsed ? (
            <Link
              href={ROUTES.DASHBOARD.WORKSPACES}
              onClick={onClose}
              title={`Workspace: ${activeWorkspace.name} (${activeWorkspace.role || 'OWNER'})`}
              className="w-full flex items-center justify-center p-2 rounded-xl bg-slate-50 dark:bg-[#161926] border border-slate-200 dark:border-[#24293D] hover:border-[#635BFF] text-[#635BFF] transition-colors"
            >
              <Building2 className="h-4 w-4" />
            </Link>
          ) : (
            <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-[#161926] border border-slate-200 dark:border-[#24293D]">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 overflow-hidden">
                  <Building2 className="h-4 w-4 text-[#635BFF] shrink-0" />
                  <span className="text-xs font-bold truncate text-slate-800 dark:text-slate-200">
                    {activeWorkspace.name}
                  </span>
                </div>
                <Badge variant="indigo" size="sm">
                  {activeWorkspace.role || 'OWNER'}
                </Badge>
              </div>
              <div className="mt-2 pt-2 border-t border-slate-200 dark:border-[#24293D] flex items-center justify-between text-[11px] text-slate-400">
                <button
                  type="button"
                  onClick={() => {
                    onClose?.();
                    openCreateWorkspaceModal();
                  }}
                  className="hover:text-[#635BFF] transition-colors flex items-center gap-1 font-medium cursor-pointer"
                >
                  <Plus className="h-3 w-3" /> New Workspace
                </button>
                <Link
                  href={ROUTES.DASHBOARD.WORKSPACES}
                  onClick={onClose}
                  className="hover:text-[#635BFF] transition-colors flex items-center gap-0.5"
                >
                  <span>Manage</span>
                  <ChevronRight className="h-3 w-3" />
                </Link>
              </div>
            </div>
          )
        ) : (
          !isCollapsed && (
            <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-[#161926] border border-dashed border-slate-200 dark:border-[#24293D] text-center">
              <p className="text-xs text-slate-400 mb-2">No active workspace</p>
              <button
                type="button"
                onClick={() => {
                  onClose?.();
                  openCreateWorkspaceModal();
                }}
                className="w-full py-1.5 px-3 rounded-lg bg-[#635BFF] text-white text-xs font-bold hover:bg-[#5248e5] transition-colors flex items-center justify-center gap-1.5 shadow-sm cursor-pointer"
              >
                <Plus className="h-3.5 w-3.5" /> Create Workspace
              </button>
            </div>
          )
        )}

        {/* User Profile */}
        {user && (
          <div
            className={`flex items-center ${
              isCollapsed ? 'flex-col gap-1.5 justify-center pt-1' : 'justify-between pt-1'
            }`}
          >
            <div className={`flex items-center overflow-hidden ${isCollapsed ? 'justify-center' : 'gap-2.5'}`}>
              <Avatar
                fallback={user.name?.slice(0, 2).toUpperCase() || 'US'}
                size="sm"
                status="online"
                title={`${user.name} (${user.email})`}
              />
              {!isCollapsed && (
                <div className="overflow-hidden">
                  <p className="text-xs font-bold truncate text-slate-900 dark:text-white leading-tight">
                    {user.name}
                  </p>
                  <p className="text-[10px] text-slate-400 truncate">{user.email}</p>
                </div>
              )}
            </div>
            <button
              type="button"
              onClick={handleLogout}
              title="Sign Out"
              aria-label="Sign Out"
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 transition-colors focus-visible:ring-2 focus-visible:ring-[#635BFF] focus-visible:outline-none"
            >
              <LogOut className="h-3.5 w-3.5" />
            </button>
          </div>
        )}
      </div>
    </aside>
  );
};
