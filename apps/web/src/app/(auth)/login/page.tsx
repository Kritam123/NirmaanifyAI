'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { NirmaanLogo } from '@nirmaanify/icons';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, Button, Input, useToast } from '@nirmaanify/ui';
import { ArrowRight, Lock, Mail, Sparkles } from 'lucide-react';
import { useAuth } from '../../../context/auth-context';
import { ROUTES } from '../../../config/routes.config';

export default function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { login, isLoading } = useAuth();

  const [email, setEmail] = useState('alex@nirmaanify.ai');
  const [password, setPassword] = useState('password123');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast({ title: 'Validation Error', description: 'Please enter your email and password.', type: 'error' });
      return;
    }

    try {
      await login(email, password);
      toast({ title: 'Welcome Back! 👋', description: 'Successfully authenticated to Nirmaanify AI.', type: 'success' });
      router.push(ROUTES.DASHBOARD.OVERVIEW);
    } catch (err: any) {
      toast({ title: 'Authentication Failed', description: err.message || 'Invalid email or password.', type: 'error' });
    }
  };

  return (
    <div className="sm:mx-auto sm:w-full sm:max-w-md px-4">
      <div className="flex flex-col items-center justify-center text-center mb-8">
        <Link href="/" className="inline-flex items-center gap-2">
          <NirmaanLogo className="h-9 w-auto text-white" />
        </Link>
        <p className="text-xs text-slate-400 mt-2">Sign in to your autonomous platform workspace</p>
      </div>

      <Card className="bg-[#161926] border-[#24293D] shadow-2xl">
        <CardHeader className="space-y-1">
          <CardTitle className="text-xl font-bold text-white text-center">Sign In</CardTitle>
          <CardDescription className="text-center text-xs text-slate-400">
            Enter your credentials or click a demo account below
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Email Address</label>
              <div className="relative">
                <Mail className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="alex@nirmaanify.ai"
                  className="pl-9 bg-[#0A0D14] border-[#24293D] text-white focus:border-[#635BFF]"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-300">Password</label>
                <a href="#forgot" className="text-[11px] text-[#635BFF] hover:underline">
                  Forgot?
                </a>
              </div>
              <div className="relative">
                <Lock className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="pl-9 bg-[#0A0D14] border-[#24293D] text-white focus:border-[#635BFF]"
                  required
                />
              </div>
            </div>

            <Button
              type="submit"
              variant="default"
              size="md"
              className="w-full font-bold bg-[#635BFF] hover:bg-[#5348E2] text-white shadow-lg shadow-[#635BFF]/20"
              isLoading={isLoading}
              rightIcon={<ArrowRight className="h-4 w-4" />}
            >
              Sign In
            </Button>
          </form>

          {/* Demo Quick Logins */}
          <div className="mt-6 pt-6 border-t border-[#24293D] space-y-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block text-center">
              Quick Demo Login
            </span>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => {
                  setEmail('alex@nirmaanify.ai');
                  setPassword('password123');
                }}
                className="text-left p-2 rounded-lg bg-[#0A0D14] hover:bg-[#24293D] border border-[#24293D] transition-colors"
              >
                <div className="text-xs font-bold text-white flex items-center gap-1">
                  <Sparkles className="h-3 w-3 text-[#635BFF]" /> Alex (Owner)
                </div>
                <div className="text-[10px] text-slate-400 truncate">alex@nirmaanify.ai</div>
              </button>
              <button
                type="button"
                onClick={() => {
                  setEmail('sarah@acme.com');
                  setPassword('password123');
                }}
                className="text-left p-2 rounded-lg bg-[#0A0D14] hover:bg-[#24293D] border border-[#24293D] transition-colors"
              >
                <div className="text-xs font-bold text-white flex items-center gap-1">
                  <Sparkles className="h-3 w-3 text-[#22D3EE]" /> Sarah (Dev)
                </div>
                <div className="text-[10px] text-slate-400 truncate">sarah@acme.com</div>
              </button>
            </div>
          </div>

          <div className="mt-6 text-center text-xs text-slate-400">
            Don&apos;t have an account?{' '}
            <Link href={ROUTES.AUTH.REGISTER} className="text-[#635BFF] font-semibold hover:underline">
              Create one now
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
