'use client';

import React, { useState, useEffect } from 'react';
import {
  Button,
  Input,
  Badge,
  useToast,
} from '@nirmaanify/ui';
import {
  Sparkles,
  Building2,
  Check,
  Zap,
  PartyPopper,
  CheckCircle2,
  Boxes,
  X,
  User,
  Users,
} from 'lucide-react';
import { useAuth } from '../../context/auth-context';
import { useWorkspaceModal } from '../../context/workspace-modal-context';
import { BirthdayCrackerAnimation } from '../effects/BirthdayCrackerAnimation';

export const CreateWorkspaceModal: React.FC = () => {
  const { createWorkspace, user } = useAuth();
  const {
    isOpen,
    isFirstTime,
    closeCreateWorkspaceModal,
    handleSuccessCallback,
  } = useWorkspaceModal();
  const { toast } = useToast();

  const sanitizeSlug = (val: string) =>
    val
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');

  const defaultName = user?.name ? `${user.name.split(' ')[0]}'s Studio` : 'My Studio';
  const [name, setName] = useState(defaultName);
  const [slug, setSlug] = useState(sanitizeSlug(defaultName));
  const [type, setType] = useState<'personal' | 'team'>('personal');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [createdWsName, setCreatedWsName] = useState('');
  const [showBirthdayCrackers, setShowBirthdayCrackers] = useState(false);

  // Reset form when opened
  useEffect(() => {
    if (isOpen) {
      const initName = user?.name ? `${user.name.split(' ')[0]}'s Studio` : 'My Studio';
      setName(initName);
      setSlug(sanitizeSlug(initName));
      setType('personal');
      setIsSuccess(false);
      setShowBirthdayCrackers(false);
    }
  }, [isOpen, user?.name]);

  if (!isOpen && !showBirthdayCrackers) return null;

  const handleNameChange = (val: string) => {
    setName(val);
    setSlug(sanitizeSlug(val));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsLoading(true);
    try {
      const isPersonal = type === 'personal';
      const created = await createWorkspace(name.trim(), slug.trim(), isPersonal);
      setCreatedWsName(created.name);
      setIsSuccess(true);
      
      // ONLY trigger cracker animation for brand-new users creating their first workspace
      if (isFirstTime) {
        setShowBirthdayCrackers(true);
      }
      
      handleSuccessCallback(created);

      toast({
        title: '🎉 Workspace Created & Activated!',
        description: `"${created.name}" is now ready (${isPersonal ? 'Personal Studio' : 'Team Workspace'}).`,
        type: 'success',
      });
    } catch (err: any) {
      toast({
        title: 'Creation Failed',
        description: err?.message || 'Could not create workspace. Please try again.',
        type: 'error',
      });
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (isFirstTime && !isSuccess) return; // Prevent dismissing if user has 0 workspaces
    setShowBirthdayCrackers(false);
    setIsSuccess(false);
    closeCreateWorkspaceModal();
  };

  return (
    <>
      {/* Birthday Cracker Animation - ONLY for first-time workspace onboarding */}
      {isFirstTime && showBirthdayCrackers && (
        <BirthdayCrackerAnimation
          durationMs={3000}
          onComplete={() => setShowBirthdayCrackers(false)}
        />
      )}

      {/* Centralized Workspace Creation Modal Backdrop */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-300">
        <div className="relative w-full max-w-xl overflow-hidden rounded-3xl bg-white dark:bg-[#0F111A] border border-slate-200 dark:border-[#24293D] shadow-2xl shadow-[#635BFF]/10">
          
          {/* Ambient Glow Background Accent */}
          <div className="absolute -top-24 -right-24 w-64 h-64 bg-[#635BFF]/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-[#22D3EE]/20 rounded-full blur-3xl pointer-events-none" />

          {/* Close button (only visible if not initial first-time onboarding) */}
          {!isFirstTime && !isSuccess && (
            <button
              onClick={handleClose}
              disabled={isLoading}
              className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#161926] transition-colors z-10"
              title="Close modal"
            >
              <X className="h-5 w-5" />
            </button>
          )}

          {isSuccess ? (
            /* Celebration Success State */
            <div className="relative p-8 md:p-10 text-center space-y-6 animate-in zoom-in-95 duration-500">
              <div className="mx-auto relative w-20 h-20 rounded-3xl bg-gradient-to-tr from-[#635BFF] via-[#8B5CF6] to-[#22D3EE] p-0.5 shadow-xl shadow-[#635BFF]/30 animate-bounce">
                <div className="w-full h-full rounded-[22px] bg-[#0F111A] flex items-center justify-center text-white">
                  <PartyPopper className="h-10 w-10 text-[#22D3EE] animate-pulse" />
                </div>
              </div>

              <div className="space-y-2">
                <h2 className="text-2xl md:text-3xl font-black tracking-tight text-slate-900 dark:text-white">
                  Welcome to <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#635BFF] to-[#22D3EE]">{createdWsName || name}</span>!
                </h2>
                <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto">
                  Your {type === 'personal' ? 'Personal Studio' : 'Team Workspace'} is ready in PostgreSQL. Start building your projects.
                </p>
              </div>

              <div className="pt-2">
                <Button
                  variant="default"
                  size="lg"
                  className="w-full font-bold shadow-lg shadow-[#635BFF]/25 group  hover:opacity-95"
                  onClick={handleClose}
                  rightIcon={<Zap className="h-4 w-4 group-hover:scale-125 transition-transform" />}
                >
                  Enter Workspace Studio 
                </Button>
              </div>
            </div>
          ) : (
            /* Centralized Workspace Setup Form */
            <div className="relative p-6 md:p-8 space-y-6">
              {/* Header */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Badge variant="indigo" size="md" className="gap-1 font-semibold">
                    {isFirstTime ? 'Onboarding Mode' : 'Workspace Engine'}
                  </Badge>
                </div>
                <h2 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                  {isFirstTime ? 'Create Your First Workspace' : 'Create New Workspace'}
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Organize your projects, invite team members, and configure your cloud database environment.
                </p>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-4">
                  <Input
                    label="Workspace Name"
                    placeholder="e.g. Acme AI Studio"
                    value={name}
                    onChange={(e) => handleNameChange(e.target.value)}
                    startIcon={<Building2 className="h-4 w-4" />}
                    required
                    disabled={isLoading}
                  />

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                      Workspace URL Identifier
                    </label>
                    <div className="flex items-center rounded-xl border border-slate-200 dark:border-[#24293D] bg-slate-50 dark:bg-[#141724] px-3 py-2 text-xs text-slate-400 focus-within:border-[#635BFF] transition-colors">
                      <span className="shrink-0 text-slate-500 font-mono">nirmaanify.ai/</span>
                      <input
                        type="text"
                        value={slug}
                        onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                        className="bg-transparent font-semibold text-slate-900 dark:text-white focus:outline-none w-full ml-0.5"
                        placeholder="my-workspace"
                        disabled={isLoading}
                      />
                    </div>
                  </div>

                  {/* Workspace Type / Mode Selector */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                      Workspace Mode
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => setType('personal')}
                        className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                          type === 'personal'
                            ? 'border-[#635BFF] bg-[#635BFF]/10 text-slate-900 dark:text-white shadow-sm ring-1 ring-[#635BFF]'
                            : 'border-slate-200 dark:border-[#24293D] hover:border-slate-300 dark:hover:border-slate-700 text-slate-500 dark:text-slate-400'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-1.5">
                            <User className={`h-4 w-4 ${type === 'personal' ? 'text-[#635BFF]' : 'text-slate-400'}`} />
                            <span className="text-xs font-bold">Personal Studio</span>
                          </div>
                          {type === 'personal' && <Check className="h-4 w-4 text-[#635BFF]" />}
                        </div>
                        <p className="text-[11px] text-slate-400">Solo builder & individual projects</p>
                      </button>

                      <button
                        type="button"
                        onClick={() => setType('team')}
                        className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                          type === 'team'
                            ? 'border-[#635BFF] bg-[#635BFF]/10 text-slate-900 dark:text-white shadow-sm ring-1 ring-[#635BFF]'
                            : 'border-slate-200 dark:border-[#24293D] hover:border-slate-300 dark:hover:border-slate-700 text-slate-500 dark:text-slate-400'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-1.5">
                            <Users className={`h-4 w-4 ${type === 'team' ? 'text-[#635BFF]' : 'text-slate-400'}`} />
                            <span className="text-xs font-bold">Team & Org</span>
                          </div>
                          {type === 'team' && <Check className="h-4 w-4 text-[#635BFF]" />}
                        </div>
                        <p className="text-[11px] text-slate-400">Collaborative team with RBAC roles</p>
                      </button>
                    </div>
                  </div>
                </div>

                <div className="pt-2 flex items-center gap-3">
                  {!isFirstTime && (
                    <Button
                      type="button"
                      variant="outline"
                      size="lg"
                      onClick={handleClose}
                      disabled={isLoading}
                      className="w-1/3"
                    >
                      Cancel
                    </Button>
                  )}
                  <Button
                    type="submit"
                    variant="default"
                    size="lg"
                    isLoading={isLoading}
                    className={`font-bold shadow-lg shadow-[#635BFF]/25 bg-gradient-to-r from-[#635BFF] to-[#8B5CF6] hover:opacity-95 ${
                      isFirstTime ? 'w-full' : 'flex-1'
                    }`}
                    leftIcon={<Boxes className="h-4 w-4" />}
                  >
                    Create Workspace & Launch
                  </Button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </>
  );
};
