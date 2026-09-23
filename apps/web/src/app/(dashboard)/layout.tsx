import React from 'react';
import type { Metadata } from 'next';
import { DashboardShell } from '../../components/layout/DashboardShell';

export const metadata: Metadata = {
  title: 'Architecture Studio — Nirmaanify AI',
  description: 'Design distributed architectures, cloud topologies, UML diagrams, and technical specifications.',
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return <DashboardShell>{children}</DashboardShell>;
}
