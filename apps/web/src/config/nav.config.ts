import { ROUTES } from './routes.config';

export interface NavItemConfig {
  id: string;
  label: string;
  href: string;
  iconName: string;
  badge?: string;
  category?: 'primary' | 'tools' | 'governance';
}

export const MAIN_NAV_ITEMS: NavItemConfig[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    href: ROUTES.DASHBOARD.OVERVIEW,
    iconName: 'LayoutDashboard',
    category: 'primary',
  },
  {
    id: 'projects',
    label: 'Projects',
    href: ROUTES.DASHBOARD.PROJECTS,
    iconName: 'Boxes',
    category: 'primary',
  },
  {
    id: 'cms',
    label: 'CMS Collections',
    href: ROUTES.DASHBOARD.CMS,
    iconName: 'Database',
    category: 'tools',
  },
  {
    id: 'backend',
    label: 'Backend & NestJS',
    href: ROUTES.DASHBOARD.BACKEND,
    iconName: 'Server',
    category: 'tools',
  },
  {
    id: 'database-builder',
    label: 'Data & API Models',
    href: ROUTES.DASHBOARD.DATABASE,
    iconName: 'Table',
    category: 'tools',
  },
  {
    id: 'plugins',
    label: 'Packages & Plugins',
    href: ROUTES.DASHBOARD.PLUGINS,
    iconName: 'Puzzle',
    category: 'tools',
  },
  {
    id: 'deploy',
    label: 'Preview & Deploy',
    href: ROUTES.DASHBOARD.DEPLOY,
    iconName: 'Rocket',
    category: 'tools',
  },
  {
    id: 'launch',
    label: 'MVP Release & QA',
    href: ROUTES.DASHBOARD.LAUNCH,
    iconName: 'Award',
    category: 'governance',
  },
  {
    id: 'governance',
    label: 'Architecture & Rules',
    href: ROUTES.DASHBOARD.GOVERNANCE,
    iconName: 'Compass',
    category: 'governance',
  },
  {
    id: 'team',
    label: 'Team & RBAC',
    href: ROUTES.DASHBOARD.TEAM,
    iconName: 'Users',
    category: 'governance',
  },
  {
    id: 'storage',
    label: 'Storage Drivers',
    href: ROUTES.DASHBOARD.STORAGE,
    iconName: 'HardDrive',
    category: 'governance',
  },
];
