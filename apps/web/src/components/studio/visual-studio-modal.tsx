'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import {
  ProjectDto,
  StudioViewMode,
  SandboxProvider,
  ProjectMessageDto,
} from '@nirmaanify/types';
import { StudioTopbar } from './studio-topbar';
import { AgentChatPane } from '../agent/AgentChatPane';
import { SandboxPreviewPane } from '../agent/SandboxPreviewPane';
import { FileExplorerPane } from '../agent/FileExplorerPane';
import { useToast } from '@nirmaanify/ui';
import { apiClient } from '../../lib/api';
import { Monitor, Code2 } from 'lucide-react';

interface VisualStudioModalProps {
  project: ProjectDto | null;
  isOpen: boolean;
  onClose: () => void;
}

export function VisualStudioModal({ project, isOpen, onClose }: VisualStudioModalProps) {
  const { toast } = useToast();

  // Unified Mode Switcher: 'split' | 'agent' | 'code' | 'preview'
  const [viewMode, setViewMode] = useState<StudioViewMode>('split');
  const [sandboxProvider, setSandboxProvider] = useState<SandboxProvider>('E2B_CLOUD');
  const [sandboxStatus, setSandboxStatus] = useState<string>('READY');
  const [sandboxUrl, setSandboxUrl] = useState<string>('');
  const [agentMessages, setAgentMessages] = useState<ProjectMessageDto[]>([]);
  const [isAgentLoading, setIsAgentLoading] = useState(false);
  const [projectFiles, setProjectFiles] = useState<Record<string, string>>({});
  const [fileDiffs, setFileDiffs] = useState<Record<string, any> | null>(null);
  const [splitRightTab, setSplitRightTab] = useState<'preview' | 'code'>('preview');

  // SSR safety for createPortal
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  // Sync / Load Initial Agent State and Sandbox
  useEffect(() => {
    if (!isOpen || !project) return;

    let isMounted = true;

    async function loadStudioData() {
      try {
        // 1. Fetch sandbox status
        const sb = await apiClient.agent.getSandboxStatus(project!.id).catch(() => null);
        if (sb && isMounted) {
          setSandboxProvider(sb.provider);
          setSandboxStatus(sb.status);
          setSandboxUrl(sb.hostUrl);
        }

        // 2. Fetch agent conversation history & fragments
        const messages = await apiClient.agent.getMessages(project!.id).catch(() => []);
        if (isMounted) {
          setAgentMessages(messages);

          // Locate latest code fragment if any
          const latestWithFragment = [...messages].reverse().find((m) => m.fragment?.files);
          if (latestWithFragment?.fragment?.files) {
            setProjectFiles(latestWithFragment.fragment.files);
            setFileDiffs(latestWithFragment.fragment.diffs || null);
            if (latestWithFragment.fragment.sandboxUrl) {
              setSandboxUrl(latestWithFragment.fragment.sandboxUrl);
            }
          }
        }
      } catch (err: any) {
        console.error('Failed to load studio data:', err);
      }
    }

    loadStudioData();

    return () => {
      isMounted = false;
    };
  }, [isOpen, project]);

  // Handle Switch Sandbox Provider (Cloud E2B vs Docker vs WebContainer)
  const handleSwitchSandboxProvider = async (provider: SandboxProvider) => {
    if (!project) return;
    try {
      setSandboxProvider(provider);
      setSandboxStatus('INITIALIZING');
      toast({
        title: 'Switching Sandbox',
        description: `Connecting project to ${provider === 'E2B_CLOUD' ? 'Cloud E2B Sandbox' : 'Local Docker Container'}...`,
        type: 'info',
      });
      const sb = await apiClient.agent.switchSandbox(project.id, provider);
      setSandboxStatus(sb.status);
      setSandboxUrl(sb.hostUrl);
      toast({
        title: 'Sandbox Connected',
        description: `Active runtime on ${sb.provider}`,
        type: 'success',
      });
    } catch (err: any) {
      toast({
        title: 'Sandbox Switch Failed',
        description: err.message || 'Could not connect to sandbox runtime',
        type: 'error',
      });
    }
  };

  // Handle Send Agent Prompt
  const handleSendAgentMessage = async (prompt: string, preferredModel?: string) => {
    if (!project) return;

    // Optimistically append user message
    const tempUserMsg: ProjectMessageDto = {
      id: `temp-${Date.now()}`,
      projectId: project.id,
      role: 'USER',
      content: prompt,
      modelUsed: preferredModel || 'gemini-3.8-flash',
      createdAt: new Date().toISOString(),
      toolCalls: [],
    };
    setAgentMessages((prev) => [...prev, tempUserMsg]);
    setIsAgentLoading(true);

    try {
      const response = await apiClient.agent.sendMessage(
        project.id,
        prompt,
        preferredModel,
      );

      // Replace optimistic message and append real assistant response
      setAgentMessages((prev) => [...prev.filter((m) => m.id !== tempUserMsg.id), tempUserMsg, response]);

      if (response.fragment?.files) {
        setProjectFiles(response.fragment.files);
        setFileDiffs(response.fragment.diffs || null);
        if (response.fragment.sandboxUrl) {
          setSandboxUrl(response.fragment.sandboxUrl);
        }
      }

      toast({
        title: 'Code Updated',
        description: response.fragment?.title || 'Gemini generated project files successfully',
        type: 'success',
      });
    } catch (err: any) {
      toast({
        title: 'Agent Error',
        description: err.message || 'Failed to process prompt with Gemini agent',
        type: 'error',
      });
    } finally {
      setIsAgentLoading(false);
    }
  };

  // Handle Rollback to Earlier Fragment Snapshot
  const handleRollbackFragment = async (fragmentId: string) => {
    if (!project) return;
    try {
      setIsAgentLoading(true);
      const restoredFragment = await apiClient.agent.rollback(project.id, fragmentId);
      setProjectFiles(restoredFragment.files);
      setFileDiffs(null);
      if (restoredFragment.sandboxUrl) {
        setSandboxUrl(restoredFragment.sandboxUrl);
      }
      toast({
        title: 'Snapshot Restored',
        description: `Codebase restored to: ${restoredFragment.title}`,
        type: 'success',
      });
      // Refresh messages
      const msgs = await apiClient.agent.getMessages(project.id);
      setAgentMessages(msgs);
    } catch (err: any) {
      toast({
        title: 'Rollback Failed',
        description: err.message || 'Could not rollback to fragment',
        type: 'error',
      });
    } finally {
      setIsAgentLoading(false);
    }
  };

  // Handle Export Codebase as JSON / files
  const handleExportCodebase = useCallback(() => {
    const fileEntries = Object.entries(projectFiles);
    if (fileEntries.length === 0) {
      toast({
        title: 'No Files to Export',
        description: 'Prompt the AI Agent to generate project code first.',
        type: 'warning',
      });
      return;
    }

    const payload = JSON.stringify(projectFiles, null, 2);
    const blob = new Blob([payload], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${(project?.name || 'project').toLowerCase().replace(/[^a-z0-9-]/g, '-')}-source.json`;
    a.click();
    URL.revokeObjectURL(url);

    toast({
      title: 'Codebase Exported',
      description: `Downloaded ${fileEntries.length} project files.`,
      type: 'success',
    });
  }, [projectFiles, project, toast]);

  // Handle Escape Key to exit
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !mounted) return null;

  const studioContent = (
    <div className="fixed inset-0 z-50 flex flex-col bg-slate-50 dark:bg-[#07090F] text-slate-900 dark:text-slate-100 font-sans overflow-hidden select-none animate-in fade-in duration-150">
      {/* Top Navigation Bar */}
      <StudioTopbar
        projectId={project?.id || 'demo'}
        projectName={project?.name || 'Project'}
        projectType={project?.type || 'WEBSITE'}
        framework={project?.framework || 'Next.js 15'}
        viewMode={viewMode}
        onChangeViewMode={setViewMode}
        sandboxProvider={sandboxProvider}
        onSwitchSandboxProvider={handleSwitchSandboxProvider}
        sandboxStatus={sandboxStatus}
        sandboxUrl={sandboxUrl}
        filesCount={Object.keys(projectFiles).length}
        onExportCodebase={handleExportCodebase}
        onCloseStudio={onClose}
      />

      {/* Main Workspace Body */}
      <div className="flex-1 w-full flex overflow-hidden">
        {viewMode === 'split' ? (
          /* Split View: Left Agent Chat, Right Sandbox / Code Tabs */
          <div className="flex-1 w-full flex overflow-hidden">
            {/* Left AI Chat Pane */}
            <div className="w-full md:w-[460px] lg:w-[480px] xl:w-[520px] border-r border-slate-200 dark:border-[#24293D] flex flex-col shrink-0 bg-white dark:bg-[#0E101A] shadow-xs">
              <AgentChatPane
                projectId={project?.id || 'demo'}
                messages={agentMessages}
                isLoading={isAgentLoading}
                onSendMessage={handleSendAgentMessage}
                onRollback={handleRollbackFragment}
              />
            </div>

            {/* Right Sandbox & Code Stage */}
            <div className="flex-1 w-full min-w-0 flex flex-col overflow-hidden bg-slate-100/70 dark:bg-[#07090F]">
              {/* Stage Sub-Tabs Switcher */}
              <div className="h-11 px-4 bg-white dark:bg-[#0E101A] border-b border-slate-200 dark:border-[#24293D] flex items-center justify-between shrink-0 shadow-xs">
                <div className="flex items-center bg-slate-100/90 dark:bg-[#121522] p-1 rounded-xl border border-slate-200/90 dark:border-[#24293D] gap-1 shadow-inner">
                  <button
                    onClick={() => setSplitRightTab('preview')}
                    className={`h-7 px-3 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all duration-150 ${
                      splitRightTab === 'preview'
                        ? 'bg-white dark:bg-[#1E2337] text-[#635BFF] dark:text-[#A5B4FC] shadow-sm border border-slate-200/70 dark:border-[#2D334D]'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white/60 dark:hover:bg-[#1A1E2E]'
                    }`}
                  >
                    <Monitor className={`h-3.5 w-3.5 ${splitRightTab === 'preview' ? 'text-[#635BFF] dark:text-[#A5B4FC]' : 'text-slate-400'}`} />
                    <span>Live Sandbox Preview</span>
                  </button>
                  <button
                    onClick={() => setSplitRightTab('code')}
                    className={`h-7 px-3 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all duration-150 ${
                      splitRightTab === 'code'
                        ? 'bg-white dark:bg-[#1E2337] text-[#635BFF] dark:text-[#A5B4FC] shadow-sm border border-slate-200/70 dark:border-[#2D334D]'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white/60 dark:hover:bg-[#1A1E2E]'
                    }`}
                  >
                    <Code2 className={`h-3.5 w-3.5 ${splitRightTab === 'code' ? 'text-[#635BFF] dark:text-[#A5B4FC]' : 'text-slate-400'}`} />
                    <span>Code Explorer</span>
                    <span
                      className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono transition-colors ${
                        splitRightTab === 'code'
                          ? 'bg-[#635BFF]/10 text-[#635BFF] font-bold'
                          : 'bg-slate-200/80 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      {Object.keys(projectFiles).length}
                    </span>
                  </button>
                </div>
              </div>

              <div className="flex-1 w-full flex flex-col overflow-hidden">
                {splitRightTab === 'preview' ? (
                  <SandboxPreviewPane
                    sandboxUrl={sandboxUrl}
                    projectId={project?.id || 'demo'}
                    files={projectFiles}
                  />
                ) : (
                  <FileExplorerPane
                    files={projectFiles}
                    diffs={fileDiffs}
                  />
                )}
              </div>
            </div>
          </div>
        ) : viewMode === 'agent' ? (
          /* Full Agent Chat Mode: Centered, readable, spacious */
          <div className="flex-1 w-full flex justify-center overflow-hidden bg-slate-100/60 dark:bg-[#07090F]">
            <div className="w-full max-w-4xl h-full flex flex-col bg-white dark:bg-[#0E101A] border-x border-slate-200 dark:border-[#24293D] shadow-sm">
              <AgentChatPane
                projectId={project?.id || 'demo'}
                messages={agentMessages}
                isLoading={isAgentLoading}
                onSendMessage={handleSendAgentMessage}
                onRollback={handleRollbackFragment}
              />
            </div>
          </div>
        ) : viewMode === 'code' ? (
          /* Full Code Explorer Mode */
          <div className="flex-1 w-full flex flex-col overflow-hidden bg-white dark:bg-[#0A0C14]">
            <FileExplorerPane files={projectFiles} diffs={fileDiffs} />
          </div>
        ) : (
          /* Full Live Preview Mode */
          <div className="flex-1 w-full flex flex-col overflow-hidden bg-slate-100/70 dark:bg-[#07090F]">
            <SandboxPreviewPane
              sandboxUrl={sandboxUrl}
              projectId={project?.id || 'demo'}
              files={projectFiles}
            />
          </div>
        )}
      </div>
    </div>
  );

  return createPortal(studioContent, document.body);
}