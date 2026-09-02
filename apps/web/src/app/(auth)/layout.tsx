import React from 'react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Authentication — Nirmaanify AI',
  description: 'Sign in, register, or manage credentials for Nirmaanify Platform.',
};

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
