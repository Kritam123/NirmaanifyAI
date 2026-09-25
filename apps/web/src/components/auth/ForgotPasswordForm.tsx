'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button, Input, useToast } from '@nirmaanify/ui';
import { Mail, ArrowLeft, CheckCircle2, RefreshCw } from 'lucide-react';
import { useAuth } from '../../context/auth-context';
import { ROUTES } from '../../lib/routes';

export const ForgotPasswordForm: React.FC = () => {
  const router = useRouter();
  const { toast } = useToast();
  const { forgotPassword, resendPasswordReset } = useAuth();

  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  // Countdown timer for resend button
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(() => {
      setResendCooldown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setIsLoading(true);
    try {
      const res = await forgotPassword(email);
      setIsSubmitted(true);
      setResendCooldown(60);
      toast({
        title: 'Reset Link Dispatched',
        description: res?.message || 'Check your email inbox for recovery instructions.',
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

  const handleResend = async () => {
    if (!email || resendCooldown > 0 || isResending) return;

    setIsResending(true);
    try {
      const res = await resendPasswordReset(email);
      setResendCooldown(60);
      toast({
        title: 'Reset Link Resent',
        description: res?.message || `A fresh reset link has been dispatched to ${email}.`,
        type: 'success',
      });
    } catch (err: any) {
      toast({
        title: 'Resend Failed',
        description: err?.message || 'Failed to resend password reset email.',
        type: 'error',
      });
    } finally {
      setIsResending(false);
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

        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
            <span>Didn't receive the email?</span>
            <button
              type="button"
              onClick={handleResend}
              disabled={isResending || resendCooldown > 0}
              className="font-semibold text-[#635BFF] dark:text-[#A5AEFD] hover:underline disabled:opacity-50 disabled:no-underline inline-flex items-center gap-1 cursor-pointer"
            >
              <RefreshCw className={`h-3 w-3 ${isResending ? 'animate-spin' : ''}`} />
              {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend Reset Link'}
            </button>
          </div>

          <div className="pt-2 text-xs">
            <button
              type="button"
              onClick={() => setIsSubmitted(false)}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors cursor-pointer"
            >
              Try another email address
            </button>
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
