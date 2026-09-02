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
  X,
  Plus,
  ZoomIn,
  PanelLeftClose,
  PanelLeftOpen,
  PanelRightClose,
  PanelRightOpen,
} from 'lucide-react';
import { Button } from '@nirmaanify/ui';

interface StudioTopbarProps {
  project: ProjectSchema;
  activePage: PageSchema;
  viewport: 'desktop' | 'tablet' | 'mobile';
  mode: 'builder' | 'preview';
  zoom: number;
  canUndo: boolean;
  canRedo: boolean;
  isSaving: boolean;
  isDirty: boolean;
  isValid: boolean;
  errorsCount: number;
  lastSavedLabel: string;
  autoSaveEnabled: boolean;
  autoSaveIntervalLabel: string;
  leftCollapsed: boolean;
  rightCollapsed: boolean;
  onToggleLeft: () => void;
  onToggleRight: () => void;
  onSelectPage: (pageId: string) => void;
  onAddPage: () => void;
  onChangeViewport: (viewport: 'desktop' | 'tablet' | 'mobile') => void;
  onChangeMode: (mode: 'builder' | 'preview') => void;
  onChangeZoom: (zoom: number) => void;
  onUndo: () => void;
  onRedo: () => void;
  onViewSchema: () => void;
  onViewCode: () => void;
  onSave: () => void;
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
  isDirty,
  isValid,
  errorsCount,
  lastSavedLabel,
  autoSaveEnabled,
  autoSaveIntervalLabel,
  leftCollapsed,
  rightCollapsed,
  onToggleLeft,
  onToggleRight,
  onSelectPage,
  onAddPage,
  onChangeViewport,
  onChangeMode,
  onChangeZoom,
  onUndo,
  onRedo,
  onViewSchema,
  onViewCode,
  onSave,
  onCloseStudio,
}: StudioTopbarProps) {
  return (
    <header className="h-[48px] px-2.5 border-b border-slate-200 dark:border-[#24293D] bg-white dark:bg-[#0F111A] flex items-center justify-between shrink-0 select-none z-30 gap-2">
      {/* Left cluster: exit, sidebar toggle, project, route */}
      <div className="flex items-center gap-1.5 min-w-0 flex-1">
        <button
          onClick={onCloseStudio}
          title="Exit Studio (Esc)"
          aria-label="Exit studio"
          className="h-7 w-7 inline-flex items-center justify-center rounded-md border border-slate-200 dark:border-[#24293D] bg-white dark:bg-[#141724] text-slate-500 hover:text-slate-900 dark:hover:text-white hover:border-slate-300 dark:hover:border-slate-600 transition-all"
        >
          <X className="h-3.5 w-3.5" />
        </button>

        {mode === 'builder' && (
          <button
            onClick={onToggleLeft}
            title={`${leftCollapsed ? 'Expand' : 'Collapse'} components panel (Ctrl+[)`}
            aria-label={leftCollapsed ? 'Expand components panel' : 'Collapse components panel'}
            className="h-7 w-7 inline-flex items-center justify-center rounded-md border border-slate-200 dark:border-[#24293D] bg-white dark:bg-[#141724] text-slate-500 hover:text-slate-900 dark:hover:text-white hover:border-slate-300 dark:hover:border-slate-600 transition-all"
          >
            {leftCollapsed ? (
              <PanelLeftOpen className="h-3.5 w-3.5" />
            ) : (
              <PanelLeftClose className="h-3.5 w-3.5" />
            )}
          </button>
        )}

        {/* Project mark + name (single line, no slug subtitle) */}
        <div className="flex items-center gap-1.5 pl-0.5 pr-1">
          <div className="relative shrink-0">
            <div className="h-7 w-7 rounded-md bg-gradient-to-br from-[#635BFF] via-[#8B5CF6] to-[#22D3EE] flex items-center justify-center text-white font-bold text-[11px] shadow-sm shadow-[#635BFF]/25">
              {project.settings.name.charAt(0).toUpperCase()}
            </div>
            <span className="absolute -bottom-0.5 -right-0.5 h-2 w-2 rounded-full bg-emerald-400 ring-2 ring-white dark:ring-[#0F111A]" />
          </div>
          <span
            className="font-semibold text-[12.5px] text-slate-900 dark:text-white truncate max-w-[180px]"
            title={project.settings.name}
          >
            {project.settings.name}
          </span>
        </div>

        {/* Page / Route Switcher */}
        <div className="flex items-center gap-1 bg-slate-50 dark:bg-[#141724] pl-2 pr-1 py-0.5 rounded-md border border-slate-200 dark:border-[#24293D]">
          <select
            value={activePage?.id}
            onChange={(e) => onSelectPage(e.target.value)}
            aria-label="Active page route"
            className="bg-transparent text-[11.5px] font-semibold text-slate-800 dark:text-slate-100 focus:outline-none cursor-pointer pr-1 max-w-[180px]"
          >
            {project.pages?.map((p) => (
              <option key={p.id} value={p.id} className="bg-white dark:bg-[#0F111A] text-slate-900 dark:text-white">
                {p.name} — {p.path}
              </option>
            ))}
          </select>
          <button
            onClick={onAddPage}
            title="Add new page route"
            aria-label="Add page route"
            className="h-5 w-5 inline-flex items-center justify-center rounded text-slate-400 hover:text-[#635BFF] hover:bg-[#635BFF]/10 transition-colors"
          >
            <Plus className="h-3 w-3" />
          </button>
        </div>
      </div>

      {/* Center cluster: undo / viewport / zoom / mode */}
      <div className="flex items-center gap-1 shrink-0">
        {/* Undo / Redo (icon-only, single grouped control) */}
        <div className="flex items-center gap-0.5 bg-slate-50 dark:bg-[#141724] p-0.5 rounded-md border border-slate-200 dark:border-[#24293D]">
          <button
            onClick={onUndo}
            disabled={!canUndo}
            title="Undo (Ctrl+Z)"
            aria-label="Undo"
            className="h-6 w-6 inline-flex items-center justify-center rounded hover:bg-white dark:hover:bg-[#0F111A] disabled:opacity-30 disabled:hover:bg-transparent text-slate-600 dark:text-slate-300 transition-colors"
          >
            <Undo2 className="h-3 w-3" />
          </button>
          <button
            onClick={onRedo}
            disabled={!canRedo}
            title="Redo (Ctrl+Y)"
            aria-label="Redo"
            className="h-6 w-6 inline-flex items-center justify-center rounded hover:bg-white dark:hover:bg-[#0F111A] disabled:opacity-30 disabled:hover:bg-transparent text-slate-600 dark:text-slate-300 transition-colors"
          >
            <Redo2 className="h-3 w-3" />
          </button>
        </div>

        {/* Viewport Modes */}
        <div className="flex items-center gap-0.5 bg-slate-50 dark:bg-[#141724] p-0.5 rounded-md border border-slate-200 dark:border-[#24293D]">
          {[
            { id: 'desktop' as const, label: 'Desktop · 1280px', icon: <Monitor className="h-3 w-3" /> },
            { id: 'tablet' as const, label: 'Tablet · 768px', icon: <Tablet className="h-3 w-3" /> },
            { id: 'mobile' as const, label: 'Mobile · 375px', icon: <Smartphone className="h-3 w-3" /> },
          ].map((v) => (
            <button
              key={v.id}
              onClick={() => onChangeViewport(v.id)}
              title={v.label}
              aria-label={v.label}
              className={`h-6 w-6 inline-flex items-center justify-center rounded transition-all duration-150 ${
                viewport === v.id
                  ? 'bg-gradient-to-br from-[#635BFF] to-[#8B5CF6] text-white shadow-sm shadow-[#635BFF]/30'
                  : 'text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
              }`}
            >
              {v.icon}
            </button>
          ))}
        </div>

        {/* Zoom (icon + dropdown, tighter) */}
        <div className="hidden lg:flex items-center gap-1 bg-slate-50 dark:bg-[#141724] px-1.5 py-0.5 rounded-md border border-slate-200 dark:border-[#24293D]">
          <ZoomIn className="h-3 w-3 text-slate-400" />
          <select
            value={zoom}
            onChange={(e) => onChangeZoom(Number(e.target.value))}
            aria-label="Canvas zoom"
            className="bg-transparent text-[11px] font-semibold focus:outline-none cursor-pointer pr-0.5 text-slate-700 dark:text-slate-200"
          >
            <option value={0.67} className="bg-white dark:bg-[#0F111A] text-slate-900 dark:text-white">67%</option>
            <option value={0.8} className="bg-white dark:bg-[#0F111A] text-slate-900 dark:text-white">80%</option>
            <option value={1} className="bg-white dark:bg-[#0F111A] text-slate-900 dark:text-white">100%</option>
            <option value={1.15} className="bg-white dark:bg-[#0F111A] text-slate-900 dark:text-white">115%</option>
          </select>
        </div>

        {/* Builder / Preview Toggle */}
        <div className="flex items-center gap-0.5 bg-slate-50 dark:bg-[#141724] p-0.5 rounded-md border border-slate-200 dark:border-[#24293D]">
          <button
            onClick={() => onChangeMode('builder')}
            title="Builder mode"
            aria-label="Builder mode"
            className={`h-6 w-6 inline-flex items-center justify-center rounded transition-all duration-200 ${
              mode === 'builder'
                ? 'bg-gradient-to-br from-[#635BFF] to-[#8B5CF6] text-white shadow-sm shadow-[#635BFF]/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Edit3 className="h-3 w-3" />
          </button>
          <button
            onClick={() => onChangeMode('preview')}
            title="Preview mode"
            aria-label="Preview mode"
            className={`h-6 w-6 inline-flex items-center justify-center rounded transition-all duration-200 ${
              mode === 'preview'
                ? 'bg-gradient-to-br from-[#635BFF] to-[#8B5CF6] text-white shadow-white shadow-[#635BFF]/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Eye className="h-3 w-3" />
          </button>
        </div>
      </div>

      {/* Right cluster: save status + actions + sidebar toggle */}
      <div className="flex items-center gap-1.5 shrink-0">
        {/* Compact save status pill (no inline AUTO text) */}
        <div
          className={`hidden md:inline-flex items-center gap-1.5 h-7 px-2.5 rounded-full border text-[10.5px] font-semibold whitespace-nowrap ${
            isDirty
              ? 'border-amber-300 dark:border-amber-500/40 bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-300'
              : 'border-emerald-300 dark:border-emerald-500/40 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-300'
          }`}
          title={
            isDirty
              ? 'Unsaved changes in this session'
              : `Last saved at ${lastSavedLabel}` +
                (autoSaveEnabled ? ` · Auto-save every ${autoSaveIntervalLabel}` : '')
          }
        >
          <span
            className={`h-1.5 w-1.5 rounded-full ${
              isDirty ? 'bg-amber-500 animate-pulse' : 'bg-emerald-500'
            }`}
          />
          <span className="tabular-nums">
            {isSaving ? 'Saving…' : isDirty ? 'Unsaved' : `Saved ${lastSavedLabel}`}
          </span>
        </div>

        {/* Save button (primary action) */}
        <Button
          size="sm"
          variant={isDirty ? 'default' : 'subtle'}
          isLoading={isSaving}
          onClick={onSave}
          disabled={isSaving}
          leftIcon={!isSaving ? <Save className="h-3.5 w-3.5" /> : undefined}
          className={isDirty ? 'shadow-md shadow-[#635BFF]/30' : ''}
          title="Save (Ctrl+S)"
        >
          {isSaving ? 'Saving' : isDirty ? 'Save' : 'Saved'}
        </Button>

        {/* Icon-only code actions */}
        <div className="hidden md:flex items-center gap-0.5">
          <button
            onClick={onViewCode}
            title="View React Code"
            aria-label="View React code"
            className="h-7 w-7 inline-flex items-center justify-center rounded-md border border-slate-200 dark:border-[#24293D] bg-white dark:bg-[#141724] text-slate-500 hover:text-[#635BFF] hover:border-[#635BFF]/40 transition-all"
          >
            <FileCode className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={onViewSchema}
            title="View JSON Schema"
            aria-label="View JSON schema"
            className="h-7 w-7 inline-flex items-center justify-center rounded-md border border-slate-200 dark:border-[#24293D] bg-white dark:bg-[#141724] text-slate-500 hover:text-[#635BFF] hover:border-[#635BFF]/40 transition-all"
          >
            <Code2 className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* Validation issue indicator (only when there are issues) */}
        {!isValid && errorsCount > 0 && (
          <div
            title={`${errorsCount} schema ${errorsCount === 1 ? 'issue' : 'issues'}`}
            aria-label={`${errorsCount} schema issues`}
            className="hidden xl:inline-flex items-center justify-center h-7 min-w-[28px] px-1.5 rounded-full border border-rose-300 dark:border-rose-500/40 bg-rose-50 dark:bg-rose-500/10 text-rose-700 dark:text-rose-300 text-[10.5px] font-bold tabular-nums"
          >
            {errorsCount}
          </div>
        )}

        {/* Right sidebar toggle */}
        {mode === 'builder' && (
          <button
            onClick={onToggleRight}
            title={`${rightCollapsed ? 'Expand' : 'Collapse'} inspector (Ctrl+])`}
            aria-label={rightCollapsed ? 'Expand inspector' : 'Collapse inspector'}
            className="h-7 w-7 inline-flex items-center justify-center rounded-md border border-slate-200 dark:border-[#24293D] bg-white dark:bg-[#141724] text-slate-500 hover:text-slate-900 dark:hover:text-white hover:border-slate-300 dark:hover:border-slate-600 transition-all"
          >
            {rightCollapsed ? (
              <PanelRightOpen className="h-3.5 w-3.5" />
            ) : (
              <PanelRightClose className="h-3.5 w-3.5" />
            )}
          </button>
        )}
      </div>
    </header>
  );
}