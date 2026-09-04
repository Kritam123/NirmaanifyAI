import React from 'react';
import type { Metadata } from 'next';
import { DashboardShell } from '../../components/layout/DashboardShell';

export const metadata: Metadata = {
  title: 'Platform Studio — Nirmaanify AI',
  description: 'Manage full-stack applications, workspaces, and AI builds.',
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return <DashboardShell>{children}</DashboardShell>;
}
