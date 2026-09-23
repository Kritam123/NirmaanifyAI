'use client';

import React from 'react';
import Link from 'next/link';
import { NirmaanLogo, NirmaanIcon } from '@nirmaanify/icons';
import { Badge, IconButton, useTheme } from '@nirmaanify/ui';
import { Sparkles, Sun, Moon, ShieldCheck, Zap, Code2, Layers } from 'lucide-react';

interface AuthLayoutWrapperProps {
  children: React.ReactNode;
  title: string;
  subtitle: string;
  badgeText?: string;
}

export const AuthLayoutWrapper: React.FC<AuthLayoutWrapperProps> = ({
  children,
  title,
  subtitle,
  badgeText = 'Architecture Studio v2.0',
}) => {
  const { theme, setTheme } = useTheme();

  return (
    <div className="min-h-screen w-full flex bg-[#F8FAFC] dark:bg-[#090A0F] text-slate-900 dark:text-slate-100 relative overflow-hidden transition-colors duration-200">
      {/* Background Decorative Gradients */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-gradient-to-br from-[#635BFF]/15 to-violet-500/10 blur-3xl pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] rounded-full bg-gradient-to-tl from-[#22D3EE]/10 to-indigo-600/10 blur-3xl pointer-events-none" />

      {/* Theme Toggle Top Right */}
      <div className="absolute top-6 right-6 z-20 flex items-center gap-3">
        <IconButton
          icon={theme === 'dark' ? <Sun className="h-4 w-4 text-amber-400" /> : <Moon className="h-4 w-4 text-slate-600" />}
          variant="ghost"
          aria-label="Toggle theme"
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          className="border border-slate-200 dark:border-[#24293D] bg-white/70 dark:bg-[#161926]/70 backdrop-blur-md"
        />
      </div>

      {/* Left Column: Product Showcase (Desktop Only) */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12 relative border-r border-slate-200 dark:border-[#1E2337] bg-gradient-to-b from-slate-50/50 to-slate-100/50 dark:from-[#0B0D14]/80 dark:to-[#0F111A]/80 backdrop-blur-md">
        {/* Top Branding */}
        <div>
          <Link href="/" className="inline-block transition-transform hover:scale-[1.02]">
            <NirmaanLogo size="md" showTagline />
          </Link>
          <div className="mt-8 flex items-center gap-2">
            <Badge variant="indigo" size="sm" className="gap-1.5 px-3 py-1">
              <Sparkles className="h-3 w-3 animate-pulse" />
              <span>{badgeText}</span>
            </Badge>
          </div>
        </div>

        {/* Center Graphic Showcase */}
        <div className="space-y-6 max-w-lg my-auto py-8">
          <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-[1.15]">
            Design, Spec & Visualize Complex Systems in Seconds.
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
            Nirmaanify combines Draw.io visual canvas flexibility and Eraser.io markdown architecture specs with AI-driven diagram scaffolding and cloud topology stencils.
          </p>

          {/* Feature Badges */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            {[
              { icon: <Zap className="h-4 w-4 text-[#635BFF]" />, label: 'Infinite Vector Canvas' },
              { icon: <ShieldCheck className="h-4 w-4 text-emerald-500" />, label: 'AWS, GCP & K8s Stencils' },
              { icon: <Code2 className="h-4 w-4 text-[#22D3EE]" />, label: 'UML Class & Sequences' },
              { icon: <Layers className="h-4 w-4 text-violet-500" />, label: 'Eraser Markdown Specs' },
            ].map((f) => (
              <div
                key={f.label}
                className="flex items-center gap-2.5 p-3 rounded-xl border border-slate-200/80 dark:border-[#24293D] bg-white/60 dark:bg-[#161926]/60 backdrop-blur-sm"
              >
                <div className="p-1.5 rounded-lg bg-slate-100 dark:bg-[#1E2337]">{f.icon}</div>
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">{f.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Testimonial Banner */}
        <div className="p-4 rounded-2xl border border-slate-200 dark:border-[#24293D] bg-white/80 dark:bg-[#161926]/80 backdrop-blur-sm space-y-2">
          <div className="flex items-center gap-2">
            <div className="flex -space-x-1.5">
              {['https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=60&auto=format&fit=crop&q=80',
                'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=60&auto=format&fit=crop&q=80',
                'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=60&auto=format&fit=crop&q=80'].map((src, i) => (
                <img key={i} src={src} alt="User" className="h-6 w-6 rounded-full ring-2 ring-white dark:ring-[#161926] object-cover" />
              ))}
            </div>
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
              Trusted by 10,000+ software architects and engineering teams
            </span>
          </div>
        </div>
      </div>

      {/* Right Column: Interactive Auth Container */}
      <div className="flex-1 flex flex-col justify-center items-center p-6 sm:p-12 relative z-10">
        <div className="w-full max-w-md space-y-6">
          {/* Mobile Logo */}
          <div className="lg:hidden flex flex-col items-center text-center mb-6">
            <Link href="/" className="mb-2">
              <NirmaanIcon size={44} variant="gradient" />
            </Link>
            <span className="text-xl font-bold font-poppins">Nirmaanify AI</span>
          </div>

          {/* Form Header */}
          <div className="space-y-1.5 text-center sm:text-left">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              {title}
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">{subtitle}</p>
          </div>

          {/* Rendered Children (Form) */}
          <div className="p-6 sm:p-8 rounded-2xl border border-slate-200 dark:border-[#24293D] bg-white/90 dark:bg-[#121521]/90 backdrop-blur-xl shadow-xl shadow-slate-900/5 dark:shadow-black/40">
            {children}
          </div>

          {/* Footer Terms */}
          <div className="text-center text-xs text-slate-400">
            Protected by workspace RBAC & vector blueprint encryption. &copy; {new Date().getFullYear()} Nirmaanify AI Inc.
          </div>
        </div>
      </div>
    </div>
  );
};
