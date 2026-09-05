'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  Sparkles,
  Send,
  Loader2,
  ChevronDown,
  ChevronRight,
  Terminal,
  FileCode,
  RotateCcw,
  Bot,
  User as UserIcon,
  CheckCircle2,
  Clock,
  ExternalLink,
  Zap,
  Cpu,
  Workflow,
} from 'lucide-react';
import { ProjectMessageDto, ProjectFragmentDto, AgentCodingModel, AVAILABLE_AGENT_MODELS } from '@nirmaanify/types';

interface AgentChatPaneProps {
  projectId: string;
  messages: ProjectMessageDto[];
  isLoading: boolean;
  onSendMessage: (prompt: string, preferredModel?: string) => Promise<void>;
  onRollback: (fragmentId: string) => Promise<void>;
}

export function AgentChatPane({
  projectId,
  messages,
  isLoading,
  onSendMessage,
  onRollback,
}: AgentChatPaneProps) {
  const [prompt, setPrompt] = useState('');
  const [selectedModel, setSelectedModel] = useState<AgentCodingModel>('gemini-3.8-flash');
  const [showModelDropdown, setShowModelDropdown] = useState(false);
  const [expandedThoughts, setExpandedThoughts] = useState<Record<string, boolean>>({});
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const toggleThought = (msgId: string) => {
    setExpandedThoughts((prev) => ({
      ...prev,
      [msgId]: !prev[msgId],
    }));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleSubmit = async () => {
    const trimmed = prompt.trim();
    if (!trimmed || isLoading) return;
    setPrompt('');
    await onSendMessage(trimmed, selectedModel);
  };

  const activeModelConfig = AVAILABLE_AGENT_MODELS.find((m) => m.id === selectedModel) || AVAILABLE_AGENT_MODELS[0];

  return (
    <div className="h-full flex flex-col bg-white dark:bg-[#0E101A] border-r border-slate-200 dark:border-[#24293D] min-w-[360px] max-w-[460px] w-full select-text">
      {/* Header */}
      <div className="h-12 px-3 border-b border-slate-200 dark:border-[#24293D] flex items-center justify-between shrink-0 bg-slate-50/50 dark:bg-[#121522]/50">
        <div className="flex items-center gap-2">
          <div className="h-6 w-6 rounded-md bg-gradient-to-br from-[#635BFF] to-[#8B5CF6] flex items-center justify-center text-white shadow-sm shadow-[#635BFF]/25">
            <Sparkles className="h-3.5 w-3.5" />
          </div>

          {/* Model Selector Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowModelDropdown((prev) => !prev)}
              className="flex items-center gap-1.5 px-2 py-1 rounded-md hover:bg-slate-200/60 dark:hover:bg-[#1E2235] text-xs font-bold text-slate-900 dark:text-white transition-colors"
            >
              <span className="flex items-center gap-1">
                {selectedModel.includes('flash') ? <Zap className="h-3 w-3 text-amber-500" /> : <Cpu className="h-3 w-3 text-indigo-400" />}
                {activeModelConfig.name}
              </span>
              <span className="text-[10px] font-medium px-1 py-0.2 rounded bg-indigo-500/10 text-indigo-500">
                {activeModelConfig.badge}
              </span>
              <ChevronDown className="h-3 w-3 text-slate-400" />
            </button>

            {showModelDropdown && (
              <div className="absolute left-0 top-full mt-1 w-64 bg-white dark:bg-[#151827] border border-slate-200 dark:border-[#24293D] rounded-xl shadow-xl z-50 p-1.5 space-y-1">
                {AVAILABLE_AGENT_MODELS.map((model) => (
                  <button
                    key={model.id}
                    onClick={() => {
                      setSelectedModel(model.id);
                      setShowModelDropdown(false);
                    }}
                    className={`w-full text-left p-2 rounded-lg text-xs transition-colors flex flex-col gap-0.5 ${
                      selectedModel === model.id
                        ? 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-bold'
                        : 'hover:bg-slate-100 dark:hover:bg-[#1E2235] text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1">
                        {model.id.includes('flash') ? <Zap className="h-3 w-3 text-amber-500" /> : <Cpu className="h-3 w-3 text-indigo-400" />}
                        {model.name}
                      </span>
                      <span className="text-[9px] px-1 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                        {model.badge}
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-400 font-normal">{model.description}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Inngest Workflow Indicator */}
        <div className="flex items-center gap-1.5 text-[10px] text-emerald-500 font-mono bg-emerald-500/10 px-2 py-0.5 rounded-full">
          <Workflow className="h-3 w-3" />
          <span>Inngest</span>
        </div>
      </div>

      {/* Message List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="py-12 px-4 text-center space-y-3">
            <div className="h-12 w-12 rounded-2xl bg-[#635BFF]/10 text-[#635BFF] flex items-center justify-center mx-auto">
              <Sparkles className="h-6 w-6" />
            </div>
            <h4 className="text-sm font-bold text-slate-900 dark:text-white">
              Autonomous Full-Stack Pair Programmer
            </h4>
            <p className="text-xs text-slate-400 leading-relaxed max-w-xs mx-auto">
              Equipped with {activeModelConfig.name} and Inngest durable workflow execution. Build components, backend APIs, and database schemas.
            </p>
            <div className="pt-2 flex flex-col gap-1.5 text-left text-xs">
              {[
                'Build a 3-tier pricing table with monthly & annual billing toggle',
                'Create a NestJS products API with GET and POST endpoints',
                'Design a responsive hero banner with CTA button and badge',
                'Add an interactive authentication sign-in form with validation',
              ].map((sample) => (
                <button
                  key={sample}
                  onClick={() => onSendMessage(sample, selectedModel)}
                  className="p-2 rounded-lg bg-slate-50 dark:bg-[#151928] hover:bg-[#635BFF]/10 hover:text-[#635BFF] text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-[#24293D] transition-colors text-left font-medium"
                >
                  ⚡ {sample}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg) => {
          const isUser = msg.role === 'USER';
          const isExpanded = expandedThoughts[msg.id];

          return (
            <div
              key={msg.id}
              className={`flex flex-col gap-1.5 ${isUser ? 'items-end' : 'items-start'}`}
            >
              {/* Message Header */}
              <div className="flex items-center gap-1.5 text-[10px] text-slate-400 px-1">
                {isUser ? (
                  <>
                    <span>You</span>
                    <UserIcon className="h-2.5 w-2.5" />
                  </>
                ) : (
                  <>
                    <Bot className="h-3 w-3 text-[#635BFF]" />
                    <span className="font-semibold text-slate-600 dark:text-slate-300">
                      {msg.modelUsed || activeModelConfig.name}
                    </span>
                    <span className="text-slate-500">·</span>
                    <span>{new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </>
                )}
              </div>

              {/* Message Bubble */}
              <div
                className={`p-3 rounded-2xl text-xs max-w-[92%] leading-relaxed ${
                  isUser
                    ? 'bg-gradient-to-r from-[#635BFF] to-[#8B5CF6] text-white rounded-br-none shadow-md shadow-[#635BFF]/15'
                    : 'bg-slate-50 dark:bg-[#141724] border border-slate-200 dark:border-[#24293D] text-slate-800 dark:text-slate-200 rounded-bl-none shadow-sm'
                }`}
              >
                {/* Assistant Thought Expansion */}
                {!isUser && msg.thought && (
                  <div className="mb-2 pb-2 border-b border-slate-200/60 dark:border-[#24293D]">
                    <button
                      onClick={() => toggleThought(msg.id)}
                      className="flex items-center gap-1 text-[11px] font-semibold text-[#635BFF] hover:underline"
                    >
                      {isExpanded ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
                      <span>Reasoning Process & Step Actions</span>
                    </button>
                    {isExpanded && (
                      <div className="mt-1.5 p-2 rounded-lg bg-white/60 dark:bg-[#0B0D14] border border-slate-200/50 dark:border-[#1E2235] text-[11px] font-mono text-slate-500 dark:text-slate-400 whitespace-pre-wrap leading-tight">
                        {msg.thought}
                      </div>
                    )}
                  </div>
                )}

                {/* Content */}
                <div className="whitespace-pre-wrap font-sans">{msg.content}</div>

                {/* Tool Calls Execution Pill */}
                {!isUser && msg.toolCalls && msg.toolCalls.length > 0 && (
                  <div className="mt-2.5 pt-2 border-t border-slate-200/60 dark:border-[#24293D] space-y-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      Executed Agent Tools ({msg.toolCalls.length})
                    </span>
                    <div className="space-y-1">
                      {msg.toolCalls.map((tc, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between gap-2 p-1.5 rounded-md bg-white/80 dark:bg-[#0F111D] border border-slate-200 dark:border-[#202538] text-[10px] font-mono"
                        >
                          <div className="flex items-center gap-1.5 truncate">
                            {tc.name === 'terminal' ? (
                              <Terminal className="h-3 w-3 text-amber-500 shrink-0" />
                            ) : (
                              <FileCode className="h-3 w-3 text-[#635BFF] shrink-0" />
                            )}
                            <span className="font-semibold text-slate-700 dark:text-slate-300">
                              {tc.name}
                            </span>
                            <span className="text-slate-400 truncate max-w-[140px]">
                              {JSON.stringify(tc.args)}
                            </span>
                          </div>
                          <span className="text-[9px] text-emerald-500 font-semibold shrink-0 flex items-center gap-0.5">
                            <CheckCircle2 className="h-2.5 w-2.5" />
                            OK
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Fragment Snapshot Card */}
                {!isUser && msg.fragment && (
                  <div className="mt-3 p-2.5 rounded-xl bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-transparent border border-indigo-500/20 flex items-center justify-between">
                    <div>
                      <div className="text-[11px] font-bold text-slate-900 dark:text-white flex items-center gap-1">
                        <span>Snapshot:</span>
                        <span className="text-[#635BFF]">{msg.fragment.title}</span>
                      </div>
                      <div className="text-[10px] text-slate-400">
                        {Object.keys(msg.fragment.files || {}).length} files generated
                      </div>
                    </div>
                    <button
                      onClick={() => onRollback(msg.fragment!.id)}
                      title="Rollback to this point in time"
                      className="px-2 py-1 rounded-md bg-white dark:bg-[#1E2235] hover:bg-slate-100 dark:hover:bg-[#282E47] border border-slate-200 dark:border-[#24293D] text-[10px] font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1 transition-colors"
                    >
                      <RotateCcw className="h-2.5 w-2.5" />
                      <span>Rollback</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {/* Loading Indicator */}
        {isLoading && (
          <div className="flex items-center gap-2 text-xs text-[#635BFF] font-medium p-2 rounded-xl bg-[#635BFF]/5 border border-[#635BFF]/10 animate-pulse">
            <Loader2 className="h-4 w-4 animate-spin text-[#635BFF]" />
            <span>{activeModelConfig.name} is synthesizing code with Inngest...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Form */}
      <div className="p-3 border-t border-slate-200 dark:border-[#24293D] bg-slate-50/50 dark:bg-[#121522]/50">
        <div className="relative rounded-xl border border-slate-200 dark:border-[#24293D] bg-white dark:bg-[#151827] focus-within:border-[#635BFF] focus-within:ring-1 focus-within:ring-[#635BFF] transition-all">
          <textarea
            ref={textareaRef}
            rows={3}
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isLoading}
            placeholder={`Ask ${activeModelConfig.name} to write Next.js & NestJS code... (Enter to send)`}
            className="w-full p-2.5 text-xs bg-transparent border-0 focus:outline-none resize-none text-slate-900 dark:text-white placeholder:text-slate-400"
          />
          <div className="px-2.5 pb-2 flex items-center justify-between text-[11px] text-slate-400">
            <span className="flex items-center gap-1 text-[10px]">
              <Zap className="h-2.5 w-2.5 text-amber-500" />
              {activeModelConfig.name}
            </span>
            <button
              onClick={handleSubmit}
              disabled={!prompt.trim() || isLoading}
              className="h-7 px-3 inline-flex items-center gap-1 rounded-lg bg-gradient-to-r from-[#635BFF] to-[#8B5CF6] text-white font-semibold text-xs disabled:opacity-30 transition-opacity shadow-sm"
            >
              {isLoading ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <>
                  <span>Send</span>
                  <Send className="h-3 w-3" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
