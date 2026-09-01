'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button, Input, useToast } from '@nirmaanify/ui';
import { Mail, ArrowLeft, CheckCircle2, KeyRound } from 'lucide-react';
import { useAuth } from '../../context/auth-context';
import { ROUTES } from '../../lib/routes';

export const ForgotPasswordForm: React.FC = () => {
  const router = useRouter();
  const { toast } = useToast();
  const { forgotPassword } = useAuth();

  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [generatedToken, setGeneratedToken] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setIsLoading(true);
    try {
      const res = await forgotPassword(email);
      setIsSubmitted(true);
      if (res.mockResetToken) {
        setGeneratedToken(res.mockResetToken);
      }
      toast({
        title: 'Reset Link Dispatched',
        description: 'Check your email inbox for recovery instructions.',
        type: 'success',
      });
    } catch (err: any) {
      toast({
        title: 'Request Failed',
        description: err?.message || 'Unable to process password reset request.',
        type: 'error',
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="space-y-6 text-center">
        <div className="mx-auto w-12 h-12 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500">
          <CheckCircle2 className="h-6 w-6" />
        </div>

        <div className="space-y-2">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">Check your email</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            We have sent password reset instructions to{' '}
            <span className="font-semibold text-slate-800 dark:text-slate-200">{email}</span>.
          </p>
        </div>

        <div className="pt-2">
          <Link
            href={ROUTES.AUTH.LOGIN}
            className="inline-flex items-center gap-2 text-xs font-semibold text-[#635BFF] dark:text-[#A5AEFD] hover:underline"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Back to Sign In
          </Link>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <p className="text-xs text-slate-500 dark:text-slate-400">
        Enter the email address associated with your Nirmaanify account and we will send you a secure link to reset your password.
      </p>

      <Input
        label="Email Address"
        type="email"
        placeholder="alex@nirmaanify.ai"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        startIcon={<Mail className="h-4 w-4" />}
        required
        disabled={isLoading}
      />

      <Button
        type="submit"
        variant="default"
        size="lg"
        isLoading={isLoading}
        className="w-full font-semibold shadow-lg shadow-[#635BFF]/25"
      >
        Send Reset Link
      </Button>

      <div className="pt-2 text-center">
        <Link
          href={ROUTES.AUTH.LOGIN}
          className="inline-flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Back to Sign In
        </Link>
      </div>
    </form>
  );
};
