'use client';

import React from 'react';
import { ProjectSchema, PageSchema } from '@nirmaanify/types';
import {
  Undo2,
  Redo2,
  Monitor,
  Tablet,
  Smartphone,
  Eye,
  Edit3,
  Code2,
  FileCode,
  Save,
  CheckCircle2,
  AlertCircle,
  X,
  Plus,
  ZoomIn,
} from 'lucide-react';
import { Button, Badge } from '@nirmaanify/ui';

interface StudioTopbarProps {
  project: ProjectSchema;
  activePage: PageSchema;
  viewport: 'desktop' | 'tablet' | 'mobile';
  mode: 'builder' | 'preview';
  zoom: number;
  canUndo: boolean;
  canRedo: boolean;
  isSaving: boolean;
  isValid: boolean;
  errorsCount: number;
  onSelectPage: (pageId: string) => void;
  onAddPage: () => void;
  onChangeViewport: (viewport: 'desktop' | 'tablet' | 'mobile') => void;
  onChangeMode: (mode: 'builder' | 'preview') => void;
  onChangeZoom: (zoom: number) => void;
  onUndo: () => void;
  onRedo: () => void;
  onViewSchema: () => void;
  onViewCode: () => void;
  onCloseStudio: () => void;
}

export function StudioTopbar({
  project,
  activePage,
  viewport,
  mode,
  zoom,
  canUndo,
  canRedo,
  isSaving,
  isValid,
  errorsCount,
  onSelectPage,
  onAddPage,
  onChangeViewport,
  onChangeMode,
  onChangeZoom,
  onUndo,
  onRedo,
  onViewSchema,
  onViewCode,
  onCloseStudio,
}: StudioTopbarProps) {
  return (
    <header className="h-14 px-4 border-b border-slate-200 dark:border-[#24293D] bg-white dark:bg-[#0E121E] flex items-center justify-between shrink-0 select-none z-30">
      {/* Left: Project title & Page Switcher */}
      <div className="flex items-center gap-3">
        <button
          onClick={onCloseStudio}
          title="Exit Studio"
          className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-[#161926] text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="h-4 w-[1px] bg-slate-200 dark:bg-[#24293D]" />

        <div className="flex items-center gap-2">
          <div className="h-6 w-6 rounded-md bg-gradient-to-tr from-[#635BFF] to-[#22D3EE] flex items-center justify-center text-white font-bold text-xs">
            {project.settings.name.charAt(0)}
          </div>
          <span className="font-bold text-xs text-slate-900 dark:text-white truncate max-w-[140px]">
            {project.settings.name}
          </span>
        </div>

        {/* Page Switcher */}
        <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-[#161926] px-2 py-1 rounded-lg border border-slate-200 dark:border-[#24293D]">
          <span className="text-[10px] text-slate-400 uppercase font-bold">Route:</span>
          <select
            value={activePage?.id}
            onChange={(e) => onSelectPage(e.target.value)}
            className="bg-transparent text-xs font-semibold text-[#635BFF] dark:text-[#A5AEFD] focus:outline-none cursor-pointer"
          >
            {project.pages?.map((p) => (
              <option key={p.id} value={p.id} className="bg-white dark:bg-[#161926] text-slate-900 dark:text-white">
                {p.name} ({p.path})
              </option>
            ))}
          </select>
          <button
            onClick={onAddPage}
            title="Add new page route"
            className="p-0.5 hover:bg-slate-200 dark:hover:bg-[#24293D] rounded text-slate-400"
          >
            <Plus className="h-3 w-3" />
          </button>
        </div>
      </div>

      {/* Center: Viewport, Zoom & Undo/Redo Controls */}
      <div className="flex items-center gap-3">
        {/* Undo / Redo */}
        <div className="flex items-center gap-0.5 bg-slate-100 dark:bg-[#161926] p-1 rounded-lg border border-slate-200 dark:border-[#24293D]">
          <button
            onClick={onUndo}
            disabled={!canUndo}
            title="Undo (Ctrl+Z)"
            className="p-1 rounded hover:bg-slate-200 dark:hover:bg-[#24293D] disabled:opacity-40 disabled:hover:bg-transparent text-slate-600 dark:text-slate-300 transition-colors"
          >
            <Undo2 className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={onRedo}
            disabled={!canRedo}
            title="Redo (Ctrl+Y)"
            className="p-1 rounded hover:bg-slate-200 dark:hover:bg-[#24293D] disabled:opacity-40 disabled:hover:bg-transparent text-slate-600 dark:text-slate-300 transition-colors"
          >
            <Redo2 className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* Viewport Modes */}
        <div className="flex items-center gap-0.5 bg-slate-100 dark:bg-[#161926] p-1 rounded-lg border border-slate-200 dark:border-[#24293D]">
          {[
            { id: 'desktop' as const, label: 'Desktop (100%)', icon: <Monitor className="h-3.5 w-3.5" /> },
            { id: 'tablet' as const, label: 'Tablet (768px)', icon: <Tablet className="h-3.5 w-3.5" /> },
            { id: 'mobile' as const, label: 'Mobile (375px)', icon: <Smartphone className="h-3.5 w-3.5" /> },
          ].map((v) => (
            <button
              key={v.id}
              onClick={() => onChangeViewport(v.id)}
              title={v.label}
              className={`p-1.5 rounded transition-colors ${
                viewport === v.id
                  ? 'bg-white dark:bg-[#0E121E] text-[#635BFF] shadow-sm'
                  : 'text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
              }`}
            >
              {v.icon}
            </button>
          ))}
        </div>

        {/* Zoom Selector */}
        <div className="hidden lg:flex items-center gap-1 bg-slate-100 dark:bg-[#161926] px-2 py-1 rounded-lg border border-slate-200 dark:border-[#24293D] text-[11px] text-slate-500">
          <ZoomIn className="h-3 w-3 text-slate-400" />
          <select
            value={zoom}
            onChange={(e) => onChangeZoom(Number(e.target.value))}
            className="bg-transparent text-xs font-semibold focus:outline-none cursor-pointer"
          >
            <option value={0.67} className="bg-white dark:bg-[#161926] text-slate-900 dark:text-white">67%</option>
            <option value={0.8} className="bg-white dark:bg-[#161926] text-slate-900 dark:text-white">80%</option>
            <option value={1} className="bg-white dark:bg-[#161926] text-slate-900 dark:text-white">100%</option>
            <option value={1.15} className="bg-white dark:bg-[#161926] text-slate-900 dark:text-white">115%</option>
          </select>
        </div>

        {/* Builder / Preview Toggle */}
        <div className="flex items-center gap-0.5 bg-slate-100 dark:bg-[#161926] p-1 rounded-lg border border-slate-200 dark:border-[#24293D] text-xs">
          <button
            onClick={() => onChangeMode('builder')}
            className={`flex items-center gap-1 px-2.5 py-1 rounded font-semibold transition-colors ${
              mode === 'builder'
                ? 'bg-[#635BFF] text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Edit3 className="h-3 w-3" />
            <span>Builder</span>
          </button>
          <button
            onClick={() => onChangeMode('preview')}
            className={`flex items-center gap-1 px-2.5 py-1 rounded font-semibold transition-colors ${
              mode === 'preview'
                ? 'bg-[#635BFF] text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Eye className="h-3 w-3" />
            <span>Preview</span>
          </button>
        </div>
      </div>

      {/* Right: Validation Diagnostic, Master Schema, React Code Preview */}
      <div className="flex items-center gap-2.5 text-xs">
        {/* Diagnostic Status */}
        <div className="hidden sm:flex items-center gap-1.5">
          {isValid ? (
            <Badge size="sm" variant="cyan" className="text-[10px]">
              <CheckCircle2 className="h-3 w-3 mr-1 inline text-emerald-400" /> Valid
            </Badge>
          ) : (
            <Badge size="sm" variant="violet" className="text-[10px] text-rose-400">
              <AlertCircle className="h-3 w-3 mr-1 inline text-rose-400" /> {errorsCount} Issues
            </Badge>
          )}
        </div>

        {/* Auto-save status */}
        <div className="hidden sm:flex items-center gap-1.5 text-slate-400 text-[11px]">
          <Save className={`h-3.5 w-3.5 ${isSaving ? 'text-amber-400 animate-spin' : 'text-emerald-400'}`} />
          <span>{isSaving ? 'Saving...' : 'Saved'}</span>
        </div>

        <Button
          size="sm"
          variant="outline"
          leftIcon={<FileCode className="h-3.5 w-3.5" />}
          onClick={onViewCode}
        >
          React Code
        </Button>

        <Button
          size="sm"
          variant="subtle"
          leftIcon={<Code2 className="h-3.5 w-3.5" />}
          onClick={onViewSchema}
        >
          JSON Schema
        </Button>
      </div>
    </header>
  );
}
