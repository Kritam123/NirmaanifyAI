'use client';

import React from 'react';
import {
  CmsCollectionDto,
  CmsContentItemDto,
  CmsContentStatus,
} from '@nirmaanify/types';
import {
  Button,
  Badge,
  Input,
  Card,
} from '@nirmaanify/ui';
import {
  Search,
  Plus,
  Edit2,
  Trash2,
  Send,
  Clock,
  RotateCcw,
  CheckCircle2,
  Calendar,
  Layers,
  FileText,
  ExternalLink,
} from 'lucide-react';

interface CmsContentTableProps {
  collection: CmsCollectionDto;
  items: CmsContentItemDto[];
  total: number;
  page: number;
  limit: number;
  statusFilter: CmsContentStatus | 'ALL';
  searchQuery: string;
  isLoading: boolean;
  onSearchChange: (q: string) => void;
  onStatusFilterChange: (status: CmsContentStatus | 'ALL') => void;
  onPageChange: (p: number) => void;
  onNewItem: () => void;
  onEditItem: (item: CmsContentItemDto) => void;
  onDeleteItem: (itemId: string) => void;
  onPublishItem: (itemId: string) => void;
  onUnpublishItem: (itemId: string) => void;
  onScheduleItem: (item: CmsContentItemDto) => void;
}

export const CmsContentTable: React.FC<CmsContentTableProps> = ({
  collection,
  items,
  total,
  page,
  limit,
  statusFilter,
  searchQuery,
  isLoading,
  onSearchChange,
  onStatusFilterChange,
  onPageChange,
  onNewItem,
  onEditItem,
  onDeleteItem,
  onPublishItem,
  onUnpublishItem,
  onScheduleItem,
}) => {
  const statusTabs: Array<{ id: CmsContentStatus | 'ALL'; label: string }> = [
    { id: 'ALL', label: 'All Items' },
    { id: 'PUBLISHED', label: 'Published' },
    { id: 'DRAFT', label: 'Drafts' },
    { id: 'SCHEDULED', label: 'Scheduled' },
    { id: 'ARCHIVED', label: 'Archived' },
  ];

  const renderStatusBadge = (status: CmsContentStatus) => {
    switch (status) {
      case 'PUBLISHED':
        return (
          <Badge variant="success" size="sm" className="gap-1">
            <CheckCircle2 className="h-3 w-3" />
            <span>Published</span>
          </Badge>
        );
      case 'DRAFT':
        return (
          <Badge variant="warning" size="sm" className="gap-1">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
            <span>Draft</span>
          </Badge>
        );
      case 'SCHEDULED':
        return (
          <Badge variant="violet" size="sm" className="gap-1">
            <Clock className="h-3 w-3" />
            <span>Scheduled</span>
          </Badge>
        );
      case 'ARCHIVED':
        return <Badge variant="secondary" size="sm">Archived</Badge>;
      default:
        return <Badge size="sm">{status}</Badge>;
    }
  };

  const getPrimaryDisplayTitle = (item: CmsContentItemDto): string => {
    const d = item.data || {};
    return d.title || d.name || item.slug || `Entry #${item.id.slice(0, 8)}`;
  };

  const getSecondaryExcerpt = (item: CmsContentItemDto): string => {
    const d = item.data || {};
    return d.excerpt || d.description || d.bio || '';
  };

  const previewFields = collection.fields.slice(0, 4);

  return (
    <div className="space-y-4">
      {/* Top Filter Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Status Pill Filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {statusTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => onStatusFilterChange(tab.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                statusFilter === tab.id
                  ? 'bg-[#635BFF] text-white shadow-sm'
                  : 'bg-slate-100 dark:bg-[#1E2337] text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search & New Item Button */}
        <div className="flex items-center gap-2">
          <div className="relative w-48 sm:w-64">
            <Input
              placeholder="Search content..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="h-8 text-xs pl-8"
            />
            <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
          </div>
          <Button
            size="xs"
            variant="default"
            leftIcon={<Plus className="h-3.5 w-3.5" />}
            onClick={onNewItem}
            className="whitespace-nowrap"
          >
            New Entry
          </Button>
        </div>
      </div>

      {/* Table Card */}
      <Card className="overflow-hidden border border-slate-200 dark:border-[#24293D] shadow-sm">
        {items.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <div className="mx-auto h-12 w-12 rounded-2xl bg-[#635BFF]/10 text-[#635BFF] flex items-center justify-center">
              <FileText className="h-6 w-6" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                No items in this collection yet
              </h4>
              <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
                {searchQuery || statusFilter !== 'ALL'
                  ? 'No entries match your search or filter criteria.'
                  : `Add your first item to "${collection.name}" to get started.`}
              </p>
            </div>
            <Button
              variant="default"
              size="xs"
              leftIcon={<Plus className="h-3.5 w-3.5" />}
              onClick={onNewItem}
            >
              Add First Item
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-[#161926] border-b border-slate-200 dark:border-slate-800 text-slate-500 font-semibold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3 px-4">Title</th>
                  <th className="py-3 px-4">Slug</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-[#1E2337]">
                {items.map((item) => {
                  const title = getPrimaryDisplayTitle(item);
                  const excerpt = getSecondaryExcerpt(item);

                  return (
                    <tr
                      key={item.id}
                      className="hover:bg-slate-50/75 dark:hover:bg-[#161926]/50 transition-colors group"
                    >
                      <td className="py-3.5 px-4 max-w-xs">
                        <div className="space-y-0.5">
                          <p className="font-bold text-slate-900 dark:text-white truncate">
                            {title}
                          </p>
                          {excerpt && (
                            <p className="text-[11px] text-slate-400 line-clamp-1">
                              {excerpt}
                            </p>
                          )}
                        </div>
                      </td>

                      <td className="py-3.5 px-4 font-mono text-[11px] text-slate-500 dark:text-slate-400">
                        {item.slug || '-'}
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {renderStatusBadge(item.status)}
                      </td>

                      <td className="py-3.5 px-4 text-slate-500 text-[11px] whitespace-nowrap">
                        {item.status === 'PUBLISHED' && item.publishedAt ? (
                          <div className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                            <Calendar className="h-3 w-3" />
                            <span>{new Date(item.publishedAt).toLocaleDateString()}</span>
                          </div>
                        ) : item.status === 'SCHEDULED' && item.scheduledAt ? (
                          <div className="flex items-center gap-1 text-violet-600 dark:text-violet-400">
                            <Clock className="h-3 w-3" />
                            <span>{new Date(item.scheduledAt).toLocaleString()}</span>
                          </div>
                        ) : (
                          <span>Created {new Date(item.createdAt).toLocaleDateString()}</span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Publish / Unpublish Actions */}
                          {item.status === 'DRAFT' && (
                            <>
                              <Button
                                variant="ghost"
                                size="xs"
                                className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-950/30"
                                onClick={() => onPublishItem(item.id)}
                                title="Publish immediately"
                              >
                                <Send className="h-3.5 w-3.5" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="xs"
                                className="text-violet-600 hover:text-violet-700 hover:bg-violet-50 dark:hover:bg-violet-950/30"
                                onClick={() => onScheduleItem(item)}
                                title="Schedule publishing"
                              >
                                <Clock className="h-3.5 w-3.5" />
                              </Button>
                            </>
                          )}

                          {item.status === 'PUBLISHED' && (
                            <Button
                              variant="ghost"
                              size="xs"
                              className="text-amber-600 hover:text-amber-700 hover:bg-amber-50 dark:hover:bg-amber-950/30"
                              onClick={() => onUnpublishItem(item.id)}
                              title="Revert to draft"
                            >
                              <RotateCcw className="h-3.5 w-3.5" />
                            </Button>
                          )}

                          {/* Edit Action */}
                          <Button
                            variant="ghost"
                            size="xs"
                            onClick={() => onEditItem(item)}
                            title="Edit entry"
                          >
                            <Edit2 className="h-3.5 w-3.5 text-slate-600 dark:text-slate-300" />
                          </Button>

                          {/* Delete Action */}
                          <Button
                            variant="ghost"
                            size="xs"
                            className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30"
                            onClick={() => onDeleteItem(item.id)}
                            title="Delete entry"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
};
