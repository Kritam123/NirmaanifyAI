'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button, Input, Checkbox, useToast } from '@nirmaanify/ui';
import { User, Mail, Lock, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/auth-context';
import { SocialAuthButtons } from './SocialAuthButtons';
import { ROUTES } from '../../lib/routes';

export const RegisterForm: React.FC = () => {
  const router = useRouter();
  const { toast } = useToast();
  const { register } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Calculate password strength
  const getPasswordStrength = () => {
    if (!password) return 0;
    let score = 0;
    if (password.length >= 6) score += 1;
    if (password.length >= 10) score += 1;
    if (/[A-Z]/.test(password)) score += 1;
    if (/[0-9]/.test(password) || /[^A-Za-z0-9]/.test(password)) score += 1;
    return score;
  };

  const strength = getPasswordStrength();
  const strengthLabels = ['Too weak', 'Fair', 'Good', 'Strong'];
  const strengthColors = ['bg-rose-500', 'bg-amber-500', 'bg-blue-500', 'bg-emerald-500'];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password) {
      setErrorMessage('Please fill in all required fields.');
      return;
    }
    if (password.length < 6) {
      setErrorMessage('Password must be at least 6 characters long.');
      return;
    }
    if (!agreed) {
      setErrorMessage('Please accept the Terms of Service & Privacy Policy.');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      await register(name, email, password);
      toast({
        title: 'Account Created! Verify Your Email',
        description: `We've sent a 6-digit verification code and confirmation link to ${email}.`,
        type: 'success',
      });
      router.push(`/verify-email?email=${encodeURIComponent(email)}`);
    } catch (err: any) {
      setErrorMessage(err?.message || 'Registration failed. Try again.');
      toast({
        title: 'Registration Error',
        description: err?.message || 'Failed to create account.',
        type: 'error',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {errorMessage && (
        <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs flex items-center gap-2.5 animate-in fade-in">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Full Name Input */}
      <Input
        label="Full Name"
        type="text"
        placeholder="Alex Developer"
        value={name}
        onChange={(e) => setName(e.target.value)}
        startIcon={<User className="h-4 w-4" />}
        required
        disabled={isLoading}
      />

      {/* Email Input */}
      <Input
        label="Work Email"
        type="email"
        placeholder="alex@company.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        startIcon={<Mail className="h-4 w-4" />}
        required
        disabled={isLoading}
      />

      {/* Password Input */}
      <div className="space-y-1.5">
        <Input
          label="Password (min. 6 characters)"
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

        {/* Password Strength Indicator */}
        {password.length > 0 && (
          <div className="space-y-1 pt-1">
            <div className="flex gap-1 h-1.5 w-full">
              {[0, 1, 2, 3].map((index) => (
                <div
                  key={index}
                  className={`h-full flex-1 rounded-full transition-all ${
                    index < strength ? strengthColors[strength - 1] : 'bg-slate-200 dark:bg-[#24293D]'
                  }`}
                />
              ))}
            </div>
            <div className="flex justify-between text-[10px] text-slate-400">
              <span>Security score</span>
              <span className="font-semibold">{strengthLabels[strength - 1] || 'Weak'}</span>
            </div>
          </div>
        )}
      </div>

      {/* Terms Agreement */}
      <div className="pt-1">
        <Checkbox
          checked={agreed}
          onChange={(e) => setAgreed(e.target.checked)}
          label={
            <span className="text-xs text-slate-600 dark:text-slate-300">
              I agree to the{' '}
              <a href="#" className="text-[#635BFF] dark:text-[#A5AEFD] underline">
                Terms of Service
              </a>{' '}
              and{' '}
              <a href="#" className="text-[#635BFF] dark:text-[#A5AEFD] underline">
                Privacy Policy
              </a>
            </span>
          }
        />
      </div>

      {/* Submit Button */}
      <Button
        type="submit"
        variant="default"
        size="lg"
        isLoading={isLoading}
        className="w-full font-semibold shadow-lg shadow-[#635BFF]/25"
      >
        Create Developer Account
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

      {/* Sign In Link */}
      <div className="pt-2 text-center text-xs text-slate-500 dark:text-slate-400">
        Already have an account?{' '}
        <Link
          href={ROUTES.AUTH.LOGIN}
          className="font-bold text-[#635BFF] dark:text-[#A5AEFD] hover:underline"
        >
          Sign in
        </Link>
      </div>
    </form>
  );
};
