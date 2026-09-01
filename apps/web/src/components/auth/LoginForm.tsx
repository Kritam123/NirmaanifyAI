'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button, Input, Checkbox, useToast } from '@nirmaanify/ui';
import { Mail, Lock, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/auth-context';
import { SocialAuthButtons } from './SocialAuthButtons';
import { ROUTES } from '../../lib/routes';

export const LoginForm: React.FC = () => {
  const router = useRouter();
  const { toast } = useToast();
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMessage('Please provide both email and password.');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      await login(email, password);
      toast({
        title: 'Welcome Back!',
        description: 'Successfully authenticated. Loading workspace...',
        type: 'success',
      });
      router.push(ROUTES.DASHBOARD.OVERVIEW);
    } catch (err: any) {
      setErrorMessage(err?.message || 'Invalid credentials. Please try again.');
      toast({
        title: 'Authentication Failed',
        description: err?.message || 'Please check your email and password.',
        type: 'error',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {errorMessage && (
        <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs flex items-center gap-2.5 animate-in fade-in">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Email Input */}
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

      {/* Password Input */}
      <div className="space-y-1.5">
        <div className="relative">
          <Input
            label="Password"
            type={showPassword ? 'text' : 'password'}
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
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
        </div>
      </div>

      {/* Remember Me & Forgot Password */}
      <div className="flex items-center justify-between text-xs">
        <Checkbox
          label="Remember me for 30 days"
          checked={rememberMe}
          onChange={(e) => setRememberMe(e.target.checked)}
        />
        <Link
          href={ROUTES.AUTH.FORGOT_PASSWORD}
          className="text-[#635BFF] dark:text-[#A5AEFD] hover:underline font-medium"
        >
          Forgot password?
        </Link>
      </div>

      {/* Submit Button */}
      <Button
        type="submit"
        variant="default"
        size="lg"
        isLoading={isLoading}
        className="w-full font-semibold shadow-lg shadow-[#635BFF]/25"
      >
        Sign In to Workspace
      </Button>

      {/* Divider */}
      <div className="relative flex items-center justify-center pt-2">
        <div className="border-t border-slate-200 dark:border-[#24293D] w-full" />
        <span className="bg-white dark:bg-[#121521] px-3 text-[11px] font-medium text-slate-400 uppercase tracking-wider shrink-0">
          Or continue with
        </span>
        <div className="border-t border-slate-200 dark:border-[#24293D] w-full" />
      </div>

      {/* Social Auth */}
      <SocialAuthButtons isLoading={isLoading} />

      {/* Register Link */}
      <div className="pt-2 text-center text-xs text-slate-500 dark:text-slate-400">
        Don't have an account?{' '}
        <Link
          href={ROUTES.AUTH.REGISTER}
          className="font-bold text-[#635BFF] dark:text-[#A5AEFD] hover:underline"
        >
          Create account
        </Link>
      </div>
    </form>
  );
};
