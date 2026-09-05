'use client';

import React, { useState } from 'react';
import {
  CmsCollectionDto,
  CmsCollectionType,
  CmsContentItemDto,
  CmsContentStatus,
  CreateCmsCollectionDto,
  CreateCmsContentItemDto,
  CreateCmsFieldDto,
} from '@nirmaanify/types';
import { useCms } from '../../hooks/use-cms';
import { CmsCollectionBuilderDialog } from './CmsCollectionBuilderDialog';
import { CmsContentEditorDialog } from './CmsContentEditorDialog';
import { CmsSchedulePublishDialog } from './CmsSchedulePublishDialog';
import { CmsContentTable } from './CmsContentTable';
import {
  Button,
  Badge,
  Card,
  Skeleton,
  useToast,
} from '@nirmaanify/ui';
import {
  Database,
  Plus,
  Sparkles,
  Settings2,
  Trash2,
  Layers,
  FileText,
  ShoppingBag,
  FolderTree,
  Users,
  CheckCircle2,
  Clock,
  Copy,
  Check,
  ArrowRight,
} from 'lucide-react';

interface CmsDashboardViewProps {
  projectId?: string;
  projectName?: string;
  workspaceId?: string;
  workspaceName?: string;
  workspaceSlug?: string;
}

const TEMPLATES: Array<{
  type: CmsCollectionType;
  title: string;
  description: string;
  fieldCount: number;
  icon: React.ComponentType<{ className?: string }>;
  colorClass: {
    bg: string;
    text: string;
    borderHover: string;
    btnHover: string;
  };
}> = [
  {
    type: 'POSTS',
    title: 'Blog & Articles',
    description: 'Publish blog posts, news, and guides with title, markdown body, cover image, and author.',
    fieldCount: 9,
    icon: FileText,
    colorClass: {
      bg: 'bg-amber-50 dark:bg-amber-950/40',
      text: 'text-amber-600 dark:text-amber-400',
      borderHover: 'hover:border-amber-400 dark:hover:border-amber-500',
      btnHover: 'group-hover:bg-amber-500 group-hover:text-white group-hover:border-amber-500',
    },
  },
  {
    type: 'PRODUCTS',
    title: 'Store Products',
    description: 'Catalog items with pricing, compare price, SKU, inventory count, and product photos.',
    fieldCount: 10,
    icon: ShoppingBag,
    colorClass: {
      bg: 'bg-indigo-50 dark:bg-indigo-950/40',
      text: 'text-indigo-600 dark:text-indigo-400',
      borderHover: 'hover:border-indigo-400 dark:hover:border-indigo-500',
      btnHover: 'group-hover:bg-[#635BFF] group-hover:text-white group-hover:border-[#635BFF]',
    },
  },
  {
    type: 'CATEGORIES',
    title: 'Categories & Tags',
    description: 'Organize and filter your content with taxonomy structures, slugs, and banner images.',
    fieldCount: 5,
    icon: FolderTree,
    colorClass: {
      bg: 'bg-emerald-50 dark:bg-emerald-950/40',
      text: 'text-emerald-600 dark:text-emerald-400',
      borderHover: 'hover:border-emerald-400 dark:hover:border-emerald-500',
      btnHover: 'group-hover:bg-emerald-500 group-hover:text-white group-hover:border-emerald-500',
    },
  },
  {
    type: 'AUTHORS',
    title: 'Team & Authors',
    description: 'Contributor profiles with full names, avatars, biographies, emails, and social links.',
    fieldCount: 6,
    icon: Users,
    colorClass: {
      bg: 'bg-violet-50 dark:bg-violet-950/40',
      text: 'text-violet-600 dark:text-violet-400',
      borderHover: 'hover:border-violet-400 dark:hover:border-violet-500',
      btnHover: 'group-hover:bg-violet-500 group-hover:text-white group-hover:border-violet-500',
    },
  },
];

export const CmsDashboardView: React.FC<CmsDashboardViewProps> = ({
  projectId,
  projectName,
  workspaceId,
  workspaceName,
  workspaceSlug,
}) => {
  const { toast } = useToast();
  const isWorkspaceMode = Boolean(workspaceId && !projectId);
  const target = isWorkspaceMode ? { workspaceId } : (projectId || '');

  const {
    collections,
    activeCollection,
    activeCollectionSlug,
    setActiveCollectionSlug,
    contentItems,
    totalItems,
    page,
    setPage,
    limit,
    statusFilter,
    setStatusFilter,
    searchQuery,
    setSearchQuery,
    isLoadingCollections,
    isLoadingContent,
    createCollection,
    updateCollection,
    deleteCollection,
    seedPreset,
    addField,
    updateField,
    deleteField,
    createContentItem,
    updateContentItem,
    deleteContentItem,
    publishItem,
    unpublishItem,
    schedulePublish,
  } = useCms(target);

  // Dialog states
  const [isBuilderOpen, setIsBuilderOpen] = useState(false);
  const [builderEditCollection, setBuilderEditCollection] = useState<CmsCollectionDto | null>(null);

  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editorEditItem, setEditorEditItem] = useState<CmsContentItemDto | null>(null);

  const [isScheduleOpen, setIsScheduleOpen] = useState(false);
  const [itemToSchedule, setItemToSchedule] = useState<CmsContentItemDto | null>(null);

  // Loading state for seeding specific template
  const [seedingType, setSeedingType] = useState<CmsCollectionType | null>(null);
  const [isApiCopied, setIsApiCopied] = useState(false);

  const handleSeedTemplate = async (templateType: CmsCollectionType) => {
    setSeedingType(templateType);
    try {
      await seedPreset(templateType);
    } finally {
      setSeedingType(null);
    }
  };

  const handleCopyApiEndpoint = () => {
    if (typeof window !== 'undefined' && activeCollection) {
      const url = isWorkspaceMode
        ? `${window.location.origin}/api/v1/cms/delivery/workspaces/${workspaceSlug || workspaceId}/${activeCollection.slug}`
        : `${window.location.origin}/api/v1/cms/delivery/${projectId}/${activeCollection.slug}`;
      navigator.clipboard.writeText(url);
      setIsApiCopied(true);
      toast({
        title: 'API URL Copied',
        description: 'Public content delivery endpoint copied to clipboard.',
        type: 'success',
      });
      setTimeout(() => setIsApiCopied(false), 2000);
    }
  };

  const openCreateCollection = () => {
    setBuilderEditCollection(null);
    setIsBuilderOpen(true);
  };

  const openEditCollection = () => {
    setBuilderEditCollection(activeCollection);
    setIsBuilderOpen(true);
  };

  const openCreateItem = () => {
    setEditorEditItem(null);
    setIsEditorOpen(true);
  };

  const openEditItem = (item: CmsContentItemDto) => {
    setEditorEditItem(item);
    setIsEditorOpen(true);
  };

  const openScheduleItem = (item: CmsContentItemDto) => {
    setItemToSchedule(item);
    setIsScheduleOpen(true);
  };

  const getCollectionIcon = (type: CmsCollectionType) => {
    switch (type) {
      case 'POSTS':
        return <FileText className="h-4 w-4" />;
      case 'PRODUCTS':
        return <ShoppingBag className="h-4 w-4" />;
      case 'CATEGORIES':
        return <FolderTree className="h-4 w-4" />;
      case 'AUTHORS':
        return <Users className="h-4 w-4" />;
      default:
        return <Database className="h-4 w-4" />;
    }
  };

  const getFriendlyTypeName = (type: CmsCollectionType) => {
    switch (type) {
      case 'POSTS':
        return 'Blog';
      case 'PRODUCTS':
        return 'Store';
      case 'CATEGORIES':
        return 'Taxonomy';
      case 'AUTHORS':
        return 'Team';
      default:
        return 'Custom';
    }
  };

  // Metrics for active collection
  const publishedCount = contentItems.filter((i) => i.status === 'PUBLISHED').length;
  const draftCount = contentItems.filter((i) => i.status === 'DRAFT').length;
  const scheduledCount = contentItems.filter((i) => i.status === 'SCHEDULED').length;

  return (
    <div className="space-y-6">
      {/* Clean, Understandable Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-start gap-3">
          <div className="p-2.5 rounded-xl bg-indigo-50 dark:bg-[#1A1E2F] text-[#635BFF] border border-indigo-100 dark:border-indigo-900/40">
            <Database className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                {isWorkspaceMode ? 'Headless CMS (Global)' : 'Content & Collections'}
              </h3>
              {isWorkspaceMode && (
                <Badge variant="indigo" size="sm">
                  {workspaceName || 'Standalone BaaS'}
                </Badge>
              )}
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {isWorkspaceMode
                ? 'Manage structured content schemas and access high-performance delivery APIs for external apps & websites.'
                : 'Create and manage dynamic content like blog articles, products, or team profiles for your website.'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="default"
            leftIcon={<Plus className="h-4 w-4" />}
            onClick={openCreateCollection}
            className="shadow-sm"
          >
            New Collection
          </Button>
        </div>
      </div>

      {isLoadingCollections ? (
        <div className="space-y-4">
          <Skeleton className="h-10 w-full rounded-xl" />
          <Skeleton className="h-64 w-full rounded-2xl" />
        </div>
      ) : collections.length === 0 ? (
        /* Simple, Inviting Template & Onboarding Gallery */
        <div className="py-4 space-y-6">
          <div className="text-center max-w-xl mx-auto space-y-1.5">
            <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 text-[#635BFF] mb-1">
              <Layers className="h-6 w-6" />
            </div>
            <h4 className="text-base font-bold text-slate-900 dark:text-white">
              Start with a content collection
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Collections hold your dynamic content. Pick a ready-made template below to get started in 1 click, or create a custom collection from scratch.
            </p>
          </div>

          {/* 4 Clean Template Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 max-w-5xl mx-auto">
            {TEMPLATES.map((tmpl) => {
              const Icon = tmpl.icon;
              const isSeeding = seedingType === tmpl.type;

              return (
                <div
                  key={tmpl.type}
                  onClick={() => !seedingType && handleSeedTemplate(tmpl.type)}
                  className={`group relative p-5 rounded-2xl bg-white dark:bg-[#161926] border border-slate-200 dark:border-slate-800 ${tmpl.colorClass.borderHover} hover:shadow-md transition-all duration-200 cursor-pointer flex flex-col justify-between`}
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className={`p-2.5 rounded-xl ${tmpl.colorClass.bg} ${tmpl.colorClass.text} group-hover:scale-105 transition-transform`}>
                        <Icon className="h-5 w-5" />
                      </span>
                      <span className="text-[10px] font-bold text-slate-400 tracking-wider uppercase">
                        Template
                      </span>
                    </div>

                    <div>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-[#635BFF] transition-colors">
                        {tmpl.title}
                      </h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                        {tmpl.description}
                      </p>
                    </div>
                  </div>

                  <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
                    <span className="text-[11px] text-slate-400 font-medium">
                      {tmpl.fieldCount} fields included
                    </span>
                    <Button
                      size="xs"
                      variant="outline"
                      className={`text-xs ${tmpl.colorClass.btnHover} transition-colors`}
                      isLoading={isSeeding}
                    >
                      Use Template
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Clean Prompt for Custom Collection */}
          <div className="max-w-md mx-auto text-center pt-2">
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Need custom fields for a unique use-case?{' '}
              <button
                onClick={openCreateCollection}
                className="font-semibold text-[#635BFF] hover:underline inline-flex items-center gap-1"
              >
                <span>Build a custom collection</span>
                <ArrowRight className="h-3 w-3" />
              </button>
            </p>
          </div>
        </div>
      ) : (
        /* Collections Explorer & Content Workspace */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Collections List */}
          <div className="lg:col-span-3 space-y-3">
            <div className="flex items-center justify-between px-1">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Collections ({collections.length})
              </span>
              <button
                onClick={openCreateCollection}
                className="text-xs text-[#635BFF] hover:underline font-semibold flex items-center gap-1"
              >
                <Plus className="h-3 w-3" /> New
              </button>
            </div>

            <div className="space-y-1.5">
              {collections.map((col) => {
                const isSelected = col.slug === activeCollection?.slug;
                return (
                  <button
                    key={col.id}
                    onClick={() => setActiveCollectionSlug(col.slug)}
                    className={`w-full p-3 rounded-xl flex items-center justify-between text-left transition-all ${
                      isSelected
                        ? 'bg-[#635BFF] text-white shadow-md shadow-[#635BFF]/25 font-bold'
                        : 'bg-slate-50 dark:bg-[#161926] text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-[#1E2337] border border-slate-200/60 dark:border-[#24293D]'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className={isSelected ? 'text-white' : 'text-[#635BFF]'}>
                        {getCollectionIcon(col.type)}
                      </span>
                      <div className="truncate">
                        <p className="text-xs truncate">{col.name}</p>
                        <p className={`text-[10px] font-mono truncate ${isSelected ? 'text-white/80' : 'text-slate-400'}`}>
                          /{col.slug}
                        </p>
                      </div>
                    </div>

                    <span
                      className={`text-[11px] font-mono px-2 py-0.5 rounded-md ${
                        isSelected
                          ? 'bg-white/20 text-white'
                          : 'bg-slate-200/60 dark:bg-slate-800 text-slate-500'
                      }`}
                    >
                      {col.itemCount ?? 0}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Quick Add Preset Link */}
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block px-1 mb-2">
                Quick Add Template
              </span>
              <div className="grid grid-cols-2 gap-1.5">
                {TEMPLATES.map((tmpl) => (
                  <button
                    key={tmpl.type}
                    onClick={() => !seedingType && handleSeedTemplate(tmpl.type)}
                    disabled={Boolean(seedingType)}
                    className="p-2 text-left rounded-lg bg-slate-50 dark:bg-[#161926] hover:bg-slate-100 dark:hover:bg-[#1E2337] border border-slate-200/60 dark:border-[#24293D] transition-colors"
                  >
                    <span className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 truncate block">
                      + {tmpl.title.split(' ')[0]}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Active Collection Content Management */}
          <div className="lg:col-span-9 space-y-4">
            {activeCollection && (
              <>
                {/* Active Collection Header Card */}
                <div className="p-4 rounded-xl border border-slate-200 dark:border-[#24293D] bg-white dark:bg-[#161926] flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-bold text-slate-900 dark:text-white">
                        {activeCollection.name}
                      </h3>
                      <Badge variant="secondary" size="sm">
                        {getFriendlyTypeName(activeCollection.type)}
                      </Badge>
                      <span className="text-xs text-slate-400 font-mono">
                        /{activeCollection.slug}
                      </span>
                    </div>
                    {activeCollection.description && (
                      <p className="text-xs text-slate-500 mt-1">{activeCollection.description}</p>
                    )}
                  </div>

                  {/* Schema & Actions */}
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="xs"
                      leftIcon={isApiCopied ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
                      onClick={handleCopyApiEndpoint}
                      title="Copy public API URL"
                    >
                      {isApiCopied ? 'Copied' : 'API URL'}
                    </Button>
                    <Button
                      variant="outline"
                      size="xs"
                      leftIcon={<Settings2 className="h-3.5 w-3.5" />}
                      onClick={openEditCollection}
                    >
                      Fields ({activeCollection.fields.length})
                    </Button>
                    <Button
                      variant="ghost"
                      size="xs"
                      className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30"
                      onClick={() => deleteCollection(activeCollection.id)}
                      title="Delete Collection"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>

                {/* Quick Content Metrics */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div className="p-3 rounded-xl border border-slate-200 dark:border-[#24293D] bg-white dark:bg-[#12141F]">
                    <span className="text-[11px] text-slate-400">Total Entries</span>
                    <p className="text-lg font-bold text-slate-900 dark:text-white mt-0.5">{totalItems}</p>
                  </div>
                  <div className="p-3 rounded-xl border border-slate-200 dark:border-[#24293D] bg-white dark:bg-[#12141F]">
                    <span className="text-[11px] text-emerald-500 font-semibold flex items-center gap-1">
                      <CheckCircle2 className="h-3 w-3" /> Published
                    </span>
                    <p className="text-lg font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">{publishedCount}</p>
                  </div>
                  <div className="p-3 rounded-xl border border-slate-200 dark:border-[#24293D] bg-white dark:bg-[#12141F]">
                    <span className="text-[11px] text-amber-500 font-semibold">Drafts</span>
                    <p className="text-lg font-bold text-amber-600 dark:text-amber-400 mt-0.5">{draftCount}</p>
                  </div>
                  <div className="p-3 rounded-xl border border-slate-200 dark:border-[#24293D] bg-white dark:bg-[#12141F]">
                    <span className="text-[11px] text-violet-500 font-semibold flex items-center gap-1">
                      <Clock className="h-3 w-3" /> Scheduled
                    </span>
                    <p className="text-lg font-bold text-violet-600 dark:text-violet-400 mt-0.5">{scheduledCount}</p>
                  </div>
                </div>

                {/* Content Table */}
                <CmsContentTable
                  collection={activeCollection}
                  items={contentItems}
                  total={totalItems}
                  page={page}
                  limit={limit}
                  statusFilter={statusFilter}
                  searchQuery={searchQuery}
                  isLoading={isLoadingContent}
                  onSearchChange={setSearchQuery}
                  onStatusFilterChange={setStatusFilter}
                  onPageChange={setPage}
                  onNewItem={openCreateItem}
                  onEditItem={openEditItem}
                  onDeleteItem={deleteContentItem}
                  onPublishItem={publishItem}
                  onUnpublishItem={unpublishItem}
                  onScheduleItem={openScheduleItem}
                />
              </>
            )}
          </div>
        </div>
      )}

      {/* Collection Builder Dialog */}
      <CmsCollectionBuilderDialog
        isOpen={isBuilderOpen}
        onClose={() => setIsBuilderOpen(false)}
        existingCollection={builderEditCollection}
        existingCollections={collections}
        onSaveCollection={async (dto) => {
          if (builderEditCollection) {
            return updateCollection(builderEditCollection.id, dto);
          }
          return createCollection(dto);
        }}
        onAddField={addField}
        onDeleteField={deleteField}
      />

      {/* Content Editor Dialog */}
      {activeCollection && (
        <CmsContentEditorDialog
          isOpen={isEditorOpen}
          onClose={() => setIsEditorOpen(false)}
          collection={activeCollection}
          itemToEdit={editorEditItem}
          onSave={async (dto) => {
            if (editorEditItem) {
              return updateContentItem(editorEditItem.id, dto);
            }
            return createContentItem(dto);
          }}
        />
      )}

      {/* Schedule Publish Dialog */}
      <CmsSchedulePublishDialog
        isOpen={isScheduleOpen}
        onClose={() => setIsScheduleOpen(false)}
        item={itemToSchedule}
        onSchedule={schedulePublish}
      />
    </div>
  );
};

