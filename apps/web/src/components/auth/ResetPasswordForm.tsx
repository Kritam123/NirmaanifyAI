'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button, Input, useToast } from '@nirmaanify/ui';
import { Lock, Eye, EyeOff, CheckCircle2, AlertCircle, KeyRound } from 'lucide-react';
import { useAuth } from '../../context/auth-context';
import { ROUTES } from '../../lib/routes';

export const ResetPasswordForm: React.FC = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const { resetPassword } = useAuth();

  const [token, setToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const urlToken = searchParams.get('token');
    if (urlToken) {
      setToken(urlToken);
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      setErrorMessage('Reset token is missing or invalid.');
      return;
    }
    if (!newPassword || newPassword.length < 6) {
      setErrorMessage('Password must be at least 6 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setErrorMessage('Passwords do not match.');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      await resetPassword(token, newPassword);
      setIsSuccess(true);
      toast({
        title: 'Password Updated',
        description: 'You can now sign in with your new password.',
        type: 'success',
      });
    } catch (err: any) {
      setErrorMessage(err?.message || 'Failed to reset password. The link may have expired.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="space-y-6 text-center">
        <div className="mx-auto w-12 h-12 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500">
          <CheckCircle2 className="h-6 w-6" />
        </div>

        <div className="space-y-2">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">Password Reset Complete</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Your credentials have been securely updated. You may now sign in to your workspace.
          </p>
        </div>

        <Button
          variant="default"
          size="lg"
          className="w-full font-semibold"
          onClick={() => router.push(ROUTES.AUTH.LOGIN)}
        >
          Proceed to Sign In
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {errorMessage && (
        <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs flex items-center gap-2.5">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Token Field (shown if not in URL) */}
      <Input
        label="Reset Token"
        type="text"
        placeholder="e.g. reset-token-uuid"
        value={token}
        onChange={(e) => setToken(e.target.value)}
        startIcon={<KeyRound className="h-4 w-4" />}
        required
        disabled={isLoading}
      />

      {/* New Password */}
      <Input
        label="New Password"
        type={showPassword ? 'text' : 'password'}
        placeholder="••••••••"
        value={newPassword}
        onChange={(e) => setNewPassword(e.target.value)}
        startIcon={<Lock className="h-4 w-4" />}
        endIcon={
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        }
        required
        disabled={isLoading}
      />

      {/* Confirm Password */}
      <Input
        label="Confirm New Password"
        type={showPassword ? 'text' : 'password'}
        placeholder="••••••••"
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
        startIcon={<Lock className="h-4 w-4" />}
        required
        disabled={isLoading}
      />

      {/* Submit Button */}
      <Button
        type="submit"
        variant="default"
        size="lg"
        isLoading={isLoading}
        className="w-full font-semibold shadow-lg shadow-[#635BFF]/25"
      >
        Set New Password
      </Button>

      <div className="pt-2 text-center text-xs text-slate-400">
        Remember your password?{' '}
        <Link href={ROUTES.AUTH.LOGIN} className="font-bold text-[#635BFF] hover:underline">
          Sign In
        </Link>
      </div>
    </form>
  );
};
