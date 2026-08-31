'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button, Input, useToast } from '@nirmaanify/ui';
import { CheckCircle2, ShieldCheck, ArrowRight, KeyRound, Loader2 } from 'lucide-react';
import { useAuth } from '../../context/auth-context';
import { ROUTES } from '../../lib/routes';

export const VerifyEmailForm: React.FC = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const { verifyEmail } = useAuth();

  const [token, setToken] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleVerify = async (tokenToUse: string) => {
    if (!tokenToUse) return;
    setIsVerifying(true);
    setErrorMessage(null);

    try {
      await verifyEmail(tokenToUse);
      setIsVerified(true);
      toast({
        title: 'Email Verified',
        description: 'Your account is now fully verified with unrestricted access.',
        type: 'success',
      });
    } catch (err: any) {
      setErrorMessage(err?.message || 'Verification token is expired or invalid.');
    } finally {
      setIsVerifying(false);
    }
  };

  useEffect(() => {
    const urlToken = searchParams.get('token');
    if (urlToken) {
      setToken(urlToken);
      handleVerify(urlToken);
    }
  }, [searchParams]);

  if (isVerified) {
    return (
      <div className="space-y-6 text-center">
        <div className="mx-auto w-14 h-14 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500">
          <ShieldCheck className="h-8 w-8" />
        </div>

        <div className="space-y-2">
          <h3 className="text-xl font-bold text-slate-900 dark:text-white">Email Verified Successfully!</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Thank you for verifying your address. Your developer permissions and API keys are now live.
          </p>
        </div>

        <Button
          variant="default"
          size="lg"
          className="w-full font-semibold"
          rightIcon={<ArrowRight className="h-4 w-4" />}
          onClick={() => router.push(ROUTES.DASHBOARD.OVERVIEW)}
        >
          Launch Workspace
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="text-center space-y-1.5">
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Please enter the confirmation token sent to your registered email address.
        </p>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleVerify(token);
        }}
        className="space-y-4"
      >
        <Input
          label="Verification Code or Token"
          placeholder="e.g. verify-token-uuid"
          value={token}
          onChange={(e) => setToken(e.target.value)}
          startIcon={<KeyRound className="h-4 w-4" />}
          required
          disabled={isVerifying}
          error={errorMessage || undefined}
        />

        <Button
          type="submit"
          variant="default"
          size="lg"
          isLoading={isVerifying}
          className="w-full font-semibold"
        >
          Verify Account
        </Button>
      </form>

      <div className="pt-2 text-center text-xs text-slate-400">
        Already verified?{' '}
        <Link href={ROUTES.AUTH.LOGIN} className="font-bold text-[#635BFF] hover:underline">
          Sign In
        </Link>
      </div>
    </div>
  );
};
