'use client';

import React, { useState } from 'react';
import { useToast } from '@nirmaanify/ui';
import { signIn } from 'next-auth/react';
import { Loader2 } from 'lucide-react';

interface SocialAuthButtonsProps {
  onSocialAuth?: (provider: 'github' | 'google') => void;
  isLoading?: boolean;
  callbackUrl?: string;
}

export const SocialAuthButtons: React.FC<SocialAuthButtonsProps> = ({
  onSocialAuth,
  isLoading = false,
  callbackUrl = '/dashboard',
}) => {
  const { toast } = useToast();
  const [activeProvider, setActiveProvider] = useState<'github' | 'google' | null>(null);

  const handleSocialSignIn = async (provider: 'github' | 'google') => {
    setActiveProvider(provider);
    if (onSocialAuth) {
      onSocialAuth(provider);
    }

    try {
      toast({
        title: `Connecting to ${provider === 'github' ? 'GitHub' : 'Google'}`,
        description: 'Redirecting to secure OAuth authorization...',
        type: 'info',
      });

      await signIn(provider, { callbackUrl });
    } catch {
      toast({
        title: 'Authentication Notice',
        description: `Starting OAuth sign-in flow with ${provider.toUpperCase()}...`,
        type: 'info',
      });
    } finally {
      setActiveProvider(null);
    }
  };

  const isBusy = isLoading || activeProvider !== null;

  return (
    <div className="grid grid-cols-2 gap-3 w-full">
      {/* GitHub Button */}
      <button
        type="button"
        disabled={isBusy}
        onClick={() => handleSocialSignIn('github')}
        className="w-full h-11 flex flex-row items-center justify-center gap-2.5 px-4 rounded-xl border border-slate-200 dark:border-[#24293D] bg-white dark:bg-[#141724] hover:bg-slate-50 dark:hover:bg-[#1B1F30] hover:border-slate-300 dark:hover:border-slate-700 text-slate-800 dark:text-slate-200 text-xs font-semibold shadow-sm transition-all disabled:opacity-50 disabled:pointer-events-none active:scale-[0.98]"
      >
        {activeProvider === 'github' ? (
          <Loader2 className="h-4 w-4 animate-spin text-[#635BFF] shrink-0" />
        ) : (
          <svg className="h-4 w-4 fill-current text-slate-900 dark:text-white shrink-0" viewBox="0 0 24 24">
            <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
          </svg>
        )}
        <span className="leading-none">GitHub</span>
      </button>

      {/* Google Button */}
      <button
        type="button"
        disabled={isBusy}
        onClick={() => handleSocialSignIn('google')}
        className="w-full h-11 flex flex-row items-center justify-center gap-2.5 px-4 rounded-xl border border-slate-200 dark:border-[#24293D] bg-white dark:bg-[#141724] hover:bg-slate-50 dark:hover:bg-[#1B1F30] hover:border-slate-300 dark:hover:border-slate-700 text-slate-800 dark:text-slate-200 text-xs font-semibold shadow-sm transition-all disabled:opacity-50 disabled:pointer-events-none active:scale-[0.98]"
      >
        {activeProvider === 'google' ? (
          <Loader2 className="h-4 w-4 animate-spin text-[#4285F4] shrink-0" />
        ) : (
          <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.66v3.05h3.87c2.26-2.09 3.675-5.17 3.675-9.15z"
            />
            <path
              fill="#34A853"
              d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.87-3.05c-1.08.72-2.45 1.16-4.06 1.16-3.13 0-5.78-2.11-6.73-4.96H1.28v3.15C3.25 21.31 7.31 24 12 24z"
            />
            <path
              fill="#FBBC05"
              d="M5.27 14.24c-.25-.72-.38-1.49-.38-2.24s.13-1.52.38-2.24V6.61H1.28C.46 8.23 0 10.06 0 12s.46 3.77 1.28 5.39l3.99-3.15z"
            />
            <path
              fill="#EA4335"
              d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.25 2.69 1.28 6.61l3.99 3.15c.95-2.85 3.6-4.96 6.73-4.96z"
            />
          </svg>
        )}
        <span className="leading-none">Google</span>
      </button>
    </div>
  );
};
