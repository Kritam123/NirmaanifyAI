'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Card,
  Button,
  Badge,
  IconButton,
  useToast,
  useTheme,
} from '@nirmaanify/ui';
import { NirmaanLogo } from '@nirmaanify/icons';
import {
  Building2,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  ShieldCheck,
  Clock,
  Sun,
  Moon,
  Zap,
  Activity,
  LogOut,
  UserX,
} from 'lucide-react';
import { useAuth } from '../../context/auth-context';
import { apiClient } from '../../lib/api';
import { ROUTES } from '../../lib/routes';

interface InvitationData {
  id: string;
  email: string;
  role: string;
  status: string;
  expiresAt: string;
  workspace: {
    id: string;
    name: string;
    slug: string;
    isPersonal: boolean;
    ownerName: string;
    ownerEmail: string;
  };
}

function InviteContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get('token');
  const { user, isAuthenticated, logout, refreshData, switchWorkspace } = useAuth();
  const { toast } = useToast();
  const { theme, setTheme } = useTheme();

  const [invitation, setInvitation] = useState<InvitationData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAccepting, setIsAccepting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      setError('Invalid or missing invitation token.');
      setIsLoading(false);
      return;
    }

    const fetchInvitation = async () => {
      try {
        const data = await apiClient.workspaces.getInvitation(token);
        setInvitation(data);
      } catch (err: any) {
        setError(err?.message || 'Invitation not found or may have expired.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchInvitation();
  }, [token]);

  const handleAccept = async () => {
    if (!token) return;

    setIsAccepting(true);
    try {
      const res = await apiClient.workspaces.acceptInvitation(token);
      setInvitation((prev) => (prev ? { ...prev, status: 'ACCEPTED' } : null));
      await refreshData();
      if (res.workspaceId) {
        await switchWorkspace(res.workspaceId);
      }
      toast({
        title: '🎉 Welcome to the Workspace!',
        description: res.message || 'Invitation accepted successfully.',
        type: 'success',
      });
      setTimeout(() => {
        router.push(ROUTES.DASHBOARD.OVERVIEW);
      }, 800);
    } catch (err: any) {
      toast({
        title: 'Could Not Accept Invitation',
        description: err?.message || 'Failed to accept invitation.',
        type: 'error',
      });
    } finally {
      setIsAccepting(false);
    }
  };

  const isDarkMode = theme === 'dark';

  // Loading State
  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#F8FAFC] dark:bg-[#090A0F] text-slate-900 dark:text-slate-100 p-4 transition-colors duration-200">
        <div className="text-center space-y-4">
          <Link href="/" className="inline-block transition-transform hover:scale-[1.02]">
            <NirmaanLogo size="md" showTagline />
          </Link>
          <div className="w-8 h-8 border-2 border-[#635BFF] border-t-transparent rounded-full animate-spin mx-auto mt-4" />
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Verifying invitation credentials...</p>
        </div>
      </div>
    );
  }

  // Invalid Token / Link State
  if (error || !invitation) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#F8FAFC] dark:bg-[#090A0F] text-slate-900 dark:text-slate-100 p-4 relative overflow-hidden transition-colors duration-200">
        <div className="absolute top-6 right-6 z-20">
          <IconButton
            icon={isDarkMode ? <Sun className="h-4 w-4 text-amber-400" /> : <Moon className="h-4 w-4 text-slate-600" />}
            variant="ghost"
            aria-label="Toggle theme"
            onClick={() => setTheme(isDarkMode ? 'light' : 'dark')}
            className="border border-slate-200 dark:border-[#24293D] bg-white/80 dark:bg-[#161926]/80 backdrop-blur-md shadow-sm"
          />
        </div>

        <div className="w-full max-w-md space-y-6 text-center">
          <Link href="/" className="inline-block transition-transform hover:scale-[1.02] mb-2">
            <NirmaanLogo size="md" showTagline />
          </Link>

          <Card className="p-8 text-center space-y-6 border-rose-500/30 bg-white/90 dark:bg-[#0F111A]/90 backdrop-blur-xl shadow-2xl">
            <div className="w-14 h-14 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center mx-auto text-rose-500">
              <AlertTriangle className="h-7 w-7" />
            </div>
            <div className="space-y-1.5">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">Invalid Invitation</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                {error || 'This invitation link is invalid, expired, or has already been used.'}
              </p>
            </div>
            <Link href={ROUTES.AUTH.LOGIN}>
              <Button variant="outline" size="sm" className="w-full">
                Back to Login
              </Button>
            </Link>
          </Card>
        </div>
      </div>
    );
  }

  const isExpired = invitation.status === 'EXPIRED' || new Date(invitation.expiresAt) < new Date();
  const isAccepted = invitation.status === 'ACCEPTED';
  const isEmailMatch =
    Boolean(user?.email) &&
    user?.email.toLowerCase().trim() === invitation.email.toLowerCase().trim();

  // Invalid User State (Logged in as another account)
  if (isAuthenticated && !isEmailMatch) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#F8FAFC] dark:bg-[#090A0F] text-slate-900 dark:text-slate-100 p-4 relative overflow-hidden transition-colors duration-200">
        <div className="absolute top-6 right-6 z-20">
          <IconButton
            icon={isDarkMode ? <Sun className="h-4 w-4 text-amber-400" /> : <Moon className="h-4 w-4 text-slate-600" />}
            variant="ghost"
            aria-label="Toggle theme"
            onClick={() => setTheme(isDarkMode ? 'light' : 'dark')}
            className="border border-slate-200 dark:border-[#24293D] bg-white/80 dark:bg-[#161926]/80 backdrop-blur-md shadow-sm"
          />
        </div>

        <div className="w-full max-w-md space-y-6 text-center">
          <Link href="/" className="inline-block transition-transform hover:scale-[1.02] mb-2">
            <NirmaanLogo size="md" showTagline />
          </Link>

          <Card className="p-8 text-center space-y-6 border-amber-500/30 bg-white/90 dark:bg-[#0F111A]/90 backdrop-blur-xl shadow-2xl">
            <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mx-auto text-amber-500">
              <UserX className="h-7 w-7" />
            </div>
            <div className="space-y-1.5">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">Invalid User</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                You are not authorized to accept this invitation.
              </p>
            </div>
            <Button
              variant="default"
              size="lg"
              className="w-full font-bold bg-amber-500 hover:bg-amber-600 text-white shadow-md"
              onClick={async () => {
                await logout();
                router.push(`/login?redirect=/invite?token=${token}`);
              }}
              leftIcon={<LogOut className="h-4 w-4" />}
            >
              Switch Account
            </Button>
          </Card>
        </div>
      </div>
    );
  }

  // Main Valid Invitation Acceptance State
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#F8FAFC] dark:bg-[#090A0F] text-slate-900 dark:text-slate-100 p-4 relative overflow-hidden transition-colors duration-200">
      {/* Background Decorative Gradients */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-gradient-to-br from-[#635BFF]/15 to-violet-500/10 blur-3xl pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] rounded-full bg-gradient-to-tl from-[#22D3EE]/10 to-indigo-600/10 blur-3xl pointer-events-none" />

      {/* Theme Toggle Top Right */}
      <div className="absolute top-6 right-6 z-20">
        <IconButton
          icon={isDarkMode ? <Sun className="h-4 w-4 text-amber-400" /> : <Moon className="h-4 w-4 text-slate-600" />}
          variant="ghost"
          aria-label="Toggle theme"
          onClick={() => setTheme(isDarkMode ? 'light' : 'dark')}
          className="border border-slate-200 dark:border-[#24293D] bg-white/80 dark:bg-[#161926]/80 backdrop-blur-md shadow-sm hover:scale-105 transition-all"
        />
      </div>

      <div className="w-full max-w-lg space-y-8 relative z-10">
        {/* Platform Brand Logo Header */}
        <div className="text-center space-y-3">
          <Link href="/" className="inline-block transition-transform hover:scale-[1.02]">
            <NirmaanLogo size="md" showTagline />
          </Link>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
            Multi-Tenant Cloud Workspace Invitation
          </p>
        </div>

        {/* Invitation Form Card */}
        <div className="p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-[#24293D] bg-white/90 dark:bg-[#0F111A]/90 backdrop-blur-xl shadow-2xl shadow-slate-900/5 dark:shadow-black/50 space-y-6">
          {/* Header Badge & Title */}
          <div className="space-y-2 text-center pb-4 border-b border-slate-100 dark:border-[#1E2337]">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#635BFF]/10 text-[#635BFF] dark:text-[#A5AEFD] text-xs font-bold border border-[#635BFF]/20 mb-1">
              Workspace Collaboration
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              Join <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#635BFF] to-[#22D3EE]">{invitation.workspace.name}</span>
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Invited by <strong className="text-slate-800 dark:text-slate-200">{invitation.workspace.ownerName}</strong> ({invitation.workspace.ownerEmail})
            </p>
          </div>

          {/* Workspace Details List with LIVE Status Badge */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#161926] border border-slate-200 dark:border-[#24293D] space-y-3 text-xs">
            {/* Target Workspace */}
            <div className="flex items-center justify-between">
              <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1.5 font-medium">
                <Building2 className="h-4 w-4 text-[#635BFF]" /> Target Workspace
              </span>
              <span className="font-bold text-slate-900 dark:text-white">{invitation.workspace.name}</span>
            </div>

            {/* Assigned Role */}
            <div className="flex items-center justify-between">
              <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1.5 font-medium">
                <ShieldCheck className="h-4 w-4 text-emerald-500" /> Assigned Role
              </span>
              <Badge variant="indigo" size="sm">
                {invitation.role}
              </Badge>
            </div>

            {/* Live Invitation Status */}
            <div className="flex items-center justify-between">
              <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1.5 font-medium">
                <Activity className="h-4 w-4 text-[#8B5CF6]" /> Invitation Status
              </span>
              {isAccepted ? (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-[11px] font-bold">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  Accepted & Active
                </span>
              ) : isExpired ? (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 text-[11px] font-bold">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                  Expired
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 text-[11px] font-bold">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                  Pending Acceptance
                </span>
              )}
            </div>

            {/* Expiration Date */}
            <div className="flex items-center justify-between">
              <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1.5 font-medium">
                <Clock className="h-4 w-4 text-amber-500" /> Expiration
              </span>
              <span className="text-slate-700 dark:text-slate-300 font-medium">
                {new Date(invitation.expiresAt).toLocaleDateString()}
              </span>
            </div>
          </div>

          {/* Action Trigger Buttons */}
          {isAccepted ? (
            <div className="text-center space-y-4">
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs flex items-center justify-center gap-2 font-semibold">
                <CheckCircle2 className="h-4 w-4" /> You are an active member of this workspace
              </div>
              <Link href={ROUTES.DASHBOARD.OVERVIEW} className="block">
                <Button variant="default" size="lg" className="w-full font-bold">
                  Go to Dashboard Studio
                </Button>
              </Link>
            </div>
          ) : isExpired ? (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs text-center font-semibold">
              This invitation expired on {new Date(invitation.expiresAt).toLocaleDateString()}.
            </div>
          ) : isAuthenticated && isEmailMatch ? (
            /* Authenticated Valid Recipient: 1-Click Accept */
            <div className="space-y-3">
              <Button
                variant="default"
                size="lg"
                className="w-full font-bold  text-white hover:opacity-95 shadow-lg shadow-[#635BFF]/25 group"
                isLoading={isAccepting}
                onClick={handleAccept}
                rightIcon={<Zap className="h-4 w-4 group-hover:scale-125 transition-transform" />}
              >
                Accept Invitation & Join Studio 
              </Button>
              <p className="text-[11px] text-center text-slate-500 dark:text-slate-400">
                Signed in as <span className="font-semibold text-slate-800 dark:text-slate-200">{user?.email}</span>
              </p>
            </div>
          ) : (
            /* Unauthenticated: Clean Sign In or Register */
            <div className="space-y-3">
              <Link href={`/login?redirect=/invite?token=${token}`} className="block">
                <Button
                  variant="default"
                  size="lg"
                  className="w-full font-bold bg-gradient-to-r from-[#635BFF] to-[#22D3EE] text-white shadow-md shadow-[#635BFF]/20"
                >
                  Sign In to Accept
                </Button>
              </Link>
              <Link href={`/register?email=${encodeURIComponent(invitation.email)}&redirect=/invite?token=${token}`} className="block">
                <Button variant="outline" size="lg" className="w-full text-xs font-semibold">
                  Create Account
                </Button>
              </Link>
            </div>
          )}

          {/* Footer Protected Tag */}
          <div className="text-center text-[11px] text-slate-400 dark:text-slate-500 pt-2 border-t border-slate-100 dark:border-[#1E2337]">
            Protected by enterprise RBAC identity verification &bull; &copy; {new Date().getFullYear()} Nirmaanify AI Inc.
          </div>
        </div>
      </div>
    </div>
  );
}

export default function InvitePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC] dark:bg-[#090A0F] text-slate-900 dark:text-slate-100 p-4">
          <div className="w-10 h-10 border-2 border-[#635BFF] border-t-transparent rounded-full animate-spin mx-auto" />
        </div>
      }
    >
      <InviteContent />
    </Suspense>
  );
}
