'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button, Input, Badge, useToast } from '@nirmaanify/ui';
import {
  ShieldCheck,
  ArrowRight,
  KeyRound,
  Mail,
  RefreshCw,
  AlertCircle,
} from 'lucide-react';
import { useAuth } from '../../context/auth-context';
import { ROUTES } from '../../lib/routes';

export const VerifyEmailForm: React.FC = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const { verifyEmail, resendVerification } = useAuth();

  const emailParam = searchParams.get('email') || '';
  const tokenParam = searchParams.get('token') || '';

  const [codeOrToken, setCodeOrToken] = useState(tokenParam);
  const [email, setEmail] = useState(emailParam);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [resendCooldown, setResendCooldown] = useState(0);

  // Countdown timer for resend button
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(() => {
      setResendCooldown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

  const executeVerification = async (valueToVerify: string) => {
    if (!valueToVerify.trim()) {
      setErrorMessage('Please enter the 6-digit code or confirmation token.');
      return;
    }

    setIsVerifying(true);
    setErrorMessage(null);

    try {
      const isOtp = /^\d{6}$/.test(valueToVerify.trim());
      const payload = isOtp
        ? { otp: valueToVerify.trim(), email: email.trim() || undefined }
        : { token: valueToVerify.trim() };

      const res = await verifyEmail(payload);
      setIsVerified(true);
      toast({
        title: 'Email Verified Successfully',
        description: res.message || 'Your account is active and verified.',
        type: 'success',
      });

      const targetDestination = searchParams.get('redirect') || ROUTES.DASHBOARD.OVERVIEW;
      setTimeout(() => {
        router.replace(targetDestination);
      }, 800);
    } catch (err: any) {
      setErrorMessage(err?.message || 'Verification code is invalid or has expired.');
      toast({
        title: 'Verification Failed',
        description: err?.message || 'Invalid or expired code.',
        type: 'error',
      });
    } finally {
      setIsVerifying(false);
    }
  };

  // Auto-verify if opened via direct link /verify-email?token=...
  useEffect(() => {
    if (tokenParam) {
      setCodeOrToken(tokenParam);
      executeVerification(tokenParam);
    }
  }, [tokenParam]);

  const handleResend = async () => {
    if (!email) {
      setErrorMessage('Please enter your registered email address to resend code.');
      return;
    }
    if (resendCooldown > 0) return;

    setIsResending(true);
    setErrorMessage(null);

    try {
      const res = await resendVerification(email);
      setResendCooldown(60);
      toast({
        title: 'Verification Code Sent',
        description: res.message || `A new 6-digit code has been sent to ${email}.`,
        type: 'success',
      });
    } catch (err: any) {
      setErrorMessage(err?.message || 'Failed to resend verification email.');
      toast({
        title: 'Resend Failed',
        description: err?.message || 'Could not send verification email.',
        type: 'error',
      });
    } finally {
      setIsResending(false);
    }
  };

  if (isVerified) {
    const targetDestination = searchParams.get('redirect') || ROUTES.DASHBOARD.OVERVIEW;

    return (
      <div className="space-y-6 text-center animate-in fade-in duration-200">
        <div className="mx-auto w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500">
          <ShieldCheck className="h-7 w-7" />
        </div>

        <div className="space-y-1.5">
          <h3 className="text-xl font-bold text-slate-900 dark:text-white">
            Email Verified Successfully
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs mx-auto leading-relaxed">
            Your email address has been confirmed. Redirecting to your workspace...
          </p>
        </div>

        <Button
          variant="default"
          size="lg"
          className="w-full font-semibold"
          rightIcon={<ArrowRight className="h-4 w-4" />}
          onClick={() => router.replace(targetDestination)}
        >
          Continue to Workspace
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Target Email Info Card */}
      {email && (
        <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#161926] border border-slate-200 dark:border-[#24293D] flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5 min-w-0">
            <Mail className="h-4 w-4 text-[#635BFF] shrink-0" />
            <div className="min-w-0">
              <span className="text-slate-400 dark:text-slate-500 block text-[10px] font-medium">Verification sent to</span>
              <span className="font-semibold text-slate-900 dark:text-white truncate block">{email}</span>
            </div>
          </div>
          <Badge variant="indigo" size="sm">
            Pending
          </Badge>
        </div>
      )}

      {errorMessage && (
        <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs flex items-center gap-2.5">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      <form
        onSubmit={(e) => {
          e.preventDefault();
          executeVerification(codeOrToken);
        }}
        className="space-y-4"
      >
        {/* If no email in query param, prompt for email */}
        {!emailParam && (
          <Input
            label="Registered Email Address"
            type="email"
            placeholder="name@company.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            startIcon={<Mail className="h-4 w-4" />}
            required
            disabled={isVerifying}
          />
        )}

        {/* 6-Digit Code / Token Input */}
        <div className="space-y-1.5">
          <Input
            label="Verification Code"
            placeholder="Enter 6-digit code or link token"
            value={codeOrToken}
            onChange={(e) => setCodeOrToken(e.target.value)}
            startIcon={<KeyRound className="h-4 w-4" />}
            required
            disabled={isVerifying}
          />
          <p className="text-[11px] text-slate-400 dark:text-slate-500">
            Check your spam folder if the email does not appear in your inbox within a few seconds.
          </p>
        </div>

        <Button
          type="submit"
          variant="default"
          size="lg"
          isLoading={isVerifying}
          className="w-full font-semibold"
        >
          Confirm & Verify Email
        </Button>
      </form>

      {/* Resend Action & Back Link */}
      <div className="space-y-3 pt-1 text-center">
        <div className="flex items-center justify-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
          <span>Didn't receive the email?</span>
          <button
            type="button"
            onClick={handleResend}
            disabled={isResending || resendCooldown > 0}
            className="font-semibold text-[#635BFF] dark:text-[#A5AEFD] hover:underline disabled:opacity-50 disabled:no-underline inline-flex items-center gap-1 cursor-pointer"
          >
            <RefreshCw className={`h-3 w-3 ${isResending ? 'animate-spin' : ''}`} />
            {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend Code'}
          </button>
        </div>

        <div className="pt-2 text-xs text-slate-400 dark:text-slate-500 border-t border-slate-100 dark:border-[#1E2337]">
          Already verified?{' '}
          <Link href={ROUTES.AUTH.LOGIN} className="font-semibold text-[#635BFF] dark:text-[#A5AEFD] hover:underline">
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
};
