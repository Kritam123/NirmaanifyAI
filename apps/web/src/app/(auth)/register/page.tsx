'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { NirmaanLogo } from '@nirmaanify/icons';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, Button, Input, useToast } from '@nirmaanify/ui';
import { ArrowRight, Lock, Mail, User, Sparkles } from 'lucide-react';
import { useAuth } from '../../../context/auth-context';
import { ROUTES } from '../../../config/routes.config';

export default function RegisterPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { register, isLoading } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password) {
      toast({ title: 'Validation Error', description: 'Please fill in all required fields.', type: 'error' });
      return;
    }

    try {
      await register(name, email, password);
      toast({ title: 'Account Created! 🎉', description: 'Welcome to Nirmaanify AI.', type: 'success' });
      router.push(ROUTES.DASHBOARD.OVERVIEW);
    } catch (err: any) {
      toast({ title: 'Registration Failed', description: err.message || 'Could not create account.', type: 'error' });
    }
  };

  return (
    <div className="sm:mx-auto sm:w-full sm:max-w-md px-4">
      <div className="flex flex-col items-center justify-center text-center mb-8">
        <Link href="/" className="inline-flex items-center gap-2">
          <NirmaanLogo className="h-9 w-auto text-white" />
        </Link>
        <p className="text-xs text-slate-400 mt-2">Start building full-stack apps autonomously</p>
      </div>

      <Card className="bg-[#161926] border-[#24293D] shadow-2xl">
        <CardHeader className="space-y-1">
          <CardTitle className="text-xl font-bold text-white text-center">Create Workspace Account</CardTitle>
          <CardDescription className="text-center text-xs text-slate-400">
            Sign up for free and generate your first AI website
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Full Name</label>
              <div className="relative">
                <User className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
                <Input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Alex Developer"
                  className="pl-9 bg-[#0A0D14] border-[#24293D] text-white focus:border-[#635BFF]"
                  required
                />
              </div>
            </div>

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
              <label className="text-xs font-semibold text-slate-300">Password</label>
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
              Create Account
            </Button>
          </form>

          <div className="mt-6 text-center text-xs text-slate-400">
            Already have an account?{' '}
            <Link href={ROUTES.AUTH.LOGIN} className="text-[#635BFF] font-semibold hover:underline">
              Sign in
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
