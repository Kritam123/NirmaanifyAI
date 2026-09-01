'use client';

import React from 'react';
import { DashboardShell } from '../components/layout/DashboardShell';
import DashboardPage from './(dashboard)/dashboard/page';

export default function RootPage() {
  return (
    <DashboardShell>
      <DashboardPage />
    </DashboardShell>
  );
}
