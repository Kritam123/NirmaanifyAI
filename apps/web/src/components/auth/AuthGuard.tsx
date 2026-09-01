'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/auth-context';
import { ROUTES } from '../../lib/routes';
import { Loader2 } from 'lucide-react';

interface AuthGuardProps {
  children: React.ReactNode;
}

export const AuthGuard: React.FC<AuthGuardProps> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace(ROUTES.AUTH.LOGIN);
    }
  }, [isLoading, isAuthenticated, router]);

  if (isLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#F8FAFC] dark:bg-[#090A0F] text-slate-900 dark:text-slate-100">
        <Loader2 className="h-8 w-8 animate-spin text-[#635BFF] mb-3" />
        <p className="text-xs text-slate-400 font-medium">Validating workspace session...</p>
      </div>
    );
  }

  return <>{children}</>;
};
